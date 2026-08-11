import { useState } from "react";
import { TrendingUp, Users, DollarSign, Loader2 } from "lucide-react";
import { useMrrStats } from "@/hooks/useMrrStats";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Currency = "USD" | "EUR";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
};

const MrrDashboard = () => {
  const { stats, history, loading } = useMrrStats();
  const [currency, setCurrency] = useState<Currency>("USD");

  const getMrr = () => {
    if (!stats) return 0;
    const key = `mrr_${currency.toLowerCase()}` as keyof typeof stats;
    return stats[key] as number;
  };

  const getChartDate = () =>
    history.map((item) => ({
      month: item.month,
      mrr: item[`mrr_${currency.toLowerCase()}` as keyof typeof item] as number,
    }));

  const formatCurrency = (value: number) =>
    `${CURRENCY_SYMBOLS[currency]}${value.toFixed(2)}`;

  if (loading) {
    return (
      <div className="finance-card">
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="finance-card space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Painel de MRR
        </h2>
        <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">$ USD</SelectItem>
            <SelectItem value="EUR">€ EUR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <DollarSign className="w-4 h-4" />
            MRR Total
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(getMrr())}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Users className="w-4 h-4" />
            Subscritores Ativos
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats?.total_active_subscribers ?? 0}
          </p>
        </div>
      </div>

      {/* Chart */}
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Histórico Mensal de MRR
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartDate()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${CURRENCY_SYMBOLS[currency]}${v}`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "MRR"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="mrr"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default MrrDashboard;
