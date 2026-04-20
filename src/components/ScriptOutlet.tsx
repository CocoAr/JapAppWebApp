import { Navigate, Outlet, useParams } from "react-router-dom";

export function ScriptOutlet() {
  const { script } = useParams();
  if (script !== "hiragana" && script !== "katakana") {
    return <Navigate to="/app" replace />;
  }
  return <Outlet />;
}
