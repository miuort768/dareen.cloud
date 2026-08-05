import { Skeleton } from '../../../shared/components/ui/Skeleton';

export const LeadsSkeleton = () => (
    <div className="bg-background min-h-screen pb-24" dir="rtl">
        <div className="relative z-10 mx-auto px-2 max-w-page">
            {/* Hero skeleton */}
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-deep mt-4 mb-6 px-4 md:px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Skeleton className="h-6 w-44 mb-1 bg-white/15" />
                        <Skeleton className="h-4 w-64 bg-white/10" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-24 rounded-xl bg-white/10" />
                        <Skeleton className="h-9 w-28 rounded-xl bg-white/10" />
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-xl bg-white/10 p-4">
                            <Skeleton className="h-3 w-20 mb-1.5 bg-white/10" />
                            <Skeleton className="h-7 w-16 mb-1 bg-white/15" />
                            <Skeleton className="h-3 w-12 bg-white/10" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main content card skeleton */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 lg:p-5 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                        <Skeleton className="h-4 w-16 shrink-0" />
                    </div>
                    <div className="flex gap-1.5 mt-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-7 w-24 rounded-full" />
                        ))}
                    </div>
                </div>

                {/* Table skeleton (desktop) */}
                <div className="hidden lg:block">
                    <div className="bg-surface/80 px-4 py-2.5 border-b border-border flex gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-3.5" style={{ flex: i === 0 ? '22%' : i === 5 ? '25%' : '15%' }} />
                        ))}
                    </div>
                    {Array.from({ length: 5 }).map((_, i) => (
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
                <div className="lg:hidden p-4 space-y-2.5">
                    {Array.from({ length: 3 }).map((_, i) => (
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
    </div>
);
