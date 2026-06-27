import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  apiGetCompletarLevelProgress,
  apiPostCompletarLevelResult,
  type CompletarStatus,
} from "../lib/api";
import { isExactAtLevel, levelKey as key } from "../lib/completar/progress";

const RANK: Record<CompletarStatus, number> = { wrong: 1, near: 2, exact: 3 };

type CompletarProgressContextValue = {
  /** Best result per `${itemId}:${level}`. */
  levels: Record<string, CompletarStatus>;
  loaded: boolean;
  /** True when item is `exact` at the given level. */
  isExactAt: (itemId: string, level: number) => boolean;
  /** Optimistically store the best result for (item, level) and persist it. */
  recordResult: (itemId: string, level: number, result: CompletarStatus) => void;
  reload: () => Promise<void>;
};

const CompletarProgressContext = createContext<CompletarProgressContextValue | null>(null);

export function CompletarProgressProvider({ children }: { children: ReactNode }) {
  const [levels, setLevels] = useState<Record<string, CompletarStatus>>({});
  const [loaded, setLoaded] = useState(false);
  const loadingRef = useRef(false);

  const reload = useCallback(async () => {
    try {
      const p = await apiGetCompletarLevelProgress();
      setLevels(p.progress ?? {});
    } catch {
      setLevels({});
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    void reload();
  }, [reload]);

  const recordResult = useCallback((itemId: string, level: number, result: CompletarStatus) => {
    const k = key(itemId, level);
    setLevels((prev) => {
      const existing = prev[k];
      if (existing && RANK[existing] >= RANK[result]) return prev;
      return { ...prev, [k]: result };
    });
    apiPostCompletarLevelResult(itemId, level, result).catch(() => {
      /* non-fatal: progress is best-effort */
    });
  }, []);

  const isExactAt = useCallback(
    (itemId: string, level: number) => isExactAtLevel(levels, itemId, level),
    [levels]
  );

  const value = useMemo(
    () => ({ levels, loaded, isExactAt, recordResult, reload }),
    [levels, loaded, isExactAt, recordResult, reload]
  );

  return (
    <CompletarProgressContext.Provider value={value}>{children}</CompletarProgressContext.Provider>
  );
}

export function useCompletarProgress(): CompletarProgressContextValue {
  const ctx = useContext(CompletarProgressContext);
  if (!ctx) throw new Error("useCompletarProgress must be used within CompletarProgressProvider");
  return ctx;
}
