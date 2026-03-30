import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="shell">
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
