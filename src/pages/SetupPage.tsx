import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const captions = [
  "A criar o seu perfil financeiro...",
  "A analisar as suas respostas...",
  "A construir a sua experiência personalizada...",
  "A preparar o seu painel...",
];

const SetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [captionIdx, setCaptionIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    const t1 = setInterval(() => setProgress((p) => Math.min(p + 2, 100)), 80);
    const t2 = setInterval(() => setCaptionIdx((i) => (i + 1) % captions.length), 1200);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  useEffect(() => {
    if (ranRef.current || !user) return;
    ranRef.current = true;

    const run = async () => {
      const raw = sessionStorage.getItem("onboarding_payload");
      if (!raw) { navigate("/dashboard", { replace: true }); return; }
      const data = JSON.parse(raw);

      // Persist user-selected currency (USD or EUR)
      const dbCurrency = data.currency === "EUR" ? "EUR" : "USD";

      const { error: profErr } = await supabase
        .from("profiles")
        .update({
          currency: dbCurrency,
          language: data.language || "en",
          name: data.name || null,
          onboarding_completed: true,
          pre_onboarding_completed: true,
          quiz_answers: {
            name: data.name,
            language: data.language,
            ageRange: data.ageRange,
            debtSituation: data.debtSituation,
            controlFocus: data.controlFocus,
            mainGoal: data.mainGoal,
            commitment: data.commitment,
            displayCurrency: data.currency,
          },
          monthly_income: data.monthlyIncome,
        })
        .eq("user_id", user.id);

      if (profErr) { setError(profErr.message); return; }

      const { data: card, error: cardErr } = await supabase
        .from("cards")
        .insert({
          user_id: user.id,
          name: data.cardName || "Cartão Principal",
          icon: data.cardIcon || "credit-card",
          color: data.cardColor || "#10B981",
        })
        .select()
        .single();

      if (cardErr) { setError(cardErr.message); return; }

      await supabase.from("goals").insert({
        user_id: user.id,
        name: data.mainGoal || "Minha primeira meta",
        target_amount: data.savingTarget || 1000,
        current_amount: 0,
        icon: "target",
        color: data.cardColor || "#10B981",
        card_id: card.id,
      });

      if (data.monthlyIncome > 0) {
        await supabase.from("recurring_transactions").insert({
          user_id: user.id,
          card_id: card.id,
          type: "income",
          amount: data.monthlyIncome,
          description: "Receita mensal",
          day_of_month: 1,
          auto_process: true,
          is_active: true,
        });
      }

      // Persist monthly fixed expenses from onboarding
      if (Array.isArray(data.monthlyBills) && data.monthlyBills.length > 0) {
        const rows = data.monthlyBills
          .filter((b: any) => b && typeof b.name === "string" && b.name.trim().length > 0)
          .map((b: any) => ({
            user_id: user.id,
            name: b.name.trim(),
            amount: Number(b.amount) || 0,
            currency: dbCurrency,
            active: true,
          }));
        if (rows.length > 0) {
          await (supabase as any).from("monthly_bills").insert(rows);
        }
      }

      sessionStorage.removeItem("onboarding_payload");
    };

    run();
  }, [user, navigate]);

  useEffect(() => {
    if (progress >= 100 && !error) {
      const t = setTimeout(() => navigate("/dashboard", { replace: true }), 400);
      return () => clearTimeout(t);
    }
  }, [progress, error, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_30%,hsl(var(--primary)/0.15),transparent)]" />
      <div className="relative z-10 w-full max-w-sm space-y-8 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto w-16 h-16"
        >
          <Loader2 className="w-16 h-16 text-primary" />
        </motion.div>

        <h1 className="text-2xl font-bold">{captions[captionIdx]}</h1>

        <div className="space-y-2">
          <div className="h-2 rounded-full bg-card overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/60"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <p className="text-sm text-muted-foreground tabular-nums">{progress}%</p>
        </div>

        {error && (
          <p className="text-sm text-destructive">
            Algo correu mal: {error}. <button onClick={() => navigate("/dashboard")} className="underline">Continuar</button>
          </p>
        )}
      </div>
    </div>
  );
};

export default SetupPage;