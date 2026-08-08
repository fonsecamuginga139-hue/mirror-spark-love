import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Installment {
  id: string;
  user_id: string;
  card_id: string | null;
  category_id: string | null;
  description: string;
  direction: "pay" | "receive";
  total_amount: number;
  installments_count: number;
  installments_paid: number;
  monthly_amount: number;
  start_date: string;
  icon: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useInstallments = () => {
  const { user } = useAuth();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    if (!user) return;
    const { data, error } = await (supabase as any)
      .from("installments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setInstallments(data as Installment[]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const add = async (input: {
    description: string;
    direction: "pay" | "receive";
    total_amount: number;
    installments_count: number;
    installments_paid?: number;
    start_date?: string;
    icon?: string;
    notes?: string;
    card_id?: string | null;
    category_id?: string | null;
  }) => {
    if (!user) return null;
    const monthly = input.total_amount / input.installments_count;
    const { data, error } = await (supabase as any)
      .from("installments")
      .insert({
        user_id: user.id,
        description: input.description,
        direction: input.direction,
        total_amount: input.total_amount,
        installments_count: input.installments_count,
        installments_paid: input.installments_paid ?? 0,
        monthly_amount: monthly,
        start_date: input.start_date ?? new Date().toISOString().slice(0, 10),
        icon: input.icon ?? (input.direction === "pay" ? "💳" : "💰"),
        notes: input.notes ?? null,
        card_id: input.card_id ?? null,
        category_id: input.category_id ?? null,
      })
      .select()
      .single();
    if (error) return null;
    await fetchAll();
    return data as Installment;
  };

  const update = async (id: string, updates: Partial<Installment>) => {
    await (supabase as any).from("installments").update(updates).eq("id", id);
    await fetchAll();
  };

  const remove = async (id: string) => {
    await (supabase as any).from("installments").delete().eq("id", id);
    await fetchAll();
  };

  const markPaid = async (row: Installment) => {
    const next = Math.min(row.installments_count, row.installments_paid + 1);
    await update(row.id, { installments_paid: next });
  };

  return { installments, loading, add, update, remove, markPaid, refetch: fetchAll };
};
