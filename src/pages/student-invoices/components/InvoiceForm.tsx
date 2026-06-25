import { Plus, Edit, Check, X } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, InputField, PrimaryBtn } from './InvoiceUI';

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
  'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
  'px-3 py-2 text-xs font-bold text-slate-800 dark:text-white',
  'focus:outline-none focus:border-[#6C4BFF] focus:ring-2 focus:ring-purple-200/50 dark:focus:ring-purple-700/50',
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
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all rounded-xl"
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
          <FieldLabel>المبلغ (ج.م) *</FieldLabel>
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
