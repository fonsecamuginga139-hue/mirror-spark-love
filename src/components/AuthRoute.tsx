import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * AuthRoute - Smart auth-based routing
 * Handles the complete flow: pre-onboarding -> quiz -> auth -> dashboard
 * 
 * Flow logic:
 * 1. If loading: show spinner
 * 2. If logged in: go to dashboard
 * 3. If not logged in: go to pre-onboarding (first contact with the app)
 */
const AuthRoute = () => {
  const { user, profile, loading } = useAuth();

  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (user && profile) {
    if (profile.onboarding_completed) {
      return <Navigate to="/dashboard" replace />;
    }
    // First open: language + currency selection before the gamified onboarding.
    if (!(profile as any).locale_setup_completed) {
      return <Navigate to="/locale-setup" replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/pre-onboarding" replace />;
};

export default AuthRoute;
