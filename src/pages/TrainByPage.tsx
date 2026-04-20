import { useNavigate } from "react-router-dom";
import { getVocabulary } from "../data/vocabulary";
import { CategoryCard } from "../components/CategoryCard";
import { useAuth } from "../context/AuthContext";
import { masteryPercentForPage } from "../lib/progress";
import { useScriptParam } from "../lib/script";

export function TrainByPage() {
  const script = useScriptParam();
  const vocabulary = getVocabulary(script);
  const { progress } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="page-title">Por nivel</h1>
      <p className="muted page-lead">Tocá un nivel para practicar solo esas palabras.</p>
      <div className="category-grid">
        {vocabulary.pages.map((p) => {
          const meta = progress?.categories.page[p.id];
          const started = meta?.started === true;
          const mastery = masteryPercentForPage(p.id, progress, script);
          const last = meta?.lastSessionScore ?? null;
          return (
            <CategoryCard
              key={p.id}
              title={p.label}
              mastery={mastery}
              lastScore={last}
              started={started}
              onClick={() =>
                navigate(`/app/${script}/session?mode=page&category=${encodeURIComponent(p.id)}`)
              }
            />
          );
        })}
      </div>
    </div>
  );
}
