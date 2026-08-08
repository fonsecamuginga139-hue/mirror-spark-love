import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Card {
  id: string;
  user_id: string;
  name: string;
  number: string | null;
  color: string;
  icon: string;
  created_at: string;
}

export const useCards = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cards:", error);
      return;
    }

    setCards(data as Card[]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchCards();
    }

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`cards-changes-`+Math.random().toString(36).slice(2))
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cards",
        },
        () => {
          fetchCards();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addCard = async (card: Omit<Card, "id" | "user_id" | "created_at">) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("cards")
      .insert({
        user_id: user.id,
        ...card,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding card:", error);
      return null;
    }

    return data as Card;
  };

  const updateCard = async (id: string, updates: Partial<Card>) => {
    const { error } = await supabase
      .from("cards")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating card:", error);
    }
  };

  const deleteCard = async (id: string) => {
    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting card:", error);
    }
  };

  return {
    cards,
    loading,
    addCard,
    updateCard,
    deleteCard,
    refetch: fetchCards,
  };
};
