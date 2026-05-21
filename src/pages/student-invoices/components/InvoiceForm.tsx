import { Plus, Edit, Check } from 'lucide-react';
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

export const InvoiceForm = ({
    showForm, editingId, formData, setFormData,
    handleSubmit, handleStudentChange, students, isSaving
}: InvoiceFormProps) => {
    if (!showForm) return null;

    return (
        <SectionCard className="mb-4 animate-in slide-in-from-top-2">
            <SectionTitle
                icon={editingId ? Edit : Plus}
                label={editingId ? 'تعديل الفاتورة' : 'إصدار فاتورة جديدة'}
                sub="Student Billing Management"
            />
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                    <FieldLabel>الطالب *</FieldLabel>
                    <InputField
                        type="select"
                        required
                        value={formData.studentId}
                        onChange={e => handleStudentChange(e.target.value)}
                    >
                        <option value="">-- اختر الطالب --</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                        ))}
                    </InputField>
                </div>
                <div>
                    <FieldLabel>المبلغ (ج.م) *</FieldLabel>
                    <InputField
                        type="number"
                        required
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: (e.target as HTMLInputElement).value })}
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <FieldLabel>بيان الفاتورة *</FieldLabel>
                    <InputField
                        required
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: (e.target as HTMLInputElement).value })}
                        placeholder="مثال: رسوم شهر أكتوبر"
                    />
                </div>
                <div className="lg:col-span-1">
                    <FieldLabel>حالة الدفع</FieldLabel>
                    <InputField
                        type="select"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: (e.target as HTMLSelectElement).value as InvoiceFormData['status'] })}
                    >
                        <option value="pending">معلقة</option>
                        <option value="paid">مدفوعة</option>
                        <option value="overdue">متأخرة</option>
                    </InputField>
                </div>
                <div className="grid grid-cols-2 gap-2 lg:col-span-1">
                    <div>
                        <FieldLabel>تاريخ الإصدار</FieldLabel>
                        <InputField
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: (e.target as HTMLInputElement).value })}
                        />
                    </div>
                    <div>
                        <FieldLabel>تاريخ الاستحقاق</FieldLabel>
                        <InputField
                            type="date"
                            value={formData.dueDate}
                            onChange={e => setFormData({ ...formData, dueDate: (e.target as HTMLInputElement).value })}
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
