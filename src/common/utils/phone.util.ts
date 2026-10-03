/**
 * Normalizes a user-entered mobile number to E.164-ish form for storage/lookup and
 * for the SMS providers, which expect a country code. Defaults bare 10-digit
 * numbers to +91 (India) since that's this clinic's market — a number that
 * already starts with `+` is left as-is.
 */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim().replace(/[\s()-]/g, '');
  if (trimmed.startsWith('+')) return trimmed;
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length === 10) return `+91${digitsOnly}`;
  if (digitsOnly.startsWith('91') && digitsOnly.length === 12) return `+${digitsOnly}`;
  return `+${digitsOnly}`;
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
