import { useState } from 'react';
import { Calendar, Plus, Trash2, Info } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, InputField, PrimaryBtn, SecondaryBtn, DangerBtn } from './SettingsUI';
import { useSettingsStore } from '../../../store/settingsStore';

export const AcademicYearSection = ({
    localSemesterName, setLocalSemesterName,
    localSemesters, setLocalSemesters,
    setSemesterName, setSemesters,
    localAcademicYear, setLocalAcademicYear,
    localSemesterStart, setLocalSemesterStart,
    localSemesterEnd, setLocalSemesterEnd,
    showNotify,
}: {
    localSemesterName: string; setLocalSemesterName: (v: string) => void;
    localSemesters: string; setLocalSemesters: (v: string) => void;
    setSemesterName: (v: string) => void; setSemesters: (v: string) => void;
    localAcademicYear: string; setLocalAcademicYear: (v: string) => void;
    localSemesterStart: string; setLocalSemesterStart: (v: string) => void;
    localSemesterEnd: string; setLocalSemesterEnd: (v: string) => void;
    showNotify: (msg: string) => void;
}) => {
    const setSetting = useSettingsStore(s => s.setSetting);
    const [isSaving, setIsSaving] = useState(false);

    const semesterList = localSemesters.split(',').filter(Boolean).map((s, i) => ({ id: i, name: s.trim() }));

    const addSemester = () => {
        const newName = `الفصل ${semesterList.length + 1}`;
        const updated = [...semesterList.map(s => s.name), newName].join(',');
        setLocalSemesters(updated);
    };

    const removeSemester = (id: number) => {
        const updated = semesterList.filter(s => s.id !== id).map(s => s.name).join(',');
        setLocalSemesters(updated);
    };

    const renameSemester = (id: number, newName: string) => {
        const updated = semesterList.map(s => s.id === id ? { ...s, name: newName } : s).map(s => s.name).join(',');
        setLocalSemesters(updated);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await Promise.all([
                setSemesterName(localSemesterName),
                setSemesters(localSemesters),
                setSetting('academicYear', localAcademicYear),
                setSetting('semesterStartDate', localSemesterStart),
                setSetting('semesterEndDate', localSemesterEnd),
            ]);
            showNotify('تم حفظ السنة الدراسية');
        } catch (e) { console.error(e); showNotify('خطأ في الحفظ'); }
        finally { setIsSaving(false); }
    };

    return (
        <SectionCard>
            <SectionTitle icon={Calendar} label="السنة الدراسية" sub="إدارة الفصول والتقويم الدراسي" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <FieldLabel>السنة الدراسية الحالية</FieldLabel>
                    <InputField value={localAcademicYear} onChange={e => setLocalAcademicYear(e.target.value)} placeholder="مثال: 2024-2025" />
                </div>
                <div>
                    <FieldLabel>مسمى الفصل</FieldLabel>
                    <InputField value={localSemesterName} onChange={e => setLocalSemesterName(e.target.value)} placeholder="مثال: الفصل الدراسي" />
                </div>
                <div>
                    <FieldLabel>تاريخ بداية الفصل</FieldLabel>
                    <InputField type="date" value={localSemesterStart} onChange={e => setLocalSemesterStart(e.target.value)} />
                </div>
                <div>
                    <FieldLabel>تاريخ نهاية الفصل</FieldLabel>
                    <InputField type="date" value={localSemesterEnd} onChange={e => setLocalSemesterEnd(e.target.value)} />
                </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-[11px] font-bold text-info-dark bg-info-soft px-4 py-3 rounded-lg">
                <Info size={13} className="shrink-0" />
                تظهر السنة الدراسية الحالية في لوحات التحكم والقائمة الجانبية لجميع المستخدمين.
            </div>

            <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                    <FieldLabel>الفصول الدراسية</FieldLabel>
                    <SecondaryBtn onClick={addSemester}><Plus size={14} /> إضافة فصل</SecondaryBtn>
                </div>
                <div className="space-y-2">
                    {semesterList.map(s => (
                        <div key={s.id} className="flex items-center gap-2 p-3 bg-background border border-border/20 rounded-xl">
                            <InputField value={s.name} onChange={e => renameSemester(s.id, e.target.value)} className="flex-1" />
                            <DangerBtn onClick={() => removeSemester(s.id)} className="!p-2.5 shrink-0"><Trash2 size={14} /></DangerBtn>
                        </div>
                    ))}
                    {semesterList.length === 0 && (
                        <p className="text-xs text-muted py-4 text-center">لا توجد فصول دراسية مضافة</p>
                    )}
                </div>
            </div>

            <div className="mt-6 pt-5 border-t border-border/20 flex justify-end">
                <PrimaryBtn onClick={handleSave} loading={isSaving}>حفظ السنة الدراسية</PrimaryBtn>
            </div>
        </SectionCard>
    );
};
