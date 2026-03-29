import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function Register() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="shell center">
        <p className="muted">Cargando…</p>
      </div>
    );
  }
  if (user) return <Navigate to="/app" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register(username, pin);
      navigate("/app", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error de red. Intentá de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shell center narrow">
      <h1 className="hero-title">Crear cuenta</h1>
      <p className="muted hero-sub">Usuario y PIN (4–8 dígitos). Grupo privado.</p>
      <form className="card form-card" onSubmit={handleSubmit}>
        {error ? <p className="form-error">{error}</p> : null}
        <label className="label">
          Usuario
          <input
            className="input"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={2}
          />
        </label>
        <label className="label">
          PIN
          <input
            className="input"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            minLength={4}
            maxLength={8}
          />
        </label>
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Creando…" : "Registrarse"}
        </button>
      </form>
      <p className="muted">
        <Link to="/">Volver al inicio de sesión</Link>
      </p>
    </div>
  );
}
