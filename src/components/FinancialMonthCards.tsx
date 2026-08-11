import { useMemo } from "react";
import { motion } from "framer-motion";
import { PiggyBank, ShoppingBag, Target, TrendingUp } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useGoals } from "@/hooks/useGoals";
import { useCurrency } from "@/hooks/useCurrency";

const FinancialMonthCards = () => {
  const { transactions } = useTransactions();
  const { goals } = useGoals();
  const { formatCurrency } = useCurrency();

  const stats = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const prevDate = new Date(y, m - 1, 1);
    const pm = prevDate.getMonth();
    const py = prevDate.getFullYear();

    const inMonth = (d: Date, mm: number, yy: number) =>
      d.getMonth() === mm && d.getFullYear() === yy;

    let monthIncome = 0;
    let monthExpense = 0;
    let prevIncome = 0;
    let prevExpense = 0;
    const categoryTotals = new Map<string, number>();

    for (const t of transactions) {
      const d = new Date(t.date);
      const amt = Number(t.amount);
      if (inMonth(d, m, y)) {
        if (t.type === "income") monthIncome += amt;
        else {
          monthExpense += amt;
          const key = (t as any).category?.name || "Other";
          categoryTotals.set(key, (categoryTotals.get(key) || 0) + amt);
        }
      } else if (inMonth(d, pm, py)) {
        if (t.type === "income") prevIncome += amt;
        else prevExpense += amt;
      }
    }

    const saved = monthIncome - monthExpense;
    const prevBalance = prevIncome - prevExpense;
    const growth = prevBalance !== 0 ? ((saved - prevBalance) / Math.abs(prevBalance)) * 100 : (saved > 0 ? 100 : 0);

    let topCategory = "—";
    let topAmount = 0;
    for (const [k, v] of categoryTotals) {
      if (v > topAmount) { topAmount = v; topCategory = k; }
    }

    const completedGoals = goals.filter((g) =>
      g.completed || Number(g.current_amount) >= Number(g.target_amount)
    ).length;

    return { saved, topCategory, completedGoals, growth };
  }, [transactions, goals]);

  const cards = [
    {
      icon: PiggyBank,
      label: "Poupou",
      value: formatCurrency(Math.max(0, stats.saved)),
      tone: "text-primary",
    },
    {
      icon: ShoppingBag,
      label: "Maior despesa",
      value: stats.topCategory,
      tone: "text-foreground",
      small: true,
    },
    {
      icon: Target,
      label: "Objetivos concluídos",
      value: String(stats.completedGoals),
      tone: "text-primary",
    },
    {
      icon: TrendingUp,
      label: "Crescimento do saldo",
      value: `${stats.growth >= 0 ? "+" : ""}${stats.growth.toFixed(0)}%`,
      tone: stats.growth >= 0 ? "text-primary" : "text-expense",
    },
  ];

  return (
    <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">O Seu Mês Financeiro</h3>
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
          {new Date().toLocaleString("pt-PT", { month: "short", year: "numeric" })}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="rounded-2xl p-4 bg-white/[0.04] backdrop-blur-xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-muted-foreground">{c.label}</span>
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className={`font-bold truncate ${c.tone} ${c.small ? "text-base" : "text-lg"}`}>
                {c.value}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FinancialMonthCards;