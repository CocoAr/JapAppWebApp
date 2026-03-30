import { useNavigate } from "react-router-dom";
import { vocabulary } from "../data/vocabulary";
import { CategoryCard } from "../components/CategoryCard";
import { useAuth } from "../context/AuthContext";
import { weakPageMasteryPercent, weakWordsForPage } from "../lib/progress";

export function TrainWeakByPage() {
  const { progress } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="page-title">Palabras débiles por nivel</h1>
      <p className="muted page-lead">Elegí un nivel para practicar solo las palabras que marcaste como “No lo sabía” en ese nivel.</p>
      <div className="category-grid">
        {vocabulary.pages.map((p) => {
          const weakList = weakWordsForPage(p.id, progress);
          const hasWeak = weakList.length > 0;
          const meta = progress?.categories.page[p.id];
          const started = hasWeak;
          const mastery = weakPageMasteryPercent(p.id, progress);
          const last = meta?.lastSessionScore ?? null;
          return (
            <CategoryCard
              key={p.id}
              title={p.label}
              mastery={mastery}
              lastScore={last}
              started={started}
              disabled={!hasWeak}
              onClick={() => {
                if (!hasWeak) return;
                navigate(`/app/session?mode=weakPage&category=${encodeURIComponent(p.id)}`);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
