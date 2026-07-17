import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, InputField, PrimaryBtn, SecondaryBtn, DangerBtn } from './SettingsUI';
import { settingsService } from '../services/settingsService';

export const AcademicYearSection = ({
    localSemesterName, setLocalSemesterName,
    localSemesters, setLocalSemesters,
    setSemesterName, setSemesters,
    showNotify,
}: {
    localSemesterName: string; setLocalSemesterName: (v: string) => void;
    localSemesters: string; setLocalSemesters: (v: string) => void;
    setSemesterName: (v: string) => void; setSemesters: (v: string) => void;
    showNotify: (msg: string) => void;
}) => {
    const [currentAcademicYear, setCurrentAcademicYear] = useState('');
    const [semesterStart, setSemesterStart] = useState('');
    const [semesterEnd, setSemesterEnd] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        settingsService.getSettingsBatch().then(data => {
            setCurrentAcademicYear(data.system.academic_year || '2024-2025');
            setSemesterStart(data.system.semester_start_date || '');
            setSemesterEnd(data.system.semester_end_date || '');
        }).catch((e) => console.warn(e));
    }, []);

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
                settingsService.saveSettingsBatch([
                    { key: 'academic_year', value: currentAcademicYear },
                    { key: 'semester_start_date', value: semesterStart },
                    { key: 'semester_end_date', value: semesterEnd },
                ]),
            ]);
            showNotify('تم حفظ السنة الدراسية');
        } catch (e) { console.error(e); alert('خطأ في الحفظ'); }
        finally { setIsSaving(false); }
    };

    return (
        <SectionCard>
            <SectionTitle icon={Calendar} label="السنة الدراسية" sub="إدارة الفصول والتقويم الدراسي" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <FieldLabel>السنة الدراسية الحالية</FieldLabel>
                    <InputField value={currentAcademicYear} onChange={e => setCurrentAcademicYear(e.target.value)} placeholder="مثال: 2024-2025" />
                </div>
                <div>
                    <FieldLabel>مسمى الفصل</FieldLabel>
                    <InputField value={localSemesterName} onChange={e => setLocalSemesterName(e.target.value)} placeholder="مثال: الفصل الدراسي" />
                </div>
                <div>
                    <FieldLabel>تاريخ بداية الفصل</FieldLabel>
                    <InputField type="date" value={semesterStart} onChange={e => setSemesterStart(e.target.value)} />
                </div>
                <div>
                    <FieldLabel>تاريخ نهاية الفصل</FieldLabel>
                    <InputField type="date" value={semesterEnd} onChange={e => setSemesterEnd(e.target.value)} />
                </div>
            </div>

            <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                    <FieldLabel>الفصول الدراسية</FieldLabel>
                    <SecondaryBtn onClick={addSemester}><Plus size={14} /> إضافة فصل</SecondaryBtn>
                </div>
                <div className="space-y-2">
                    {semesterList.map(s => (
                        <div key={s.id} className="flex items-center gap-2">
                            <InputField value={s.name} onChange={e => renameSemester(s.id, e.target.value)} className="flex-1" />
                            <DangerBtn onClick={() => removeSemester(s.id)}><Trash2 size={14} /></DangerBtn>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <PrimaryBtn onClick={handleSave} loading={isSaving}>حفظ السنة الدراسية</PrimaryBtn>
            </div>
        </SectionCard>
    );
};
