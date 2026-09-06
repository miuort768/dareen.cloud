import { memo, useMemo } from 'react'
import { Edit, Trash2, GraduationCap, type LucideIcon } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { CURRENCY_SYMBOL } from '../../../config/constants'
import { Table, EmptyState, Badge } from '../../../shared/components/ui'
import type { Column } from '../../../shared/components/ui'
import {
  INVOICE_STATUS_LABEL,
  normalizeInvoiceStatus,
  type TeacherInvoice,
} from '../../../types/invoice'

interface InvoiceTableProps {
  filteredInvoices: TeacherInvoice[]
  handleEdit: (invoice: TeacherInvoice) => void
  handleDelete: (id: string) => void
  isTeacher: boolean
}

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  paid: 'success',
  pending: 'warning',
  reviewed: 'info',
}

const AvatarLetter = ({ name }: { name: string }) => (
  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary-soft text-micro font-bold text-primary">
    {(name || '?').charAt(0).toUpperCase()}
  </div>
)

const ActionButton = ({
  icon: Icon,
  onClick,
  title,
  hoverClass,
}: {
  icon: LucideIcon
  onClick: () => void
  title: string
  hoverClass: string
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation()
      onClick()
    }}
    className={cn(
      'flex h-8 w-8 items-center justify-center rounded-lg text-muted outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus active:scale-90',
      hoverClass,
    )}
    title={title}
    aria-label={title}
  >
    <Icon size={13} />
  </button>
)

export const InvoiceTable = memo(
  ({ filteredInvoices, handleEdit, handleDelete, isTeacher }: InvoiceTableProps) => {
    const columns = useMemo<Column<TeacherInvoice>[]>(() => {
      const cols: Column<TeacherInvoice>[] = [
        {
          key: 'teacher',
          header: 'المعلمة',
          mobileLabel: 'المعلمة',
          render: (inv) => (
            <div className="flex items-center gap-2">
              <AvatarLetter name={inv.teacher} />
              <span className="text-xs font-bold text-main">{inv.teacher}</span>
            </div>
          ),
        },
        {
          key: 'specialization',
          header: 'التخصص',
          mobileLabel: 'التخصص',
          render: (inv) => (
            <span className="text-micro font-medium text-muted">{inv.specialization}</span>
          ),
        },
        {
          key: 'amount',
          header: 'المبلغ',
          align: 'center',
          mobileLabel: 'المبلغ',
          render: (inv) => (
            <span className="font-mono text-xs font-bold text-muted">
              {inv.amount.toLocaleString()} {CURRENCY_SYMBOL}
            </span>
          ),
        },
        {
          key: 'net',
          header: 'الصافي',
          align: 'center',
          mobileLabel: 'الصافي',
          render: (inv) => (
            <Badge variant="success" size="sm">
              {(inv.amount - (inv.personalExpenses || 0)).toLocaleString()} {CURRENCY_SYMBOL}
            </Badge>
          ),
        },
        {
          key: 'status',
          header: 'الحالة',
          align: 'center',
          mobileLabel: 'الحالة',
          render: (inv) => (
            <div className="flex justify-center">
              <Badge
                variant={statusVariant[normalizeInvoiceStatus(inv.status)] || 'error'}
                size="sm"
              >
                {INVOICE_STATUS_LABEL[normalizeInvoiceStatus(inv.status)]}
              </Badge>
            </div>
          ),
        },
      ]
      if (!isTeacher) {
        cols.push({
          key: 'actions',
          header: 'الإجراءات',
          align: 'center',
          hideOnMobile: true,
          render: (inv) => (
            <div className="flex items-center justify-center gap-1">
              <ActionButton
                icon={Edit}
                onClick={() => handleEdit(inv)}
                title="تعديل"
                hoverClass="hover:text-success hover:bg-success-soft"
              />
              <ActionButton
                icon={Trash2}
                onClick={() => handleDelete(inv.id)}
                title="حذف"
                hoverClass="hover:text-error hover:bg-error-soft"
              />
            </div>
          ),
        })
      }
      return cols
    }, [isTeacher, handleEdit, handleDelete])

    if (filteredInvoices.length === 0) {
      return (
        <div className="rounded-2xl border border-border bg-card">
          <EmptyState
            icon={GraduationCap}
            title="لا توجد فواتير"
            subtitle="ستظهر فواتير المعلمات هنا بعد إضافتها"
          />
        </div>
      )
    }

    return (
      <Table<TeacherInvoice>
        data={filteredInvoices}
        columns={columns}
        headerVariant="surface"
        getId={(inv) => inv.id}
        mobileCard={(inv) => (
          <>
            <div className="px-4 pb-3 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AvatarLetter name={inv.teacher} />
                  <div>
                    <p className="text-xs font-bold text-main">{inv.teacher}</p>
                    <p className="text-micro text-muted">{inv.specialization}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="mb-0.5 text-micro font-bold uppercase text-muted">المبلغ</p>
                    <span className="font-mono text-sm font-bold text-main">
                      {inv.amount.toLocaleString()} {CURRENCY_SYMBOL}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div>
                    <p className="mb-0.5 text-micro font-bold uppercase text-muted">الصافي</p>
                    <span className="text-xs font-bold text-success-dark">
                      {(inv.amount - (inv.personalExpenses || 0)).toLocaleString()}{' '}
                      {CURRENCY_SYMBOL}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={statusVariant[normalizeInvoiceStatus(inv.status)] || 'error'}
                  size="sm"
                >
                  {INVOICE_STATUS_LABEL[normalizeInvoiceStatus(inv.status)]}
                </Badge>
              </div>
            </div>
            {!isTeacher && (
              <div className="flex items-center justify-end gap-1 border-t border-border px-4 py-2.5">
                <ActionButton
                  icon={Edit}
                  onClick={() => handleEdit(inv)}
                  title="تعديل"
                  hoverClass="hover:text-success hover:bg-success-soft"
                />
                <ActionButton
                  icon={Trash2}
                  onClick={() => handleDelete(inv.id)}
                  title="حذف"
                  hoverClass="hover:text-error hover:bg-error-soft"
                />
              </div>
            )}
          </>
        )}
      />
    )
  },
)
