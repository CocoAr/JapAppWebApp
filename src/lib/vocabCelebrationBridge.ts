/** Lets the global celebration modal resume a study session after the user dismisses it. */

type Pending = { newK: number; unknownCount: number };

let pending: Pending | null = null;
let advance: ((k: number, u: number) => void) | null = null;
let modalOpen = false;

export function registerPendingCelebrationAdvance(p: Pending, adv: (k: number, u: number) => void) {
  pending = p;
  advance = adv;
}

export function takeAndRunCelebrationAdvance() {
  if (!pending || !advance) return;
  const payload = pending;
  const fn = advance;
  pending = null;
  advance = null;
  fn(payload.newK, payload.unknownCount);
}

export function clearCelebrationAdvance() {
  pending = null;
  advance = null;
}

export function setCelebrationModalOpen(v: boolean) {
  modalOpen = v;
}

export function isCelebrationModalOpen() {
  return modalOpen;
}
