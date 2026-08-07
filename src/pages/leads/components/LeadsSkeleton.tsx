import { Skeleton } from '../../../shared/components/ui/Skeleton';

export const LeadsSkeleton = () => (
    <div className="bg-background min-h-screen pb-24" dir="rtl">
        <div className="relative z-10 mx-auto px-4 max-w-page">
            {/* Hero skeleton */}
            <div className="rounded-2xl bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a855f7] mt-4 mb-6 px-5 py-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-30" />
                <div className="relative z-10 flex items-center justify-between mb-5">
                    <div>
                        <Skeleton className="h-5 w-40 mb-1.5 bg-white/15 rounded-lg" />
                        <Skeleton className="h-3.5 w-56 bg-white/10 rounded-lg" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-24 rounded-xl bg-white/10" />
                        <Skeleton className="h-9 w-28 rounded-xl bg-white/10" />
                    </div>
                </div>
                <div className="relative z-10 grid grid-cols-4 gap-1.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-xl bg-white/[0.07] backdrop-blur-md p-2.5 border border-white/[0.08]">
                            <Skeleton className="h-2.5 w-16 mb-1.5 bg-white/10 rounded-md" />
                            <Skeleton className="h-5 w-12 mb-0.5 bg-white/15 rounded-md" />
                            <Skeleton className="h-2 w-10 bg-white/8 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main content card skeleton */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-elevation-1">
                {/* Toolbar */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <Skeleton className="h-11 w-full rounded-xl" />
                        </div>
                        <Skeleton className="h-11 w-14 shrink-0 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 rounded-xl" />
                        ))}
                    </div>
                </div>

                {/* Table skeleton (desktop) */}
                <div className="hidden lg:block">
                    <div className="bg-surface/80 px-5 py-3 border-b border-border flex gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-3 rounded-md" style={{ flex: i === 0 ? '22%' : i === 5 ? '25%' : '15%' }} />
                        ))}
                    </div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="px-5 py-3 border-b border-border/40 flex items-center gap-4">
                            <div className="w-[22%] flex items-center gap-3">
                                <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                                <Skeleton className="h-3.5 flex-1 rounded-md" />
                            </div>
                            <Skeleton className="h-3.5 w-[15%] rounded-md" />
                            <Skeleton className="h-6 w-[13%] rounded-lg" />
                            <Skeleton className="h-5 w-[15%] rounded-full" />
                            <Skeleton className="h-4 w-[10%] rounded-full" />
                            <div className="w-[25%] flex justify-end gap-1.5">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <Skeleton key={j} className="h-7 w-16 rounded-lg" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cards skeleton (mobile) */}
                <div className="lg:hidden p-3 space-y-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-card border border-border border-l-[3px] border-l-primary/20 rounded-2xl p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-[14px] shrink-0" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-28 rounded-lg" />
                                        <Skeleton className="h-2.5 w-36 rounded-md" />
                                    </div>
                                </div>
                                <Skeleton className="w-4 h-4 rounded-md" />
                            </div>
                            <div className="flex gap-1.5">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-14 rounded-full" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                            <div className="border-t border-border/50 pt-2.5 flex items-center justify-between">
                                <div className="flex gap-1">
                                    <Skeleton className="h-5 w-14 rounded-lg" />
                                    <Skeleton className="h-5 w-20 rounded-lg" />
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
