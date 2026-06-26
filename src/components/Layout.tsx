import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { VocabCelebrationHost } from "./VocabCelebrationHost";
import type { Script } from "../data/vocabulary";

function scriptFromPath(pathname: string): Script | null {
  if (pathname.startsWith("/app/hiragana")) return "hiragana";
  if (pathname.startsWith("/app/katakana")) return "katakana";
  return null;
}

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const script = scriptFromPath(location.pathname);
  const inCompletar = location.pathname.startsWith("/app/completar");

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="shell">
      <VocabCelebrationHost />
      <header className="topbar">
        <Link to="/app" className="brand">
          Jap Vocab
        </Link>
        <nav className="nav-links">
          {script ? (
            <>
              <Link to={`/app/${script}`}>Menú</Link>
              <Link to={`/app/${script}/train/page`}>Por nivel</Link>
              <Link to={`/app/${script}/train/topic`}>Por tema</Link>
              <Link to={`/app/${script}/session?mode=random`}>Al azar</Link>
              <Link to={`/app/${script}/train/weak`}>Débiles</Link>
              <Link to={`/app/${script}/train/weak-page`}>Débiles × nivel</Link>
            </>
          ) : inCompletar ? (
            <>
              <Link to="/app/completar">Completar</Link>
              <Link to="/app/completar/tips">Consejos</Link>
            </>
          ) : null}
          <Link to="/app/account">Cuenta</Link>
        </nav>
        <div className="topbar-user">
          <span className="muted">{user?.username}</span>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
