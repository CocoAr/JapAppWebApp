export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseJson(r: Response): Promise<unknown> {
  const text = await r.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const r = await fetch(path, {
    ...init,
    credentials: "include",
    headers,
  });
  const data = (await parseJson(r)) as T & { error?: string };
  if (!r.ok) {
    const msg = typeof data === "object" && data && "error" in data && data.error ? String(data.error) : r.statusText;
    throw new ApiError(r.status, msg);
  }
  return data as T;
}

export interface User {
  id: number;
  username: string;
}

export interface CelebrationShown {
  hiragana: boolean;
  katakana: boolean;
}

export interface ProgressPayload {
  words: Record<string, "known" | "weak">;
  categories: {
    page: Record<string, { started: boolean; lastSessionScore: number | null }>;
    topic: Record<string, { started: boolean; lastSessionScore: number | null }>;
  };
  /** After the user dismissed the full-vocabulary celebration per script (persisted server-side). */
  celebrationShown: CelebrationShown;
}

export const apiRegister = (username: string, pin: string) =>
  api<{ user: User }>("/api/register", { method: "POST", body: JSON.stringify({ username, pin }) });

export const apiLogin = (username: string, pin: string) =>
  api<{ user: User }>("/api/login", { method: "POST", body: JSON.stringify({ username, pin }) });

export const apiLogout = () => api<{ ok: boolean }>("/api/logout", { method: "POST" });

export const apiMe = () => api<{ user: User }>("/api/me");

export async function apiGetProgress(): Promise<ProgressPayload> {
  const p = await api<
    ProgressPayload & {
      celebrationShown?: CelebrationShown | boolean;
    }
  >("/api/progress");
  const raw = p.celebrationShown;
  const celebrationShown: CelebrationShown =
    typeof raw === "boolean"
      ? { hiragana: raw, katakana: false }
      : {
          hiragana: raw?.hiragana ?? false,
          katakana: raw?.katakana ?? false,
        };
  return {
    ...p,
    celebrationShown,
  };
}

export const apiPostVocabCelebrationSeen = (script: "hiragana" | "katakana") =>
  api<{ ok: boolean }>("/api/progress/vocab-celebration-seen", {
    method: "POST",
    body: JSON.stringify({ script }),
  });

export const apiPostWord = (wordId: string, status: "known" | "weak") =>
  api<{ ok: boolean }>("/api/progress/word", { method: "POST", body: JSON.stringify({ wordId, status }) });

export const apiPostSession = (mode: "page" | "topic", categoryId: string, score: number) =>
  api<{ ok: boolean }>("/api/progress/session", {
    method: "POST",
    body: JSON.stringify({ mode, categoryId, score }),
  });

export const apiCategoryStarted = (mode: "page" | "topic", categoryId: string) =>
  api<{ ok: boolean }>("/api/progress/category-started", {
    method: "POST",
    body: JSON.stringify({ mode, categoryId }),
  });
