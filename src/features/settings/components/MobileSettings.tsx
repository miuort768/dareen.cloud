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
            showNotify('تم حفظ أرقام الواتساب');
        } catch {
            showNotify('فشل الحفظ');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <SectionCard>
                <SectionTitle icon={MessageSquare} label="أرقام الواتساب" sub="أزرار التواصل لكل قسم" />
                <p className="text-xs text-dim mb-4">
                    كل مدخل يمثل زر واتساب منفصل برقم مستقل. الرقم بدون الصفر والمفتاح (مثال: 201015098836).
                </p>
                <div className="space-y-3">
                    {entries.map((entry, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 bg-surface border border-border">
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
                <SectionTitle icon={MessageSquare} label="كيفية استخدام الأرقام" sub="الربط بالأزرار" />
                <div className="space-y-2 text-xs text-dim">
                    <p>• كل رقم يضاف هنا يظهر كزر واتساب منفصل في صفحة الاتصال والتواصل.</p>
                    <p>• "تواصل عام" يستخدم لاستفسارات العملاء العامة.</p>
                    <p>• "إدارة الأكاديمية" يوجه للشؤون الإدارية والمالية.</p>
                    <p>• يمكنك إضافة أرقام لأقسام أخرى مثل: المبيعات، الدعم الفني، التسجيل.</p>
                </div>
            </SectionCard>
        </div>
    );
};
