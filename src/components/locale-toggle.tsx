"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";

export function LocaleToggle() {
  const { locale, t, setLocale } = useLocale();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
    >
      {locale === "ar" ? t.locale.en : t.locale.ar}
    </Button>
  );
}
