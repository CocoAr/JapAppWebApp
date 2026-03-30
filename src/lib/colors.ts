/** Interpolate bright red → bright yellow → bright green for mastery 0–100 when category was started. */
export function masteryBackground(masteryPercent: number): string {
  const r1 = [255, 60, 60];
  const r2 = [255, 225, 70];
  const r3 = [60, 220, 90];
  const t = Math.max(0, Math.min(100, masteryPercent)) / 100;
  let a: number[];
  let b: number[];
  let k: number;
  if (t <= 0.5) {
    a = r1;
    b = r2;
    k = t / 0.5;
  } else {
    a = r2;
    b = r3;
    k = (t - 0.5) / 0.5;
  }
  const rgb = a.map((x, i) => Math.round(x + (b[i] - x) * k));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export const cardGrey = "#3d3d42";
