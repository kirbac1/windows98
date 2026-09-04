import { describe, expect, it } from "vitest";
import {
  autoFinish, canFound, canTab, dealGame, drawFromStock, isWon, validRun,
} from "../game/solitaire";
import type { Card, Game } from "../game/solitaire";

const card = (r: number, s: number, up = true): Card => ({ id: r * 4 + s, r, s, up });
const empty = (): Game => ({ stock: [], waste: [], found: [[], [], [], []], tab: [[], [], [], [], [], [], []] });

describe("solitaire", () => {
  it("deals a full deck into the classic layout", () => {
    const g = dealGame();
    const all = [...g.stock, ...g.tab.flat()];
    expect(all).toHaveLength(52);
    expect(new Set(all.map((c) => c.id)).size).toBe(52);
    g.tab.forEach((pile, i) => {
      expect(pile).toHaveLength(i + 1);
      expect(pile[pile.length - 1].up).toBe(true);
      expect(pile.slice(0, -1).every((c) => !c.up)).toBe(true);
    });
    expect(g.stock).toHaveLength(24);
  });

  it("only stacks descending and in alternating colours", () => {
    const blackSix = card(5, 0);
    const redSeven = card(6, 1);
    const blackSeven = card(6, 3);
    expect(canTab(blackSix, [redSeven])).toBe(true);
    expect(canTab(blackSix, [blackSeven])).toBe(false); // same colour
    expect(canTab(card(4, 0), [redSeven])).toBe(false); // wrong rank
  });

  it("only puts a King on an empty column", () => {
    expect(canTab(card(12, 0), [])).toBe(true);
    expect(canTab(card(11, 0), [])).toBe(false);
  });

  it("builds foundations up from the ace, by suit", () => {
    expect(canFound(card(0, 2), [], 2)).toBe(true);
    expect(canFound(card(0, 2), [], 1)).toBe(false); // wrong foundation
    expect(canFound(card(1, 2), [card(0, 2)], 2)).toBe(true);
    expect(canFound(card(2, 2), [card(0, 2)], 2)).toBe(false); // skips a rank
  });

  it("recognises a legal run and rejects a broken one", () => {
    expect(validRun([card(6, 1), card(5, 0), card(4, 1)])).toBe(true);
    expect(validRun([card(6, 1), card(5, 1)])).toBe(false); // same colour
    expect(validRun([card(6, 1), card(4, 0)])).toBe(false); // gap
  });

  it("turns the stock one card at a time, then recycles it", () => {
    let g = empty();
    g.stock = [card(0, 0, false), card(1, 0, false)];
    g = drawFromStock(g);
    expect(g.waste).toHaveLength(1);
    expect(g.waste[0].up).toBe(true);
    g = drawFromStock(g);
    expect(g.stock).toHaveLength(0);
    g = drawFromStock(g); // empty stock recycles the waste face-down
    expect(g.stock).toHaveLength(2);
    expect(g.waste).toHaveLength(0);
    expect(g.stock.every((c) => !c.up)).toBe(true);
  });

  it("auto-finish clears a board that is ready to go home", () => {
    const g = empty();
    // Every suit laid out A..K in one column, all face up.
    for (let s = 0; s < 4; s++) g.tab[s] = Array.from({ length: 13 }, (_, r) => card(12 - r, s));
    const done = autoFinish(g);
    expect(isWon(done)).toBe(true);
    expect(done.tab.every((t) => t.length === 0)).toBe(true);
  });

  it("auto-finish flips the card it exposes", () => {
    const g = empty();
    g.tab[0] = [card(5, 0, false), card(0, 1)]; // ace on top of a face-down card
    const done = autoFinish(g);
    expect(done.found[1]).toHaveLength(1);
    expect(done.tab[0][0].up).toBe(true);
  });
});
