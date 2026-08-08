import { createContext, useContext, ReactNode, useCallback, useMemo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  CURRENCIES,
  CurrencyMeta,
  DEFAULT_CURRENCY,
  formatMoney,
  formatNumber,
  getCurrencyMeta,
} from "@/lib/currencies";

/** Legacy alias — currency codes are plain strings now. */
export type CurrencyType = string;

interface CurrencyContextType {
  currency: string;
  meta: CurrencyMeta;
  currencies: CurrencyMeta[];
  isLoaded: boolean;
  formatCurrency: (amount: number) => string;
  formatCompact: (amount: number) => string;
  getCurrencySymbol: () => string;
  setCurrency: (code: string) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { profile, loading, user, refreshProfile } = useAuth();
  const { locale } = useLanguage();
  const [override, setOverride] = useState<string | null>(null);

  const profileCode = ((profile as any)?.currency_code || (profile as any)?.currency || null) as string | null;

  // A local override keeps the UI instant while the profile round-trips.
  useEffect(() => {
    if (profileCode && override && profileCode.toUpperCase() === override.toUpperCase()) {
      setOverride(null);
    }
  }, [profileCode, override]);

  const code = (override || profileCode || DEFAULT_CURRENCY) as string;
  const meta = getCurrencyMeta(code);
  const isLoaded = !loading && profile !== null;

  const formatCurrency = useCallback(
    (amount: number) => formatMoney(amount, meta.code, locale),
    [meta.code, locale],
  );

  const formatCompact = useCallback(
    (amount: number) => `${meta.symbol}${formatNumber(amount, locale, 0)}`,
    [meta.symbol, locale],
  );

  const setCurrency = useCallback(
    async (next: string) => {
      const m = getCurrencyMeta(next);
      setOverride(m.code);
      if (!user) return;
      const { error } = await supabase
        .from("profiles")
        .update({
          currency_code: m.code,
          currency_symbol: m.symbol,
          currency: m.code,
        } as any)
        .eq("user_id", user.id);
      if (error) {
        console.error("Failed to persist currency", error);
        return;
      }
      await refreshProfile();
    },
    [user, refreshProfile],
  );

  const value = useMemo(
    () => ({
      currency: meta.code,
      meta,
      currencies: CURRENCIES,
      isLoaded,
      formatCurrency,
      formatCompact,
      getCurrencySymbol: () => meta.symbol,
      setCurrency,
    }),
    [meta, isLoaded, formatCurrency, formatCompact, setCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrencyContext = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrencyContext must be used within a CurrencyProvider");
  return context;
};
