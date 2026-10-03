"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

interface ThemeToggleProps {
  className?: string;
  /** Use on dark hero overlays (white icon) vs light surfaces */
  variant?: "onDark" | "onLight" | "auto";
}

export function ThemeToggle({
  className,
  variant = "auto",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const isDark = theme === "dark";

  const styles =
    variant === "onDark"
      ? "border-white/25 text-white hover:bg-white/10"
      : variant === "onLight"
        ? "border-navy-200 text-navy-800 hover:bg-navy-50 dark:border-navy-700 dark:text-navy-100 dark:hover:bg-navy-800"
        : "border-navy-200 bg-white/90 text-navy-800 hover:bg-navy-50 dark:border-navy-600 dark:bg-navy-900/90 dark:text-navy-100 dark:hover:bg-navy-800";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t("themeLight") : t("themeDark")}
      title={isDark ? t("themeLight") : t("themeDark")}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border transition",
        styles,
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
