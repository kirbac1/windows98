/** Klondike rules. The component decides what a click means; this file
 *  decides whether the resulting move is legal. */

export const SUITS = ["♠", "♥", "♦", "♣"] as const;
export const RED = [false, true, true, false] as const;
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;

export interface Card {
  id: number;
  /** 0 = Ace … 12 = King */
  r: number;
  /** index into SUITS */
  s: number;
  up: boolean;
}
export interface Game {
  stock: Card[];
  waste: Card[];
  /** One foundation per suit, in SUITS order. */
  found: Card[][];
  tab: Card[][];
}

export function dealGame(): Game {
  const d: Card[] = [];
  let id = 0;
  for (let s = 0; s < 4; s++) for (let r = 0; r < 13; r++) d.push({ id: id++, r, s, up: false });
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = d[i];
    d[i] = d[j];
    d[j] = t;
  }
  const tab: Card[][] = [];
  for (let i = 0; i < 7; i++) {
    const p = d.splice(0, i + 1);
    p[p.length - 1].up = true;
    tab.push(p);
  }
  return { stock: d, waste: [], found: [[], [], [], []], tab };
}

export const clone = (g: Game): Game => ({
  stock: [...g.stock],
  waste: [...g.waste],
  found: g.found.map((f) => [...f]),
  tab: g.tab.map((t) => t.map((c) => ({ ...c }))),
});

/** Onto a tableau pile: descending rank, alternating colour. Empty takes a King. */
export const canTab = (c: Card, pile: Card[]): boolean => {
  if (pile.length === 0) return c.r === 12;
  const top = pile[pile.length - 1];
  return top.up && RED[top.s] !== RED[c.s] && top.r === c.r + 1;
};

/** Onto a foundation: same suit, ascending from the Ace. */
export const canFound = (c: Card, f: Card[], i: number): boolean => {
  if (f.length === 0) return c.r === 0 && c.s === i;
  const top = f[f.length - 1];
  return top.s === c.s && top.r === c.r - 1;
};

/** A run may only be picked up whole if it is itself a legal sequence. */
export const validRun = (cs: Card[]): boolean =>
  cs.every((c, i) => i === 0 || (RED[cs[i - 1].s] !== RED[c.s] && cs[i - 1].r === c.r + 1));

export const isWon = (g: Game): boolean => g.found.reduce((a, f) => a + f.length, 0) === 52;

/** Send everything that can legally go home, repeatedly, until nothing moves. */
export function autoFinish(game: Game): Game {
  const g = clone(game);
  let moved = true;
  let guard = 0;
  while (moved && guard++ < 200) {
    moved = false;
    for (const t of g.tab) {
      if (!t.length) continue;
      const c = t[t.length - 1];
      if (c.up && canFound(c, g.found[c.s], c.s)) {
        t.pop();
        g.found[c.s].push(c);
        if (t.length && !t[t.length - 1].up) t[t.length - 1].up = true;
        moved = true;
      }
    }
    if (g.waste.length) {
      const c = g.waste[g.waste.length - 1];
      if (canFound(c, g.found[c.s], c.s)) {
        g.waste.pop();
        g.found[c.s].push(c);
        moved = true;
      }
    }
  }
  return g;
}

/** Click the stock: turn one card, or recycle the waste when it runs out. */
export function drawFromStock(game: Game): Game {
  const g = clone(game);
  if (g.stock.length) {
    const c = g.stock.pop() as Card;
    c.up = true;
    g.waste.push(c);
  } else {
    g.stock = g.waste.reverse().map((c) => ({ ...c, up: false }));
    g.waste = [];
  }
  return g;
}
