import { useCallback, useEffect, useState } from "react";

export type Appearance = "light" | "dark" | "system";

const STORAGE_KEY = "appearance";
const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

const readAppearance = (): Appearance => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "system";
};

const applyAppearance = (appearance: Appearance) => {
  const dark =
    appearance === "dark" ||
    (appearance === "system" && darkQuery().matches);

  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
};

export function useAppearance() {
  const [appearance, setAppearanceState] = useState<Appearance>(readAppearance);

  const setAppearance = useCallback((value: Appearance) => {
    setAppearanceState(value);
    try {
      if (value === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, value);
    } catch {}
    applyAppearance(value);
  }, []);

  useEffect(() => {
    if (appearance !== "system") return;

    const query = darkQuery();
    const onChange = () => applyAppearance("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [appearance]);

  return { appearance, setAppearance };
}
