import React from 'react';
import { cn } from '../../../lib/utils';

// ── Base Skeleton Pulse ──────────────────────────────────────────────────────
const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl',
      className
    )}
  />
);

// ── SkeletonCard ─────────────────────────────────────────────────────────────
export const SkeletonCard = () => (
  <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-8 w-1/3 rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  </div>
);

// ── SkeletonRow (for tables) ─────────────────────────────────────────────────
export const SkeletonRow = () => (
  <div className="flex items-center gap-4 py-3 border-b border-slate-50 dark:border-slate-800/50 px-4">
    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
    <Skeleton className="flex-1 h-3 max-w-[200px]" />
    <Skeleton className="h-3 w-16 ml-auto" />
    <Skeleton className="h-3 w-20" />
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
);

// ── SkeletonGrid: renders N SkeletonCards in a grid ──────────────────────────
export const SkeletonGrid = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// ── SkeletonTable: renders N SkeletonRows ────────────────────────────────────
export const SkeletonTable = ({ rows = 6 }: { rows?: number }) => (
  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
    {/* header */}
    <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
      {[40, 180, 80, 100, 80].map((w, i) => (
        <Skeleton key={i} className={`h-3`} style={{ width: w }} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
);

export default Skeleton;
