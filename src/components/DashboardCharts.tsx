import { useMemo, useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, Maximize2, X, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { TransactionWithDetails } from "@/hooks/useTransactions";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DashboardChartsProps {
  transactions: TransactionWithDetails[];
}

const DashboardCharts = ({ transactions }: DashboardChartsProps) => {
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const [fullscreenChart, setFullscreenChart] = useState<"cashflow" | "monthly" | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Cash Flow Date - accumulated balance over time
  const cashFlowDate = useMemo(() => {
    if (transactions.length === 0) return [];

    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const dailyMap = new Map<string, number>();
    let accumulated = 0;

    sorted.forEach((t) => {
      const dateKey = new Date(t.date).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
      });
      const amount = t.type === "income" ? Number(t.amount) : -Number(t.amount);
      accumulated += amount;
      dailyMap.set(dateKey, accumulated);
    });

    const entries = Array.from(dailyMap.entries());
    const lastEntries = entries.slice(-14);

    return lastEntries.map(([date, balance]) => ({
      date,
      balance,
    }));
  }, [transactions]);

  // Calculate trend
  const trend = useMemo(() => {
    if (cashFlowDate.length < 2) return "neutral";
    const first = cashFlowDate[0].balance;
    const last = cashFlowDate[cashFlowDate.length - 1].balance;
    const diff = last - first;
    const percentChange = first !== 0 ? (diff / Math.abs(first)) * 100 : 0;
    
    return {
      direction: diff > 0 ? "up" : diff < 0 ? "down" : "neutral",
      value: Math.abs(percentChange).toFixed(1),
      diff: diff,
    };
  }, [cashFlowDate]);

  // Monthly Comparison Date - last 3 months
  const monthlyComparisonDate = useMemo(() => {
    const now = new Date();
    const months: { month: string; income: number; expense: number }[] = [];

    for (let i = 2; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = targetDate.toLocaleDateString("pt-PT", {
        month: "short",
      }).replace(".", "");

      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getMonth() === targetDate.getMonth() &&
          tDate.getFullYear() === targetDate.getFullYear()
        );
      });

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      months.push({ month: monthKey.charAt(0).toUpperCase() + monthKey.slice(1), income, expense });
    }

    return months;
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    const symbol = getCurrencySymbol();
    if (Math.abs(value) >= 1000) {
      return `${symbol}${(value / 1000).toFixed(0)}k`;
    }
    return `${symbol}${value.toFixed(0)}`;
  };

  if (transactions.length === 0) {
    return null;
  }

  const TrendIndicator = () => {
    if (typeof trend === "string") return null;
    
    const isUp = trend.direction === "up";
    const isNeutral = trend.direction === "neutral";
    
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        isUp ? "bg-income/20 text-income" : 
        isNeutral ? "bg-muted text-muted-foreground" : 
        "bg-expense/20 text-expense"
      }`}>
        {isUp ? <ArrowUpRight size={14} /> : isNeutral ? <Minus size={14} /> : <ArrowDownRight size={14} />}
        <span>{trend.value}%</span>
      </div>
    );
  };

  const CashFlowChart = ({ isFullscreen = false }: { isFullscreen?: boolean }) => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={cashFlowDate} margin={{ top: 5, right: 10, left: isFullscreen ? 0 : -15, bottom: 0 }}>
        <defs>
          <linearGradient id="cashFlowGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis 
          dataKey="date" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isFullscreen ? 12 : 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          tickFormatter={formatYAxis}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isFullscreen ? 12 : 10 }}
          tickLine={false}
          axisLine={false}
          width={isFullscreen ? 60 : 50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="url(#cashFlowGradient)"
          strokeWidth={isFullscreen ? 4 : 3}
          dot={false}
          activeDot={{ r: isFullscreen ? 6 : 4, fill: 'hsl(var(--primary))' }}
          isAnimationActive={isAnimated}
          animationDuration={1500}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const MonthlyChart = ({ isFullscreen = false }: { isFullscreen?: boolean }) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={monthlyComparisonDate} margin={{ top: 5, right: 10, left: isFullscreen ? 0 : -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis 
          dataKey="month" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isFullscreen ? 14 : 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          tickFormatter={formatYAxis}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isFullscreen ? 12 : 10 }}
          tickLine={false}
          axisLine={false}
          width={isFullscreen ? 60 : 50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="income" 
          name="Income" 
          fill="hsl(var(--income))" 
          radius={[4, 4, 0, 0]}
          maxBarSize={isFullscreen ? 60 : 40}
          isAnimationActive={isAnimated}
          animationDuration={1200}
          animationEasing="ease-out"
        />
        <Bar 
          dataKey="expense" 
          name="Expenses" 
          fill="hsl(var(--expense))" 
          radius={[4, 4, 0, 0]}
          maxBarSize={isFullscreen ? 60 : 40}
          isAnimationActive={isAnimated}
          animationDuration={1400}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <>
      <div className="space-y-4 mb-6">
        {/* Cash Flow Chart */}
        {cashFlowDate.length > 1 && (
          <div 
            className="finance-card animate-fade-in-up"
            style={{ animationDelay: '0.35s' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  typeof trend !== "string" && trend.direction === "up" ? "bg-income/20" :
                  typeof trend !== "string" && trend.direction === "down" ? "bg-expense/20" :
                  "bg-primary/20"
                }`}>
                  {typeof trend !== "string" && trend.direction === "up" ? (
                    <TrendingUp className="text-income" size={16} />
                  ) : typeof trend !== "string" && trend.direction === "down" ? (
                    <TrendingDown className="text-expense" size={16} />
                  ) : (
                    <TrendingUp className="text-primary" size={16} />
                  )}
                </div>
                <h3 className="text-lg font-semibold font-display text-foreground">Cash Flow</h3>
              </div>
              <div className="flex items-center gap-2">
                <TrendIndicator />
                <button
                  onClick={() => setFullscreenChart("cashflow")}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  aria-label="Expand chart"
                >
                  <Maximize2 size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <div className="h-40 w-full">
              <CashFlowChart />
            </div>
            
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {typeof trend !== "string" && trend.direction === "up" 
                ? "📈 Your balance is growing!"
                : typeof trend !== "string" && trend.direction === "down"
                ? "📉 Warning: balance is falling"
                : "Line going up = surplus • Line going down = alert"}
            </p>
          </div>
        )}

        {/* Monthly Comparison Chart */}
        <div 
          className="finance-card animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <BarChart3 className="text-primary" size={16} />
              </div>
              <h3 className="text-lg font-semibold font-display text-foreground">Monthly Comparison</h3>
            </div>
            <button
              onClick={() => setFullscreenChart("monthly")}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Expand chart"
            >
              <Maximize2 size={16} className="text-muted-foreground" />
            </button>
          </div>
          
          <div className="h-44 w-full">
            <MonthlyChart />
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-income" />
              <span className="text-xs text-muted-foreground">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-expense" />
              <span className="text-xs text-muted-foreground">Expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={fullscreenChart !== null} onOpenChange={() => setFullscreenChart(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[85vh] p-0 bg-background border-border">
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  {fullscreenChart === "cashflow" ? (
                    <TrendingUp className="text-primary" size={20} />
                  ) : (
                    <BarChart3 className="text-primary" size={20} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-foreground">
                    {fullscreenChart === "cashflow" ? "Cash Flow" : "Monthly Comparison"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {fullscreenChart === "cashflow" ? "Last 14 days" : "Last 3 months"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {fullscreenChart === "cashflow" && <TrendIndicator />}
                <button
                  onClick={() => setFullscreenChart(null)}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 min-h-0">
              {fullscreenChart === "cashflow" ? (
                <CashFlowChart isFullscreen />
              ) : (
                <MonthlyChart isFullscreen />
              )}
            </div>
            
            {fullscreenChart === "monthly" && (
              <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-income" />
                  <span className="text-sm text-muted-foreground">Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-expense" />
                  <span className="text-sm text-muted-foreground">Expenses</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardCharts;
