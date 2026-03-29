import { useAuth } from "../context/AuthContext";

export function Account() {
  const { user } = useAuth();

  return (
    <div className="card narrow-inline">
      <h1 className="page-title">Cuenta</h1>
      <p>
        Usuario: <strong>{user?.username}</strong>
      </p>
      <p className="muted">
        El PIN no se puede recuperar desde la app. Si lo olvidás, pedile a quien administre la base de datos que cree
        otra cuenta o restablezca el usuario.
      </p>
    </div>
  );
}
