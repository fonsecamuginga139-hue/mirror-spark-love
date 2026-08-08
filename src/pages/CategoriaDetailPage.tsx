import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, PanInfo } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import BackButton from "@/components/BackButton";
import BottomNav from "@/components/BottomNav";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrency } from "@/hooks/useCurrency";

const CategoriaDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const categoryName = decodeURIComponent(id || "");
  const navigate = useNavigate();
  const { transactions, loading } = useTransactions();
  const { formatCurrency } = useCurrency();
  const [dragY, setDragY] = useState(0);
  const constraints = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      transactions.filter(
        (t) => (t.category_name || "Other").toLowerCase() === categoryName.toLowerCase(),
      ),
    [transactions, categoryName],
  );

  const total = filtered.reduce((s, t) => s + Number(t.amount), 0);
  const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  // Build 12-week bar chart (last 12 weeks totals)
  const bars = useMemo(() => {
    const now = new Date();
    const weeks: { label: string; value: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i * 7 - now.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const sum = filtered
        .filter((t) => {
          const d = new Date(t.date);
          return d >= start && d <= end;
        })
        .reduce((s, t) => s + Number(t.amount), 0);
      weeks.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, value: sum });
    }
    return weeks;
  }, [filtered]);

  const max = Math.max(...bars.map((b) => b.value), 1);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 400) {
      navigate("/dashboard");
    } else {
      setDragY(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div ref={constraints} className="min-h-screen bg-background pb-32 overflow-hidden">
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDrag={(_, info) => setDragY(Math.max(0, info.offset.y))}
        onDragEnd={handleDragEnd}
        style={{ y: dragY }}
        className="relative p-4 max-w-lg mx-auto"
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-2">
          <div className="w-10 h-1 rounded-full bg-primary/30" />
        </div>

        <div className="flex items-center justify-between mb-5">
          <BackButton to="/dashboard" />
          <p className="text-xs text-muted-foreground">Swipe down to close</p>
        </div>

        <div className="finance-card mb-5">
          <p className="text-sm text-muted-foreground">{categoryName}</p>
          <p className="text-4xl font-bold font-display tabular-nums text-foreground mt-1">
            {formatCurrency(total)}
          </p>
          <div className="flex gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <TrendingUp size={14} /> {formatCurrency(income)}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
              <TrendingDown size={14} /> {formatCurrency(expense)}
            </span>
          </div>
        </div>

        {/* Futuristic bar chart */}
        <div className="finance-card mb-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Last 12 weeks</h3>
          <div className="flex items-end gap-1.5 h-40">
            {bars.map((b, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(b.value / max) * 100}%` }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 120 }}
                className="flex-1 rounded-t-lg bg-gradient-to-t from-primary/40 to-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                title={`${b.label}: ${formatCurrency(b.value)}`}
              />
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              No transactions in this category.
            </p>
          ) : (
            filtered.map((t) => {
              const desc = t.description || categoryName;
              // Extract leading emoji (if voice/scan stored one) so we can show
              // the item icon on the row while the category keeps its own.
              const match = desc.match(/^(\p{Extended_Pictographic}(?:\uFE0F)?)\s*(.*)$/u);
              const itemEmoji = match?.[1] ?? "•";
              const label = match?.[2]?.trim() || desc;
              return (
                <div
                  key={t.id}
                  className="finance-card flex items-center justify-between !p-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0">
                      {itemEmoji}
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground font-medium truncate">{label}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold tabular-nums ${
                      t.type === "income" ? "text-income" : "text-expense"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(Number(t.amount))}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
      <BottomNav />
    </div>
  );
};

export default CategoriaDetailPage;
