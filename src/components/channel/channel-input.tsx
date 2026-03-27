"use client";

import { useState, type FormEvent } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";

const EXAMPLE_CHANNELS = ["@mkbhd", "@veritasium", "@lexfridman", "@LinusTechTips"];

interface ChannelInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  defaultValue?: string;
}

export function ChannelInput({
  onAnalyze,
  isLoading,
  defaultValue = "",
}: ChannelInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [touched, setTouched] = useState(false);

  const isEmpty = touched && !value.trim();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (value.trim()) onAnalyze(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Input + button wrapped in a single pill container */}
      <div
        className={`flex items-center gap-0 rounded-xl border bg-background/80 backdrop-blur-sm shadow-sm transition-all duration-200 overflow-hidden
          ${isEmpty
            ? "border-destructive ring-1 ring-destructive/30"
            : "border-border/70 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 hover:border-border"
          }
        `}
      >
        {/* Search icon */}
        <div className="flex items-center pl-4 shrink-0">
          <Search className="h-4 w-4 text-muted-foreground/60" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setTouched(false);
          }}
          placeholder="youtube.com/@mkbhd — paste any channel URL"
          className="flex-1 h-12 px-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          disabled={isLoading}
          aria-label="YouTube channel URL"
          aria-describedby={isEmpty ? "url-error" : undefined}
        />

        {/* Submit button */}
        <div className="p-1.5 shrink-0">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-all duration-150 hover:bg-primary/90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline">Analyzing</span>
              </>
            ) : (
              <>
                <span>Analyze</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {isEmpty && (
        <p
          id="url-error"
          className="mt-1.5 ml-1 text-xs text-destructive text-left"
        >
          Please enter a YouTube channel URL
        </p>
      )}

      {/* Example channels */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-muted-foreground/60 uppercase tracking-widest font-semibold shrink-0">
          Try:
        </span>
        {EXAMPLE_CHANNELS.map((handle) => (
          <button
            key={handle}
            type="button"
            onClick={() => onAnalyze(handle)}
            disabled={isLoading}
            className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-all duration-150 hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {handle}
          </button>
        ))}
      </div>
    </form>
  );
}
