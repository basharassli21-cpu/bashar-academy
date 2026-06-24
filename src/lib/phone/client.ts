// Duplicated from lib/phone/normalize.ts (deliberately): that module is
// "server-only", so it can't be imported here. The default country code
// is passed in by the caller (fetched from /api/settings) rather than
// hardcoded, so click-to-call/WhatsApp links stay in sync with whatever
// the admin has configured on the Settings page.
function toDialableDigits(raw: string, defaultCountryCode: string): string {
  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = defaultCountryCode + digits.slice(1);
  } else if (!digits.startsWith(defaultCountryCode)) {
    digits = defaultCountryCode + digits;
  }

  return digits;
}

export function buildTelLink(phone: string, defaultCountryCode: string): string {
  return `tel:+${toDialableDigits(phone, defaultCountryCode)}`;
}

export function buildWhatsAppLink(phone: string, defaultCountryCode: string): string {
  return `https://wa.me/${toDialableDigits(phone, defaultCountryCode)}`;
}
