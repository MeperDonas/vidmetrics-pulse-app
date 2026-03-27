import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 shadow-lg shadow-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>

      <div className="space-y-1.5">
        <p className="font-bold text-foreground">Something went wrong</p>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground transition-all duration-150 hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95"
        >
          Try again
        </button>
      )}
    </div>
  );
}
