/** The soundtrack. Three loops written as step patterns — 16 steps to a
 *  bar, four bars each — played back by the sequencer in engine.ts.
 *  MIDI note numbers; R is a rest. Nothing here is sampled: the lead is a
 *  square wave, the bass a triangle, the drums filtered noise. */

export interface Track {
  name: string;
  artist: string;
  bpm: number;
  kbps: number;
  /** How many times the four-bar pattern repeats before the track ends. */
  loops: number;
  lead: number[][];
  bass: number[][];
  drums: string[];
}

export interface PlaylistItem {
  kind: "synth" | "file";
  name: string;
  artist: string;
  dur: number;
  kbps: number | string;
  url?: string;
}

export const EQ_FREQS =[60,170,310,600,1000,3000,6000,12000,14000,16000];
const R = 0;
export const TRACKS: Track[] = [
  {name:"Blue Screen Boogie",artist:"System Idle",bpm:150,kbps:256,loops:4,
   lead:[[76,R,76,R,79,R,76,R,74,R,72,R,71,R,R,R],
         [72,R,74,R,76,R,72,R,69,R,R,R,R,R,71,72],
         [76,R,76,R,79,R,83,R,81,R,79,R,76,R,R,R],
         [74,R,76,R,74,R,71,R,69,R,R,R,R,R,R,R]],
   bass:[[40,R,40,R,40,R,40,R,40,R,40,R,47,R,47,R],
         [45,R,45,R,45,R,45,R,43,R,43,R,43,R,43,R],
         [40,R,40,R,40,R,40,R,40,R,40,R,47,R,47,R],
         [45,R,45,R,43,R,43,R,40,R,R,R,40,R,42,R]],
   drums:["k..hs..hk..hs..h","k..hs..hk..hs..h","k..hs..hk..hs..h","k..hs..hk.khs.ss"]},
  {name:"Dial-Up Serenade",artist:"56k Handshake",bpm:96,kbps:192,loops:3,
   lead:[[72,R,R,76,R,R,79,R,R,R,76,R,R,R,R,R],
         [74,R,R,77,R,R,81,R,R,R,79,R,77,R,R,R],
         [76,R,R,79,R,R,84,R,R,R,81,R,R,R,79,R],
         [77,R,R,74,R,R,72,R,R,R,R,R,R,R,R,R]],
   bass:[[36,R,R,R,43,R,R,R,36,R,R,R,43,R,R,R],
         [38,R,R,R,45,R,R,R,38,R,R,R,45,R,R,R],
         [40,R,R,R,47,R,R,R,40,R,R,R,47,R,R,R],
         [41,R,R,R,48,R,R,R,43,R,R,R,43,R,R,R]],
   drums:["k......h........","k......h....h...","k......h........","k......h..h.h.h."]},
  {name:"Defrag Dreams",artist:"Cluster Shuffle",bpm:128,kbps:224,loops:4,
   lead:[[69,72,76,72,69,72,76,72,69,72,76,72,69,72,76,72],
         [67,71,74,71,67,71,74,71,67,71,74,71,67,71,74,71],
         [65,69,72,69,65,69,72,69,65,69,72,69,65,69,72,69],
         [64,68,71,68,64,68,71,68,64,68,71,68,71,72,74,76]],
   bass:[[33,R,R,R,33,R,R,R,33,R,R,R,33,R,33,R],
         [31,R,R,R,31,R,R,R,31,R,R,R,31,R,31,R],
         [29,R,R,R,29,R,R,R,29,R,R,R,29,R,29,R],
         [28,R,R,R,28,R,R,R,28,R,R,R,28,R,30,R]],
   drums:["k.h.k.h.k.h.k.h.","k.h.k.h.k.h.k.h.","k.h.k.h.k.h.k.h.","k.h.k.h.k.h.kkss"]}
];

export const mtof = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

/** m:ss, the way every media player has shown it since forever. */
export const fmt = (s: number): string => {
  const v = Math.max(0, Math.floor(s));
  return Math.floor(v / 60) + ":" + String(v % 60).padStart(2, "0");
};

export const stepDur = (t: Track): number => 60 / t.bpm / 4;
export const trackSteps = (t: Track): number => 64 * t.loops;
export const trackLen = (t: Track): number => trackSteps(t) * stepDur(t);
