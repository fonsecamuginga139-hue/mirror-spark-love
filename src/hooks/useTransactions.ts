import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  icon: string | null;
  tags: string[];
  payment_method: string | null;
  source: "manual" | "scan" | "voice";
  occurred_on: string;
  created_at: string;
  /** Legacy alias for `occurred_on` (kept so older screens keep working). */
  date: string;
  /** Legacy field — the app no longer uses cards. */
  card_id?: string | null;
  recurring_transaction_id?: string | null;
  is_auto_generated?: boolean;
  payment_tag?: string | null;
}

export interface TransactionWithDetails extends Transaction {
  card_name?: string;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
}

export interface NewTransactionInput {
  category_id?: string | null;
  type: "income" | "expense";
  amount: number;
  description?: string | null;
  icon?: string | null;
  tags?: string[];
  payment_method?: string | null;
  source?: "manual" | "scan" | "voice";
  /** Accepts either name; both map to `occurred_on`. */
  date?: string;
  occurred_on?: string;
  /** Ignored — kept for backwards compatibility with older callers. */
  card_id?: string | null;
}

const mapRow = (t: any): TransactionWithDetails => ({
  ...t,
  amount: Number(t.amount),
  tags: t.tags ?? [],
  date: t.occurred_on,
  card_id: null,
  category_name: t.categories?.name,
  category_color: t.categories?.color,
  category_icon: t.categories?.icon,
});

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*, categories:category_id(name, color, icon)")
      .eq("user_id", user.id)
      .order("occurred_on", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
      return;
    }

    setTransactions((data ?? []).map(mapRow));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
    if (!user) return;

    const channel = supabase
      .channel(`transactions-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` },
        () => fetchTransactions(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchTransactions]);

  const addTransaction = useCallback(
    async (input: NewTransactionInput) => {
      if (!user) return null;

      const payload = {
        user_id: user.id,
        type: input.type,
        amount: input.amount,
        category_id: input.category_id ?? null,
        description: input.description ?? null,
        icon: input.icon ?? null,
        tags: input.tags ?? [],
        payment_method: input.payment_method ?? null,
        source: input.source ?? "manual",
        occurred_on:
          input.occurred_on ?? input.date ?? new Date().toISOString().slice(0, 10),
      };

      const { data, error } = await supabase
        .from("transactions")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Error adding transaction:", error);
        return null;
      }
      await fetchTransactions();
      return data;
    },
    [user, fetchTransactions],
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<NewTransactionInput>) => {
      const { date, card_id, ...rest } = updates as any;
      const payload: Record<string, unknown> = { ...rest };
      if (date) payload.occurred_on = date;

      const { error } = await supabase.from("transactions").update(payload as any).eq("id", id);
      if (error) console.error("Error updating transaction:", error);
      else await fetchTransactions();
    },
    [fetchTransactions],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) console.error("Error deleting transaction:", error);
      else await fetchTransactions();
    },
    [fetchTransactions],
  );

  const totals = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();

    let totalIncome = 0;
    let totalExpense = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    for (const t of transactions) {
      const amount = Number(t.amount);
      const d = new Date(t.occurred_on);
      const inMonth = d.getMonth() === m && d.getFullYear() === y;
      if (t.type === "income") {
        totalIncome += amount;
        if (inMonth) monthlyIncome += amount;
      } else {
        totalExpense += amount;
        if (inMonth) monthlyExpense += amount;
      }
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      monthlyIncome,
      monthlyExpense,
      monthlyBalance: monthlyIncome - monthlyExpense,
    };
  }, [transactions]);

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
    ...totals,
    /** Legacy no-op — cards were removed from the product. */
    getCardBalance: (_cardId?: string) => totals.balance,
  };
};
