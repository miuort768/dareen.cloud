import { Search, Calendar, GraduationCap, Plus, X, UserPlus, Trash2, Printer } from 'lucide-react'
import { INVOICE_STATUS, INVOICE_STATUS_LABEL } from '../../../types/invoice'
import { CURRENCY_SYMBOL } from '../../../config/constants'
import { PrimaryBtn, SecondaryBtn, DangerBtn } from '../components/InvoiceUI'

interface TeacherInvoicesHeaderProps {
  stats: { totalAmount: number }
  searchTerm: string
  onSearchChange: (v: string) => void
  filterStatus: string
  onFilterChange: (v: string) => void
  startDate: string
  onStartDateChange: (v: string) => void
  endDate: string
  onEndDateChange: (v: string) => void
  showForm: boolean
  onToggleForm: () => void
  onImport: () => void
  onDeleteAll: () => void
  onPrint: () => void
  isTeacher: boolean
}

export const TeacherInvoicesHeader = ({
  stats,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  showForm,
  onToggleForm,
  onImport,
  onDeleteAll,
  onPrint,
  isTeacher,
}: TeacherInvoicesHeaderProps) => (
  <div className="rounded-2xl border border-border bg-surface p-3 md:p-4">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
          <GraduationCap size={16} className="text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-main md:text-base">فواتير المعلمات</h1>
          <p className="text-[10px] font-bold text-muted">إدارة مستحقات المعلمات المالية</p>
        </div>
      </div>
      <span className="whitespace-nowrap rounded-lg bg-success-soft px-2.5 py-1 text-[10px] font-bold text-success">
        {stats.totalAmount.toLocaleString()} {CURRENCY_SYMBOL}
      </span>
    </div>
    <div className="flex flex-col items-center gap-2 lg:flex-row">
      <div className="flex w-full flex-1 items-center gap-2">
        <div className="relative max-w-md flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
          <input
            aria-label="بحث باسم المعلمة"
            placeholder="بحث باسم المعلمة..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pe-3 ps-8 text-xs font-bold text-main outline-none transition-all placeholder:text-muted focus:ring-2 focus:ring-focus"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
          <Calendar size={13} className="text-muted" />
          <div className="flex items-center gap-1">
            <input
              type="date"
              aria-label="تاريخ البداية"
              className="cursor-pointer border-none bg-transparent p-0 text-xs font-bold text-main outline-none"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
            <span className="text-[10px] font-bold text-muted">إلى</span>
            <input
              type="date"
              aria-label="تاريخ النهاية"
              className="cursor-pointer border-none bg-transparent p-0 text-xs font-bold text-main outline-none"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          aria-label="تصفية حسب الحالة"
          className="w-auto min-w-[120px] rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-main outline-none transition-all focus:ring-2 focus:ring-focus"
        >
          <option value="all">جميع الحالات</option>
          {Object.values(INVOICE_STATUS).map((status) => (
            <option key={status} value={status}>
              {INVOICE_STATUS_LABEL[status] || status}
            </option>
          ))}
        </select>
      </div>
      <div className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto pb-1 lg:w-auto lg:pb-0">
        {!isTeacher && (
          <>
            <PrimaryBtn onClick={onToggleForm} className="whitespace-nowrap">
              {showForm ? <X size={14} /> : <Plus size={14} />}
              {showForm ? 'إلغاء' : 'إضافة فاتورة'}
            </PrimaryBtn>
            <SecondaryBtn onClick={onImport} title="استيراد من الحصص">
              <UserPlus size={14} /> استيراد
            </SecondaryBtn>
            <DangerBtn onClick={onDeleteAll} title="حذف الكل">
              <Trash2 size={14} />
            </DangerBtn>
          </>
        )}
        <SecondaryBtn onClick={onPrint} title="طباعة السجل">
          <Printer size={14} />
        </SecondaryBtn>
      </div>
    </div>
  </div>
)
