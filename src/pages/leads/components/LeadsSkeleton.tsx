import { Skeleton } from '../../../shared/components/ui/Skeleton';

export const LeadsSkeleton = () => (
    <div className="bg-background min-h-screen pb-24" dir="rtl">
        <div className="relative z-10 mx-auto px-4 max-w-page">
            {/* Hero skeleton */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary-deep dark:from-[#1a1f4e] dark:via-[#1e2456] dark:to-[#131836] mt-4 mb-6 px-5 py-6 relative overflow-hidden border border-primary/10 dark:border-white/[0.04]">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 dark:bg-[#D4AF37]/10 rounded-full blur-3xl" />
                <div className="relative z-10 flex items-center justify-between mb-5">
                    <div>
                        <Skeleton className="h-3 w-24 mb-1.5 bg-white/15 dark:bg-white/10 rounded-md" />
                        <Skeleton className="h-5 w-44 mb-1 bg-white/20 dark:bg-white/15 rounded-md" />
                        <Skeleton className="h-3 w-56 bg-white/10 dark:bg-white/8 rounded-md" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-24 rounded-xl bg-white/10 dark:bg-white/5" />
                        <Skeleton className="h-9 w-28 rounded-xl bg-white/10 dark:bg-white/5" />
                    </div>
                </div>
                <div className="relative z-10 grid grid-cols-4 gap-1.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-xl bg-white/10 dark:bg-white/[0.04] p-2.5 border border-white/10 dark:border-white/[0.04]">
                            <Skeleton className="h-2.5 w-16 mb-1.5 bg-white/10 dark:bg-white/8 rounded-md" />
                            <Skeleton className="h-5 w-12 mb-0.5 bg-white/15 dark:bg-white/12 rounded-md" />
                            <Skeleton className="h-2 w-10 bg-white/8 dark:bg-white/6 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main content card skeleton */}
            <div className="bg-card dark:bg-[#0d0d0f]/80 rounded-2xl border border-border dark:border-white/[0.04] overflow-hidden shadow-elevation-1 dark:shadow-none">
                <div className="p-4 border-b border-border dark:border-white/[0.04]">
                    <div className="flex items-center gap-3">
                        <div className="flex-1"><Skeleton className="h-11 w-full rounded-xl" /></div>
                        <Skeleton className="h-11 w-14 shrink-0 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 rounded-xl" />
                        ))}
                    </div>
                </div>

                {/* Cards skeleton (mobile) */}
                <div className="lg:hidden p-3 space-y-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-card dark:bg-[#0d0d0f]/80 border border-border dark:border-white/[0.06] rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-28 rounded-md" />
                                        <Skeleton className="h-2.5 w-36 rounded-md" />
                                    </div>
                                </div>
                                <Skeleton className="h-5 w-14 rounded-full" />
                            </div>
                            <div className="flex gap-1.5">
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <div className="border-t border-border dark:border-white/[0.04] pt-2.5 flex items-center justify-between">
                                <div className="flex gap-2">
                                    {Array.from({ length: 4 }).map((_, j) => (
                                        <Skeleton key={j} className="w-8 h-8 rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table skeleton (desktop) */}
                <div className="hidden lg:block">
                    <div className="bg-surface/80 dark:bg-white/[0.02] px-5 py-3 border-b border-border dark:border-white/[0.04] flex gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-3 rounded-md" style={{ flex: i === 0 ? '22%' : i === 5 ? '25%' : '15%' }} />
                        ))}
                    </div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="px-5 py-3 border-b border-border/40 dark:border-white/[0.03] flex items-center gap-4">
                            <div className="w-[22%] flex items-center gap-3">
                                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                <Skeleton className="h-3.5 flex-1 rounded-md" />
                            </div>
                            <Skeleton className="h-3.5 w-[15%] rounded-md" />
                            <Skeleton className="h-6 w-[13%] rounded-lg" />
                            <Skeleton className="h-5 w-[15%] rounded-full" />
                            <Skeleton className="h-4 w-[10%] rounded-full" />
                            <div className="w-[25%] flex justify-end gap-1.5">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <Skeleton key={j} className="w-8 h-8 rounded-xl" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
