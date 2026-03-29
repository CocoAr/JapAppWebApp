/** Interpolate red → yellow → green for mastery 0–100 when category was started. */
export function masteryBackground(masteryPercent: number): string {
  const r1 = [88, 58, 58];
  const r2 = [160, 140, 55];
  const r3 = [58, 140, 95];
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
