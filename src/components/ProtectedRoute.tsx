import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import ExpiredPaywall from "@/components/ExpiredPaywall";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Subscription state machine (production):
 *
 *   admin              → full access, always
 *   plan_status=active → full access
 *   trial_active       → full access while trial_end > now()
 *   expired            → only /plans and /settings; every other route
 *                        renders inside <ExpiredPaywall/> which blocks
 *                        interaction and shows the paywall modal.
 *
 * Onboarding gate: any authenticated user without onboarding_completed
 * is forced to /onboarding (except /setup itself).
 */
const ALWAYS_ALLOWED = new Set<string>([
  "/plans",
  "/settings",
  "/support",
  "/privacy-policy",
  "/terms",
  "/contact",
]);

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const { isAdmin, isExpired, isAwaitingPayment, loading: subLoading } = useSubscription();
  const location = useLocation();

  if (loading || subLoading || (user && !profile)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Force onboarding completion (except while on the onboarding/setup flow itself)
  if (
    profile &&
    !profile.onboarding_completed &&
    location.pathname !== "/onboarding" &&
    location.pathname !== "/setup"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  // Admin bypass — full access everywhere
  if (isAdmin) return <>{children}</>;

  // Hard paywall: user finished onboarding but never completed Hotmart checkout.
  // Block every route with the paywall overlay until webhook activates the account.
  if (isAwaitingPayment) {
    if (ALWAYS_ALLOWED.has(location.pathname)) return <>{children}</>;
    return <ExpiredPaywall>{children}</ExpiredPaywall>;
  }

  // Routes always accessible (plans, settings, support, legal)
  if (ALWAYS_ALLOWED.has(location.pathname)) return <>{children}</>;

  // Expired trial or subscription → block interaction on any other route
  if (isExpired) {
    return <ExpiredPaywall>{children}</ExpiredPaywall>;
  }

  // Trial active or paid active
  return <>{children}</>;
};

export default ProtectedRoute;
