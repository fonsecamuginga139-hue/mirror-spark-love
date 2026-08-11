import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Acesso à aplicação (produção):
 *
 *   - Basta estar autenticado: NUNCA bloqueamos ecrãs por assinatura.
 *   - O estado do plano (trial/activo/expirado) é apenas informativo e é
 *     sincronizado pelos webhooks para consulta do Admin.
 *   - Único redireccionamento: quem ainda não terminou o onboarding vai para
 *     /onboarding.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (
    profile &&
    !profile.onboarding_completed &&
    location.pathname !== "/onboarding" &&
    location.pathname !== "/setup"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
