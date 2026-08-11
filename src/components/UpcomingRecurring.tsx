import { useMemo } from "react";
import { CalendarClock, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { RecurringTransactionWithDetails } from "@/hooks/useRecurringTransactions";
import { useCurrency } from "@/hooks/useCurrency";

interface UpcomingRecurringProps {
  recurringTransactions: RecurringTransactionWithDetails[];
}

const UpcomingRecurring = ({ recurringTransactions }: UpcomingRecurringProps) => {
  const { formatCurrency } = useCurrency();

  // Get next 5 upcoming recurring transactions
  const upcomingTransactions = useMemo(() => {
    const today = new Date().getDate();
    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate();

    return recurringTransactions
      .filter((r) => r.is_active)
      .map((r) => {
        let daysUntil: number;
        if (r.day_of_month >= today) {
          daysUntil = r.day_of_month - today;
        } else {
          // Next month
          daysUntil = daysInMonth - today + r.day_of_month;
        }
        return { ...r, daysUntil };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  }, [recurringTransactions]);

  if (upcomingTransactions.length === 0) {
    return null;
  }

  const getDaysText = (days: number) => {
    if (days === 0) return "Hoje";
    if (days === 1) return "Amanhã";
    return `${days} dias`;
  };

  return (
    <div className="finance-card mb-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <CalendarClock className="text-primary" size={18} />
          </div>
          <h3 className="text-lg font-semibold font-display text-foreground">
            Próximas Recorrentes
          </h3>
        </div>
        <Link
          to="/recorrentes"
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Ver todas
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="space-y-3">
        {upcomingTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  transaction.type === "income"
                    ? "bg-income/20"
                    : "bg-expense/20"
                }`}
              >
                {transaction.type === "income" ? (
                  <TrendingUp className="text-income" size={16} />
                ) : (
                  <TrendingDown className="text-expense" size={16} />
                )}
              </div>
              <div>
                <p className="text-foreground font-medium text-sm">
                  {transaction.description ||
                    transaction.category_name ||
                    "Sem descrição"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Dia {transaction.day_of_month} • {transaction.card_name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-semibold text-sm ${
                  transaction.type === "income" ? "text-income" : "text-expense"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(Number(transaction.amount))}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  transaction.daysUntil === 0
                    ? "bg-primary/20 text-primary"
                    : transaction.daysUntil <= 3
                    ? "bg-warning/20 text-warning"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {getDaysText(transaction.daysUntil)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingRecurring;
