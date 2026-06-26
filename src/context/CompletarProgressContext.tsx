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
  apiGetCompletarProgress,
  apiPostCompletarResult,
  type CompletarStatus,
} from "../lib/api";

type CompletarProgressContextValue = {
  /** itemId → best/last persisted status. */
  items: Record<string, CompletarStatus>;
  loaded: boolean;
  /** Optimistically store a result and persist it (non-fatal on failure). */
  recordResult: (itemId: string, status: CompletarStatus) => void;
  reload: () => Promise<void>;
};

const CompletarProgressContext = createContext<CompletarProgressContextValue | null>(null);

export function CompletarProgressProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Record<string, CompletarStatus>>({});
  const [loaded, setLoaded] = useState(false);
  const loadingRef = useRef(false);

  const reload = useCallback(async () => {
    try {
      const p = await apiGetCompletarProgress();
      setItems(p.items ?? {});
    } catch {
      setItems({});
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    void reload();
  }, [reload]);

  const recordResult = useCallback((itemId: string, status: CompletarStatus) => {
    setItems((prev) => ({ ...prev, [itemId]: status }));
    apiPostCompletarResult(itemId, status).catch(() => {
      /* non-fatal: progress is best-effort */
    });
  }, []);

  const value = useMemo(
    () => ({ items, loaded, recordResult, reload }),
    [items, loaded, recordResult, reload]
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
