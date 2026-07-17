import { useState } from 'react';
import { MessageSquare, Plus, Trash2, Save } from 'lucide-react';
import { SectionCard, SectionTitle, InputField, PrimaryBtn, DangerBtn } from './SettingsUI';

interface WhatsAppEntry {
    label: string;
    phone: string;
}

interface MobileSettingsProps {
    whatsappNumbers: string;
    setWhatsappNumbers: (v: string) => Promise<void>;
    showNotify: (msg: string) => void;
}

export const MobileSettings = ({ whatsappNumbers, setWhatsappNumbers, showNotify }: MobileSettingsProps) => {
    const [entries, setEntries] = useState<WhatsAppEntry[]>(() => {
        try { return JSON.parse(whatsappNumbers); } catch { return []; }
    });
    const [saving, setSaving] = useState(false);

    const updateEntry = (i: number, field: keyof WhatsAppEntry, value: string) => {
        const next = [...entries];
        next[i] = { ...next[i], [field]: value };
        setEntries(next);
    };

    const addEntry = () => {
        setEntries([...entries, { label: '', phone: '' }]);
    };

    const removeEntry = (i: number) => {
        setEntries(entries.filter((_, idx) => idx !== i));
    };

    const handleSave = async () => {
        const valid = entries.filter(e => e.label.trim() && e.phone.trim());
        if (valid.length === 0) {
            showNotify('أضف على الأقل رقم واحد صالح');
            return;
        }
        setSaving(true);
        try {
            await setWhatsappNumbers(JSON.stringify(valid));
            showNotify('تم حفظ أرقام واتساب');
        } catch {
            showNotify('فشل الحفظ');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <SectionCard>
                <SectionTitle icon={MessageSquare} label="واتساب" sub="أزرار التواصل لكل قسم" />
                <p className="text-xs text-dim mb-4">
                    كل مدخل يمثل زر واتساب منفصل برقم مستقل. الرقم بدون الصفر والمفتاح (مثال: 201015098836).
                </p>
                <div className="space-y-3">
                    {entries.map((entry, i) => (
                        <div key={`setting-${i}`} className="flex items-start gap-2 p-3 bg-surface border border-border">
                            <div className="flex-1 space-y-2">
                                <InputField
                                    placeholder="مسمى الزر (مثال: تواصل عام)"
                                    value={entry.label}
                                    onChange={e => updateEntry(i, 'label', e.target.value)}
                                />
                                <InputField
                                    placeholder="رقم الهاتف (مثال: 201015098836)"
                                    value={entry.phone}
                                    onChange={e => updateEntry(i, 'phone', e.target.value)}
                                />
                            </div>
                            <DangerBtn onClick={() => removeEntry(i)} className="!p-2.5 mt-0">
                                <Trash2 size={14} />
                            </DangerBtn>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 mt-4">
                    <PrimaryBtn onClick={addEntry} className="!bg-surface !text-primary !border !border-border">
                        <Plus size={14} /> إضافة رقم
                    </PrimaryBtn>
                    <PrimaryBtn onClick={handleSave} loading={saving}>
                        <Save size={14} /> حفظ الأرقام
                    </PrimaryBtn>
                </div>
            </SectionCard>
            <SectionCard>
                <SectionTitle icon={MessageSquare} label="الربط بالأزرار" sub="راجع labels المستخدمة" />
                <div className="space-y-2 text-xs text-dim">
                    <p>• الصفحة الرئيسية: <span dir="ltr" className="font-bold">طلب حصة مجانية</span>، <span dir="ltr" className="font-bold">احجز حصتك المجانية الآن</span>، <span dir="ltr" className="font-bold">ابدأ رحلة التميز</span>، <span dir="ltr" className="font-bold">ابدأ الحفظ الآن</span>، <span dir="ltr" className="font-bold">سجل الآن</span></p>
                    <p>• صفحة الدورات: <span dir="ltr" className="font-bold">تواصل عبر واتساب</span></p>
                    <p>• الزر الجانبي: <span dir="ltr" className="font-bold">تواصل معانا</span></p>
                    <p>• سياسة الخصوصية: <span dir="ltr" className="font-bold">تواصل مع الدعم الفني</span></p>
                    <p>• سياسة الاسترجاع: <span dir="ltr" className="font-bold">تواصل مع قسم الحسابات</span></p>
                    <p>• قوانين العمل: <span dir="ltr" className="font-bold">تواصل مع إدارة المعهد</span></p>
                    <p className="mt-2 text-xs text-info font-bold">أي label غير موجود يستخدم رقم المسؤول (adminPhone) كبديل.</p>
                </div>
            </SectionCard>
        </div>
    );
};
