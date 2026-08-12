import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/hooks/useCurrency";
import { useLanguage } from "@/context/LanguageContext";
import type { TransactionWithDetails } from "@/hooks/useTransactions";

type Mode = "expense" | "income";

interface Slice {
  id: string;
  name: string;
  icon: string;
  color: string;
  value: number;
  percent: number;
}

const EXPENSE_PALETTE = ["#ef4444", "#f97316", "#f59e0b", "#e11d48", "#fb7185", "#c2410c", "#dc2626"];
const INCOME_PALETTE = ["#10b981", "#22c55e", "#14b8a6", "#34d399", "#059669", "#4ade80", "#0d9488"];

/** Encolhe o texto do centro para nunca passar por cima do anel. */
const fitSize = (text: string) => {
  const n = text.length;
  if (n <= 9) return "1.25rem";
  if (n <= 12) return "1.05rem";
  if (n <= 15) return "0.9rem";
  if (n <= 18) return "0.78rem";
  return "0.68rem";
};

interface Props {
  transactions: TransactionWithDetails[];
  onSelect?: (categoryName: string) => void;
}

const CategoryDonutChart = ({ transactions, onSelect }: Props) => {
  const { formatCurrency } = useCurrency();
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>("expense");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { slices, total } = useMemo(() => {
    const palette = mode === "expense" ? EXPENSE_PALETTE : INCOME_PALETTE;
    const buckets = new Map<string, Slice>();
    let sum = 0;

    for (const tx of transactions) {
      if (tx.type !== mode) continue;
      const amount = Number(tx.amount) || 0;
      if (amount <= 0) continue;
      sum += amount;

      const name = tx.category_name || t("common.other");
      const key = tx.category_id || name;
      const existing = buckets.get(key);
      if (existing) {
        existing.value += amount;
      } else {
        buckets.set(key, {
          id: key,
          name,
          icon: tx.category_icon || tx.icon || (mode === "expense" ? "💸" : "💰"),
          color: tx.category_color || palette[buckets.size % palette.length],
          value: amount,
          percent: 0,
        });
      }
    }

    const list = [...buckets.values()].sort((a, b) => b.value - a.value);
    for (const s of list) s.percent = sum > 0 ? (s.value / sum) * 100 : 0;
    return { slices: list, total: sum };
  }, [transactions, mode, t]);

  const active = activeIndex !== null ? slices[activeIndex] : null;
  const accent = mode === "expense" ? "text-expense" : "text-income";

  return (
    <section className="rounded-[28px] border border-primary/20 bg-card/60 backdrop-blur-xl p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">
          {t("dashboard.byCategory")}
        </h2>
        <div className="inline-flex p-1 rounded-full border border-primary/20 bg-background/50">
          {(["expense", "income"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setActiveIndex(null);
              }}
              className={`relative px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                mode === m ? "text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === m && (
                <motion.span
                  layoutId="donut-mode-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className={`absolute inset-0 rounded-full ${
                    m === "expense" ? "bg-expense" : "bg-income"
                  }`}
                />
              )}
              <span className="relative">
                {m === "expense" ? t("dashboard.expenses") : t("dashboard.income")}
              </span>
            </button>
          ))}
        </div>
      </header>

      {slices.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {t("dashboard.noData")}
        </p>
      ) : (
        <>
          <motion.div
            className="relative h-56"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={94}
                  paddingAngle={3}
                  cornerRadius={8}
                  strokeWidth={0}
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive
                  animationBegin={120}
                  animationDuration={900}
                  animationEasing="ease-out"
                  activeIndex={activeIndex ?? undefined}
                  activeShape={(props: any) => (
                    <Sector {...props} outerRadius={props.outerRadius + 7} />
                  )}
                  onMouseEnter={(_, i) => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={(_, i) => onSelect?.(slices[i].name)}
                >
                  {slices.map((s) => (
                    <Cell key={s.id} fill={s.color} className="cursor-pointer outline-none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active?.id ?? "total"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="text-center w-[122px]"
                >
                  {active ? (
                    <>
                      <div className="text-xl leading-none mb-0.5">{active.icon}</div>
                      <p className="text-[11px] text-muted-foreground truncate">{active.name}</p>
                      <p
                        className={`font-bold tabular-nums leading-tight break-words ${accent}`}
                        style={{ fontSize: fitSize(formatCurrency(active.value)) }}
                      >
                        {formatCurrency(active.value)}
                      </p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        {active.percent.toFixed(0)}%
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                        {mode === "expense" ? t("dashboard.expenses") : t("dashboard.income")}
                      </p>
                      <p
                        className={`font-bold tabular-nums leading-tight break-words ${accent}`}
                        style={{ fontSize: fitSize(formatCurrency(total)) }}
                      >
                        {formatCurrency(total)}
                      </p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>


          <ul className="mt-4 space-y-1">
            {slices.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <button
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={() => onSelect?.(s.name)}
                  className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors ${
                    activeIndex === i ? "bg-primary/10" : "hover:bg-primary/5"
                  }`}
                >
                  <span
                    className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-base"
                    style={{ backgroundColor: `${s.color}22`, border: `1px solid ${s.color}55` }}
                  >
                    {s.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-foreground truncate">
                      {s.name}
                    </span>
                    <span className="mt-1 block h-1 rounded-full bg-muted/40 overflow-hidden">
                      <motion.span
                        className="block h-full rounded-full"
                        style={{ backgroundColor: s.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${s.percent}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </span>
                  </span>
                  <span className="text-right shrink-0">
                    <span className={`block text-sm font-semibold tabular-nums ${accent}`}>
                      {formatCurrency(s.value)}
                    </span>
                    <span className="block text-xs text-muted-foreground tabular-nums">
                      {s.percent.toFixed(0)}%
                    </span>
                  </span>
                </button>
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

export default CategoryDonutChart;
