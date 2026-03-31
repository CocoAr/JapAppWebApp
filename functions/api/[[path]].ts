import type { Env } from "../types";
import { createSessionToken, generateSaltHex, hashPin, verifyPin, verifySessionToken } from "../_utils/crypto";
import { json, jsonError, readSessionCookie, sessionCookieHeader, SESSION_TTL_MS } from "../_utils/http";
import { normalizeUsername, validatePin, validateUsername } from "../_utils/validate";

async function requireUser(env: Env, request: Request): Promise<{ id: number; username: string } | null> {
  const secret = env.SESSION_SECRET;
  if (!secret) return null;
  const raw = readSessionCookie(request);
  if (!raw) return null;
  const payload = await verifySessionToken(secret, raw);
  if (!payload) return null;
  const row = await env.DB.prepare("SELECT id, username FROM users WHERE id = ?").bind(payload.uid).first<{
    id: number;
    username: string;
  }>();
  return row ?? null;
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "") || "/";

  try {
    if (path === "/api/register" && request.method === "POST") {
      return handleRegister(env, request);
    }
    if (path === "/api/login" && request.method === "POST") {
      return handleLogin(env, request);
    }
    if (path === "/api/logout" && request.method === "POST") {
      return handleLogout(env, request);
    }
    if (path === "/api/me" && request.method === "GET") {
      return handleMe(env, request);
    }
    if (path === "/api/progress" && request.method === "GET") {
      return handleGetProgress(env, request);
    }
    if (path === "/api/progress/vocab-celebration-seen" && request.method === "POST") {
      return handlePostVocabCelebrationSeen(env, request);
    }
    if (path === "/api/progress/word" && request.method === "POST") {
      return handlePostWord(env, request);
    }
    if (path === "/api/progress/session" && request.method === "POST") {
      return handlePostSession(env, request);
    }
    if (path === "/api/progress/category-started" && request.method === "POST") {
      return handleCategoryStarted(env, request);
    }
    if (path === "/api/categories/page" && request.method === "GET") {
      return handleGetProgress(env, request);
    }
    if (path === "/api/categories/topic" && request.method === "GET") {
      return handleGetProgress(env, request);
    }

    return jsonError("Not found", 404);
  } catch (e) {
    console.error(e);
    return jsonError("Server error", 500);
  }
}

