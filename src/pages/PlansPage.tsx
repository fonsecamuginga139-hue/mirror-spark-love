import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowLeft, Loader2, Sparkles, Crown } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useCurrency } from "@/hooks/useCurrency";
import { openCheckout } from "@/components/CheckoutRedirect";
import { useCheckoutUrl } from "@/hooks/usePaymentSettings";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

type PlanKey = "monthly" | "yearly";

const benefits = [
  "Armazenamento ilimitado",
  "Organização inteligente",
  "Backup seguro",
  "Sincronização instantânea",
  "Funcionalidades premium futuras",
];

const PlansPage = () => {
  const navigate = useNavigate();
  const { isActive, isAdmin } = useSubscription();
  const { currency } = useCurrency();
  const { monthlyCheckoutUrl, yearlyCheckoutUrl, loading: loadingUrl } = useCheckoutUrl();
  const { profile } = useAuth();
  const [selected, setSelected] = useState<PlanKey>("yearly");
  const [submitting, setSubmitting] = useState(false);

  const symbol = currency === "EUR" ? "€" : currency === "BRL" ? "R$" : currency === "GBP" ? "£" : "$";
  const monthlyPrice = 4.99;
  const yearlyPrice = 9.99;
  const savings = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);

  if (isActive && !isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.4)]">
            <Crown className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Já é Premium</h1>
          <p className="text-white/60">A sua subscrição está ativa. Desfrute da experiência completa do VAULT.</p>
          <Button onClick={() => navigate("/dashboard")} className="w-full h-12 rounded-2xl">
            Voltar ao Painel
          </Button>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    const url = selected === "yearly" ? yearlyCheckoutUrl || monthlyCheckoutUrl : monthlyCheckoutUrl;
    setSubmitting(true);
    openCheckout(url, profile?.email ?? undefined);
    setTimeout(() => setSubmitting(false), 1200);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pb-32">
      <SEO
        title="Vault Premium — Planos e preços"
        description="Desbloqueie o Vault Premium: armazenamento ilimitado, organização inteligente e sincronização instantânea. Escolha o plano mensal ou poupe com o plano anual."
        path="/plans"
      />
      {/* Ambient green glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.35),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.18),transparent_70%)] blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 backdrop-blur border border-white/10 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs text-white/40 uppercase tracking-widest">Premium</span>
        <div className="w-10" />
      </div>

      <main className="relative z-10 max-w-md mx-auto px-5 pt-6">
        {/* Logo + Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <img
            src="/vault-logo.png"
            alt="Logótipo de gestão financeira VAULT"
            className="w-20 h-20 mx-auto rounded-2xl object-cover shadow-[0_0_60px_rgba(34,197,94,0.45)]"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-medium">
            <Sparkles className="w-3 h-3" /> VAULT Premium
          </div>
          <h1 className="text-3xl font-bold leading-tight">
            Desbloqueie Todo o Potencial<br />do VAULT
          </h1>
          <p className="text-white/60 text-sm px-4">
            Organize, proteja e aceda a tudo num só lugar.
          </p>
        </motion.div>

        {/* Benefits */}
        <div className="mt-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-5 space-y-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
              </div>
              <span className="text-sm text-white/90">{b}</span>
            </motion.div>
          ))}
        </div>

        {/* Plans */}
        <div className="mt-8 space-y-3">
          {/* Monthly */}
          <PlanCard
            active={selected === "monthly"}
            onClick={() => setSelected("monthly")}
            title="Mensal"
            subtitle="Faturado mensalmente"
            price={`${symbol}${monthlyPrice.toFixed(2)}`}
            period="/mês"
          />

          {/* Yearly — BEST VALUE */}
          <PlanCard
            active={selected === "yearly"}
            onClick={() => setSelected("yearly")}
            title="Anual"
            subtitle={`Apenas ${symbol}${(yearlyPrice / 12).toFixed(2)} / mês`}
            price={`${symbol}${yearlyPrice.toFixed(2)}`}
            period="/ano"
            badge="MELHOR VALOR"
            savingsLabel={`Poupe ${savings}%`}
            highlighted
          />
        </div>

        <p className="text-center text-[11px] text-white/40 mt-6">
          Checkout seguro · Cancele quando quiser · Sem taxas ocultas
        </p>
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-6 pt-4 bg-gradient-to-t from-black via-black/95 to-transparent">
        <div className="max-w-md mx-auto">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
            disabled={loadingUrl || submitting}
            className="w-full h-14 rounded-2xl font-semibold text-base text-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] shadow-[0_10px_40px_-10px_rgba(34,197,94,0.7)] active:shadow-[0_5px_20px_-5px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Continuar · {selected === "yearly" ? `${symbol}${yearlyPrice.toFixed(2)}/ano` : `${symbol}${monthlyPrice.toFixed(2)}/mês`}</>
            )}
          </motion.button>
          <button
            onClick={() => navigate("/dashboard")}
            className="block w-full text-center text-xs text-white/40 mt-3"
          >
            Talvez mais tarde
          </button>
        </div>
      </div>
    </div>
  );
};

interface PlanCardProps {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  price: string;
  period: string;
  badge?: string;
  savingsLabel?: string;
  highlighted?: boolean;
}

const PlanCard = ({ active, onClick, title, subtitle, price, period, badge, savingsLabel, highlighted }: PlanCardProps) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative w-full text-left rounded-3xl p-5 transition-all duration-300 backdrop-blur-xl border ${
      active
        ? "border-primary bg-gradient-to-br from-primary/15 to-primary/5 shadow-[0_0_40px_rgba(34,197,94,0.35)]"
        : "border-white/10 bg-white/[0.04]"
    } ${highlighted && !active ? "border-primary/40" : ""}`}
  >
    {badge && (
      <span className="absolute -top-2 right-4 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black shadow-lg">
        {badge}
      </span>
    )}
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-xs text-white/50 mt-0.5">{subtitle}</p>
        {savingsLabel && (
          <p className="text-xs text-primary font-semibold mt-1">{savingsLabel}</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold">{price}</p>
        <p className="text-[11px] text-white/50">{period}</p>
      </div>
      <div
        className={`absolute top-5 right-5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          active ? "border-primary bg-primary" : "border-white/30"
        } ${badge ? "hidden" : ""}`}
      >
        {active && <Check className="w-3 h-3 text-black" strokeWidth={4} />}
      </div>
    </div>
  </motion.button>
);

export default PlansPage;
