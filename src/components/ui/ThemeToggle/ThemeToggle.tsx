"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

const STORAGE_KEY = "portfolio-theme";
const THEME_CHANGE_EVENT = "portfolio-theme-change";

function getDocumentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getPreferredTheme(): Theme {
  try {
    const storedTheme = localStorage.getItem(STORAGE_KEY);

    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }
  } catch {}

  try {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {}

  return "light";
}

function getServerTheme(): Theme {
  return "light";
}

function subscribeToThemeChange(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToThemeChange,
    getDocumentTheme,
    getServerTheme,
  );

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = getPreferredTheme();
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  function handleToggle() {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";

    document.documentElement.dataset.theme = nextTheme;
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));

    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {}
  }

  const nextThemeLabel = theme === "light" ? "oscuro" : "claro";

  return (
    <button
      className={styles.toggle}
      type="button"
      onClick={handleToggle}
      aria-label={`Cambiar al tema ${nextThemeLabel}`}
    >
      <span className={styles.lightTheme}>
        <Sun aria-hidden="true" size={19} strokeWidth={1.8} />
        <span>Tema claro</span>
      </span>
      <span className={styles.darkTheme}>
        <Moon aria-hidden="true" size={19} strokeWidth={1.8} />
        <span>Tema oscuro</span>
      </span>
    </button>
  );
}
