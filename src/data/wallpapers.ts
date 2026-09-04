/** Desktop wallpapers.
 *
 *  Original recreations in the spirit of the patterns Windows shipped —
 *  drawn as SVG tiles rather than copied bitmaps, so the whole desktop
 *  still contains no image files. Each one is a CSS `background` value;
 *  encodeURIComponent keeps the SVG readable in source instead of a wall
 *  of %3C escapes. */

const tile = (w: number, h: number, svg: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${svg}</svg>`,
  )}")`;

export interface Wallpaper {
  id: string;
  name: string;
  /** Full CSS background shorthand. */
  background: string;
}

export const WALLPAPERS: Wallpaper[] = [
  { id: "teal", name: "(None) — Teal", background: "#008080" },

  {
    id: "triangles",
    name: "Triangles",
    background:
      tile(32, 32, `<rect width="32" height="32" fill="#008080"/>
        <path d="M8 22l6-11 6 11z" fill="#00a0a0"/>
        <path d="M8 22l6-11 6 11z" fill="none" stroke="#004f4f"/>
        <path d="M24 10l4 7h-8z" fill="#006a6a"/>`) + " repeat",
  },
  {
    id: "waves",
    name: "Waves",
    background:
      tile(64, 32, `<rect width="64" height="32" fill="#3a6ea5"/>
        <path d="M0 10q16 -8 32 0t32 0" fill="none" stroke="#5c8fc6" stroke-width="2"/>
        <path d="M0 20q16 -8 32 0t32 0" fill="none" stroke="#2b5580" stroke-width="2"/>
        <path d="M0 30q16 -8 32 0t32 0" fill="none" stroke="#5c8fc6" stroke-width="2"/>`) + " repeat",
  },
  {
    id: "bubbles",
    name: "Bubbles",
    background:
      tile(48, 48, `<rect width="48" height="48" fill="#000e42"/>
        <circle cx="12" cy="12" r="7" fill="none" stroke="#3b57a8" stroke-width="2"/>
        <circle cx="34" cy="30" r="10" fill="none" stroke="#2b4180" stroke-width="2"/>
        <circle cx="10" cy="9" r="2" fill="#8fa8e8"/>
        <circle cx="31" cy="26" r="2" fill="#6d86c8"/>`) + " repeat",
  },
  {
    id: "rivets",
    name: "Blue Rivets",
    background:
      tile(32, 32, `<rect width="32" height="32" fill="#4a6c8c"/>
        <rect width="32" height="1" fill="#5f86aa"/><rect width="1" height="32" fill="#5f86aa"/>
        <rect y="31" width="32" height="1" fill="#33506b"/><rect x="31" width="1" height="32" fill="#33506b"/>
        <circle cx="6" cy="6" r="2.5" fill="#6f97bb"/><circle cx="6" cy="6" r="1.2" fill="#2e4a63"/>
        <circle cx="26" cy="26" r="2.5" fill="#6f97bb"/><circle cx="26" cy="26" r="1.2" fill="#2e4a63"/>`) + " repeat",
  },
  {
    id: "straws",
    name: "Straws",
    background:
      tile(56, 56, `<rect width="56" height="56" fill="#e8e4d8"/>
        <path d="M4 40l16-28" stroke="#d24b3e" stroke-width="3"/>
        <path d="M20 48l22-10" stroke="#2f7d4f" stroke-width="3"/>
        <path d="M34 6l6 26" stroke="#3b62a8" stroke-width="3"/>
        <path d="M44 44l10-8" stroke="#d8a63c" stroke-width="3"/>`) + " repeat",
  },
  {
    id: "circuits",
    name: "Circuits",
    background:
      tile(48, 48, `<rect width="48" height="48" fill="#04170c"/>
        <path d="M0 24h14v-14h20v10h14M24 48V34h10" fill="none" stroke="#1f7a3d" stroke-width="2"/>
        <circle cx="14" cy="24" r="3" fill="#2ea355"/><circle cx="34" cy="20" r="3" fill="#2ea355"/>
        <rect x="30" y="32" width="8" height="5" fill="#123f22" stroke="#2ea355"/>`) + " repeat",
  },
  {
    id: "carved",
    name: "Carved Stone",
    background:
      tile(24, 24, `<rect width="24" height="24" fill="#9a9a92"/>
        <path d="M12 2l10 10-10 10L2 12z" fill="#a6a69e"/>
        <path d="M12 2l10 10-10 10L2 12z" fill="none" stroke="#7d7d75"/>
        <path d="M12 4l8 8-8 8-8-8z" fill="none" stroke="#b5b5ad"/>`) + " repeat",
  },
  {
    id: "houndstooth",
    name: "Houndstooth",
    background:
      tile(32, 32, `<rect width="32" height="32" fill="#20242c"/>
        <path d="M0 0h16v16H0zM16 16h16v16H16z" fill="#cfd3da"/>
        <path d="M16 8l8 8-8 8z" fill="#cfd3da"/><path d="M8 16l8 8H8z" fill="#20242c"/>`) + " repeat",
  },
  { id: "clouds", name: "Clouds", background: "linear-gradient(#3a6fc4 0%,#6ea6e8 45%,#a8cdf0 75%,#d8e9f8 100%)" },
  {
    id: "setup",
    name: "Setup",
    background: "radial-gradient(120% 90% at 50% 40%, #2a5aa8 0%, #10306a 55%, #06132e 100%)",
  },
  { id: "plum", name: "Plum", background: "#3f2a4d" },
];

export const wallpaperById = (id: string): Wallpaper => WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
