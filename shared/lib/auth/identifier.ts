function normalizeIndianMobile(value: string): string | null {
  const compact = value.trim().replace(/[\s()-]/g, "");
  const local = compact.startsWith("+91") ? compact.slice(3) : compact;
  return /^[6-9]\d{9}$/.test(local) ? `+91${local}` : null;
}

export type AuthIdentifier =
  | { kind: "email"; value: string }
  | { kind: "phone"; value: string };

/** Normalize the login identifier without exposing whether an account exists. */
export function normalizeAuthIdentifier(value: string): AuthIdentifier {
  const trimmed = value.trim();
  const phone = normalizeIndianMobile(trimmed);
  return phone
    ? { kind: "phone", value: phone }
    : { kind: "email", value: trimmed.toLowerCase() };
}
