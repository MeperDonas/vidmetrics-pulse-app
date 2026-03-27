import { Activity } from "lucide-react";
import { ModeToggle } from "@/components/shared/mode-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Subtle gradient border at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div
        className="bg-background/70 backdrop-blur-xl"
        style={{ WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Activity className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">
              VidMetrics{" "}
              <span className="text-primary font-extrabold">Pulse</span>
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border border-border/60 rounded-full px-3 py-1 bg-muted/40">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              YouTube Analytics
            </span>
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
