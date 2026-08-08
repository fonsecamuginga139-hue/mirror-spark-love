import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Save, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/context/AuthContext";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import BottomNav from "@/components/BottomNav";

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useSubscription();
  const { user } = useAuth();
  const { data: settings, refetch } = usePaymentSettings();

  const [monthlyUrl, setMonthlyUrl] = useState("");
  const [yearlyUrl, setYearlyUrl] = useState("");
  const [trialDays, setTrialDays] = useState<number>(7);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) navigate("/dashboard");
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (settings) {
      setMonthlyUrl(settings.hotmart_monthly_url || settings.monthly_checkout_url || "");
      setYearlyUrl(settings.hotmart_yearly_url || settings.yearly_checkout_url || "");
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
        trial_length_days: trialDays,
        processor: "hotmart",
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      })
      .eq("id", settings.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Hotmart settings saved");
      refetch();
    }
  };

  if (!isAdmin) return null;

  const webhookUrl = `https://thbosfhigonvmckpeltc.supabase.co/functions/v1/hotmart-webhook`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 border-b border-border flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Shield className="w-5 h-5 text-amber-500 ml-2 mr-2" />
        <h1 className="text-xl font-bold">Admin · Hotmart</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-6">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4 flex items-start gap-3">
          <Settings className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-semibold">Hotmart checkout</p>
            <p className="text-sm text-muted-foreground">
              URLs configuradas aqui são usadas em todo o app: paywall final do onboarding, página de planos e CTAs de upgrade.
            </p>
          </div>
        </div>

        <div>
          <Label>Monthly Plan Checkout URL (Hotmart)</Label>
          <Input value={monthlyUrl} onChange={(e) => setMonthlyUrl(e.target.value)}
            placeholder="https://pay.hotmart.com/XXXXXXXX" className="mt-1" />
        </div>

        <div>
          <Label>Yearly Plan Checkout URL (Hotmart)</Label>
          <Input value={yearlyUrl} onChange={(e) => setYearlyUrl(e.target.value)}
            placeholder="https://pay.hotmart.com/XXXXXXXX" className="mt-1" />
        </div>

        <div>
          <Label>Trial length (days)</Label>
          <Input type="number" min={1} max={30} value={trialDays}
            onChange={(e) => setTrialDays(parseInt(e.target.value) || 7)} className="mt-1" />
        </div>

        <Button onClick={handleSave} disabled={saving || !monthlyUrl.trim()} className="w-full h-12">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Settings
        </Button>

        <div className="rounded-xl border border-border bg-card/40 p-4 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">Hotmart webhook URL</p>
          <code className="block break-all bg-background p-2 rounded">{webhookUrl}</code>
          <p>
            Cole este URL em Hotmart → Ferramentas → Webhooks. O HOTTOK deve corresponder ao
            secret <code>HOTMART_HOTTOK</code>. Todos os eventos (compra, renovação,
            cancelamento, reembolso, chargeback, expiração) já são tratados.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminSettingsPage;
