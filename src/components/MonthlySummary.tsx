import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useCurrency } from "@/hooks/useCurrency";
import { TransactionWithDetails } from "@/hooks/useTransactions";

interface MonthlySummaryProps {
  transactions: TransactionWithDetails[];
}

const MonthlySummary = ({ transactions }: MonthlySummaryProps) => {
  const { formatCurrency } = useCurrency();

  const monthlySummaries = useMemo(() => {
    // Group transactions by month
    const grouped: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[key]) {
        grouped[key] = { income: 0, expense: 0 };
      }
      
      if (t.type === "income") {
        grouped[key].income += Number(t.amount);
      } else {
        grouped[key].expense += Number(t.amount);
      }
    });

    // Sort by date descending (most recent first)
    const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    return sortedKeys.map((key) => {
      const [year, month] = key.split("-");
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthName = monthDate.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
      const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      const { income, expense } = grouped[key];
      const total = income - expense;

      return {
        key,
        monthName: capitalizedMonth,
        income,
        expense,
        total,
      };
    });
  }, [transactions]);

  if (monthlySummaries.length === 0) {
    return (
      <div className="finance-card text-center py-8">
        <p className="text-muted-foreground">Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {monthlySummaries.map((summary) => {
        // Date for mini donut chart
        const chartDate = [
          { name: "Receitas", value: summary.income, color: "#22c55e" },
          { name: "Despesas", value: summary.expense, color: "#ef4444" },
        ].filter(d => d.value > 0);

        // If no data, show empty state
        const hasDate = chartDate.length > 0;

        return (
          <div
            key={summary.key}
            className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-colors"
          >
            {/* Mini Donut Chart */}
            <div className="w-20 h-20 flex-shrink-0">
              {hasDate ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartDate}
                      cx="50%"
                      cy="50%"
                      innerRadius={22}
                      outerRadius={36}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {chartDate.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-4 border-muted" />
                </div>
              )}
            </div>

            {/* Month Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-semibold text-foreground mb-2 truncate">
                {summary.monthName}
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Receitas:</span>
                  <span className="text-sm font-medium text-income">
                    {formatCurrency(summary.income)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Despesas:</span>
                  <span className="text-sm font-medium text-expense">
                    -{formatCurrency(summary.expense)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className={`text-sm font-bold ${summary.total >= 0 ? "text-income" : "text-expense"}`}>
                    {formatCurrency(summary.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonthlySummary;
