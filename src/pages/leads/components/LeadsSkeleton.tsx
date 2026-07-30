import { Skeleton } from '../../../shared/components/ui/Skeleton';

export const LeadsSkeleton = () => (
    <div className="bg-background min-h-screen pb-24" dir="rtl">
        <div className="relative z-10 mx-auto px-2 max-w-page">
            {/* Header skeleton */}
            <div className="rounded-2xl bg-gradient-to-l from-primary/10 via-primary-soft/50 to-primary/5 border border-primary/10 mt-4 mb-4 px-4 md:px-5 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-xl" />
                        <div>
                            <Skeleton className="h-4 w-32 mb-1.5" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="h-8 w-20 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-xl" />
                    </div>
                </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl bg-card border border-border p-4">
                        <Skeleton className="w-6 h-6 mb-2" />
                        <Skeleton className="h-6 w-12 mb-1.5" />
                        <Skeleton className="h-3 w-20 mb-2" />
                        <div className="flex gap-[2px]">
                            {Array.from({ length: 7 }).map((_, j) => (
                                <Skeleton key={j} className="w-1 rounded-t-[1px]" style={{ height: `${3 + Math.sin(j) * 3}px` }} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Search skeleton */}
            <div className="bg-card border border-border rounded-xl px-3 py-3 flex items-center gap-2 mb-3">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 flex-1" />
            </div>

            {/* Chips skeleton */}
            <div className="flex gap-1.5 mb-5 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0" />
                ))}
            </div>

            {/* Table skeleton (desktop) */}
            <div className="hidden lg:block bg-card border border-border rounded-2xl overflow-hidden">
                <div className="bg-surface/80 px-4 py-2.5 border-b border-border flex gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-3.5" style={{ flex: i === 0 ? '22%' : i === 5 ? '25%' : '15%' }} />
                    ))}
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="px-4 py-2 border-b border-border/40 flex items-center gap-4">
                        <div className="w-[22%] flex items-center gap-2.5">
                            <Skeleton className="w-7 h-7 rounded-xl shrink-0" />
                            <Skeleton className="h-3.5 flex-1" />
                        </div>
                        <Skeleton className="h-3.5 w-[15%]" />
                        <Skeleton className="h-6 w-[13%] rounded-lg" />
                        <Skeleton className="h-5 w-[15%] rounded-full" />
                        <Skeleton className="h-4 w-[10%] rounded-full" />
                        <div className="w-[25%] flex justify-end gap-1">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <Skeleton key={j} className="h-7 w-16 rounded-lg" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Cards skeleton (mobile) */}
            <div className="lg:hidden space-y-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                                <Skeleton className="h-4 w-28 rounded-lg" />
                            </div>
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-3.5 w-44" />
                        <div className="border-t border-border/50 pt-2.5 flex items-center justify-between">
                            <div className="flex gap-1">
                                <Skeleton className="h-5 w-14 rounded-full" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                            <div className="flex gap-0.5">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <Skeleton key={j} className="h-7 w-12 rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
