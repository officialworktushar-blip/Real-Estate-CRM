export type CurrencyCode = "USD" | "INR";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  label: string;
}

export const currencies: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", locale: "en-US", label: "US Dollar" },
  INR: { code: "INR", symbol: "₹", locale: "en-IN", label: "Indian Rupee" },
};

export const USD_TO_INR = 83;

export function detectCountry(): CurrencyCode {
  try {
    const lang = navigator.language || navigator.languages?.[0] || "";
    if (lang === "en-IN" || lang.startsWith("en-IN") || lang === "hi" || lang.startsWith("hi-")) {
      return "INR";
    }
  } catch {
    // fallback
  }
  return "USD";
}

export function convertCurrency(amountUSD: number, to: CurrencyCode): number {
  if (to === "INR") {
    return Math.round(amountUSD * USD_TO_INR);
  }
  return amountUSD;
}

export function formatAmount(amountUSD: number, currency: CurrencyCode): string {
  const config = currencies[currency] ?? currencies.USD;
  const value =
    typeof amountUSD === "number" && Number.isFinite(amountUSD) ? amountUSD : 0;
  const converted = convertCurrency(value, config.code);
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    maximumFractionDigits: 0,
  }).format(converted);
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  return (currencies[currency] ?? currencies.USD).symbol;
}

/**
 * Formats an amount already expressed in Indian Rupees. Billing is INR-only
 * for now (Razorpay), so plan and payment amounts bypass the USD conversion.
 */
export function formatInr(amount: number): string {
  const value =
    typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
