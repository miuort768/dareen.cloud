import React from 'react';
import { cn } from '../../../lib/utils';

export interface TooltipEntry {
  name?: string;
  value: number;
  fill?: string;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  formatValue?: (val: number) => string;
  className?: string;
}

export const ChartTooltip = ({
  active,
  payload,
  label,
  formatValue = (val) => val.toLocaleString(),
  className,
}: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);

  return (
    <div className={cn(
      'bg-card border border-border shadow-xl p-4 min-w-[170px] rounded-xl',
      className
    )}>
      {label && (
        <div className="flex items-center gap-2 mb-3 border-b border-divider pb-2">
          <p className="text-xs font-bold text-main">{label}</p>
        </div>
      )}
      <div className="space-y-2">
        {payload.map((entry, i) => (
          <div key={`item-${i}`} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: entry.fill || entry.color }} />
              <span className="text-micro font-bold text-muted">{entry.name}</span>
            </div>
            <span className="text-xs font-black text-main tabular-nums">
              {formatValue(entry.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-divider flex items-center justify-between">
        <span className="text-micro font-bold text-dim">المجموع</span>
        <span className="text-xs font-black text-main tabular-nums">{formatValue(total)}</span>
      </div>
    </div>
  );
};

ChartTooltip.displayName = 'ChartTooltip';
