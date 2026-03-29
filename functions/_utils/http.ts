import type { Env } from "../types";

export function json(data: unknown, init: number | ResponseInit = 200): Response {
  const status = typeof init === "number" ? init : init.status ?? 200;
  const headers = new Headers(typeof init === "number" ? undefined : init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { status, headers });
}

export function jsonError(message: string, status: number): Response {
  return json({ error: message }, status);
}

const SESSION_COOKIE = "jv_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function sessionCookieHeader(
  env: Env,
  request: Request,
  token: string | null,
  maxAgeSeconds?: number
): string {
  const secure = new URL(request.url).protocol === "https:";
  if (token === null) {
    return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
  }
  const maxAge = maxAgeSeconds ?? Math.floor(SESSION_TTL_MS / 1000);
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${
    secure ? "; Secure" : ""
  }`;
}

export function readSessionCookie(request: Request): string | null {
  const raw = request.headers.get("Cookie") ?? "";
  for (const part of raw.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

export { SESSION_TTL_MS };
