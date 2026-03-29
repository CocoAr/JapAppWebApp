const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

const te = new TextEncoder();

function bytesToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function hashPin(pin: string, saltHex: string): Promise<string> {
  const salt = hexToBytes(saltHex);
  const keyMaterial = await crypto.subtle.importKey("raw", te.encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    KEY_BITS
  );
  return bytesToHex(bits);
}

export function generateSaltHex(): string {
  const salt = new Uint8Array(SALT_BYTES);
  crypto.getRandomValues(salt);
  return bytesToHex(salt.buffer);
}

export async function verifyPin(pin: string, saltHex: string, expectedHashHex: string): Promise<boolean> {
  const computed = await hashPin(pin, saltHex);
  return timingSafeEqual(computed, expectedHashHex);
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", te.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, te.encode(data));
  return bytesToHex(sig);
}

export type SessionPayload = { uid: number; exp: number };

export async function createSessionToken(secret: string, uid: number, ttlMs: number): Promise<string> {
  const exp = Date.now() + ttlMs;
  const payload: SessionPayload = { uid, exp };
  const json = JSON.stringify(payload);
  const b64 = b64urlEncode(te.encode(json));
  const sig = await hmacSign(secret, b64);
  return `${b64}.${sig}`;
}

export async function verifySessionToken(secret: string, token: string): Promise<SessionPayload | null> {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const b64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmacSign(secret, b64);
  if (!timingSafeEqual(sig.toLowerCase(), expected.toLowerCase())) return null;
  try {
    const json = new TextDecoder().decode(b64urlDecode(b64));
    const payload = JSON.parse(json) as SessionPayload;
    if (typeof payload.uid !== "number" || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
