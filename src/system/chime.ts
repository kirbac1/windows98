/** The four-note startup sound. Its own short-lived AudioContext, so it
 *  never interferes with whatever the music player is doing. */
export function chime(): void {
  try {
    const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return;
    const c = new Ctor();
    const now = c.currentTime;
    ([[392, 0], [523.25, 0.16], [659.25, 0.32], [783.99, 0.48]] as const).forEach(([f, t]) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, now + t);
      g.gain.linearRampToValueAtTime(0.16, now + t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0008, now + t + 1.2);
      o.connect(g);
      g.connect(c.destination);
      o.start(now + t);
      o.stop(now + t + 1.3);
    });
    setTimeout(() => void c.close(), 2800);
  } catch {
    /* no audio here — the desktop works fine in silence */
  }
}
