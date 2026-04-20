import { useNavigate } from "react-router-dom";
import { getVocabulary } from "../data/vocabulary";
import { CategoryCard } from "../components/CategoryCard";
import { useAuth } from "../context/AuthContext";
import { masteryPercentForTopic } from "../lib/progress";
import { useScriptParam } from "../lib/script";

export function TrainByTopic() {
  const script = useScriptParam();
  const vocabulary = getVocabulary(script);
  const { progress } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="page-title">Por tema</h1>
      <p className="muted page-lead">Tocá un tema para practicar todas las palabras asociadas.</p>
      <div className="category-grid">
        {vocabulary.topics.map((t) => {
          const meta = progress?.categories.topic[t.id];
          const started = meta?.started === true;
          const mastery = masteryPercentForTopic(t.id, progress, script);
          const last = meta?.lastSessionScore ?? null;
          return (
            <CategoryCard
              key={t.id}
              title={t.label}
              mastery={mastery}
              lastScore={last}
              started={started}
              onClick={() =>
                navigate(`/app/${script}/session?mode=topic&category=${encodeURIComponent(t.id)}`)
              }
            />
          );
        })}
      </div>
    </div>
  );
}
