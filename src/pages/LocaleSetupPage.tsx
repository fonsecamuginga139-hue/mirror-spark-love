import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/hooks/useCurrency";
import { CURRENCIES } from "@/lib/currencies";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

/** Primeira abertura: escolher a moeda. Fica guardada no perfil para todo o app. */
const LocaleSetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [picked, setPicked] = useState<string>(currency);
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    await setCurrency(picked);
    if (user) {
      await supabase
        .from("profiles")
        .update({ locale_setup_completed: true, language: "pt-PT" } as any)
        .eq("id", user.id);
    }
    setSaving(false);
    navigate("/onboarding", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/10 px-5 py-10">
      <div className="mx-auto w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Escolha a sua moeda</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Todos os valores do aplicativo vão usar esta moeda.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {CURRENCIES.map((c) => {
              const active = picked === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => setPicked(c.code)}
                  className={`rounded-2xl border p-4 text-left backdrop-blur-xl transition-all active:scale-[0.97] ${
                    active
                      ? "border-primary bg-primary/10 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.6)]"
                      : "border-border/60 bg-card/60 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-foreground">{c.symbol}</span>
                    {active && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <span className="mt-1 block text-sm font-bold text-foreground">{c.code}</span>
                  <span className="block text-[11px] text-muted-foreground truncate">{c.namePt}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Pode mudar mais tarde nas configurações.
          </p>

          <button
            disabled={saving}
            onClick={finish}
            className="mt-4 w-full h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-[0_0_40px_-12px_hsl(var(--primary))] active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continuar <ArrowRight className="w-5 h-5" /></>}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default LocaleSetupPage;
