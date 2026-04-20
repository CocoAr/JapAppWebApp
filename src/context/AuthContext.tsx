import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  apiGetProgress,
  apiLogin,
  apiLogout,
  apiMe,
  apiRegister,
  type ProgressPayload,
  type User,
} from "../lib/api";
import { clearCelebrationAdvance } from "../lib/vocabCelebrationBridge";

type AuthContextValue = {
  user: User | null;
  progress: ProgressPayload | null;
  loading: boolean;
  refreshProgress: () => Promise<void>;
  mergeWordProgress: (wordId: string, status: "known" | "weak") => void;
  mergeCategorySession: (
    mode: "page" | "topic",
    categoryId: string,
    score: number,
    started: boolean
  ) => void;
  mergeCategoryStarted: (mode: "page" | "topic", categoryId: string) => void;
  mergeCelebrationShown: (script: "hiragana" | "katakana") => void;
  login: (username: string, pin: string) => Promise<void>;
  register: (username: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<ProgressPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProgress = useCallback(async () => {
    const p = await apiGetProgress();
    setProgress(p);
  }, []);

  const mergeWordProgress = useCallback((wordId: string, status: "known" | "weak") => {
    setProgress((p) =>
      p
        ? {
            ...p,
            words: { ...p.words, [wordId]: status },
          }
        : null
    );
  }, []);

  const mergeCategorySession = useCallback(
    (mode: "page" | "topic", categoryId: string, score: number, started: boolean) => {
      setProgress((p) => {
        if (!p) return null;
        const bucket = { ...p.categories[mode] };
        bucket[categoryId] = {
          started: started || bucket[categoryId]?.started === true,
          lastSessionScore: score,
        };
        return {
          ...p,
          categories: { ...p.categories, [mode]: bucket },
        };
      });
    },
    []
  );

  const mergeCategoryStarted = useCallback((mode: "page" | "topic", categoryId: string) => {
    setProgress((p) => {
      if (!p) return null;
      const bucket = { ...p.categories[mode] };
      const prev = bucket[categoryId];
      bucket[categoryId] = {
        started: true,
        lastSessionScore: prev?.lastSessionScore ?? null,
      };
      return {
        ...p,
        categories: { ...p.categories, [mode]: bucket },
      };
    });
  }, []);

  const mergeCelebrationShown = useCallback((script: "hiragana" | "katakana") => {
    setProgress((p) =>
      p
        ? {
            ...p,
            celebrationShown: { ...p.celebrationShown, [script]: true },
          }
        : null
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user: u } = await apiMe();
        if (cancelled) return;
        setUser(u);
        const pr = await apiGetProgress();
        if (!cancelled) setProgress(pr);
      } catch {
        if (!cancelled) {
          setUser(null);
          setProgress(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (username: string, pin: string) => {
      const { user: u } = await apiLogin(username, pin);
      setUser(u);
      await refreshProgress();
    },
    [refreshProgress]
  );

  const register = useCallback(
    async (username: string, pin: string) => {
      const { user: u } = await apiRegister(username, pin);
      setUser(u);
      await refreshProgress();
    },
    [refreshProgress]
  );

  const logout = useCallback(async () => {
    clearCelebrationAdvance();
    await apiLogout();
    setUser(null);
    setProgress(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      progress,
      loading,
      refreshProgress,
      mergeWordProgress,
      mergeCategorySession,
      mergeCategoryStarted,
      mergeCelebrationShown,
      login,
      register,
      logout,
    }),
    [
      user,
      progress,
      loading,
      refreshProgress,
      mergeWordProgress,
      mergeCategorySession,
      mergeCategoryStarted,
      mergeCelebrationShown,
      login,
      register,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
