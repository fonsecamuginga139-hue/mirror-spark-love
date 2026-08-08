import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Minus, Plus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import BackButton from "@/components/BackButton";
import SEO from "@/components/SEO";
import CurrencyInput from "@/components/CurrencyInput";
import { Button } from "@/components/ui/button";
import { useEmergencyFund } from "@/hooks/useEmergencyFund";
import { useCurrency } from "@/hooks/useCurrency";
import { useLanguage } from "@/context/LanguageContext";
import { useTransactions } from "@/hooks/useTransactions";

const FundoPage = () => {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const { fund, loading, update, target, current, progress } = useEmergencyFund();
  const { transactions } = useTransactions();
  const [amount, setAmount] = useState(0);

  const suggestedCost = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const expenses = transactions.filter(
      (tx) => tx.type === "expense" && new Date(tx.occurred_on) >= start,
    );
    if (!expenses.length) return 0;
    const sum = expenses.reduce((acc, tx) => acc + Number(tx.amount), 0);
    return Math.round(sum / 3);
  }, [transactions]);

  if (loading || !fund) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const remaining = Math.max(0, target - current);
  const plans = [
    { months: 6, key: "basic" as const },
    { months: 12, key: "shielded" as const },
  ];

  return (
    <div className="min-h-screen bg-background pb-28">
      <SEO
        title={`${t("emergency.title")} — Vault`}
        description={t("emergency.subtitle")}
        path="/emergency"
        noindex
      />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("emergency.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("emergency.subtitle")}</p>
          </div>
        </div>

        {/* Shield */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-52 h-52">
            <svg viewBox="0 0 100 110" className="w-full h-full">
              <defs>
                <clipPath id="shield-clip">
                  <path d="M50 3 L92 20 V56 C92 82 72 99 50 106 C28 99 8 82 8 56 V20 Z" />
                </clipPath>
                <linearGradient id="shield-fill" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.45" />
                </linearGradient>
              </defs>
              <path
                d="M50 3 L92 20 V56 C92 82 72 99 50 106 C28 99 8 82 8 56 V20 Z"
                fill="hsl(var(--muted))"
                fillOpacity="0.18"
                stroke="hsl(var(--primary))"
                strokeOpacity="0.45"
                strokeWidth="1.6"
              />
              <g clipPath="url(#shield-clip)">
                <motion.rect
                  x="0"
                  width="100"
                  fill="url(#shield-fill)"
                  initial={{ height: 0, y: 110 }}
                  animate={{ height: (progress / 100) * 110, y: 110 - (progress / 100) * 110 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
              </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Shield className="text-primary mb-1" size={22} />
              <span className="text-3xl font-bold tabular-nums text-foreground">
                {progress.toFixed(0)}%
              </span>
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold tabular-nums text-foreground">
            {formatCurrency(current)}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("emergency.of")} {formatCurrency(target)}
          </p>
          {remaining > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("emergency.remaining")}: {formatCurrency(remaining)}
            </p>
          )}
        </div>

        {/* Plans */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {plans.map((p) => {
            const active = fund.target_months === p.months;
            return (
              <button
                key={p.months}
                onClick={() => update({ target_months: p.months })}
                className={`rounded-2xl p-4 text-left border transition-all ${
                  active
                    ? "border-primary bg-primary/10 shadow-[0_0_24px_-8px_hsl(var(--primary))]"
                    : "border-border/60 bg-card/50 hover:border-primary/40"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">
                  {t(`emergency.plan.${p.key}`)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("emergency.months", { count: p.months })}
                </p>
              </button>
            );
          })}
        </div>

        {/* Monthly cost */}
        <div className="rounded-2xl border border-border/60 bg-card/50 p-4 mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("emergency.monthlyCost")}
          </label>
          <CurrencyInput
            value={fund.monthly_cost}
            onChange={(v) => update({ monthly_cost: v })}
          />
          {suggestedCost > 0 && suggestedCost !== fund.monthly_cost && (
            <button
              onClick={() => update({ monthly_cost: suggestedCost })}
              className="mt-2 text-xs text-primary hover:underline"
            >
              {t("emergency.useAverage", { value: formatCurrency(suggestedCost) })}
            </button>
          )}
        </div>

        {/* Deposit / withdraw */}
        <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("emergency.adjustBalance")}
          </label>
          <CurrencyInput value={amount} onChange={setAmount} />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Button
              variant="outline"
              disabled={amount <= 0}
              onClick={() => {
                update({ current_amount: Math.max(0, current - amount) });
                setAmount(0);
              }}
            >
              <Minus size={16} className="mr-1" /> {t("emergency.withdraw")}
            </Button>
            <Button
              disabled={amount <= 0}
              onClick={() => {
                update({ current_amount: current + amount });
                setAmount(0);
              }}
            >
              <Plus size={16} className="mr-1" /> {t("emergency.deposit")}
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default FundoPage;
