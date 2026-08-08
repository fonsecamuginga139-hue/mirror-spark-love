import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface BudgetGoal {
  id: string;
  user_id: string;
  category_id: string;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

export const useBudgetGoals = () => {
  const { user } = useAuth();
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgetGoals = async () => {
    if (!user) {
      setBudgetGoals([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("budget_goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching budget goals:", error);
      return;
    }

    setBudgetGoals(data as BudgetGoal[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchBudgetGoals();

    const channel = supabase
      .channel(`budget-goals-changes-`+Math.random().toString(36).slice(2))
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "budget_goals",
        },
        () => {
          fetchBudgetGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addBudgetGoal = async (categoryId: string, monthlyLimit: number) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("budget_goals")
      .upsert({
        user_id: user.id,
        category_id: categoryId,
        monthly_limit: monthlyLimit,
      }, { onConflict: 'user_id,category_id' })
      .select()
      .single();

    if (error) {
      console.error("Error adding budget goal:", error);
      return null;
    }

    return data as BudgetGoal;
  };

  const updateBudgetGoal = async (id: string, monthlyLimit: number) => {
    const { error } = await supabase
      .from("budget_goals")
      .update({ monthly_limit: monthlyLimit })
      .eq("id", id);

    if (error) {
      console.error("Error updating budget goal:", error);
      return false;
    }

    return true;
  };

  const deleteBudgetGoal = async (id: string) => {
    const { error } = await supabase
      .from("budget_goals")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting budget goal:", error);
      return false;
    }

    return true;
  };

  const getBudgetGoalByCategory = (categoryId: string) => {
    return budgetGoals.find(bg => bg.category_id === categoryId);
  };

  return {
    budgetGoals,
    loading,
    addBudgetGoal,
    updateBudgetGoal,
    deleteBudgetGoal,
    getBudgetGoalByCategory,
    refetch: fetchBudgetGoals,
  };
};
