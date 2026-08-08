import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  LANGUAGES,
  LanguageCode,
  DEFAULT_LANGUAGE,
  detectBrowserLanguage,
  getLanguageMeta,
  normalizeLanguage,
} from "@/lib/i18n/languages";
import enUS from "@/locales/en-US.json";

/** Backwards-compatible alias used across the app. */
export type Language = LanguageCode;

type Dict = Record<string, any>;

/** Lazy loaders — only the selected language file is fetched. */
const loaders: Record<LanguageCode, () => Promise<{ default: Dict }>> = {
  "en-US": () => import("@/locales/en-US.json"),
  "pt-PT": () => import("@/locales/pt-PT.json"),
  "es-ES": () => import("@/locales/es-ES.json"),
};

const cache: Partial<Record<LanguageCode, Dict>> = { "en-US": enUS as Dict };

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
const STORAGE_KEY = "vault_language";

function getNested(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{{${k}}}`));
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile } = useAuth();

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) return normalizeLanguage(stored);
    // English stays the default; browser detection only switches to a supported language.
    return detectBrowserLanguage();
  });
  const [dict, setDict] = useState<Dict>(cache[language] ?? (enUS as Dict));

  const loadDict = useCallback(async (lang: LanguageCode) => {
    if (cache[lang]) {
      setDict(cache[lang]!);
      return;
    }
    try {
      const mod = await loaders[lang]();
      cache[lang] = mod.default;
      setDict(mod.default);
    } catch {
      setDict(enUS as Dict);
    }
  }, []);

  useEffect(() => {
    void loadDict(language);
    if (typeof document !== "undefined") document.documentElement.lang = language;
  }, [language, loadDict]);

  // Realtime sync from the profile row (AuthContext subscribes to profile changes).
  useEffect(() => {
    const p = (profile as any)?.language;
    if (!p) return;
    const normalized = normalizeLanguage(p);
    setLanguageState((prev) => (prev === normalized ? prev : normalized));
    localStorage.setItem(STORAGE_KEY, normalized);
  }, [profile]);

  const setLanguage = useCallback(
    async (lang: LanguageCode) => {
      const normalized = normalizeLanguage(lang);
      const meta = getLanguageMeta(normalized);
      setLanguageState(normalized);
      localStorage.setItem(STORAGE_KEY, normalized);
      await loadDict(normalized);
      if (user) {
        // Only columns that exist on public.profiles — an unknown column makes
        // the whole update fail and the language silently reverts to English.
        const { error } = await supabase
          .from("profiles")
          .update({ language: normalized, locale: meta.locale } as any)
          .eq("user_id", user.id);
        if (error) console.error("Failed to persist language", error);
      }
    },
    [user, loadDict],
  );

  const locale = getLanguageMeta(language).locale;

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = getNested(dict, key);
      if (typeof value === "string") return interpolate(value, vars);
      const fb = getNested(enUS, key);
      return typeof fb === "string" ? interpolate(fb, vars) : key;
    },
    [dict],
  );

  const tArray = useCallback(
    (key: string) => {
      const value = getNested(dict, key);
      if (Array.isArray(value)) return value;
      const fb = getNested(enUS, key);
      return Array.isArray(fb) ? fb : [];
    },
    [dict],
  );

  const formatDate = useCallback(
    (value: string | number | Date, opts?: Intl.DateTimeFormatOptions) => {
      const d = value instanceof Date ? value : new Date(value);
      if (isNaN(d.getTime())) return "";
      try {
        return new Intl.DateTimeFormat(locale, opts ?? { day: "2-digit", month: "short", year: "numeric" }).format(d);
      } catch {
        return d.toLocaleDateString();
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
