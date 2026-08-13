import { useAuth } from "@/context/AuthContext";

/**
 * A aplicação é totalmente gratuita e aberta: não existem planos, trial nem
 * paywall. Este hook fica apenas para saber se o utilizador é admin.
 */
export const useSubscription = () => {
  const { profile, loading, isAdmin: roleAdmin } = useAuth();

  const isAdmin = roleAdmin || (profile as any)?.plano === "admin";

  return {
    isAdmin,
    hasAccess: true,
    isActive: true,
    loading,
  };
};

export default useSubscription;
