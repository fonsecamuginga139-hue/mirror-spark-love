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

/** MVP: the whole product ships in Portuguese. The catalogue stays so other languages can be re-enabled later. */
export const DEFAULT_LANGUAGE: LanguageCode = "pt-PT";

export const getLanguageMeta = (code?: string | null): LanguageMeta =>
  LANGUAGES.find((l) => l.code === code) ?? LANGUAGES.find((l) => l.code === DEFAULT_LANGUAGE)!;

/** Normalises any legacy/browser value into a supported code. MVP always resolves to Portuguese. */
export function normalizeLanguage(_raw?: string | null): LanguageCode {
  return DEFAULT_LANGUAGE;
}

/** MVP: no browser detection — Portuguese only. */
export function detectBrowserLanguage(): LanguageCode {
  return DEFAULT_LANGUAGE;
}

