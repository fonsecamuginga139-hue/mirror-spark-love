import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface MonthlyBill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_BILL_NAMES = [
  "Rent / Housing",
  "Electricity",
  "Water",
  "Internet",
  "Phone",
  "Gas",
  "Netflix",
  "Spotify",
  "Insurance",
  "Transportation",
];

export const useMonthlyBills = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<MonthlyBill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    if (!user) return;
    const { data, error } = await (supabase as any)
      .from("monthly_bills")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (!error && data) setBills(data as MonthlyBill[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetchBills();
    const channel = supabase
      .channel(`monthly-bills-changes-`+Math.random().toString(36).slice(2))
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "monthly_bills" },
        () => fetchBills()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addBill = async (bill: { name: string; amount: number; currency?: string; active?: boolean }) => {
    if (!user) return null;
    const { data, error } = await (supabase as any)
      .from("monthly_bills")
      .insert({
        user_id: user.id,
        name: bill.name,
        amount: bill.amount,
        currency: bill.currency || "USD",
        active: bill.active ?? true,
      })
      .select()
      .single();
    if (error) {
      console.error("addBill error", error);
      return null;
    }
    return data as MonthlyBill;
  };

  const updateBill = async (id: string, updates: Partial<Pick<MonthlyBill, "name" | "amount" | "active">>) => {
    const { error } = await (supabase as any)
      .from("monthly_bills")
      .update(updates)
      .eq("id", id);
    if (error) console.error("updateBill error", error);
  };

  const deleteBill = async (id: string) => {
    const { error } = await (supabase as any)
      .from("monthly_bills")
      .delete()
      .eq("id", id);
    if (error) console.error("deleteBill error", error);
  };

  const toggleActive = async (id: string) => {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    await updateBill(id, { active: !bill.active });
  };

  const totalActiveAmount = bills
    .filter((b) => b.active)
    .reduce((acc, b) => acc + Number(b.amount || 0), 0);

  return {
    bills,
    activeBills: bills.filter((b) => b.active),
    inactiveBills: bills.filter((b) => !b.active),
    totalActiveAmount,
    loading,
    addBill,
    updateBill,
    deleteBill,
    toggleActive,
    refetch: fetchBills,
  };
};