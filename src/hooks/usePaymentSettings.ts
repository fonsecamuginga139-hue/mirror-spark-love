import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface PaymentSettings {
  id: string;
  monthly_checkout_url: string | null;
  yearly_checkout_url: string | null;
  trial_checkout_url: string | null;
  hotmart_monthly_url: string | null;
  hotmart_yearly_url: string | null;
  kambafy_monthly_url: string | null;
  kambafy_yearly_url: string | null;
  trial_length_days: number;
  processor: string;
  updated_at: string;
}

export const usePaymentSettings = () => {
  const query = useQuery({
    queryKey: ["payment_settings"],
    queryFn: async (): Promise<PaymentSettings | null> => {
      const { data, error } = await (supabase as any)
        .from("payment_settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as PaymentSettings | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`payment_settings-changes-` + Math.random().toString(36).slice(2))
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payment_settings" },
        () => query.refetch()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return query;
};

/**
 * Escolhe o processador pela moeda do utilizador:
 *   Kz (AOA) → Kambafy   |   $ R$ € £ → Hotmart
 */
export const useCheckoutUrl = () => {
  const { data, isLoading } = usePaymentSettings();
  const { profile } = useAuth();

  const currency = String(
    (profile as any)?.currency_code || (profile as any)?.currency || "",
  ).toUpperCase();
  const isKwanza = currency === "AOA";

  const monthly = isKwanza
    ? data?.kambafy_monthly_url || ""
    : data?.hotmart_monthly_url || data?.monthly_checkout_url || "";
  const yearly = isKwanza
    ? data?.kambafy_yearly_url || ""
    : data?.hotmart_yearly_url || data?.yearly_checkout_url || "";

  return {
    checkoutUrl: monthly,
    monthlyCheckoutUrl: monthly,
    yearlyCheckoutUrl: yearly,
    trialCheckoutUrl: data?.trial_checkout_url || "",
    trialLengthDays: data?.trial_length_days ?? 7,
    processor: isKwanza ? "kambafy" : "hotmart",
    loading: isLoading,
  };
};

export default usePaymentSettings;
