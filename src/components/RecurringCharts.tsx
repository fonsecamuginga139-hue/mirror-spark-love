import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { RecurringTransactionWithDetails } from "@/hooks/useRecurringTransactions";

interface RecurringChartsProps {
  recurringTransactions: RecurringTransactionWithDetails[];
  variant?: "dashboard" | "reports";
}

const RecurringCharts = ({ recurringTransactions, variant = "dashboard" }: RecurringChartsProps) => {
  const { formatCurrency } = useCurrency();

  // Calculate totals for active recurring
  const { totalRecurringIncome, totalRecurringExpense, monthlyRecurringBalance } = useMemo(() => {
    const active = recurringTransactions.filter(r => r.is_active);
    
    const income = active
      .filter(r => r.type === "income")
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    const expense = active
      .filter(r => r.type === "expense")
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    return {
      totalRecurringIncome: income,
      totalRecurringExpense: expense,
      monthlyRecurringBalance: income - expense,
    };
  }, [recurringTransactions]);

  // Date for simple bar chart (dashboard)
  const simpleChartDate = useMemo(() => [
    { name: "Income", value: totalRecurringIncome, color: "hsl(var(--income))" },
    { name: "Expenses", value: totalRecurringExpense, color: "hsl(var(--expense))" },
  ], [totalRecurringIncome, totalRecurringExpense]);

  // Date for comparison chart (reports) - recurring vs non-recurring
  const hasDate = totalRecurringIncome > 0 || totalRecurringExpense > 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.fill || entry.color }}>
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!hasDate) {
    return null;
  }

  // Yesple Dashboard Version
  if (variant === "dashboard") {
    const max = Math.max(totalRecurringIncome, totalRecurringExpense, 1);
    const rows = [
      { name: "Income", value: totalRecurringIncome, icon: "⬆️", color: "hsl(var(--income))" },
      { name: "Expenses", value: totalRecurringExpense, icon: "⬇️", color: "hsl(var(--expense))" },
    ];
    return (
      <div className="finance-card animate-fade-in-up mb-4" style={{ animationDelay: "0.4s" }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <RefreshCw className="text-primary" size={16} />
          </div>
          <h3 className="text-lg font-semibold font-display text-foreground">Recurring This Month</h3>
        </div>

        <div className="space-y-4">
          {rows.map((r) => {
            const pct = (r.value / max) * 100;
            const width = Math.max(pct, 8);
            return (
              <div key={r.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium">{r.name}</span>
                  <span className="text-muted-foreground tabular-nums">{formatCurrency(r.value)}</span>
                </div>
                <div className="relative h-8">
                  <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-primary/5" />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
                    style={{
                      width: `${width}%`,
                      background: `linear-gradient(90deg, ${r.color} / 0.35 0%, ${r.color} 100%)`,
                      backgroundImage: `linear-gradient(90deg, color-mix(in oklab, ${r.color} 35%, transparent) 0%, ${r.color} 100%)`,
                      boxShadow: `0 0 20px ${r.color}`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-base shadow-lg ring-2 ring-background transition-[left] duration-700 ease-out"
                    style={{ left: `calc(${width}% - 32px)`, background: r.color }}
                    aria-hidden
                  >
                    <span className="leading-none">{r.icon}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Balance</span>
          <span className={`font-bold tabular-nums ${monthlyRecurringBalance >= 0 ? "text-income" : "text-expense"}`}>
            {formatCurrency(monthlyRecurringBalance)}
          </span>
        </div>
      </div>
    );
  }

  // Reports Version - More detailed
  return (
    <div className="finance-card mb-6">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="text-primary" size={20} />
        <h3 className="text-lg font-semibold text-foreground">Transações Recurring</h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-income/10 border border-income/20 text-center">
          <span className="text-xs text-muted-foreground block mb-1">Income</span>
          <p className="text-lg font-bold text-income">{formatCurrency(totalRecurringIncome)}</p>
        </div>
        <div className="p-3 rounded-xl bg-expense/10 border border-expense/20 text-center">
          <span className="text-xs text-muted-foreground block mb-1">Expenses</span>
          <p className="text-lg font-bold text-expense">{formatCurrency(totalRecurringExpense)}</p>
        </div>
        <div className={`p-3 rounded-xl text-center ${monthlyRecurringBalance >= 0 ? "bg-income/10 border border-income/20" : "bg-expense/10 border border-expense/20"}`}>
          <span className="text-xs text-muted-foreground block mb-1">Balance</span>
          <p className={`text-lg font-bold ${monthlyRecurringBalance >= 0 ? "text-income" : "text-expense"}`}>
            {formatCurrency(monthlyRecurringBalance)}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={simpleChartDate} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80}>
              {simpleChartDate.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Active Count */}
      <p className="text-xs text-muted-foreground text-center mt-2">
        {recurringTransactions.filter(r => r.is_active).length} active recurring transactions
      </p>
    </div>
  );
};

export default RecurringCharts;
