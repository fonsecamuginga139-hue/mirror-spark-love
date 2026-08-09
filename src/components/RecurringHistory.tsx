import { useState, useEffect } from "react";
import { History, RefreshCw, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";

interface GeneratedTransaction {
  id: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  recurring_transaction_id: string;
  card_name?: string;
  category_name?: string;
  created_at: string;
}

interface RecurringHistoryProps {
  recurringId?: string | null;
}

const RecurringHistory = ({ recurringId }: RecurringHistoryProps) => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const { recurringTransactions } = useRecurringTransactions();
  const [transactions, setTransactions] = useState<GeneratedTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      let query = supabase
        .from("transactions")
        .select(`
          id,
          date,
          amount,
          type,
          description,
          recurring_transaction_id,
          created_at,
          cards:card_id(name),
          categories:category_id(name)
        `)
        .eq("user_id", user.id)
        .eq("is_auto_generated", true)
        .order("date", { ascending: false });

      if (recurringId) {
        query = query.eq("recurring_transaction_id", recurringId);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error("Error fetching recurring history:", error);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map((t: any) => ({
        ...t,
        card_name: t.cards?.name,
        category_name: t.categories?.name,
      }));

      setTransactions(mapped);
      setLoading(false);
    };

    fetchHistory();
  }, [user, recurringId]);

  const getRecurringName = (recurringTransactionId: string) => {
    const recurring = recurringTransactions.find(r => r.id === recurringTransactionId);
    return recurring?.description || "Recurring";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <History size={40} className="mb-3 opacity-50" />
        <p className="font-medium">No generated transactions yet</p>
        <p className="text-sm text-center mt-1">
          Recurring transactions will appear here after they run
        </p>
      </div>
    );
  }

  // Group by month
  const groupedByMonth: { [key: string]: GeneratedTransaction[] } = {};
  transactions.forEach((t) => {
    const monthKey = new Date(t.date).toLocaleDateString("pt-PT", {
      month: "long",
      year: "numeric",
    });
    if (!groupedByMonth[monthKey]) {
      groupedByMonth[monthKey] = [];
    }
    groupedByMonth[monthKey].push(t);
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Generated</p>
          <p className="text-lg font-bold text-foreground">{transactions.length}</p>
        </div>
        <div className="glass-card text-center">
          <p className="text-xs text-muted-foreground mb-1">Last Month</p>
          <p className="text-lg font-bold text-foreground">
            {groupedByMonth[Object.keys(groupedByMonth)[0]]?.length || 0}
          </p>
        </div>
      </div>

      {/* Transactions by Month */}
      {Object.entries(groupedByMonth).map(([month, txs]) => (
        <div key={month}>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar size={14} />
            {month.charAt(0).toUpperCase() + month.slice(1)}
          </h4>
          <div className="space-y-2">
            {txs.map((t) => (
              <div
                key={t.id}
                className="glass-card flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">
                      {t.description || getRecurringName(t.recurring_transaction_id)}
                    </p>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary flex-shrink-0">
                      <RefreshCw size={10} className="inline mr-1" />
                      Auto
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.date).toLocaleDateString("pt-PT")}
                    {t.card_name && ` • ${t.card_name}`}
                  </p>
                </div>
                <p
                  className={`font-semibold ${
                    t.type === "income" ? "text-income" : "text-expense"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatCurrency(Number(t.amount))}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecurringHistory;
