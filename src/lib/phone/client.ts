const DEFAULT_COUNTRY_CODE = "962";

// Duplicated from lib/phone/normalize.ts (deliberately): that module is
// "server-only" and reads a server env var, so it can't be imported here.
function toDialableDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = DEFAULT_COUNTRY_CODE + digits.slice(1);
  } else if (!digits.startsWith(DEFAULT_COUNTRY_CODE)) {
    digits = DEFAULT_COUNTRY_CODE + digits;
  }

  return digits;
}

export function buildTelLink(phone: string): string {
  return `tel:+${toDialableDigits(phone)}`;
}

export function buildWhatsAppLink(phone: string): string {
  return `https://wa.me/${toDialableDigits(phone)}`;
}
