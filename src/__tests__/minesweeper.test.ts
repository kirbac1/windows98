import { describe, expect, it } from "vitest";
import { LEVELS, dig, flagsUsed, makeBoard, neighbours, plant } from "../game/minesweeper";

const BEG = LEVELS.Beginner;

describe("minesweeper", () => {
  it("builds a board of the right size", () => {
    const b = makeBoard(BEG.w, BEG.h);
    expect(b).toHaveLength(81);
    expect(b.every((c) => !c.mine && !c.open && !c.flag)).toBe(true);
  });

  it("counts neighbours, clamping at the edges", () => {
    expect(neighbours(0, BEG)).toHaveLength(3); // top-left corner
    expect(neighbours(4, BEG)).toHaveLength(5); // top edge
    expect(neighbours(10, BEG)).toHaveLength(8); // interior
    expect(neighbours(80, BEG)).toHaveLength(3); // bottom-right corner
  });

  it("never puts a mine on the first click or next to it", () => {
    // Run it repeatedly: the guarantee has to hold every single time.
    for (let n = 0; n < 200; n++) {
      const first = Math.floor(Math.random() * BEG.w * BEG.h);
      const b = plant(BEG, first);
      const safe = [first, ...neighbours(first, BEG)];
      expect(safe.some((i) => b[i].mine)).toBe(false);
      expect(b.filter((c) => c.mine)).toHaveLength(BEG.m);
    }
  });

  it("labels each square with its adjacent mine count", () => {
    const b = plant(BEG, 40);
    b.forEach((c, i) => {
      if (c.mine) return;
      expect(c.n).toBe(neighbours(i, BEG).filter((j) => b[j].mine).length);
    });
  });

  it("opens the whole empty region in one click", () => {
    // A board with a single mine in the corner: clicking the far corner
    // has to cascade across almost the entire grid.
    const b = makeBoard(BEG.w, BEG.h);
    b[0].mine = true;
    b.forEach((c, i) => {
      if (!c.mine) c.n = neighbours(i, BEG).filter((j) => b[j].mine).length;
    });
    const r = dig(b, 80, BEG);
    expect(r.status).toBe("won");
    expect(r.board.filter((c) => c.open && !c.mine)).toHaveLength(80);
  });

  it("ends the game when a mine is dug, and reveals the rest", () => {
    const b = makeBoard(BEG.w, BEG.h);
    b[5].mine = true;
    b[9].mine = true;
    const r = dig(b, 5, BEG);
    expect(r.status).toBe("lost");
    expect(r.board[5].boom).toBe(true);
    expect(r.board[9].open).toBe(true);
  });

  it("refuses to dig a flagged square", () => {
    const b = makeBoard(BEG.w, BEG.h);
    b[3].flag = true;
    b[3].mine = true;
    const r = dig(b, 3, BEG);
    expect(r.status).toBe("run");
    expect(r.board[3].open).toBe(false);
  });

  it("counts flags for the mine counter", () => {
    const b = makeBoard(BEG.w, BEG.h);
    b[1].flag = true;
    b[2].flag = true;
    expect(flagsUsed(b)).toBe(2);
  });
});