async function handleRegister(env: Env, request: Request): Promise<Response> {
  const secret = env.SESSION_SECRET;
  if (!secret) return jsonError("Server misconfigured", 500);

  let body: { username?: string; pin?: string };
  try {
    body = (await request.json()) as { username?: string; pin?: string };
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const u = validateUsername(body.username ?? "");
  if (!u) {
    return jsonError("Usuario: 2–32 caracteres, solo letras minúsculas, números y guión bajo.", 400);
  }
  const pin = body.pin ?? "";
  if (!validatePin(pin)) {
    return jsonError("PIN: 4 a 8 dígitos.", 400);
  }

  const salt = generateSaltHex();
  const pinHash = await hashPin(pin, salt);
  const now = Date.now();

  try {
    const res = await env.DB.prepare(
      "INSERT INTO users (username, pin_hash, pin_salt, created_at) VALUES (?, ?, ?, ?) RETURNING id"
    )
      .bind(u, pinHash, salt, now)
      .first<{ id: number }>();

    if (!res) return jsonError("No se pudo crear la cuenta.", 500);

    const token = await createSessionToken(secret, res.id, SESSION_TTL_MS);
    const headers = new Headers();
    headers.append("Set-Cookie", sessionCookieHeader(env, request, token));
    return new Response(JSON.stringify({ user: { id: res.id, username: u } }), {
      status: 201,
      headers,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("UNIQUE") || msg.includes("unique")) {
      return jsonError("Ese nombre de usuario ya existe.", 409);
    }
    throw e;
  }
}

async function handleLogin(env: Env, request: Request): Promise<Response> {
  const secret = env.SESSION_SECRET;
  if (!secret) return jsonError("Server misconfigured", 500);

  let body: { username?: string; pin?: string };
  try {
    body = (await request.json()) as { username?: string; pin?: string };
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const name = normalizeUsername(body.username ?? "");
  if (!name) return jsonError("Usuario o PIN incorrectos.", 401);
  const pin = body.pin ?? "";
  if (!validatePin(pin)) return jsonError("Usuario o PIN incorrectos.", 401);

  const row = await env.DB.prepare("SELECT id, username, pin_hash, pin_salt FROM users WHERE username = ?")
    .bind(name)
    .first<{ id: number; username: string; pin_hash: string; pin_salt: string }>();

  if (!row) return jsonError("Usuario o PIN incorrectos.", 401);

  const ok = await verifyPin(pin, row.pin_salt, row.pin_hash);
  if (!ok) return jsonError("Usuario o PIN incorrectos.", 401);

  const token = await createSessionToken(secret, row.id, SESSION_TTL_MS);
  const headers = new Headers();
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.append("Set-Cookie", sessionCookieHeader(env, request, token));
  return new Response(JSON.stringify({ user: { id: row.id, username: row.username } }), { status: 200, headers });
}

async function handleLogout(env: Env, request: Request): Promise<Response> {
  const headers = new Headers();
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.append("Set-Cookie", sessionCookieHeader(env, request, null));
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

async function handleMe(env: Env, request: Request): Promise<Response> {
  const user = await requireUser(env, request);
  if (!user) return jsonError("No autenticado.", 401);
  return json({ user });
}

async function handleGetProgress(env: Env, request: Request): Promise<Response> {
  const user = await requireUser(env, request);
  if (!user) return jsonError("No autenticado.", 401);

  const words = await env.DB.prepare(
    "SELECT word_id, status FROM word_progress WHERE user_id = ?"
  )
    .bind(user.id)
    .all<{ word_id: string; status: string }>();

  const wordMap: Record<string, "known" | "weak"> = {};
  for (const r of words.results ?? []) {
    if (r.status === "known" || r.status === "weak") wordMap[r.word_id] = r.status;
  }

  const cats = await env.DB.prepare(
    "SELECT mode, category_id, started, last_session_score FROM category_progress WHERE user_id = ?"
  )
    .bind(user.id)
    .all<{ mode: string; category_id: string; started: number; last_session_score: number | null }>();

  const categoryProgress: {
    page: Record<string, { started: boolean; lastSessionScore: number | null }>;
    topic: Record<string, { started: boolean; lastSessionScore: number | null }>;
  } = { page: {}, topic: {} };

  for (const r of cats.results ?? []) {
    const mode = r.mode === "page" ? "page" : "topic";
    categoryProgress[mode][r.category_id] = {
      started: r.started === 1,
      lastSessionScore: r.last_session_score,
    };
  }

  const seenRow = await env.DB.prepare("SELECT vocab_celebration_seen FROM users WHERE id = ?")
    .bind(user.id)
    .first<{ vocab_celebration_seen: number }>();
  const celebrationShown = (seenRow?.vocab_celebration_seen ?? 0) === 1;

  return json({ words: wordMap, categories: categoryProgress, celebrationShown });
}

async function handlePostVocabCelebrationSeen(env: Env, request: Request): Promise<Response> {
  const user = await requireUser(env, request);
  if (!user) return jsonError("No autenticado.", 401);

  await env.DB.prepare("UPDATE users SET vocab_celebration_seen = 1 WHERE id = ?").bind(user.id).run();

  return json({ ok: true });
}

async function handlePostWord(env: Env, request: Request): Promise<Response> {
  const user = await requireUser(env, request);
  if (!user) return jsonError("No autenticado.", 401);

  let body: { wordId?: string; status?: string };
  try {
    body = (await request.json()) as { wordId?: string; status?: string };
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const wordId = body.wordId?.trim() ?? "";
  const status = body.status;
  if (!wordId) return jsonError("wordId requerido.", 400);
  if (status !== "known" && status !== "weak") return jsonError("status inválido.", 400);

  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO word_progress (user_id, word_id, status, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, word_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`
  )
    .bind(user.id, wordId, status, now)
    .run();

  return json({ ok: true });
}

async function handlePostSession(env: Env, request: Request): Promise<Response> {
  const user = await requireUser(env, request);
  if (!user) return jsonError("No autenticado.", 401);

  let body: { mode?: string; categoryId?: string; score?: number };
  try {
    body = (await request.json()) as { mode?: string; categoryId?: string; score?: number };
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const mode = body.mode;
  const categoryId = body.categoryId?.trim() ?? "";
  const score = body.score;

  if (mode !== "page" && mode !== "topic") return jsonError("mode inválido.", 400);
  if (!categoryId) return jsonError("categoryId requerido.", 400);
  if (typeof score !== "number" || Number.isNaN(score) || score < 0 || score > 100) {
    return jsonError("score debe ser 0–100.", 400);
  }

  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO category_progress (user_id, mode, category_id, started, last_session_score, updated_at)
     VALUES (?, ?, ?, 1, ?, ?)
     ON CONFLICT(user_id, mode, category_id) DO UPDATE SET
       started = 1,
       last_session_score = excluded.last_session_score,
       updated_at = excluded.updated_at`
  )
    .bind(user.id, mode, categoryId, score, now)
    .run();

  return json({ ok: true });
}

async function handleCategoryStarted(env: Env, request: Request): Promise<Response> {
  const user = await requireUser(env, request);
  if (!user) return jsonError("No autenticado.", 401);

  let body: { mode?: string; categoryId?: string };
  try {
    body = (await request.json()) as { mode?: string; categoryId?: string };
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const mode = body.mode;
  const categoryId = body.categoryId?.trim() ?? "";
  if (mode !== "page" && mode !== "topic") return jsonError("mode inválido.", 400);
  if (!categoryId) return jsonError("categoryId requerido.", 400);

  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO category_progress (user_id, mode, category_id, started, last_session_score, updated_at)
     VALUES (?, ?, ?, 1, NULL, ?)
     ON CONFLICT(user_id, mode, category_id) DO UPDATE SET started = 1, updated_at = excluded.updated_at`
  )
    .bind(user.id, mode, categoryId, now)
    .run();

  return json({ ok: true });
}
