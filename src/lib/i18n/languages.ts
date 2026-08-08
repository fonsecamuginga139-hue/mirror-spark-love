/**
 * Central language catalogue for Vault.
 * Adding a new language = add an entry here + a matching src/locales/<code>.json file.
 */
export type LanguageCode = "en-US" | "pt-PT" | "es-ES";

export interface LanguageMeta {
  code: LanguageCode;
  /** BCP-47 locale used by Intl + speech recognition */
  locale: string;
  flag: string;
  /** Native name, e.g. "Deutsch" */
  native: string;
  /** English name, used as subtitle */
  english: string;
  /** Short 2-letter code (AI prompts, legacy data) */
  short: "en" | "pt" | "es";
  numberFormat: string;
  dateFormat: string;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: "en-US", locale: "en-US", flag: "🇺🇸", native: "English", english: "English (US)", short: "en", numberFormat: "1,234.56", dateFormat: "MM/dd/yyyy" },
  { code: "pt-PT", locale: "pt-PT", flag: "🇵🇹", native: "Português", english: "Portuguese", short: "pt", numberFormat: "1.234,56", dateFormat: "dd/MM/yyyy" },
  { code: "es-ES", locale: "es-ES", flag: "🇪🇸", native: "Español", english: "Spanish", short: "es", numberFormat: "1.234,56", dateFormat: "dd/MM/yyyy" },
];

export const DEFAULT_LANGUAGE: LanguageCode = "en-US";

export const getLanguageMeta = (code?: string | null): LanguageMeta =>
  LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

/** Normalises any legacy/browser value ("pt", "pt-BR", "de-AT") into a supported code. */
export function normalizeLanguage(raw?: string | null): LanguageCode {
  if (!raw) return DEFAULT_LANGUAGE;
  const v = raw.toLowerCase();
  const exact = LANGUAGES.find((l) => l.code.toLowerCase() === v);
  if (exact) return exact.code;
  const byPrefix = LANGUAGES.find((l) => v.startsWith(l.short));
  return byPrefix ? byPrefix.code : DEFAULT_LANGUAGE;
}

/** English is the default: browser detection only picks another supported language. */
export function detectBrowserLanguage(): LanguageCode {
  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE;
  return normalizeLanguage(navigator.language);
}
