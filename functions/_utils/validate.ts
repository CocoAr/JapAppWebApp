export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsername(raw: string): string | null {
  const u = normalizeUsername(raw);
  if (u.length < 2 || u.length > 32) return null;
  if (!/^[a-z0-9_]+$/.test(u)) return null;
  return u;
}

export function validatePin(pin: string): boolean {
  return /^[0-9]{4,8}$/.test(pin);
}
