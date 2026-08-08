import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface RecurringTransaction {
  id: string;
  user_id: string;
  card_id: string;
  category_id: string | null;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  day_of_month: number;
  is_active: boolean;
  auto_process: boolean;
  last_processed_month: string | null;
  created_at: string;
}

export interface RecurringTransactionWithDetails extends RecurringTransaction {
  card_name?: string;
  category_name?: string;
}

export const useRecurringTransactions = () => {
  const { user } = useAuth();
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecurringTransactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("recurring_transactions")
      .select(`
        *,
        cards:card_id(name),
        categories:category_id(name)
      `)
      .eq("user_id", user.id)
      .order("day_of_month", { ascending: true });

    if (error) {
      console.error("Error fetching recurring transactions:", error);
      return;
    }

    const mapped = data.map((t: any) => ({
      ...t,
      card_name: t.cards?.name,
      category_name: t.categories?.name,
    }));

    setRecurringTransactions(mapped);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchRecurringTransactions();
    }

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`recurring-transactions-changes-`+Math.random().toString(36).slice(2))
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "recurring_transactions",
        },
        () => {
          fetchRecurringTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addRecurringTransaction = async (transaction: {
    card_id: string;
    category_id?: string | null;
    type: "income" | "expense";
    amount: number;
    description?: string;
    day_of_month: number;
    auto_process?: boolean;
  }) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("recurring_transactions")
      .insert({
        user_id: user.id,
        ...transaction,
        is_active: true,
        auto_process: transaction.auto_process ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding recurring transaction:", error);
      return null;
    }

    return data;
  };

  const updateRecurringTransaction = async (id: string, updates: {
    type?: "income" | "expense";
    amount?: number;
    description?: string;
    day_of_month?: number;
    card_id?: string;
    category_id?: string | null;
    auto_process?: boolean;
  }) => {
    const { error } = await supabase
      .from("recurring_transactions")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating recurring transaction:", error);
    }
  };

  const toggleActive = async (id: string) => {
    const transaction = recurringTransactions.find((t) => t.id === id);
    if (!transaction) return;

    const { error } = await supabase
      .from("recurring_transactions")
      .update({ is_active: !transaction.is_active })
      .eq("id", id);

    if (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    const { error } = await supabase
      .from("recurring_transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting recurring transaction:", error);
    }
  };

  // Process recurring transactions for current month
  // Only creates the transaction when today >= day_of_month
  const processRecurringTransactions = async () => {
    if (!user) return;

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    for (const recurring of recurringTransactions) {
      if (!recurring.is_active) continue;
      if (recurring.last_processed_month === currentMonth) continue;
      // Skip if not set to auto-process (requires manual confirmation)
      if (!recurring.auto_process) continue;

      // Only process if today is >= the scheduled day of month
      const scheduledDay = Math.min(recurring.day_of_month, daysInMonth);
      if (currentDay < scheduledDay) continue;

      // Create the transaction for this month
      const transactionDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        scheduledDay
      );

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        card_id: recurring.card_id,
        category_id: recurring.category_id,
        type: recurring.type,
        amount: recurring.amount,
        description: recurring.description || `Automatic recurring`,
        date: transactionDate.toISOString().split("T")[0],
        recurring_transaction_id: recurring.id,
        is_auto_generated: true,
      });

      if (!error) {
        // Update last_processed_month only if transaction was created successfully
        await supabase
          .from("recurring_transactions")
          .update({ last_processed_month: currentMonth })
          .eq("id", recurring.id);
        
        console.log(`Recurring transaction processed: ${recurring.description || recurring.type} - ${recurring.amount}`);
      } else {
        console.error("Error processing recurring:", error);
      }
    }
  };

  // Manually process a single recurring transaction (for manual confirmation mode)
  const processManualRecurring = async (recurringId: string) => {
    if (!user) return false;

    const recurring = recurringTransactions.find((r) => r.id === recurringId);
    if (!recurring) return false;

    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const scheduledDay = Math.min(recurring.day_of_month, daysInMonth);

    const transactionDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      scheduledDay
    );

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      card_id: recurring.card_id,
      category_id: recurring.category_id,
      type: recurring.type,
      amount: recurring.amount,
      description: recurring.description || `Manual recurring`,
      date: transactionDate.toISOString().split("T")[0],
      recurring_transaction_id: recurring.id,
      is_auto_generated: true,
    });

    if (!error) {
      await supabase
        .from("recurring_transactions")
        .update({ last_processed_month: currentMonth })
        .eq("id", recurring.id);
      
      return true;
    }
    
    console.error("Error processing manual recurring:", error);
    return false;
  };

  // Get pending manual recurring transactions for current month
  const getPendingManualRecurring = () => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    return recurringTransactions.filter((r) => {
      if (!r.is_active) return false;
      if (r.auto_process) return false;
      if (r.last_processed_month === currentMonth) return false;
      
      const scheduledDay = Math.min(r.day_of_month, daysInMonth);
      return currentDay >= scheduledDay;
    });
  };

  const activeRecurring = recurringTransactions.filter((t) => t.is_active);
  const inactiveRecurring = recurringTransactions.filter((t) => !t.is_active);

  return {
    recurringTransactions,
    activeRecurring,
    inactiveRecurring,
    loading,
    addRecurringTransaction,
    updateRecurringTransaction,
    toggleActive,
    deleteRecurringTransaction,
    processRecurringTransactions,
    processManualRecurring,
    getPendingManualRecurring,
    refetch: fetchRecurringTransactions,
  };
};