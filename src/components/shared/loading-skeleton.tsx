export function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Channel header skeleton */}
      <div className="flex items-center gap-4 p-5 rounded-xl border border-border/60 bg-card card-surface">
        <div className="h-14 w-14 rounded-full bg-muted shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-44 rounded-lg bg-muted" />
          <div className="h-3.5 w-28 rounded-lg bg-muted" />
        </div>
        <div className="hidden sm:flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-2.5 w-12 rounded bg-muted" />
              <div className="h-4 w-16 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-xl border border-border/60 bg-card card-surface space-y-3"
          >
            <div className="h-8 w-8 rounded-lg bg-muted" />
            <div className="h-6 w-20 rounded-lg bg-muted" />
            <div className="h-3 w-28 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Video grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/60 bg-card overflow-hidden card-surface"
          >
            <div className="aspect-video w-full bg-muted" />
            <div className="p-3.5 space-y-2.5">
              <div className="h-4 w-full rounded-md bg-muted" />
              <div className="h-3.5 w-3/4 rounded-md bg-muted" />
              <div className="flex gap-2 pt-1">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-3 w-10 rounded bg-muted" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
