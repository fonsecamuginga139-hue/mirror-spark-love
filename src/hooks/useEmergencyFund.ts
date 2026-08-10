import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface EmergencyFund {
  id: string;
  user_id: string;
  target_months: number;
  monthly_cost: number;
  current_amount: number;
}

export const useEmergencyFund = () => {
  const { user } = useAuth();
  const [fund, setFund] = useState<EmergencyFund | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFund = useCallback(async () => {
    if (!user) {
      setFund(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("emergency_funds")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) console.error("Error loading emergency fund:", error);

    if (!data) {
      const { data: created } = await supabase
        .from("emergency_funds")
        .insert({ user_id: user.id })
        .select()
        .single();
      setFund((created as EmergencyFund) ?? null);
    } else {
      setFund(data as EmergencyFund);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFund();
    if (!user) return;
    const channel = supabase
      .channel(`emergency-fund-${user.id}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "emergency_funds", filter: `user_id=eq.${user.id}` },
        () => fetchFund(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFund]);

  const update = useCallback(
    async (patch: Partial<Pick<EmergencyFund, "target_months" | "monthly_cost" | "current_amount">>) => {
      if (!fund) return;
      setFund({ ...fund, ...patch });
      const { error } = await supabase.from("emergency_funds").update(patch).eq("id", fund.id);
      if (error) {
        console.error("Error updating emergency fund:", error);
        fetchFund();
      }
    },
    [fund, fetchFund],
  );

  const target = (fund?.monthly_cost ?? 0) * (fund?.target_months ?? 6);
  const current = fund?.current_amount ?? 0;
  const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;

  return { fund, loading, update, target, current, progress, refetch: fetchFund };
};
