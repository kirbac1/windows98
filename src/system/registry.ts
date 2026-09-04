import { AmpApp } from "../apps/Amp";
import { MinesApp } from "../apps/Minesweeper";
import { SolApp } from "../apps/Solitaire";
import { NotepadApp } from "../apps/Notepad";
import { PaintApp } from "../apps/Paint";
import { BrowserApp } from "../apps/Browser";
import { ComputerApp } from "../apps/Computer";
import { AboutApp, DialogApp, DisplayApp, RecycleApp, RunApp, ShutApp, WelcomeApp } from "../apps/Dialogs";
import type { AppDef, AppId, IconName } from "./types";

/** Everything installed on this machine. Default window sizes are the
 *  ones the real applications opened at, clamped to the viewport when a
 *  window is created. */
export const APPS: Record<AppId, AppDef> = {
  amp: { title: "Nostalgia Amp", icon: "amp", w: 452, h: 530, minW: 410, minH: 230, C: AmpApp },
  mines: { title: "Minesweeper", icon: "mine", w: 230, h: 330, minW: 200, minH: 220, C: MinesApp },
  sol: { title: "Solitaire", icon: "cards", w: 520, h: 440, minW: 460, minH: 300, C: SolApp },
  notepad: { title: "Untitled - Notepad", icon: "notepad", w: 430, h: 330, C: NotepadApp, multi: true },
  paint: { title: "untitled - Paint", icon: "paint", w: 640, h: 470, minW: 420, minH: 300, C: PaintApp },
  ie: { title: "Nostalgia Explorer", icon: "ie", w: 600, h: 470, minW: 380, minH: 260, C: BrowserApp },
  computer: { title: "My Computer", icon: "computer", w: 520, h: 370, minW: 340, minH: 240, C: ComputerApp },
  recycle: { title: "Recycle Bin", icon: "recycle", w: 400, h: 270, C: RecycleApp },
  display: { title: "Display Properties", icon: "display", w: 392, h: 376, C: DisplayApp, resizable: false },
  welcome: { title: "Welcome to Nostalgia 98", icon: "info", w: 452, h: 262, C: WelcomeApp, resizable: false },
  about: { title: "About Nostalgia 98", icon: "info", w: 412, h: 300, C: AboutApp, resizable: false },
  run: { title: "Run", icon: "run", w: 352, h: 168, C: RunApp, resizable: false },
  shutdown: { title: "Shut Down Windows", icon: "power", w: 340, h: 200, C: ShutApp, resizable: false },
  dialog: { title: "Nostalgia 98", icon: "info", w: 340, h: 170, C: DialogApp, resizable: false, multi: true },
};

/** README is a pseudo-app: it opens Notepad with the file already in it. */
export type DesktopKey = AppId | "readme";

export const DESK: { k: DesktopKey; label: string; icon: IconName }[] = [
  { k: "computer", label: "My Computer", icon: "computer" },
  { k: "recycle", label: "Recycle Bin", icon: "recycle" },
  { k: "ie", label: "Nostalgia Explorer", icon: "ie" },
  { k: "amp", label: "Nostalgia Amp", icon: "amp" },
  { k: "mines", label: "Minesweeper", icon: "mine" },
  { k: "sol", label: "Solitaire", icon: "cards" },
  { k: "paint", label: "Paint", icon: "paint" },
  { k: "notepad", label: "Notepad", icon: "notepad" },
  { k: "readme", label: "README.TXT", icon: "file" },
];

export const SUBMENUS: Record<string, { k: DesktopKey | "notes"; label: string; icon: IconName }[]> = {
  programs: [
    { k: "amp", label: "Nostalgia Amp", icon: "amp" },
    { k: "mines", label: "Minesweeper", icon: "mine" },
    { k: "sol", label: "Solitaire", icon: "cards" },
    { k: "paint", label: "Paint", icon: "paint" },
    { k: "notepad", label: "Notepad", icon: "notepad" },
    { k: "ie", label: "Nostalgia Explorer", icon: "ie" },
    { k: "computer", label: "Windows Explorer", icon: "folder" },
  ],
  documents: [
    { k: "readme", label: "README.TXT", icon: "file" },
    { k: "notes", label: "NOTES.TXT", icon: "file" },
  ],
  settings: [
    { k: "display", label: "Display Properties", icon: "display" },
    { k: "computer", label: "Control Panel", icon: "folder" },
  ],
};
