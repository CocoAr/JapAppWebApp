import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "jap_vocab_auto_speak_ja";

type SpeechPreferenceValue = {
  autoSpeakJapanese: boolean;
  setAutoSpeakJapanese: (value: boolean) => void;
  toggleAutoSpeakJapanese: () => void;
};

const SpeechPreferenceContext = createContext<SpeechPreferenceValue | null>(null);

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function SpeechPreferenceProvider({ children }: { children: ReactNode }) {
  const [autoSpeakJapanese, setAutoSpeakJapaneseState] = useState(false);

  useEffect(() => {
    setAutoSpeakJapaneseState(readStored());
  }, []);

  const setAutoSpeakJapanese = useCallback((value: boolean) => {
    setAutoSpeakJapaneseState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleAutoSpeakJapanese = useCallback(() => {
    setAutoSpeakJapaneseState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      autoSpeakJapanese,
      setAutoSpeakJapanese,
      toggleAutoSpeakJapanese,
    }),
    [autoSpeakJapanese, setAutoSpeakJapanese, toggleAutoSpeakJapanese]
  );

  return <SpeechPreferenceContext.Provider value={value}>{children}</SpeechPreferenceContext.Provider>;
}

export function useSpeechPreference(): SpeechPreferenceValue {
  const ctx = useContext(SpeechPreferenceContext);
  if (!ctx) throw new Error("useSpeechPreference must be used within SpeechPreferenceProvider");
  return ctx;
}
