import "server-only";

const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE ?? "962";

export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = DEFAULT_COUNTRY_CODE + digits.slice(1);
  } else if (!digits.startsWith(DEFAULT_COUNTRY_CODE)) {
    digits = DEFAULT_COUNTRY_CODE + digits;
  }

  return `+${digits}`;
}
