import { Github } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";

export const AppFooter = memo(function AppFooter({ dimmed }: { dimmed: boolean }) {
  return (
    <footer
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 text-xs text-muted transition-opacity duration-200",
        dimmed && "opacity-0",
      )}
    >
      <p>Everything is stored on this device. No account, no tracking.</p>
      <a
        href="https://github.com/Rafi-SBM/Type-Sensei"
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1.5 rounded transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Github className="h-3.5 w-3.5" aria-hidden="true" />
        Source
      </a>
    </footer>
  );
});
