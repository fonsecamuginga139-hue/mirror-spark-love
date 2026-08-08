import { useEffect, useMemo } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { RecurringTransactionWithDetails } from "@/hooks/useRecurringTransactions";
import { useCurrency } from "@/hooks/useCurrency";
import { useNotifications } from "@/hooks/useNotifications";

interface RecurringRemindersProps {
  recurringTransactions: RecurringTransactionWithDetails[];
}

const RecurringReminders = ({ recurringTransactions }: RecurringRemindersProps) => {
  const { formatCurrency } = useCurrency();
  const { permission, requestPermission, sendNotification, isSupported } = useNotifications();

  // Get upcoming transactions (1-3 days before)
  const upcomingTransactions = useMemo(() => {
    const today = new Date().getDate();
    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate();

    return recurringTransactions
      .filter((r) => {
        if (!r.is_active) return false;

        // Calculate days until the transaction
        let daysUntil: number;
        if (r.day_of_month > today) {
          daysUntil = r.day_of_month - today;
        } else if (r.day_of_month < today) {
          // Next month
          daysUntil = daysInMonth - today + r.day_of_month;
        } else {
          // Today
          daysUntil = 0;
        }

        return daysUntil >= 0 && daysUntil <= 3;
      })
      .map((r) => {
        const daysUntil =
          r.day_of_month >= new Date().getDate()
            ? r.day_of_month - new Date().getDate()
            : new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                0
              ).getDate() -
                new Date().getDate() +
                r.day_of_month;

        return { ...r, daysUntil };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [recurringTransactions]);

  // Show reminders on mount
  useEffect(() => {
    if (upcomingTransactions.length === 0) return;

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const storageKey = `shown-reminders-${monthKey}`;
    const shownReminders: string[] = JSON.parse(
      localStorage.getItem(storageKey) || "[]"
    );

    upcomingTransactions.forEach((transaction) => {
      if (shownReminders.includes(transaction.id)) return;

      // Show toast notification
      const daysText =
        transaction.daysUntil === 0
          ? "today"
          : transaction.daysUntil === 1
          ? "tomorrow"
          : `em ${transaction.daysUntil} days`;

      const description =
        transaction.description || transaction.category_name || "Recurring";

      toast(
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              transaction.type === "income"
                ? "bg-income/20"
                : "bg-expense/20"
            }`}
          >
            <Bell
              className={
                transaction.type === "income" ? "text-income" : "text-expense"
              }
              size={20}
            />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">
              {transaction.type === "income" ? "Income" : "Expense"} {daysText}
            </p>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p
              className={`text-sm font-semibold ${
                transaction.type === "income" ? "text-income" : "text-expense"
              }`}
            >
              {formatCurrency(Number(transaction.amount))}
            </p>
          </div>
        </div>,
        {
          duration: 6000,
        }
      );

      // Send push notification if permitted
      if (permission === "granted") {
        sendNotification(`${transaction.type === "income" ? "Income" : "Expense"} ${daysText}`, {
          body: `${description} - ${formatCurrency(Number(transaction.amount))}`,
          tag: `recurring-${transaction.id}`,
        });
      }

      // Mark as shown
      shownReminders.push(transaction.id);
    });

    localStorage.setItem(storageKey, JSON.stringify(shownReminders));
  }, [upcomingTransactions, formatCurrency, permission, sendNotification]);

  // Request notification permission on first visit
  useEffect(() => {
    if (isSupported && permission === "default") {
      const hasAsked = localStorage.getItem("notification-permission-asked");
      if (!hasAsked) {
        const timer = setTimeout(() => {
          requestPermission();
          localStorage.setItem("notification-permission-asked", "true");
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [isSupported, permission, requestPermission]);

  return null; // This component only handles side effects
};

export default RecurringReminders;
