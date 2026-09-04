/** The usable desktop, in pixels.
 *
 *  The floors matter: a page can lay out before the browser knows how big
 *  it is (a hidden tab, an iframe that sizes late), and window geometry
 *  derived from a zero viewport comes out negative — which the browser
 *  then discards, leaving windows shrink-wrapped around their content.
 *  Clamping here means the arithmetic is always sane. */
export const TASKBAR = 28;

export function viewport(): { vw: number; vh: number } {
  const w = typeof window === "undefined" ? 0 : window.innerWidth;
  const h = typeof window === "undefined" ? 0 : window.innerHeight;
  return { vw: Math.max(320, w), vh: Math.max(240, h - TASKBAR) };
}

/** Keep a window on screen and no larger than the desktop it lives on. */
export function fit(win: { x: number; y: number; w: number; h: number; minW: number; minH: number }) {
  const { vw, vh } = viewport();
  const w = Math.min(Math.max(win.w, win.minW), vw - 14);
  const h = Math.min(Math.max(win.h, win.minH), vh - 14);
  return {
    w,
    h,
    x: Math.max(4, Math.min(vw - w - 6, win.x)),
    y: Math.max(2, Math.min(vh - h - 6, win.y)),
  };
}
