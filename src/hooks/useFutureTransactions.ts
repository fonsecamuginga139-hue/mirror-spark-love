import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface FutureTransaction {
  id: string;
  user_id: string;
  card_id: string;
  category_id: string | null;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  due_date: string;
  paid: boolean;
  created_at: string;
}

export interface FutureTransactionWithDetails extends FutureTransaction {
  card_name?: string;
  category_name?: string;
}

export const useFutureTransactions = () => {
  const { user } = useAuth();
  const [futureTransactions, setFutureTransactions] = useState<FutureTransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFutureTransactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("future_transactions")
      .select(`
        *,
        cards:card_id(name),
        categories:category_id(name)
      `)
      .eq("user_id", user.id)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching future transactions:", error);
      return;
    }

    const mapped = data.map((t: any) => ({
      ...t,
      card_name: t.cards?.name,
      category_name: t.categories?.name,
    }));

    setFutureTransactions(mapped);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchFutureTransactions();
    }

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`future-transactions-changes-`+Math.random().toString(36).slice(2))
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "future_transactions",
        },
        () => {
          fetchFutureTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addFutureTransaction = async (transaction: {
    card_id: string;
    category_id?: string | null;
    type: "income" | "expense";
    amount: number;
    description?: string;
    due_date: string;
  }) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("future_transactions")
      .insert({
        user_id: user.id,
        ...transaction,
        paid: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding future transaction:", error);
      return null;
    }

    return data;
  };

  const updateFutureTransaction = async (id: string, updates: {
    type?: "income" | "expense";
    amount?: number;
    description?: string;
    due_date?: string;
    card_id?: string;
    category_id?: string | null;
  }) => {
    const { error } = await supabase
      .from("future_transactions")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating future transaction:", error);
    }
  };

  const togglePaid = async (id: string) => {
    const transaction = futureTransactions.find((t) => t.id === id);
    if (!transaction) return;

    const { error } = await supabase
      .from("future_transactions")
      .update({ paid: !transaction.paid })
      .eq("id", id);

    if (error) {
      console.error("Error toggling paid status:", error);
    }
  };

  const deleteFutureTransaction = async (id: string) => {
    const { error } = await supabase
      .from("future_transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting future transaction:", error);
    }
  };

  // Calculations
  const pendingTransactions = futureTransactions.filter((t) => !t.paid);
  const paidTransactions = futureTransactions.filter((t) => t.paid);

  const totalPending = pendingTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalToReceive = pendingTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  return {
    futureTransactions,
    pendingTransactions,
    paidTransactions,
    loading,
    addFutureTransaction,
    updateFutureTransaction,
    togglePaid,
    deleteFutureTransaction,
    refetch: fetchFutureTransactions,
    totalPending,
    totalToReceive,
  };
};