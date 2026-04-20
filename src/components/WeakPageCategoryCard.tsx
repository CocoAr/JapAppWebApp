import { masteryBackground } from "../lib/colors";
import type { ProgressPayload } from "../lib/api";
import type { Script } from "../data/vocabulary";
import { weakPageMasteryPercent } from "../lib/progress";

type Props = {
  title: string;
  pageId: string;
  weakCount: number;
  progress: ProgressPayload | null;
  script: Script;
  onClick: () => void;
};

export function WeakPageCategoryCard({ title, pageId, weakCount, progress, script, onClick }: Props) {
  const hasWeak = weakCount > 0;
  const mastery = weakPageMasteryPercent(pageId, progress, script);
  const bg = hasWeak ? masteryBackground(mastery) : masteryBackground(100);

  return (
    <button
      type="button"
      className={`weak-page-card category-card ${hasWeak ? "" : "weak-page-card--complete"}`}
      onClick={onClick}
      disabled={!hasWeak}
      style={{ background: bg }}
    >
      <span className="category-card-title weak-page-card-title">{title}</span>
      <span className="weak-page-card-message">
        {hasWeak ? (
          <>
            Te faltan <span className="weak-page-card-count">{weakCount}</span>{" "}
            {weakCount === 1 ? "palabra" : "palabras"} por aprender
          </>
        ) : (
          <>¡Felicitaciones! Ya sabes todas las palabras del nivel</>
        )}
      </span>
    </button>
  );
}
