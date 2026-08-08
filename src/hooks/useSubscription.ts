import { useAuth } from "@/context/AuthContext";

type PlanType = "free" | "mensal" | "monthly" | "master" | "admin" | null;

export const useSubscription = () => {
  const { profile, loading, isAdmin: roleAdmin } = useAuth();

  const plano = profile?.plano as PlanType;
  const planStatus = (profile?.plan_status as "trial_active" | "active" | "expired" | "awaiting_payment") || "awaiting_payment";
  const trialEnd = profile?.trial_end ? new Date(profile.trial_end) : null;

  // Admin comes from the user_roles table; the legacy profile column is a fallback.
  const isAdmin = roleAdmin || plano === "admin";
  const isPaid = plano === "monthly" || plano === "mensal" || plano === "master";

  const now = new Date();
  const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000) : 0;

  const isAwaitingPayment = planStatus === "awaiting_payment" && !isAdmin;
  const isTrialActive = planStatus === "trial_active" && daysLeft > 0;
  const isActive = planStatus === "active" || isAdmin;
  const isExpired = planStatus === "expired" || (planStatus === "trial_active" && daysLeft <= 0);

  const hasAccess = isAdmin || isActive || isTrialActive;

  const getPlanLabel = (): string => {
    if (isAdmin) return "Admin";
    if (plano === "master") return "Master Annual";
    if (plano === "monthly" || plano === "mensal") return "Monthly Flow";
    if (isActive || isPaid) return "Monthly Flow";
    if (isTrialActive) return "Free Trial";
    return "Expired";
  };

  const getPlanPrice = (): string => {
    if (isAdmin) return "Admin";
    if (plano === "master") return "$30/year";
    if (plano === "monthly" || plano === "mensal") return "$7/month";
    if (plano === "free") return "Free";
    if (isTrialActive) return "Free";
    return "—";
  };

  return {
    plano,
    planStatus,
    isActive,
    isAdmin,
    isTrialActive,
    isExpired,
    isAwaitingPayment,
    hasAccess,
    daysLeft,
    trialEnd,
    planLabel: getPlanLabel(),
    planPrice: getPlanPrice(),
    loading,
  };
};

export default useSubscription;
