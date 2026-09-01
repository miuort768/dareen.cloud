import { Plus, Edit, Check, X } from 'lucide-react'
import { SectionCard, SectionTitle, FieldLabel, PrimaryBtn } from './InvoiceUI'
import type { TeacherInvoiceFormData, InvoiceStatus } from '../../../types/invoice'

interface Teacher {
  id: string
  name: string
  subject?: string
}

interface InvoiceFormProps {
  showForm: boolean
  editingId: string | null
  formData: TeacherInvoiceFormData
  setFormData: React.Dispatch<React.SetStateAction<TeacherInvoiceFormData>>
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleCancel: () => void
  teachers: Teacher[]
  isSaving: boolean
  INVOICE_STATUS: Record<string, string>
}

const inputClasses = [
  'w-full bg-background border border-border',
  'px-3 py-2 text-xs font-bold text-main',
  'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50',
  'transition-all duration-200 rounded-xl',
].join(' ')

export const InvoiceForm = ({
  showForm,
  editingId,
  formData,
  setFormData,
  handleSubmit,
  handleCancel,
  teachers,
  isSaving,
  INVOICE_STATUS,
}: InvoiceFormProps) => {
  if (!showForm) return null

  return (
    <SectionCard className="mb-4 motion-safe:animate-[fadeIn_0.3s_ease-out]">
      <div className="mb-1 flex items-center justify-between">
        <SectionTitle
          icon={editingId ? Edit : Plus}
          label={editingId ? 'تعديل فاتورة' : 'إضافة فاتورة جديدة'}
          sub="إدارة الفواتير"
        />
        <button
          type="button"
          onClick={handleCancel}
          aria-label="إغلاق"
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted transition-all hover:bg-surface hover:text-muted"
        >
          <X size={16} />
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <FieldLabel>المعلمة *</FieldLabel>
          <select
            required
            value={formData.teacherId}
            aria-label="المعلمة"
            onChange={(e) => {
              const t = teachers.find((t) => t.id === e.target.value)
              if (t) {
                setFormData({
                  ...formData,
                  teacherId: t.id,
                  teacher: t.name,
                  specialization: t.subject || formData.specialization,
                })
              } else {
                setFormData({ ...formData, teacherId: e.target.value })
              }
            }}
            className={inputClasses}
          >
            <option value="">-- اختر المعلمة --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
            <option value="other">أخرى (إدخال يدوي)</option>
          </select>
        </div>
        {formData.teacherId === 'other' && (
          <div>
            <FieldLabel>اسم المعلمة (يدوي) *</FieldLabel>
            <input
              required
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              placeholder="اسم المعلمة"
              className={inputClasses}
            />
          </div>
        )}
        <div>
          <FieldLabel>التخصص *</FieldLabel>
          <input
            required
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            placeholder="التخصص"
            className={inputClasses}
          />
        </div>
        <div>
          <FieldLabel>المبلغ *</FieldLabel>
          <input
            type="number"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0"
            className={inputClasses}
          />
        </div>
        <div>
          <FieldLabel>العملة</FieldLabel>
          <select
            value={formData.currency}
            aria-label="العملة"
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className={inputClasses}
          >
            <option value="EGP">ج.م (EGP)</option>
          </select>
        </div>
        <div>
          <FieldLabel>وسيلة الدفع</FieldLabel>
          <input
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            placeholder="نقدي / تحويل"
            className={inputClasses}
          />
        </div>
        <div>
          <FieldLabel>المصاريف الشخصية</FieldLabel>
          <input
            type="number"
            value={formData.personalExpenses}
            onChange={(e) => setFormData({ ...formData, personalExpenses: e.target.value })}
            placeholder="0"
            className={inputClasses}
          />
        </div>
        <div>
          <FieldLabel>الحالة *</FieldLabel>
          <select
            value={formData.status}
            aria-label="حالة الفاتورة"
            onChange={(e) => setFormData({ ...formData, status: e.target.value as InvoiceStatus })}
            className={inputClasses}
          >
            {Object.values(INVOICE_STATUS).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col justify-end md:col-span-1 lg:col-span-1">
          <PrimaryBtn type="submit" loading={isSaving} className="w-full">
            <Check size={14} /> {editingId ? 'حفظ التعديلات' : 'حفظ الفاتورة'}
          </PrimaryBtn>
        </div>
      </form>
    </SectionCard>
  )
}
