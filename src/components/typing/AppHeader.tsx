import { BarChart3, Keyboard, Moon, Settings, Sun } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ThemeName } from "@/types";

interface AppHeaderProps {
  theme: ThemeName;
  dimmed: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
}

export const AppHeader = memo(function AppHeader({
  theme,
  dimmed,
  onToggleTheme,
  onOpenSettings,
  onOpenStats,
}: AppHeaderProps) {
  const isDarkish = theme !== "light" && theme !== "amber";

  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4 transition-opacity duration-200",
        dimmed && "opacity-30",
      )}
    >
      <a href="/" className="group flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Keyboard className="h-5 w-5 text-accent" aria-hidden="true" />
        <span className="text-base font-semibold tracking-tight text-text">Type Sensei</span>
      </a>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onOpenStats} aria-label="Open statistics">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenSettings} aria-label="Open settings">
          <Settings className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          aria-label={isDarkish ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDarkish ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </header>
  );
});
