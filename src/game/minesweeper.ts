/** Minesweeper rules, kept free of React so they can be tested directly. */

export interface Cell {
  mine: boolean;
  open: boolean;
  flag: boolean;
  n: number;
  boom?: boolean;
}
export interface Level {
  w: number;
  h: number;
  m: number;
}
export type Status = "idle" | "run" | "won" | "lost";

export const LEVELS: Record<string, Level> = {
  Beginner: { w: 9, h: 9, m: 10 },
  Intermediate: { w: 16, h: 16, m: 40 },
  Expert: { w: 30, h: 16, m: 99 },
};

export const makeBoard = (w: number, h: number): Cell[] =>
  Array.from({ length: w * h }, () => ({ mine: false, open: false, flag: false, n: 0 }));

export function neighbours(i: number, L: Level): number[] {
  const x = i % L.w;
  const y = Math.floor(i / L.w);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < L.w && ny < L.h) out.push(ny * L.w + nx);
    }
  return out;
}

/** Mines are laid *after* the first click, and never on it or beside it —
 *  which is why the first click can never lose the game. */
export function plant(L: Level, first: number): Cell[] {
  const b = makeBoard(L.w, L.h);
  const safe = new Set([first, ...neighbours(first, L)]);
  let placed = 0;
  const room = L.w * L.h - safe.size;
  const target = Math.min(L.m, room);
  while (placed < target) {
    const i = Math.floor(Math.random() * b.length);
    if (b[i].mine || safe.has(i)) continue;
    b[i].mine = true;
    placed++;
  }
  for (let i = 0; i < b.length; i++) {
    if (b[i].mine) continue;
    b[i].n = neighbours(i, L).filter((j) => b[j].mine).length;
  }
  return b;
}

/** Opening an empty square opens the whole empty region around it. */
export function flood(board: Cell[], i: number, L: Level): void {
  const stack = [i];
  while (stack.length) {
    const c = stack.pop() as number;
    const cell = board[c];
    if (cell.open || cell.flag) continue;
    cell.open = true;
    if (cell.n === 0 && !cell.mine) {
      for (const j of neighbours(c, L)) if (!board[j].open && !board[j].flag) stack.push(j);
    }
  }
}

export function dig(board: Cell[], i: number, L: Level): { board: Cell[]; status: Status } {
  const b = board.map((c) => ({ ...c }));
  const cell = b[i];
  if (cell.flag || cell.open) return { board: b, status: "run" };
  if (cell.mine) {
    b.forEach((c) => {
      if (c.mine) c.open = true;
    });
    cell.boom = true;
    return { board: b, status: "lost" };
  }
  flood(b, i, L);
  const left = b.filter((c) => !c.open && !c.mine).length;
  if (left === 0) return { board: b.map((c) => (c.mine ? { ...c, flag: true } : c)), status: "won" };
  return { board: b, status: "run" };
}

export const flagsUsed = (board: Cell[]): number => board.filter((c) => c.flag).length;
