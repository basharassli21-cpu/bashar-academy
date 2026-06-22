"use client";

import { Phone, MessageCircle } from "lucide-react";
import { buildTelLink, buildWhatsAppLink } from "@/lib/phone/client";
import { useTranslations } from "@/components/providers/locale-provider";

export function PhoneActions({ phone }: { phone: string }) {
  const t = useTranslations();

  return (
    <span className="inline-flex items-center gap-2" dir="ltr">
      <span>{phone}</span>
      <a
        href={buildTelLink(phone)}
        onClick={(e) => e.stopPropagation()}
        title={t.common.call}
        aria-label={t.common.call}
        className="text-muted-foreground hover:text-foreground"
      >
        <Phone className="size-3.5" />
      </a>
      <a
        href={buildWhatsAppLink(phone)}
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
