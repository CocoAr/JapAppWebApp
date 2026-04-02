import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SpeechAutoToggle } from "./SpeechAutoToggle";
import { VocabCelebrationHost } from "./VocabCelebrationHost";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMenuPage = location.pathname === "/app" || location.pathname === "/app/";

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
          <Link to="/app">Menú</Link>
          <Link to="/app/train/page">Por nivel</Link>
          <Link to="/app/train/topic">Por tema</Link>
          <Link to="/app/session?mode=random">Al azar</Link>
          <Link to="/app/train/weak">Débiles</Link>
          <Link to="/app/train/weak-page">Débiles × nivel</Link>
          <Link to="/app/account">Cuenta</Link>
        </nav>
        <div className="topbar-end">
          <div className="topbar-user">
            <span className="muted">{user?.username}</span>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Salir
            </button>
          </div>
          {isMenuPage ? <SpeechAutoToggle /> : null}
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
