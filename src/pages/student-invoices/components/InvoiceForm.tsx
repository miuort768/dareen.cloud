import { Plus, Edit, Check, X } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, PrimaryBtn } from './InvoiceUI';

interface Student {
    id: string;
    name: string;
    grade: string;
    parentPhone: string;
    sessionPrice?: number;
    enrollments: {
        teacher: string;
        subject: string;
        sessionsTotal: number;
        sessionsUsed: number;
        price?: number;
    }[];
}

interface InvoiceFormData {
    studentId: string;
    amount: string;
    description: string;
    date: string;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
    paymentMethod: string;
    notes: string;
    currency?: string;
    items: { description: string; date?: string; amount: number }[];
}

interface InvoiceFormProps {
    showForm: boolean;
    editingId: string | null;
    formData: InvoiceFormData;
    setFormData: React.Dispatch<React.SetStateAction<InvoiceFormData>>;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleCancel: () => void;
    handleStudentChange: (studentId: string) => void;
    students: Student[];
    isSaving: boolean;
}

const inputClasses = [
  'w-full bg-background dark:bg-primary-active border border-border dark:border-border',
  'px-3 py-2 text-xs font-bold text-main dark:text-on-primary',
  'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/50',
  'transition-all duration-200 rounded-xl',
].join(' ');

export const InvoiceForm = ({
  showForm, editingId, formData, setFormData,
  handleSubmit, handleStudentChange, students, isSaving
}: InvoiceFormProps) => {
  if (!showForm) return null;

  return (
    <SectionCard className="mb-4 motion-safe:animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-1">
        <SectionTitle
          icon={editingId ? Edit : Plus}
          label={editingId ? 'تعديل الفاتورة' : 'إصدار فاتورة جديدة'}
          sub="إدارة فواتير الطلاب"
        />
        <button
          type="button"
          onClick={handleCancel}
          className="p-1.5 text-muted hover:text-muted hover:bg-surface dark:hover:bg-primary-active transition-all rounded-xl"
        >
          <X size={16} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <FieldLabel>الطالب *</FieldLabel>
          <select
            required
            value={formData.studentId}
            aria-label="الطالب"
            onChange={e => handleStudentChange(e.target.value)}
            className={inputClasses}
          >
            <option value="">-- اختر الطالب --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>المبلغ *</FieldLabel>
          <input
            type="number"
            required
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            className={inputClasses}
          />
        </div>
        <div>
          <FieldLabel>العملة</FieldLabel>
          <select
            value={formData.currency || 'KWD'}
            aria-label="العملة"
            onChange={e => setFormData({ ...formData, currency: e.target.value })}
            className={inputClasses}
          >
            <option value="KWD">د.ك (KWD)</option>
            <option value="SAR">﷼ (SAR)</option>
            <option value="AED">د.إ (AED)</option>
            <option value="QAR">﷼ (QAR)</option>
            <option value="OMR">﷼ (OMR)</option>
            <option value="BHD">د.ب (BHD)</option>
            <option value="EGP">ج.م (EGP)</option>
            <option value="USD">$ (USD)</option>
          </select>
        </div>
        <div>
          <FieldLabel>بيان الفاتورة *</FieldLabel>
          <input
            required
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="مثال: رسوم شهر أكتوبر"
            className={inputClasses}
          />
        </div>
        <div className="lg:col-span-1">
          <FieldLabel>حالة الدفع</FieldLabel>
          <select
            value={formData.status}
            aria-label="حالة الدفع"
            onChange={e => setFormData({ ...formData, status: e.target.value as InvoiceFormData['status'] })}
            className={inputClasses}
          >
            <option value="pending">معلقة</option>
            <option value="paid">مدفوعة</option>
            <option value="overdue">متأخرة</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:col-span-1">
          <div>
            <FieldLabel>تاريخ الإصدار</FieldLabel>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel>تاريخ الاستحقاق</FieldLabel>
            <input
              type="date"
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              className={inputClasses}
            />
          </div>
        </div>
        <div className="flex items-end">
          <PrimaryBtn type="submit" loading={isSaving} className="w-full">
            <Check size={14} /> {editingId ? 'تحديث الفاتورة' : 'إصدار الفاتورة'}
          </PrimaryBtn>
        </div>
      </form>
    </SectionCard>
  );
};
