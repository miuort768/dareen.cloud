import { Skeleton } from "./Skeleton";

export const LoadingSkeleton = ({ type = 'card' }: { type?: 'card' | 'table' | 'stats' | 'chart' }) => {
    if (type === 'stats') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white p-4 border border-gray-100 shadow-sm animate-pulse dark:bg-gray-900 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-none" />
                            <div className="flex-1">
                                <Skeleton className="h-3 w-20 mb-2" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'table') {
        return (
            <div className="bg-white border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800 animate-pulse">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-6 flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-none" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="w-20 h-8" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'chart') {
        return (
            <div className="bg-white p-6 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 animate-pulse">
                <Skeleton className="h-6 w-48 mb-6" />
                <Skeleton className="h-80" />
            </div>
        );
    }

    return (
        <div className="bg-white p-6 border border-gray-200 rounded-none animate-pulse dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-12 h-12 rounded-none" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-3" />
                <Skeleton className="h-3" />
                <Skeleton className="h-3 w-5/6" />
            </div>
        </div>
    );
};
