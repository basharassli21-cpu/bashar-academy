"use client";

import * as React from "react";
import { DirectionProvider } from "@/components/ui/direction";
import { getDictionary } from "@/lib/i18n";
import {
  type Locale,
  localeDirection,
  LOCALE_COOKIE,
} from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type LocaleContextValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Dictionary;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);
  const dir = localeDirection[locale];

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    document.documentElement.dir = localeDirection[next];
  }, []);

  const value = React.useMemo<LocaleContextValue>(
    () => ({ locale, dir, t: getDictionary(locale), setLocale }),
    [locale, dir, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>
      <DirectionProvider direction={dir}>{children}</DirectionProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useTranslations() {
  return useLocale().t;
}
