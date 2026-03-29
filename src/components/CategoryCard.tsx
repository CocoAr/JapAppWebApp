import { cardGrey, masteryBackground } from "../lib/colors";

type Props = {
  title: string;
  mastery: number;
  lastScore: number | null;
  started: boolean;
  onClick: () => void;
};

export function CategoryCard({ title, mastery, lastScore, started, onClick }: Props) {
  const bg = !started ? cardGrey : masteryBackground(mastery);
  const last =
    lastScore === null || lastScore === undefined ? "Últ.: --" : `Últ.: ${Math.round(lastScore)}%`;

  return (
    <button
      type="button"
      className={`category-card ${!started ? "category-card--grey" : ""}`}
      onClick={onClick}
      style={{ background: bg }}
    >
      <span className="category-card-title">{title}</span>
      <span className="category-card-meta">
        <span className="category-card-last">{last}</span>
        <span className="category-card-pct">{started ? `${mastery}%` : "—"}</span>
      </span>
    </button>
  );
}
