import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SpeechPreferenceProvider } from "./context/SpeechPreferenceContext";
import { Layout } from "./components/Layout";
import { ScriptOutlet } from "./components/ScriptOutlet";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ScriptPicker } from "./pages/ScriptPicker";
import { TrainingMenu } from "./pages/TrainingMenu";
import { TrainByPage } from "./pages/TrainByPage";
import { TrainByTopic } from "./pages/TrainByTopic";
import { TrainWeak } from "./pages/TrainWeak";
import { TrainWeakByPage } from "./pages/TrainWeakByPage";
import { StudySession } from "./pages/StudySession";
import { SessionSummary } from "./pages/SessionSummary";
import { Account } from "./pages/Account";
import { KatakanaTypeSettings } from "./pages/KatakanaTypeSettings";
import { KatakanaTypeSession } from "./pages/KatakanaTypeSession";

export default function App() {
  return (
    <AuthProvider>
      <SpeechPreferenceProvider>
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
              <Route index element={<ScriptPicker />} />
              <Route path="account" element={<Account />} />
              <Route path=":script" element={<ScriptOutlet />}>
                <Route index element={<TrainingMenu />} />
                <Route path="train/page" element={<TrainByPage />} />
                <Route path="train/topic" element={<TrainByTopic />} />
                <Route path="train/weak" element={<TrainWeak />} />
                <Route path="train/weak-page" element={<TrainWeakByPage />} />
                <Route path="session" element={<StudySession />} />
                <Route path="summary" element={<SessionSummary />} />
                <Route path="type/session" element={<KatakanaTypeSession />} />
                <Route path="type" element={<KatakanaTypeSettings />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SpeechPreferenceProvider>
    </AuthProvider>
  );
}
