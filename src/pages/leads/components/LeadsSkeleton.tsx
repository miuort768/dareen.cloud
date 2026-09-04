import { Skeleton } from '../../../shared/components/ui/Skeleton'

export const LeadsSkeleton = () => (
  <div className="min-h-screen bg-background pb-24" dir="rtl">
    <div className="relative z-10 mx-auto max-w-page px-2.5 sm:px-4">
      {/* Header skeleton */}
      <div className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div>
              <Skeleton className="mb-1 h-5 w-36 rounded-lg" />
              <Skeleton className="h-3 w-48 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>
      </div>

      {/* KPI skeleton */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-3.5">
            <div className="mb-2 flex items-center gap-1.5">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
            <Skeleton className="mb-1 h-7 w-14 rounded-lg" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main content card skeleton */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1 dark:shadow-none">
        <div className="border-b border-border p-4 lg:p-5">
          <Skeleton className="h-11 w-full rounded-xl" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </div>

        {/* Cards skeleton (mobile) */}
        <div className="space-y-2.5 p-3 md:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-2.5 w-36 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-5 w-14 rounded-lg" />
              </div>
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-20 rounded-lg" />
                <Skeleton className="h-5 w-16 rounded-lg" />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2.5">
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-8 w-8 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table skeleton (desktop) */}
        <div className="hidden md:block">
          <div className="flex gap-4 border-b border-border bg-gradient-to-l from-primary to-primary-deep px-5 py-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ flex: i === 0 ? '22%' : i === 5 ? '25%' : '15%' }}>
                <Skeleton className="h-3 w-full rounded-md" />
              </div>
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border px-5 py-3.5">
              <div className="flex w-[22%] items-center gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <Skeleton className="h-3.5 flex-1 rounded-md" />
              </div>
              <Skeleton className="h-3.5 w-[15%] rounded-md" />
              <Skeleton className="h-6 w-[13%] rounded-lg" />
              <Skeleton className="h-5 w-[15%] rounded-lg" />
              <Skeleton className="h-4 w-[10%] rounded-lg" />
              <div className="flex w-[25%] justify-end gap-1.5">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-8 w-8 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)
