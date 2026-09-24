import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "hnedu-theme";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable — fall back to system preference
  }
  return getSystemTheme();
}

let currentTheme: Theme = getInitialTheme();
const listeners = new Set<() => void>();

document.documentElement.setAttribute("data-theme", currentTheme);

function setTheme(next: Theme) {
  currentTheme = next;
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // localStorage unavailable — theme just won't persist
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentTheme;
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot);

  function toggleTheme() {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  }

  return { theme, toggleTheme };
}
