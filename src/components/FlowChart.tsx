import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import type { TransactionWithDetails } from "@/hooks/useTransactions";

interface Props {
  transactions: TransactionWithDetails[];
  days?: number;
}

/** Evolução do saldo acumulado nos últimos dias — leitura imediata da tendência. */
const FlowChart = ({ transactions, days = 30 }: Props) => {
  const { formatCurrency } = useCurrency();

  const data = useMemo(() => {
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - (days - 1));

    const porDia = new Map<string, number>();
    for (const t of transactions) {
      const key = String(t.occurred_on).slice(0, 10);
      const valor = t.type === "income" ? Number(t.amount) : -Number(t.amount);
      porDia.set(key, (porDia.get(key) ?? 0) + valor);
    }

    let acumulado = 0;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      acumulado += porDia.get(key) ?? 0;
      return {
        dia: d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }),
        saldo: acumulado,
      };
    });
  }, [transactions, days]);

  const ultimo = data[data.length - 1]?.saldo ?? 0;
  const positivo = ultimo >= 0;

  const Tip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-border bg-card/95 px-3 py-2 shadow-xl backdrop-blur-sm">
        <p className="mb-1 text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground tabular-nums">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  };

  if (transactions.length === 0) return null;

  return (
    <section className="mb-4 rounded-[28px] border border-primary/20 bg-card/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      <header className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <TrendingUp size={15} />
          </span>
          <h3 className="truncate text-sm font-semibold text-foreground">Evolução do saldo</h3>
        </div>
        <span
          className={`shrink-0 text-sm font-bold tabular-nums ${positivo ? "text-income" : "text-expense"}`}
        >
          {positivo ? "+" : "−"} {formatCurrency(Math.abs(ultimo))}
        </span>
      </header>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="flow-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.3} />
            <XAxis
              dataKey="dia"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip content={<Tip />} />
            <Area
              type="monotone"
              dataKey="saldo"
              stroke="hsl(var(--primary))"
              strokeWidth={2.4}
              fill="url(#flow-grad)"
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">Últimos {days} dias</p>
    </section>
  );
};

export default FlowChart;
