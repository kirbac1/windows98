import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "../App";

/** A smoke test for the shell: the desktop has to come up with its icons,
 *  a taskbar, and the two windows it opens on boot. */
describe("the desktop", () => {
  it("boots with icons, a Start button and its opening windows", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /start/i })).toBeDefined();
    expect(screen.getByText("My Computer")).toBeDefined();
    expect(screen.getByText("README.TXT")).toBeDefined();
    // An open window names itself in at least two places: its title bar
    // and its taskbar button.
    expect(screen.getAllByText("Welcome to Nostalgia 98").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Nostalgia Amp").length).toBeGreaterThanOrEqual(2);
    // The player is open and knows what it would play first.
    expect(screen.getAllByText(/Blue Screen Boogie/).length).toBeGreaterThan(0);
  });
});
