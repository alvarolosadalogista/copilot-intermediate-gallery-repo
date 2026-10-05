"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const hasPreference = useRef(false);

  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    let preference: string | null = null;
    try {
      preference = localStorage.getItem("theme");
    } catch {
      // Storage may be unavailable in private or restricted browsing.
    }
    hasPreference.current = preference === "light" || preference === "dark";

    const applyTheme = (dark: boolean) => {
      document.documentElement.classList.toggle("dark", dark);
      setIsDark(dark);
    };

    applyTheme(hasPreference.current ? preference === "dark" : systemTheme.matches);

    const onSystemChange = (event: MediaQueryListEvent) => {
      if (!hasPreference.current) applyTheme(event.matches);
    };
    systemTheme.addEventListener("change", onSystemChange);
    return () => systemTheme.removeEventListener("change", onSystemChange);
  }, []);

  const toggleTheme = () => {
    const dark = !isDark;
    hasPreference.current = true;
    document.documentElement.classList.toggle("dark", dark);
    setIsDark(dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // Keep the toggle working even when the preference cannot be saved.
    }
  };

  return (
    <button
      type="button"
      className="btn-secondary inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      aria-label="Toggle dark mode"
      aria-pressed={isDark === true}
      disabled={isDark === null}
      onClick={toggleTheme}
    >
      <Moon className="h-5 w-5 dark:hidden" aria-hidden="true" />
      <Sun className="hidden h-5 w-5 dark:block" aria-hidden="true" />
    </button>
  );
}
