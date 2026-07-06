import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  hideOnMobile?: boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  variant?: 'primary' | 'surface';
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  selectedId?: string | number;
  getId: (item: T) => string | number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalCount?: number;
  pageSize?: number;
  className?: string;
  mobileCard?: (item: T) => React.ReactNode;
}

const SkeletonRow = ({ cols }: { cols: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-4 bg-hover rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
);

function TableInner<T>({
  data, columns, variant = 'primary', isLoading, emptyMessage,
  onRowClick, selectedId, getId, page, totalPages, onPageChange,
  totalCount, pageSize, className, mobileCard,
}: TableProps<T>) {
  const headerClass = variant === 'primary'
    ? 'bg-primary text-on-primary'
    : 'bg-surface text-muted';

  const thClass = variant === 'primary'
    ? 'text-on-primary/80'
    : 'text-muted';

  const renderHeader = () => (
    <thead>
      <tr className={headerClass}>
        {columns.map(col => (
          <th
            key={col.key}
            className={cn(
              'px-5 py-3.5 text-xs font-bold text-right',
              thClass,
              col.hideOnMobile && 'hidden lg:table-cell',
              col.headerClassName
            )}
          >
            {col.header}
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} cols={columns.length} />
          ))}
        </tbody>
      );
    }

    if (data.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length} className="px-5 py-16 text-center">
              <div className="flex flex-col items-center gap-2 text-muted">
                <Inbox size={32} className="text-dim" />
                <span className="text-sm font-medium">{emptyMessage || 'لا توجد بيانات'}</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className="divide-y divide-border">
        {data.map(item => {
          const id = getId(item);
          const isSelected = selectedId !== undefined && id === selectedId;
          return (
            <tr
              key={id}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'transition-colors',
                onRowClick && 'cursor-pointer',
                isSelected ? 'bg-primary-soft' : 'hover:bg-hover'
              )}
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  className={cn(
                    'px-5 py-3.5 text-sm text-main',
                    col.hideOnMobile && 'hidden lg:table-cell',
                    col.className
                  )}
                >
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    );
  };

  const renderPagination = () => {
    if (!totalPages || totalPages <= 1 || !onPageChange) return null;
    return (
      <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface rounded-b-card">
        <p className="text-xs font-bold text-dim">
          {totalCount ? `1-${Math.min(pageSize || data.length, totalCount)} من ${totalCount}` : ''}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, (page || 1) - 1))}
            disabled={page === 1 || page === undefined}
            className="p-1.5 rounded-card text-muted hover:bg-hover disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="الصفحة السابقة"
          >
            <ChevronRight size={16} />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  'min-w-[32px] h-8 text-xs font-bold rounded-card transition-colors',
                  p === page
                    ? 'bg-primary text-on-primary'
                    : 'text-muted hover:bg-hover'
                )}
              >
                {p}
              </button>
            );
          })}
          {totalPages > 7 && <span className="text-xs text-dim">...</span>}
          <button
            onClick={() => onPageChange(Math.min(totalPages, (page || 1) + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-card text-muted hover:bg-hover disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="الصفحة التالية"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderMobileCards = () => {
    if (!mobileCard || isLoading) return null;
    if (data.length === 0) return null;
    return (
      <div className="md:hidden space-y-4">
        {data.map(item => {
          const id = getId(item);
          return (
            <div key={id} onClick={() => onRowClick?.(item)} className={cn(
              'bg-card border border-border shadow-card rounded-card p-5',
              onRowClick && 'cursor-pointer',
              selectedId !== undefined && selectedId === id && 'border-primary'
            )}>
              {mobileCard(item)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="hidden md:block overflow-x-auto rounded-card border border-border bg-card shadow-card">
        <table className="w-full text-right border-collapse">
          {renderHeader()}
          {renderBody()}
        </table>
        {renderPagination()}
      </div>
      {renderMobileCards()}
    </div>
  );
}

export const Table = React.memo(TableInner) as typeof TableInner;
