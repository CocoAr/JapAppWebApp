import { useParams } from "react-router-dom";
import type { Script } from "../data/vocabulary";

/** Call only under `/app/hiragana/...` or `/app/katakana/...`. */
export function useScriptParam(): Script {
  const { script } = useParams();
  if (script !== "hiragana" && script !== "katakana") {
    throw new Error("useScriptParam: missing or invalid script in route");
  }
  return script;
}

export function scriptBase(script: Script): string {
  return `/app/${script}`;
}
