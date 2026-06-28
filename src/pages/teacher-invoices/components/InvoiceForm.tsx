import { Plus, Edit, Check, X } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, PrimaryBtn } from './InvoiceUI';

interface Teacher {
    id: string;
    name: string;
    subject?: string;
}

interface TeacherInvoiceFormData {
    teacherId: string;
    teacher: string;
    specialization: string;
    amount: string;
    paymentMethod: string;
    status: string;
    personalExpenses: string;
}

interface InvoiceFormProps {
    showForm: boolean;
    editingId: string | null;
    formData: TeacherInvoiceFormData;
    setFormData: React.Dispatch<React.SetStateAction<TeacherInvoiceFormData>>;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleCancel: () => void;
    teachers: Teacher[];
    isSaving: boolean;
    INVOICE_STATUS: Record<string, string>;
}

const inputClasses = [
  'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
  'px-3 py-2 text-xs font-bold text-slate-800 dark:text-white',
  'focus:outline-none focus:border-[#6C4BFF] focus:ring-2 focus:ring-purple-200/50 dark:focus:ring-purple-700/50',
  'transition-all duration-200 rounded-xl',
].join(' ');

export const InvoiceForm = ({
  showForm, editingId, formData, setFormData,
  handleSubmit, handleCancel, teachers, isSaving, INVOICE_STATUS
}: InvoiceFormProps) => {
  if (!showForm) return null;

  return (
    <SectionCard className="mb-4 motion-safe:animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-1">
        <SectionTitle
          icon={editingId ? Edit : Plus}
          label={editingId ? 'تعديل فاتورة' : 'إضافة فاتورة جديدة'}
          sub="إدارة الفواتير"
        />
        <button
          type="button"
          onClick={handleCancel}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all rounded-xl"
        >
          <X size={16} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <FieldLabel>المعلمة *</FieldLabel>
          <select
            required
            value={formData.teacherId}
            onChange={e => {
              const t = teachers.find(t => t.id === e.target.value);
              if (t) {
                setFormData({ ...formData, teacherId: t.id, teacher: t.name, specialization: t.subject || formData.specialization });
              } else {
                setFormData({ ...formData, teacherId: e.target.value });
              }
            }}
            className={inputClasses}
          >
            <option value="">-- اختر المعلمة --</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
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
              onChange={e => setFormData({ ...formData, teacher: e.target.value })}
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
            onChange={e => setFormData({ ...formData, specialization: e.target.value })}
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
            onChange={e => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0"
            className={inputClasses}
          />
        </div>
        <div>
          <FieldLabel>العملة</FieldLabel>
          <select
            value={formData.currency}
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
          <FieldLabel>وسيلة الدفع</FieldLabel>
          <input
            value={formData.paymentMethod}
            onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
            placeholder="نقدي / تحويل"
            className={inputClasses}
          />
        </div>
        <div>
          <FieldLabel>المصاريف الشخصية</FieldLabel>
          <input
            type="number"
            value={formData.personalExpenses}
            onChange={e => setFormData({ ...formData, personalExpenses: e.target.value })}
            placeholder="0"
            className={inputClasses}
          />
        </div>
        <div>
          <FieldLabel>الحالة *</FieldLabel>
          <select
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            className={inputClasses}
          >
            {Object.values(INVOICE_STATUS).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-1 lg:col-span-1 flex flex-col justify-end">
          <PrimaryBtn type="submit" loading={isSaving} className="w-full">
            <Check size={14} /> {editingId ? 'حفظ التعديلات' : 'حفظ الفاتورة'}
          </PrimaryBtn>
        </div>
      </form>
    </SectionCard>
  );
};
