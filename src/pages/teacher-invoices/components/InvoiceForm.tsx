import { Plus, Edit, Check } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, InputField, PrimaryBtn } from './InvoiceUI';

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

export const InvoiceForm = ({
    showForm, editingId, formData, setFormData,
    handleSubmit, handleCancel, teachers, isSaving, INVOICE_STATUS
}: InvoiceFormProps) => {
    if (!showForm) return null;

    return (
        <SectionCard className="mb-4 animate-in slide-in-from-top-2">
            <SectionTitle
                icon={editingId ? Edit : Plus}
                label={editingId ? 'تعديل فاتورة' : 'إضافة فاتورة جديدة'}
                sub="Invoice Management"
            />
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                    <FieldLabel>المعلمة *</FieldLabel>
                    <InputField
                        type="select"
                        required
                        value={formData.teacherId}
                        onChange={e => {
                            const t = teachers.find(t => t.id === e.target.value);
                            if (t) {
                                setFormData({
                                    ...formData,
                                    teacherId: t.id,
                                    teacher: t.name,
                                    specialization: t.subject || formData.specialization
                                });
                            } else {
                                setFormData({ ...formData, teacherId: e.target.value });
                            }
                        }}
                    >
                        <option value="">-- اختر المعلمة --</option>
                        {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                        <option value="other">أخرى (إدخال يدوي)</option>
                    </InputField>
                </div>
                {formData.teacherId === 'other' && (
                    <div>
                        <FieldLabel>اسم المعلمة (يدوي) *</FieldLabel>
                        <InputField
                            required
                            value={formData.teacher}
                            onChange={e => setFormData({ ...formData, teacher: (e.target as HTMLInputElement).value })}
                            placeholder="اسم المعلمة"
                        />
                    </div>
                )}
                <div>
                    <FieldLabel>التخصص *</FieldLabel>
                    <InputField
                        required
                        value={formData.specialization}
                        onChange={e => setFormData({ ...formData, specialization: (e.target as HTMLInputElement).value })}
                        placeholder="التخصص"
                    />
                </div>
                <div>
                    <FieldLabel>المبلغ (ج.م) *</FieldLabel>
                    <InputField
                        type="number"
                        required
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: (e.target as HTMLInputElement).value })}
                        placeholder="0"
                    />
                </div>
                <div>
                    <FieldLabel>وسيلة الدفع</FieldLabel>
                    <InputField
                        value={formData.paymentMethod}
                        onChange={e => setFormData({ ...formData, paymentMethod: (e.target as HTMLInputElement).value })}
                        placeholder="نقدي / تحويل"
                    />
                </div>
                <div>
                    <FieldLabel>المصاريف الشخصية</FieldLabel>
                    <InputField
                        type="number"
                        value={formData.personalExpenses}
                        onChange={e => setFormData({ ...formData, personalExpenses: (e.target as HTMLInputElement).value })}
                        placeholder="0"
                    />
                </div>
                <div>
                    <FieldLabel>الحالة *</FieldLabel>
                    <InputField
                        type="select"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: (e.target as HTMLSelectElement).value as any })}
                    >
                        {Object.values(INVOICE_STATUS).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </InputField>
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
