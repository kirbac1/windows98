import type { ReactElement } from "react";

/** Shared vocabulary for the desktop: what an app is, what a window is,
 *  and the small system API every application gets handed. */

export type IconName =
  | "computer" | "recycle" | "amp" | "mine" | "cards" | "notepad"
  | "paint" | "ie" | "folder" | "file" | "drive" | "display"
  | "power" | "run" | "info" | "flag";

export type AppId =
  | "amp" | "mines" | "sol" | "notepad" | "paint" | "ie" | "computer"
  | "recycle" | "display" | "welcome" | "about" | "run" | "shutdown" | "dialog";

export type PowerMode = "off" | "restart" | "standby";

/** Anything an app can be opened with. Notepad takes a body, dialogs a message. */
export interface LaunchProps {
  body?: string;
  msg?: string;
}

export interface WindowState {
  id: number;
  appId: AppId;
  title: string;
  icon: IconName;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  min: boolean;
  max: boolean;
  props: LaunchProps;
  resizable: boolean;
  minW: number;
  minH: number;
}

/** The system calls available to a running application. */
export interface Sys {
  open(appId: AppId, props?: LaunchProps | null, title?: string | null, at?: { x: number; y: number }): void;
  close(id: number): void;
  min(id: number): void;
  max(id: number): void;
  update(id: number, patch: Partial<WindowState>): void;
  focus(id: number): void;
  dialog(title: string, msg: string): void;
  power(mode: PowerMode): void;
  wall: string;
  setWall(wall: string): void;
}

export interface AppProps {
  sys: Sys;
  win: WindowState;
  props: LaunchProps;
}

export interface AppDef {
  title: string;
  icon: IconName;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  resizable?: boolean;
  /** Multi-instance apps (Notepad, dialogs) open a new window every time. */
  multi?: boolean;
  C: (p: AppProps) => ReactElement;
}
