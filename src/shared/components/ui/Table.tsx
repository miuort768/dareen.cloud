import React, { useState, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Inbox } from 'lucide-react'
import { cn } from '../../../lib/utils'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  render?: (item: T) => React.ReactNode
  className?: string
  headerClassName?: string
  hideOnMobile?: boolean
  mobileLabel?: string
}

export type SortDirection = 'asc' | 'desc'

export interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  /** @default 'surface' — quiet SaaS header; 'primary' = solid brand header */
  headerVariant?: 'primary' | 'surface' | 'gradient'
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  selectedId?: string | number
  getId: (item: T) => string | number
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  totalCount?: number
  pageSize?: number
  className?: string
  mobileCard?: (item: T) => React.ReactNode
  sortKey?: string
  sortDir?: SortDirection
  onSort?: (key: string, dir: SortDirection) => void
  /** Compact row density for data-heavy tables */
  dense?: boolean
}

const SkeletonRow = ({ cols }: { cols: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={`skel-td-${i}`} className="px-5 py-4">
        <div
          className="h-4 animate-pulse rounded bg-hover"
          style={{ width: `${60 + Math.random() * 30}%` }}
        />
      </td>
    ))}
  </tr>
)

function TableInner<T>({
  data,
  columns,
  headerVariant = 'surface',
  isLoading,
  emptyMessage,
  onRowClick,
  selectedId,
  getId,
  page,
  totalPages,
  onPageChange,
  totalCount,
  pageSize,
  className,
  mobileCard,
  sortKey: externalSortKey,
  sortDir: externalSortDir,
  onSort,
  dense = false,
}: TableProps<T>) {
  const [internalSortKey, setInternalSortKey] = useState<string | undefined>()
  const [internalSortDir, setInternalSortDir] = useState<SortDirection>('asc')

  const isControlled = externalSortKey !== undefined && onSort !== undefined
  const activeSortKey = isControlled ? externalSortKey : internalSortKey
  const activeSortDir = isControlled ? externalSortDir : internalSortDir

  const handleSort = useCallback(
    (key: string) => {
      if (isControlled) {
        const newDir = externalSortKey === key && externalSortDir === 'asc' ? 'desc' : 'asc'
        onSort(key, newDir)
      } else {
        setInternalSortKey((prev) => {
          if (prev === key) {
            setInternalSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
            return key
          }
          setInternalSortDir('asc')
          return key
        })
      }
    },
    [isControlled, externalSortKey, externalSortDir, onSort],
  )

  const sortedData = useMemo(() => {
    if (!activeSortKey) return data
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[activeSortKey]
      const bVal = (b as Record<string, unknown>)[activeSortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal), 'ar')
      return activeSortDir === 'asc' ? cmp : -cmp
    })
  }, [data, activeSortKey, activeSortDir])

  const headerClass =
    headerVariant === 'gradient'
      ? 'bg-gradient-to-l from-primary to-primary-deep text-on-primary'
      : headerVariant === 'primary'
        ? 'bg-primary text-on-primary'
        : 'bg-surface text-muted'

  const thClass = headerVariant === 'surface' ? 'text-dim' : 'text-on-primary'

  const renderHeader = () => (
    <thead>
      <tr className={cn('border-b border-border', headerClass)}>
        {columns.map((col) => (
          <th
            key={col.key}
            className={cn(
              'select-none px-5 py-3 text-start text-xs font-bold',
              col.align === 'center' && 'text-center',
              col.align === 'right' && 'text-end',
              thClass,
              col.hideOnMobile && 'hidden lg:table-cell',
              col.sortable && 'cursor-pointer transition-colors hover:text-main',
              col.headerClassName,
            )}
            onClick={() => col.sortable && handleSort(col.key)}
            aria-sort={
              col.sortable && activeSortKey === col.key
                ? activeSortDir === 'asc'
                  ? 'ascending'
                  : 'descending'
                : undefined
            }
          >
            <span className="inline-flex items-center gap-1">
              {col.header}
              {col.sortable &&
                activeSortKey === col.key &&
                (activeSortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  )

  const cellPad = dense ? 'px-4 py-2.5' : 'px-5 py-3.5'

  const renderBody = () => {
    if (isLoading) {
      return (
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={`skel-row-${i}`} cols={columns.length} />
          ))}
        </tbody>
      )
    }

    if (sortedData.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length} className="px-5 py-14 text-center">
              <div className="flex flex-col items-center gap-2 text-muted">
                <Inbox size={32} className="text-dim" />
                <span className="text-sm font-medium">{emptyMessage || 'لا توجد بيانات'}</span>
              </div>
            </td>
          </tr>
        </tbody>
      )
    }

    return (
      <tbody className="divide-y divide-border">
        {sortedData.map((item) => {
          const id = getId(item)
          const isSelected = selectedId !== undefined && id === selectedId
          return (
            <tr
              key={id}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'transition-colors',
                onRowClick && 'cursor-pointer',
                isSelected ? 'bg-primary-soft' : 'hover:bg-hover',
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    cellPad,
                    'text-sm text-main',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-end',
                    col.hideOnMobile && 'hidden lg:table-cell',
                    col.className,
                  )}
                >
                  {col.render
                    ? col.render(item)
                    : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    )
  }

  const renderPagination = () => {
    if (!totalPages || totalPages <= 1 || !onPageChange) return null
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface px-4 py-3 md:px-5">
        <p className="text-xs font-bold text-dim">
          {totalCount ? `1-${Math.min(pageSize || data.length, totalCount)} من ${totalCount}` : ''}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, (page || 1) - 1))}
            disabled={page === 1 || page === undefined}
            className="rounded-card p-2.5 text-muted outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-30 md:p-1.5"
            aria-label="الصفحة السابقة"
          >
            <ChevronRight size={16} />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            const p = i + 1
            const isActive = p === page
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  'h-9 min-w-9 rounded-card text-xs font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus md:h-8 md:min-w-[32px]',
                  isActive ? 'bg-primary text-on-primary' : 'text-muted hover:bg-hover',
                )}
              >
                {p}
              </button>
            )
          })}
          {totalPages > 7 && <span className="text-xs text-dim">...</span>}
          <button
            onClick={() => onPageChange(Math.min(totalPages, (page || 1) + 1))}
            disabled={page === totalPages}
            className="rounded-card p-2.5 text-muted outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-30 md:p-1.5"
            aria-label="الصفحة التالية"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>
    )
  }

  const renderMobileCards = () => {
    if (!mobileCard || isLoading) return null
    if (sortedData.length === 0) return null
    return (
      <div className="space-y-3 md:hidden">
        {sortedData.map((item) => {
          const id = getId(item)
          return (
            <div
              key={id}
              onClick={() => onRowClick?.(item)}
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onRowClick(item)
                      }
                    }
                  : undefined
              }
              className={cn(
                'rounded-2xl border border-border bg-card p-4 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-focus',
                onRowClick && 'cursor-pointer active:scale-[0.99]',
                selectedId !== undefined && selectedId === id && 'border-primary',
              )}
            >
              {mobileCard(item)}
            </div>
          )
        })}
      </div>
    )
  }

  // Default mobile cards: when no custom mobileCard is provided, build cards
  // from columns that declare a mobileLabel (label: value rows per card).
  const defaultMobileColumns = mobileCard
    ? null
    : columns.filter((col) => col.mobileLabel && !col.hideOnMobile)

  const renderDefaultMobileCards = () => {
    if (mobileCard || isLoading || sortedData.length === 0) return null
    if (!defaultMobileColumns || defaultMobileColumns.length === 0) return null
    return (
      <div className="space-y-3 md:hidden">
        {sortedData.map((item) => {
          const id = getId(item)
          const isSelected = selectedId !== undefined && id === selectedId
          return (
            <div
              key={id}
              onClick={() => onRowClick?.(item)}
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onRowClick(item)
                      }
                    }
                  : undefined
              }
              className={cn(
                'rounded-2xl border border-border bg-card p-4 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-focus',
                onRowClick && 'cursor-pointer active:scale-[0.99]',
                isSelected && 'border-primary',
              )}
            >
              <div className="space-y-2.5">
                {defaultMobileColumns.map((col) => (
                  <div key={col.key} className="flex items-start justify-between gap-3">
                    <span className="shrink-0 pt-0.5 text-xs font-semibold text-muted">
                      {col.mobileLabel}
                    </span>
                    <span className="min-w-0 text-end text-sm font-medium text-main">
                      {col.render
                        ? col.render(item)
                        : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
        <table className="w-full border-collapse text-start">
          {renderHeader()}
          {renderBody()}
        </table>
        {renderPagination()}
      </div>
      {renderMobileCards()}
      {renderDefaultMobileCards()}
    </div>
  )
}

export const Table = React.memo(TableInner) as typeof TableInner
