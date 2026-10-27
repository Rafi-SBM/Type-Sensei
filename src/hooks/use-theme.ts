import { useEffect } from "react";
import type { ThemeName } from "@/types";

const DARK_THEMES: readonly ThemeName[] = ["dark", "slate", "forest"];

/**
 * Writes the chosen theme onto <html> so the CSS variables in index.css can
 * pick it up, and follows the OS preference while the theme is "system".
 * The same attribute is set by /theme.js before paint to avoid a flash.
 */
export function useTheme(theme: ThemeName): void {
  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      const resolved =
        theme === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : theme;

      root.dataset.theme = resolved;
      root.classList.toggle("dark", DARK_THEMES.includes(resolved as ThemeName));

      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute(
          "content",
          getComputedStyle(root).getPropertyValue("--theme-color").trim() || "#ffffff",
        );
      }
    };

    apply();

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
}
