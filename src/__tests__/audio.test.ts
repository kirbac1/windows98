import { describe, expect, it } from "vitest";
import { EQ_FREQS, TRACKS, fmt, mtof, stepDur, trackLen, trackSteps } from "../audio/tracks";

describe("audio helpers", () => {
  it("converts MIDI notes to concert pitch", () => {
    expect(mtof(69)).toBeCloseTo(440, 6); // A4
    expect(mtof(81)).toBeCloseTo(880, 6); // an octave up
    expect(mtof(60)).toBeCloseTo(261.626, 3); // middle C
  });

  it("formats time the way a media player does", () => {
    expect(fmt(0)).toBe("0:00");
    expect(fmt(9)).toBe("0:09");
    expect(fmt(75)).toBe("1:15");
    expect(fmt(-4)).toBe("0:00"); // never shows a negative
  });

  it("derives track length from tempo and loop count", () => {
    const t = TRACKS[0];
    expect(stepDur(t)).toBeCloseTo(60 / t.bpm / 4, 9);
    expect(trackSteps(t)).toBe(64 * t.loops);
    expect(trackLen(t)).toBeCloseTo(trackSteps(t) * stepDur(t), 9);
  });
});

describe("track data", () => {
  it("is shaped the way the sequencer indexes it", () => {
    // schedule() reads pattern[bar % 4][step % 16] — anything else is a crash.
    for (const t of TRACKS) {
      expect(t.lead).toHaveLength(4);
      expect(t.bass).toHaveLength(4);
      expect(t.drums).toHaveLength(4);
      t.lead.forEach((bar) => expect(bar).toHaveLength(16));
      t.bass.forEach((bar) => expect(bar).toHaveLength(16));
      t.drums.forEach((bar) => expect(bar).toHaveLength(16));
    }
  });

  it("uses only drum characters the synth knows", () => {
    for (const t of TRACKS) for (const bar of t.drums) expect(bar).toMatch(/^[.khs]{16}$/);
  });

  it("stays inside the MIDI range", () => {
    for (const t of TRACKS)
      for (const bar of [...t.lead, ...t.bass])
        for (const n of bar) expect(n === 0 || (n > 20 && n < 108)).toBe(true);
  });

  it("has one equalizer band per filter", () => {
    expect(EQ_FREQS).toHaveLength(10);
    expect([...EQ_FREQS].sort((a, b) => a - b)).toEqual(EQ_FREQS);
  });
});
