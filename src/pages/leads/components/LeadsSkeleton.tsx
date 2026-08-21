import { Skeleton } from '../../../shared/components/ui/Skeleton';

export const LeadsSkeleton = () => (
    <div className="bg-background min-h-screen pb-24" dir="rtl">
        <div className="relative z-10 mx-auto px-4 max-w-page">
            {/* Header skeleton */}
            <div className="pt-4 pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Skeleton className="w-9 h-9 rounded-xl" />
                        <div>
                            <Skeleton className="h-5 w-36 mb-1 rounded-lg" />
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-3.5">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Skeleton className="w-7 h-7 rounded-lg" />
                            <Skeleton className="h-3 w-20 rounded-md" />
                        </div>
                        <Skeleton className="h-7 w-14 mb-1 rounded-lg" />
                        <Skeleton className="h-3 w-16 rounded-md" />
                    </div>
                ))}
            </div>

            {/* Main content card skeleton */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-elevation-1 dark:shadow-none">
                <div className="p-4 lg:p-5 border-b border-border">
                    <Skeleton className="h-11 w-full rounded-xl" />
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <Skeleton className="h-11 rounded-xl" />
                        <Skeleton className="h-11 rounded-xl" />
                    </div>
                </div>

                {/* Cards skeleton (mobile) */}
                <div className="lg:hidden p-3 space-y-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
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
                            <div className="border-t border-border pt-2.5 flex items-center justify-between">
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
                    <div className="bg-gradient-to-l from-primary to-primary-deep px-5 py-3 border-b border-border flex gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-3 rounded-md" style={{ flex: i === 0 ? '22%' : i === 5 ? '25%' : '15%' }} />
                        ))}
                    </div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="px-5 py-3.5 border-b border-border flex items-center gap-4">
                            <div className="w-[22%] flex items-center gap-3">
                                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                <Skeleton className="h-3.5 flex-1 rounded-md" />
                            </div>
                            <Skeleton className="h-3.5 w-[15%] rounded-md" />
                            <Skeleton className="h-6 w-[13%] rounded-lg" />
                            <Skeleton className="h-5 w-[15%] rounded-lg" />
                            <Skeleton className="h-4 w-[10%] rounded-lg" />
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
