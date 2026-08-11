import { useNavigate } from "react-router-dom";
import { Lock, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionGateProps {
  children: React.ReactNode;
}

const SubscriptionGate = ({ children }: SubscriptionGateProps) => {
  const navigate = useNavigate();
  const { isActive, loading } = useSubscription();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  // If user has active subscription, show content
  if (isActive) {
    return <>{children}</>;
  }

  // Show subscription required screen
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Lock Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Acesso Premium Necessário
          </h1>
          <p className="text-muted-foreground text-lg">
            Para usar todas as funcionalidades do Vault, precisa de uma subscrição ativa.
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-card/50 border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-left">
            <Crown className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-foreground">Controlo total das suas finanças</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-foreground">Relatórios e gráficos detalhados</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <Crown className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-foreground">Metas e orçamentos personalizados</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-foreground">Sincronização em tempo real</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/plans")}
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
        >
          <Crown className="w-5 h-5 mr-2" />
          SUBSCREVER AGORA
        </Button>

        {/* Price hint */}
        <p className="text-sm text-muted-foreground">
          A partir de <span className="text-primary font-semibold">7€/mês</span> · Anual 30€/ano
        </p>
      </div>
    </div>
  );
};

export default SubscriptionGate;
