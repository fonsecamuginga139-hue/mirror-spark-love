import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import BottomNav from "@/components/BottomNav";

/**
 * Admin · Definições — apenas informativo.
 * A aplicação é gratuita e aberta: já não existem links de checkout nem planos.
 * Os webhooks continuam ativos só para acompanhamento de eventos externos.
 */
const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useSubscription();

  useEffect(() => {
    if (!isAdmin) navigate("/dashboard");
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 border-b border-border flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Shield className="w-5 h-5 text-amber-500 ml-2 mr-2" />
        <h1 className="text-xl font-bold">Admin · Definições</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-6">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4 flex items-start gap-3">
          <Settings className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-semibold">Acesso aberto</p>
            <p className="text-sm text-muted-foreground">
              A aplicação está totalmente gratuita para todos os utilizadores. Não há planos,
              teste gratuito nem cobranças.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-4 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">Webhook Hotmart (só registo)</p>
          <code className="block break-all bg-background p-2 rounded">
            {origin}/api/public/hotmart-webhook
          </code>
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-4 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">Webhook Kambafy (só registo)</p>
          <code className="block break-all bg-background p-2 rounded">
            {origin}/api/public/kambafy-webhook
          </code>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminSettingsPage;
