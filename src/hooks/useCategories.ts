import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: "income" | "expense" | null;
  is_default: boolean;
  is_user_default?: boolean;
  color: string;
  icon: string;
}

export const useCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }

    setCategories(data as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`categories-changes-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addCategory = async (name: string, type: "income" | "expense", color?: string, icon?: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name,
        type,
        color: color || "#10B981",
        icon: icon || "tag",
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding category:", error);
      return null;
    }

    return data as Category;
  };

  const updateCategory = async (id: string, updates: Partial<Pick<Category, "name" | "color" | "icon">>) => {
    const { error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating category:", error);
      return false;
    }

    await fetchCategories();
    return true;
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      return false;
    }

    await fetchCategories();
    return true;
  };

  const setAsDefault = async (categoryId: string, type: "income" | "expense") => {
    if (!user) return false;

    // First, remove is_user_default from all categories of same type for this user
    await supabase
      .from("categories")
      .update({ is_user_default: false })
      .eq("user_id", user.id)
      .eq("type", type);

    // Then set the selected category as default
    const { error } = await supabase
      .from("categories")
      .update({ is_user_default: true })
      .eq("id", categoryId);

    if (error) {
      console.error("Error setting default category:", error);
      return false;
    }

    await fetchCategories();
    return true;
  };

  const getDefaultCategory = (type: "income" | "expense") => {
    return categories.find(c => c.is_user_default && c.type === type);
  };

  const incomeCategories = categories.filter(c => c.type === "income" || c.type === null);
  const expenseCategories = categories.filter(c => c.type === "expense" || c.type === null);

  return {
    categories,
    incomeCategories,
    expenseCategories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    setAsDefault,
    getDefaultCategory,
    refetch: fetchCategories,
  };
};
