"use client";

import { useQuery } from "@tanstack/react-query";
import { Phone, MessageCircle } from "lucide-react";
import { buildTelLink, buildWhatsAppLink } from "@/lib/phone/client";
import { useTranslations } from "@/components/providers/locale-provider";
import { fetchSettings } from "@/lib/api/settings";

const FALLBACK_COUNTRY_CODE = "962";

export function PhoneActions({ phone }: { phone: string }) {
  const t = useTranslations();
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
  });
  const countryCode = data?.defaultCountryCode ?? FALLBACK_COUNTRY_CODE;

  return (
    <span className="inline-flex items-center gap-2" dir="ltr">
      <span>{phone}</span>
      <a
        href={buildTelLink(phone, countryCode)}
        onClick={(e) => e.stopPropagation()}
        title={t.common.call}
        aria-label={t.common.call}
        className="text-muted-foreground hover:text-foreground"
      >
        <Phone className="size-3.5" />
      </a>
      <a
        href={buildWhatsAppLink(phone, countryCode)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title={t.common.whatsapp}
        aria-label={t.common.whatsapp}
        className="text-muted-foreground hover:text-green-600"
      >
        <MessageCircle className="size-3.5" />
      </a>
    </span>
  );
}
