import { useNavigate } from "react-router-dom";
import { vocabulary } from "../data/vocabulary";
import { WeakPageCategoryCard } from "../components/WeakPageCategoryCard";
import { useAuth } from "../context/AuthContext";
import { weakWordsForPage } from "../lib/progress";

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
          return (
            <WeakPageCategoryCard
              key={p.id}
              title={p.label}
              pageId={p.id}
              weakCount={weakList.length}
              progress={progress}
              onClick={() => {
                if (weakList.length === 0) return;
                navigate(`/app/session?mode=weakPage&category=${encodeURIComponent(p.id)}`);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
