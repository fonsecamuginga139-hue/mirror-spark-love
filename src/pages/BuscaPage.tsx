import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import BackButton from "@/components/BackButton";
import BottomNav from "@/components/BottomNav";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrency } from "@/hooks/useCurrency";

type Filter = "all" | "income" | "expense";
type Range = "7d" | "30d" | "90d" | "all";

const BuscaPage = () => {
  const { transactions, loading } = useTransactions();
  const { formatCurrency } = useCurrency();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [range, setRange] = useState<Range>("30d");

  const filtered = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    if (range === "7d") cutoff.setDate(now.getDate() - 7);
    else if (range === "30d") cutoff.setDate(now.getDate() - 30);
    else if (range === "90d") cutoff.setDate(now.getDate() - 90);
    else cutoff.setFullYear(1970);

    const needle = q.trim().toLowerCase();
    return transactions.filter((t) => {
      if (filter !== "all" && t.type !== filter) return false;
      const d = new Date(t.date);
      if (d < cutoff) return false;
      if (!needle) return true;
      return (
        (t.description || "").toLowerCase().includes(needle) ||
        (t.category_name || "").toLowerCase().includes(needle) ||
        (t.card_name || "").toLowerCase().includes(needle)
      );
    });
  }, [transactions, q, filter, range]);

  const totalIn = filtered.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  // Line chart daily net (last N days from range)
  const chart = useMemo(() => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 30;
    const map = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      map.set(d.toISOString().slice(0, 10), 0);
    }
    filtered.forEach((t) => {
      const key = t.date.slice(0, 10);
      if (map.has(key)) {
        const delta = t.type === "income" ? Number(t.amount) : -Number(t.amount);
        map.set(key, (map.get(key) || 0) + delta);
      }
    });
    return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
  }, [filtered, range]);

  const maxAbs = Math.max(...chart.map((c) => Math.abs(c.value)), 1);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <BackButton to="/dashboard" />
          <h1 className="text-lg font-semibold font-display text-foreground">Pesquisar</h1>
          <div className="w-10" />
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar descrição, categoria, cartão…"
            className="input-field pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(["all", "income", "expense"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition ${
                filter === f
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                  : "bg-primary/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
          <span className="mx-1 text-muted-foreground">·</span>
          {(["7d", "30d", "90d", "all"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                range === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="finance-card !p-3">
            <div className="flex items-center gap-2 text-income">
              <TrendingUp size={14} />
              <span className="text-xs uppercase">Entrada</span>
            </div>
            <p className="text-lg font-bold tabular-nums text-foreground mt-1">
              {formatCurrency(totalIn)}
            </p>
          </div>
          <div className="finance-card !p-3">
            <div className="flex items-center gap-2 text-expense">
              <TrendingDown size={14} />
              <span className="text-xs uppercase">Saída</span>
            </div>
            <p className="text-lg font-bold tabular-nums text-foreground mt-1">
              {formatCurrency(totalOut)}
            </p>
          </div>
        </div>

        {/* Futuristic bar chart */}
        <div className="finance-card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={14} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Fluxo líquido</h3>
          </div>
          <div className="flex items-end gap-[2px] h-28">
            {chart.map((c, i) => {
              const h = (Math.abs(c.value) / maxAbs) * 100;
              const positive = c.value >= 0;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h || 2}%` }}
                  transition={{ delay: i * 0.005 }}
                  className={`flex-1 rounded-sm ${
                    positive
                      ? "bg-gradient-to-t from-primary/30 to-primary shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
                      : "bg-gradient-to-t from-destructive/30 to-destructive"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            No transactions found.
          </p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((t) => (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="finance-card flex items-center justify-between !p-3"
              >
                <div className="min-w-0">
                  <p className="text-foreground font-medium truncate">
                    {t.description || t.category_name || "Transação"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t.category_name || "Sem categoria"} · {new Date(t.date).toLocaleDateString()}
                    {t.card_name ? ` · ${t.card_name}` : ""}
                  </p>
                </div>
                <span
                  className={`font-semibold tabular-nums shrink-0 ${
                    t.type === "income" ? "text-income" : "text-expense"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatCurrency(Number(t.amount))}
                </span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default BuscaPage;
