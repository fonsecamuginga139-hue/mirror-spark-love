import { createContext, useContext, ReactNode, useCallback, useMemo } from "react";
import {
  LANGUAGES,
  LanguageCode,
  DEFAULT_LANGUAGE,
  getLanguageMeta,
} from "@/lib/i18n/languages";
import ptPT from "@/locales/pt-PT.json";

/** Backwards-compatible alias used across the app. */
export type Language = LanguageCode;

type Dict = Record<string, any>;

const dict = ptPT as Dict;

interface LanguageContextType {
  language: LanguageCode;
  locale: string;
  languages: typeof LANGUAGES;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tArray: (key: string) => any[];
  formatDate: (value: string | number | Date, opts?: Intl.DateTimeFormatOptions) => string;
  formatRelativeDate: (value: string | number | Date) => string;
  monthNames: (style?: "long" | "short") => string[];
  weekdayNames: () => string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNested(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{{${k}}}`));
}

/**
 * MVP: o produto é 100% em Português. A estrutura de i18n mantém-se intacta para
 * ser possível voltar a ligar EN/ES no futuro sem reconstruir o aplicativo.
 */
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const language = DEFAULT_LANGUAGE;
  const locale = getLanguageMeta(language).locale;

  const setLanguage = useCallback(async (_lang: LanguageCode) => {
    // Idioma fixo no MVP.
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const value = getNested(dict, key);
    return typeof value === "string" ? interpolate(value, vars) : key;
  }, []);

  const tArray = useCallback((key: string) => {
    const value = getNested(dict, key);
    return Array.isArray(value) ? value : [];
  }, []);

  const formatDate = useCallback(
    (value: string | number | Date, opts?: Intl.DateTimeFormatOptions) => {
      const d = value instanceof Date ? value : new Date(value);
      if (isNaN(d.getTime())) return "";
      try {
        return new Intl.DateTimeFormat(locale, opts ?? { day: "2-digit", month: "short", year: "numeric" }).format(d);
      } catch {
        return d.toLocaleDateString("pt-PT");
      }
    },
    [locale],
  );

  const formatRelativeDate = useCallback(
    (value: string | number | Date) => {
      const d = value instanceof Date ? value : new Date(value);
      if (isNaN(d.getTime())) return "";
      const diffDays = Math.round((d.getTime() - Date.now()) / 86400000);
      try {
        if (Math.abs(diffDays) < 30) {
          return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(diffDays, "day");
        }
        return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(Math.round(diffDays / 30), "month");
      } catch {
        return formatDate(d);
      }
    },
    [locale, formatDate],
  );

  const monthNames = useCallback(
    (style: "long" | "short" = "long") => {
      const arr = tArray(`months.${style}`) as string[];
      if (arr.length === 12) return arr;
      const fmt = new Intl.DateTimeFormat(locale, { month: style });
      return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2020, i, 1)));
    },
    [tArray, locale],
  );

  const weekdayNames = useCallback(() => {
    const arr = tArray("days.short") as string[];
    if (arr.length === 7) return arr;
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, i + 1)));
  }, [tArray, locale]);

  const value = useMemo(
    () => ({
      language,
      locale,
      languages: LANGUAGES,
      setLanguage,
      t,
      tArray,
      formatDate,
      formatRelativeDate,
      monthNames,
      weekdayNames,
    }),
    [language, locale, setLanguage, t, tArray, formatDate, formatRelativeDate, monthNames, weekdayNames],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

export const useT = () => useLanguage().t;
export { DEFAULT_LANGUAGE };
