import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MrrStats {
  total_active_subscribers: number;
  mrr_usd: number;
  mrr_eur: number;
}

interface MrrHistoryItem {
  month: string;
  events: number;
  mrr_usd: number;
  mrr_eur: number;
}

const PRICE = { monthly: 7, master: 30 / 12 };

export function useMrrStats() {
  const [stats, setStats] = useState<MrrStats | null>(null);
  const [history, setHistory] = useState<MrrHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("plano, currency, plan_status");
    const active = (profiles || []).filter(
      (p) => p.plan_status === "active" && (p.plano === "monthly" || p.plano === "master"),
    );
    const compute = (curr: "USD" | "EUR") =>
      active
        .filter((p) => p.currency === curr)
        .reduce((s, p) => s + (p.plano === "master" ? PRICE.master : PRICE.monthly), 0);
    setStats({
      total_active_subscribers: active.length,
      mrr_usd: Number(compute("USD").toFixed(2)),
      mrr_eur: Number(compute("EUR").toFixed(2)),
    });
    const { data: logs } = await supabase
      .from("webhook_logs")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    const buckets = new Map<string, MrrHistoryItem>();
    (logs || []).forEach((l) => {
      const month = (l.created_at as string).slice(0, 7);
      const item = buckets.get(month) || { month, events: 0, mrr_usd: 0, mrr_eur: 0 };
      item.events += 1;
      buckets.set(month, item);
    });
    setHistory(Array.from(buckets.values()).sort((a, b) => b.month.localeCompare(a.month)));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`mrr-realtime-`+Math.random().toString(36).slice(2))
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchData)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "webhook_logs" }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  return { stats, history, loading, refetch: fetchData };
}
