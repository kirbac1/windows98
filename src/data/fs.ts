/** The contents of the C: drive. Small enough to live in one file, and
 *  the README is the page's own documentation — what you read in Notepad
 *  is the same text a visitor reads. */

export interface FsNode {
  name: string;
  type: "drive" | "dir" | "txt" | "app" | "cpl";
  kids?: FsNode[];
  body?: string;
  app?: string;
}

export const README = `NOSTALGIA 98 — README.TXT
=========================================

A Windows 98 desktop rebuilt in React. Everything on this
machine is drawn with CSS box-shadows and hand-written SVG:
no screenshots, no sprite sheets, no icon fonts.

WHAT ACTUALLY WORKS
  Nostalgia Amp .. three chiptunes synthesized live with the
                   Web Audio API, a working 10-band equalizer,
                   a real spectrum analyzer, and an Open File
                   button that plays music off your own disk.
  Minesweeper .... flood fill, first click is always safe,
                   three difficulties, right-click to flag.
  Solitaire ...... full Klondike. Click a card, click where it
                   goes. Double-click sends it home.
  Paint .......... pencil, brush, eraser, line, rectangle,
                   ellipse, and the 28-colour palette.
  Explorer ....... the web as it looked before CSS.

THINGS THAT WERE TRUE IN 1998
  A 3.5" floppy held 1.44 MB. This page is smaller than four
  of them. Windows 98 shipped on a CD because it was 200 MB.
`;

export const AUTOEXEC = `@ECHO OFF
PROMPT $P$G
PATH C:\\WINDOWS;C:\\WINDOWS\\COMMAND
SET TEMP=C:\\WINDOWS\\TEMP
LH C:\\WINDOWS\\COMMAND\\MSCDEX.EXE /D:MSCD001
ECHO Starting Nostalgia 98...
`;

export const NOTES = [
  "Ideas",
  "-----",
  "- add a screensaver (flying toasters?)",
  "- CD player applet",
  "- make the Recycle Bin actually keep things",
  "",
].join("\r\n");

export const FS: FsNode = {
  name: "C:",
  type: "drive",
  kids: [
    {
      name: "My Documents",
      type: "dir",
      kids: [
        { name: "README.TXT", type: "txt", body: README },
        { name: "NOTES.TXT", type: "txt", body: NOTES },
      ],
    },
    {
      name: "Program Files",
      type: "dir",
      kids: [
        { name: "Nostalgia Amp", type: "app", app: "amp" },
        { name: "Minesweeper", type: "app", app: "mines" },
        { name: "Solitaire", type: "app", app: "sol" },
        { name: "Paint", type: "app", app: "paint" },
      ],
    },
    {
      name: "Windows",
      type: "dir",
      kids: [
        { name: "AUTOEXEC.BAT", type: "txt", body: AUTOEXEC },
        { name: "SYSTEM.INI", type: "txt", body: "[boot]\r\nshell=explorer.exe\r\n\r\n[386Enh]\r\ndevice=*vshare\r\n" },
        { name: "Media", type: "dir", kids: [{ name: "CHIMES.WAV", type: "txt", body: "(binary)" }] },
      ],
    },
    { name: "AUTOEXEC.BAT", type: "txt", body: AUTOEXEC },
  ],
};
