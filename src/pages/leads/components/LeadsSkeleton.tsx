import { Skeleton } from '../../../shared/components/ui/Skeleton';

export const LeadsSkeleton = () => (
    <div className="bg-background min-h-screen pb-24" dir="rtl">
        <div className="relative z-10 mx-auto px-2 max-w-page">
            {/* Header skeleton */}
            <div className="bg-surface border border-border/50 rounded-2xl p-3 md:p-4 mb-4 mt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-xl" />
                        <div>
                            <Skeleton className="h-4 w-28 mb-1.5" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="h-8 w-20 rounded-lg" />
                        <Skeleton className="h-8 w-16 rounded-xl" />
                    </div>
                </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-card bg-card border border-border/50">
                        <Skeleton className="w-11 h-11 rounded-card shrink-0" />
                        <div className="min-w-0 flex-1">
                            <Skeleton className="h-3 w-20 mb-2" />
                            <Skeleton className="h-5 w-12" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Search skeleton */}
            <div className="bg-card border border-border/50 shadow-soft rounded-card mb-6 p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                    <Skeleton className="h-10 w-full md:w-36 rounded-xl" />
                </div>
            </div>

            {/* Table skeleton (desktop) */}
            <div className="hidden lg:block bg-card border border-border/50 shadow-soft rounded-card overflow-hidden">
                <div className="bg-surface px-5 py-3 border-b border-border/50 flex gap-4">
                    <Skeleton className="h-3.5 flex-[2]" />
                    <Skeleton className="h-3.5 flex-1" />
                    <Skeleton className="h-3.5 flex-1" />
                    <Skeleton className="h-3.5 flex-1" />
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3.5 w-24" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-5 py-3.5 border-b border-border/50 flex items-center gap-4">
                        <div className="flex-[2] flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded-card shrink-0" />
                            <Skeleton className="h-4 w-24 rounded-lg" />
                        </div>
                        <Skeleton className="h-3.5 flex-1" />
                        <Skeleton className="h-6 w-20 rounded-lg" />
                        <Skeleton className="h-6 w-20 rounded-xl" />
                        <div className="w-20 flex justify-center gap-0.5">
                            <Skeleton className="w-3 h-3 rounded-full" />
                            <Skeleton className="w-3 h-3 rounded-full" />
                            <Skeleton className="w-3 h-3 rounded-full" />
                        </div>
                        <div className="w-24 flex justify-center gap-1.5">
                            <Skeleton className="w-7 h-7 rounded-xl" />
                            <Skeleton className="w-7 h-7 rounded-xl" />
                            <Skeleton className="w-7 h-7 rounded-xl" />
                            <Skeleton className="w-7 h-7 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Cards skeleton (mobile) */}
            <div className="lg:hidden space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card border border-border/50 shadow-soft rounded-card p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Skeleton className="w-9 h-9 rounded-card shrink-0" />
                                <Skeleton className="h-5 w-28 rounded-lg" />
                            </div>
                            <div className="flex gap-0.5">
                                <Skeleton className="w-3 h-3 rounded-full" />
                                <Skeleton className="w-3 h-3 rounded-full" />
                                <Skeleton className="w-3 h-3 rounded-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3.5 w-32" />
                            <Skeleton className="h-3.5 w-24" />
                        </div>
                        <div className="border-t border-border/50 pt-3 flex items-center justify-between">
                            <Skeleton className="h-6 w-20 rounded-xl" />
                            <div className="flex gap-1.5">
                                <Skeleton className="w-7 h-7 rounded-xl" />
                                <Skeleton className="w-7 h-7 rounded-xl" />
                                <Skeleton className="w-7 h-7 rounded-xl" />
                                <Skeleton className="w-7 h-7 rounded-xl" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
