import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  color: string;
  completed: boolean;
  card_id: string | null;
  created_at: string;
}

export const useGoals = (cardId?: string | null) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!user) return;

    let query = supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Filter by card if specified
    if (cardId !== undefined) {
      if (cardId === null) {
        // Show all goals when "All Cards" is selected
      } else {
        query = query.eq("card_id", cardId);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching goals:", error);
      return;
    }

    setGoals(data as Goal[]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchGoals();
    }

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`goals-changes-`+Math.random().toString(36).slice(2))
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "goals",
        },
        () => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, cardId]);

  const addGoal = async (goal: {
    name: string;
    icon?: string;
    target_amount: number;
    deadline?: string;
    color?: string;
    card_id?: string | null;
  }) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        name: goal.name,
        icon: goal.icon || "target",
        target_amount: goal.target_amount,
        deadline: goal.deadline || null,
        color: goal.color || "#10B981",
        card_id: goal.card_id || null,
        current_amount: 0,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding goal:", error);
      return null;
    }

    return data as Goal;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const { error } = await supabase
      .from("goals")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating goal:", error);
    }
  };

  const addToGoal = async (id: string, amount: number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    const newAmount = Number(goal.current_amount) + amount;
    const completed = newAmount >= Number(goal.target_amount);

    await updateGoal(id, {
      current_amount: newAmount,
      completed,
    });
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const markAsCompleted = async (id: string) => {
    await updateGoal(id, { completed: true });
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    addToGoal,
    deleteGoal,
    markAsCompleted,
    refetch: fetchGoals,
  };
};
