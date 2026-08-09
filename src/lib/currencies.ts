/**
 * Central currency catalogue + formatting utilities.
 * Never hardcode a currency symbol anywhere in the app — use these helpers.
 */
export interface CurrencyMeta {
  code: string;
  symbol: string;
  name: string;
  /** Nome em Português, mostrado na interface */
  namePt: string;
  /** Preferred locale used to format this currency when the user locale is unknown */
  locale: string;
  decimals?: number;
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: "BRL", symbol: "R$", name: "Brazilian Real", namePt: "Real brasileiro", locale: "pt-BR" },
  { code: "USD", symbol: "$", name: "US Dollar", namePt: "Dólar americano", locale: "en-US" },
  { code: "AOA", symbol: "Kz", name: "Angolan Kwanza", namePt: "Kwanza angolano", locale: "pt-AO" },
  { code: "EUR", symbol: "€", name: "Euro", namePt: "Euro", locale: "pt-PT" },
  { code: "GBP", symbol: "£", name: "British Pound", namePt: "Libra esterlina", locale: "en-GB" },
];

export const DEFAULT_CURRENCY = "BRL";

export const getCurrencyMeta = (code?: string | null): CurrencyMeta =>
  CURRENCIES.find((c) => c.code === (code ?? "").toUpperCase()) ?? CURRENCIES[0];

/** Popular picks shown first on the currency selection screen. */
export const POPULAR_CURRENCIES = ["BRL", "USD", "AOA", "EUR", "GBP"];


export function formatMoney(amount: number, code: string, locale: string): string {
  const meta = getCurrencyMeta(code);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: meta.code,
      minimumFractionDigits: meta.decimals ?? 2,
      maximumFractionDigits: meta.decimals ?? 2,
    }).format(Number.isFinite(amount) ? amount : 0);
  } catch {
    return `${meta.symbol}${(amount ?? 0).toFixed(meta.decimals ?? 2)}`;
  }
}

export function formatNumber(amount: number, locale: string, decimals = 2): string {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(Number.isFinite(amount) ? amount : 0);
  } catch {
    return String(amount ?? 0);
  }
}

/** Detects a currency code mentioned in free text (voice / receipts). */
const WORD_MAP: Record<string, string> = {
  dollar: "USD", dollars: "USD", dólar: "USD", dólares: "USD", usd: "USD", "$": "USD",
  euro: "EUR", euros: "EUR", eur: "EUR", "€": "EUR",
  pound: "GBP", pounds: "GBP", libra: "GBP", libras: "GBP", gbp: "GBP", "£": "GBP",
  real: "BRL", reais: "BRL", brl: "BRL", "r$": "BRL",
  peso: "MXN", pesos: "MXN",
  franc: "CHF", franken: "CHF", franco: "CHF", chf: "CHF",
  kwanza: "AOA", kwanzas: "AOA", aoa: "AOA",
  rand: "ZAR", rupee: "INR", rupees: "INR", yen: "JPY", yuan: "CNY", zloty: "PLN", lira: "TRY",
};

export function detectCurrencyInText(text: string): string | null {
  const lower = (text || "").toLowerCase();
  for (const [word, code] of Object.entries(WORD_MAP)) {
    if (lower.includes(word)) return code;
  }
  const upper = (text || "").toUpperCase();
  const match = CURRENCIES.find((c) => new RegExp(`\\b${c.code}\\b`).test(upper));
  return match ? match.code : null;
}
