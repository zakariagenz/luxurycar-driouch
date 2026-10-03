"use client";

import * as React from "react";
import {
  dictionaries,
  type AppLocale,
  type Dictionary,
  type TranslationKey,
} from "@/lib/i18n/dictionaries";

interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  dict: Dictionary;
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = "lcd_locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<AppLocale>("en");

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as AppLocale | null;
    if (saved === "en" || saved === "fr") setLocaleState(saved);
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = React.useCallback((next: AppLocale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const dict = dictionaries[locale] as Dictionary;

  const t = React.useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let text = dict[key] ?? dictionaries.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [dict]
  );

  const value = React.useMemo(
    () => ({ locale, setLocale, t, dict }),
    [locale, setLocale, t, dict]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
