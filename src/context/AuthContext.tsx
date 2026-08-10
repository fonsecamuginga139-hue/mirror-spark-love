import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  currency: "USD" | "EUR" | "BRL" | "GBP";
  language?: "en" | "pt" | "es";
  selected_categories?: string[];
  monthly_income?: number | null;
  onboarding_completed: boolean;
  pre_onboarding_completed: boolean;
  quiz_answers: Record<string, any> | null;
  plano: "free" | "monthly" | "master" | "admin";
  status_assinatura: "ativo" | "inativo";
  trial_start: string | null;
  trial_end: string | null;
  plan_status: "trial_active" | "active" | "expired" | "awaiting_payment";
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data as Profile | null;
  };

  /** Admin is decided by the user_roles table (never by a profile column). */
  const fetchIsAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    return !!data;
  };

  useEffect(() => {
    // 1. Set up listener FIRST (Supabase recommended order)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Defer to avoid deadlocks inside the auth callback
          setTimeout(() => {
            fetchProfile(session.user.id).then(setProfile);
            fetchIsAdmin(session.user.id).then(setIsAdmin);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        if (event === "SIGNED_OUT") {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // 2. Then restore session from storage
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id).then(setProfile);
          fetchIsAdmin(session.user.id).then(setIsAdmin);
        }
      })
      .catch(() => {
        // Stale refresh token — clear silently
        supabase.auth.signOut().catch(() => {});
      })
      .finally(() => setLoading(false));

    return () => subscription.unsubscribe();
  }, []);

  // Subscribe to profile changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile-changes-${user.id}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore — local state is cleared below
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const fresh = await fetchProfile(user.id);
    if (fresh) setProfile(fresh);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update(updates as any)
      .eq("user_id", user.id);
    await refreshProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
