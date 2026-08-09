import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type CurrencyCode, detectCountry } from "@/utils/currency";
import { toast } from "@/stores/toastStore";

interface CurrencyStore {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  toggleCurrency: () => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: detectCountry(),
      setCurrency: (currency) => {
        set({ currency });
        toast("info", `Currency set to ${currency}`);
      },
      toggleCurrency: () => {
        const current = get().currency;
        const next = current === "USD" ? "INR" : "USD";
        set({ currency: next });
        toast("info", `Currency switched to ${next}`);
      },
    }),
    {
      name: "oryntal-currency",
      merge: (persisted, current) => {
        const raw = persisted as { currency?: unknown } | null;
        const currency =
          raw?.currency === "INR" || raw?.currency === "USD"
            ? raw.currency
            : current.currency;
        return { ...current, currency };
      },
    }
  )
);
