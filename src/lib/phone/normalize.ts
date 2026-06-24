import "server-only";

export function normalizePhone(raw: string, defaultCountryCode: string): string {
  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = defaultCountryCode + digits.slice(1);
  } else if (!digits.startsWith(defaultCountryCode)) {
    digits = defaultCountryCode + digits;
  }

  return `+${digits}`;
}
