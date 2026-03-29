import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Menu } from "./pages/Menu";
import { TrainByPage } from "./pages/TrainByPage";
import { TrainByTopic } from "./pages/TrainByTopic";
import { TrainWeak } from "./pages/TrainWeak";
import { StudySession } from "./pages/StudySession";
import { SessionSummary } from "./pages/SessionSummary";
import { Account } from "./pages/Account";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Menu />} />
            <Route path="train/page" element={<TrainByPage />} />
            <Route path="train/topic" element={<TrainByTopic />} />
            <Route path="train/weak" element={<TrainWeak />} />
            <Route path="session" element={<StudySession />} />
            <Route path="summary" element={<SessionSummary />} />
            <Route path="account" element={<Account />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
