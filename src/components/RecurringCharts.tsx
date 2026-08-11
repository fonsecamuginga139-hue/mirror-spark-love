import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { RecurringTransactionWithDetails } from "@/hooks/useRecurringTransactions";

interface RecurringChartsProps {
  recurringTransactions: RecurringTransactionWithDetails[];
  variant?: "dashboard" | "reports";
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const RecurringCharts = ({ recurringTransactions, variant = "dashboard" }: RecurringChartsProps) => {
  const { formatCurrency } = useCurrency();

  const { receitas, despesas, saldo } = useMemo(() => {
    const activos = recurringTransactions.filter((r) => r.is_active);
    const income = activos
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const expense = activos
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + Number(r.amount), 0);
    return { receitas: income, despesas: expense, saldo: income - expense };
  }, [recurringTransactions]);

  // Projecção dos próximos 6 meses com base nos recorrentes activos.
  const projeccao = useMemo(() => {
    const hoje = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      return {
        mes: MESES[d.getMonth()],
        receitas,
        despesas,
        saldo,
      };
    });
  }, [receitas, despesas, saldo]);

  const temDados = receitas > 0 || despesas > 0;
  if (!temDados) return null;

  const Tip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-border bg-card/95 px-3 py-2 shadow-xl backdrop-blur-sm">
        <p className="mb-1 text-xs text-muted-foreground">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: entry.stroke }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  const max = Math.max(receitas, despesas, 1);

  return (
    <section
      className="rounded-[28px] border border-primary/20 bg-card/60 backdrop-blur-xl p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] animate-fade-in-up mb-4"
      style={{ animationDelay: "0.15s" }}
    >
      <header className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
          <RefreshCw size={15} />
        </span>
        <h3 className="text-sm font-semibold text-foreground">Recorrentes deste mês</h3>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Receitas", value: receitas, cls: "text-income" },
          { label: "Despesas", value: despesas, cls: "text-expense" },
          { label: "Saldo", value: saldo, cls: saldo >= 0 ? "text-income" : "text-expense" },
        ].map((c) => (
          <div key={c.label} className="min-w-0 rounded-2xl border border-primary/10 bg-background/40 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{c.label}</p>
            <p className={`truncate text-sm font-bold tabular-nums ${c.cls}`}>
              {formatCurrency(Math.abs(c.value))}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {[
          { label: "Receitas", value: receitas, color: "hsl(var(--income))" },
          { label: "Despesas", value: despesas, color: "hsl(var(--expense))" },
        ].map((r) => (
          <div key={r.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{r.label}</span>
              <span className="tabular-nums text-muted-foreground">{formatCurrency(r.value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted/30">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max((r.value / max) * 100, 4)}%`, backgroundColor: r.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {variant === "reports" && (
        <div className="mt-5 h-44">
          <p className="mb-2 text-xs text-muted-foreground">Projecção dos próximos 6 meses</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projeccao} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="rc-in" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--income))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--income))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rc-out" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--expense))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--expense))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.35} />
              <XAxis
                dataKey="mes"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip content={<Tip />} />
              <Area
                type="monotone"
                dataKey="receitas"
                name="Receitas"
                stroke="hsl(var(--income))"
                strokeWidth={2}
                fill="url(#rc-in)"
              />
              <Area
                type="monotone"
                dataKey="despesas"
                name="Despesas"
                stroke="hsl(var(--expense))"
                strokeWidth={2}
                fill="url(#rc-out)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default RecurringCharts;
