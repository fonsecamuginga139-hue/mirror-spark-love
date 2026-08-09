import { useAuth } from "@/context/AuthContext";

type PlanType = "free" | "mensal" | "monthly" | "master" | "admin" | null;

/**
 * Fonte de verdade da assinatura: as datas gravadas no Supabase.
 *   admin        → acesso total, sempre
 *   active       → acesso total
 *   trial_active → acesso total enquanto trial_end > agora
 *   expirado     → paywall em todos os ecrãs premium
 */
export const useSubscription = () => {
  const { profile, loading, isAdmin: roleAdmin } = useAuth();

  const plano = profile?.plano as PlanType;
  const planStatus =
    (profile?.plan_status as "trial_active" | "active" | "expired" | "awaiting_payment") || "trial_active";
  const trialEnd = profile?.trial_end ? new Date(profile.trial_end) : null;

  const isAdmin = roleAdmin || plano === "admin";
  const isPaid = plano === "monthly" || plano === "mensal" || plano === "master";

  const now = Date.now();
  const msLeft = trialEnd ? trialEnd.getTime() - now : 0;
  const daysLeft = trialEnd ? Math.max(0, Math.ceil(msLeft / 86400000)) : 0;
  const trialStillRunning = !!trialEnd && msLeft > 0;

  const isActive = planStatus === "active" || isAdmin;
  // Um perfil com trial válido tem acesso total, mesmo que o estado tenha ficado
  // desactualizado (ex.: contas criadas antes da mudança de fluxo).
  const isTrialActive = !isActive && trialStillRunning;
  const isExpired =
    !isAdmin &&
    !isActive &&
    !isTrialActive &&
    (planStatus === "expired" || planStatus === "trial_active" || planStatus === "awaiting_payment");

  // No fluxo actual ninguém fica à espera de pagamento antes de usar o app.
  const isAwaitingPayment = false;

  const hasAccess = isAdmin || isActive || isTrialActive;

  const getPlanLabel = (): string => {
    if (isAdmin) return "Admin";
    if (plano === "master") return "Anual";
    if (plano === "monthly" || plano === "mensal") return "Mensal";
    if (isActive || isPaid) return "Mensal";
    if (isTrialActive) return "Teste grátis";
    return "Expirado";
  };

  const getPlanPrice = (): string => {
    if (isAdmin) return "Admin";
    if (plano === "master") return "US$ 39,99/ano";
    if (plano === "monthly" || plano === "mensal") return "US$ 4,99/mês";
    if (isTrialActive) return "Grátis";
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
