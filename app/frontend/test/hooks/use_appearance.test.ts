import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAppearance } from "@/hooks/use_appearance";

const root = document.documentElement;

let prefersDark: boolean;
let listeners: Set<() => void>;

const changeSystemTheme = (dark: boolean) => {
  prefersDark = dark;
  act(() => listeners.forEach((listener) => listener()));
};

beforeEach(() => {
  prefersDark = false;
  listeners = new Set();
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    get matches() {
      return prefersDark;
    },
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
  root.className = "";
  root.style.colorScheme = "";
});

describe("useAppearance", () => {
  it("defaults to system when nothing is stored", () => {
    const { result } = renderHook(() => useAppearance());

    expect(result.current.appearance).toBe("system");
  });

  it("reads the stored appearance", () => {
    localStorage.setItem("appearance", "dark");

    const { result } = renderHook(() => useAppearance());

    expect(result.current.appearance).toBe("dark");
  });

  it("ignores an invalid stored value", () => {
    localStorage.setItem("appearance", "sepia");

    const { result } = renderHook(() => useAppearance());

    expect(result.current.appearance).toBe("system");
  });

  it("falls back to system when localStorage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    const { result } = renderHook(() => useAppearance());

    expect(result.current.appearance).toBe("system");
  });

  it("stores and applies the dark appearance", () => {
    const { result } = renderHook(() => useAppearance());

    act(() => result.current.setAppearance("dark"));

    expect(result.current.appearance).toBe("dark");
    expect(localStorage.getItem("appearance")).toBe("dark");
    expect(root).toHaveClass("dark");
    expect(root.style.colorScheme).toBe("dark");
  });

  it("stores and applies the light appearance", () => {
    root.classList.add("dark");
    const { result } = renderHook(() => useAppearance());

    act(() => result.current.setAppearance("light"));

    expect(localStorage.getItem("appearance")).toBe("light");
    expect(root).not.toHaveClass("dark");
    expect(root.style.colorScheme).toBe("light");
  });

  it("forgets the stored value and follows the system when set to system", () => {
    localStorage.setItem("appearance", "light");
    prefersDark = true;
    const { result } = renderHook(() => useAppearance());

    act(() => result.current.setAppearance("system"));

    expect(localStorage.getItem("appearance")).toBeNull();
    expect(root).toHaveClass("dark");
  });

  it("follows system theme changes while in system mode", () => {
    renderHook(() => useAppearance());

    changeSystemTheme(true);
    expect(root).toHaveClass("dark");

    changeSystemTheme(false);
    expect(root).not.toHaveClass("dark");
  });

  it("stops following the system after choosing an explicit appearance", () => {
    const { result } = renderHook(() => useAppearance());

    act(() => result.current.setAppearance("light"));
    changeSystemTheme(true);

    expect(listeners.size).toBe(0);
    expect(root).not.toHaveClass("dark");
  });

  it("stops following the system when unmounted", () => {
    const { unmount } = renderHook(() => useAppearance());

    unmount();

    expect(listeners.size).toBe(0);
  });
});
