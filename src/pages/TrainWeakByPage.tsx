import { useNavigate } from "react-router-dom";
import { getVocabulary } from "../data/vocabulary";
import { WeakPageCategoryCard } from "../components/WeakPageCategoryCard";
import { useAuth } from "../context/AuthContext";
import { weakWordsForPage } from "../lib/progress";
import { useScriptParam } from "../lib/script";

export function TrainWeakByPage() {
  const script = useScriptParam();
  const vocabulary = getVocabulary(script);
  const { progress } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="page-title">Palabras débiles por nivel</h1>
      <p className="muted page-lead">Elegí un nivel para practicar solo las palabras que marcaste como “No lo sabía” en ese nivel.</p>
      <div className="category-grid">
        {vocabulary.pages.map((p) => {
          const weakList = weakWordsForPage(p.id, progress, script);
          return (
            <WeakPageCategoryCard
              key={p.id}
              script={script}
              title={p.label}
              pageId={p.id}
              weakCount={weakList.length}
              progress={progress}
              onClick={() => {
                if (weakList.length === 0) return;
                navigate(`/app/${script}/session?mode=weakPage&category=${encodeURIComponent(p.id)}`);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
