import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Save, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import BottomNav from "@/components/BottomNav";

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useSubscription();
  const { data: settings, refetch } = usePaymentSettings();

  const [monthlyUrl, setMonthlyUrl] = useState("");
  const [yearlyUrl, setYearlyUrl] = useState("");
  const [kambafyMonthlyUrl, setKambafyMonthlyUrl] = useState("");
  const [kambafyYearlyUrl, setKambafyYearlyUrl] = useState("");
  const [trialDays, setTrialDays] = useState<number>(7);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) navigate("/dashboard");
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (settings) {
      setMonthlyUrl(settings.hotmart_monthly_url || settings.monthly_checkout_url || "");
      setYearlyUrl(settings.hotmart_yearly_url || settings.yearly_checkout_url || "");
      setKambafyMonthlyUrl(settings.kambafy_monthly_url || "");
      setKambafyYearlyUrl(settings.kambafy_yearly_url || "");
      setTrialDays(settings.trial_length_days || 7);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings?.id) return;
    setSaving(true);
    const { error } = await (supabase as any)
      .from("payment_settings")
      .update({
        hotmart_monthly_url: monthlyUrl.trim() || null,
        hotmart_yearly_url: yearlyUrl.trim() || null,
        monthly_checkout_url: monthlyUrl.trim() || null,
        yearly_checkout_url: yearlyUrl.trim() || null,
        kambafy_monthly_url: kambafyMonthlyUrl.trim() || null,
        kambafy_yearly_url: kambafyYearlyUrl.trim() || null,
        trial_length_days: trialDays,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Configurações de pagamento guardadas");
      refetch();
    }
  };

  if (!isAdmin) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const hotmartWebhook = `${origin}/api/public/hotmart-webhook`;
  const kambafyWebhook = `${origin}/api/public/kambafy-webhook`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 border-b border-border flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Shield className="w-5 h-5 text-amber-500 ml-2 mr-2" />
        <h1 className="text-xl font-bold">Admin · Pagamentos</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-6">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4 flex items-start gap-3">
          <Settings className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-semibold">Checkout por moeda</p>
            <p className="text-sm text-muted-foreground">
              Utilizadores em Kwanza (Kz) vão para o Kambafy. Todas as outras moedas ($, R$, €, £)
              vão para a Hotmart.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground">Hotmart ($, R$, €, £)</p>
          <div>
            <Label>URL do plano mensal</Label>
            <Input
              value={monthlyUrl}
              onChange={(e) => setMonthlyUrl(e.target.value)}
              placeholder="https://pay.hotmart.com/XXXXXXXX"
              className="mt-1"
            />
          </div>
          <div>
            <Label>URL do plano anual</Label>
            <Input
              value={yearlyUrl}
              onChange={(e) => setYearlyUrl(e.target.value)}
              placeholder="https://pay.hotmart.com/XXXXXXXX"
              className="mt-1"
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground">Kambafy (Kz — Angola)</p>
          <div>
            <Label>URL do plano mensal</Label>
            <Input
              value={kambafyMonthlyUrl}
              onChange={(e) => setKambafyMonthlyUrl(e.target.value)}
              placeholder="https://app.kambafy.com/checkout/XXXXXXXX"
              className="mt-1"
            />
          </div>
          <div>
            <Label>URL do plano anual</Label>
            <Input
              value={kambafyYearlyUrl}
              onChange={(e) => setKambafyYearlyUrl(e.target.value)}
              placeholder="https://app.kambafy.com/checkout/XXXXXXXX"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Duração do teste grátis (dias)</Label>
          <Input
            type="number"
            min={1}
            max={30}
            value={trialDays}
            onChange={(e) => setTrialDays(parseInt(e.target.value) || 7)}
            className="mt-1"
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full h-12">
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar configurações
        </Button>

        <div className="rounded-xl border border-border bg-card/40 p-4 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">Webhook Hotmart</p>
          <code className="block break-all bg-background p-2 rounded">{hotmartWebhook}</code>
          <p>
            Hotmart → Ferramentas → Webhooks. O HOTTOK já está guardado no servidor. Compra,
            renovação, cancelamento, reembolso, chargeback e expiração são tratados.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-4 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">Webhook Kambafy</p>
          <code className="block break-all bg-background p-2 rounded">{kambafyWebhook}</code>
          <p>
            Cole este URL no Kambafy (app.kambafy.com → Webhooks). Não é necessário token. Pedido
            criado, pagamento aprovado/falhado, pedido cancelado e assinatura paga/expirada são
            tratados automaticamente.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminSettingsPage;
