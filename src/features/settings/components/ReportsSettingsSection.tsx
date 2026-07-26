import { useState, useEffect } from 'react';
import { FileText, Image, Download } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, InputField, ToggleRow, PrimaryBtn } from './SettingsUI';
import { settingsService } from '../services/settingsService';
import { safeGet } from '../../../lib/api';

export const ReportsSettingsSection = ({ showNotify }: { showNotify: (msg: string) => void }) => {
    const [reportHeader, setReportHeader] = useState('');
    const [reportFooter, setReportFooter] = useState('');
    const [showLogo, setShowLogo] = useState(true);
    const [defaultFormat, setDefaultFormat] = useState<'pdf' | 'excel'>('pdf');
    const [pageSize, setPageSize] = useState('A4');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        settingsService.getSettingsBatch().then(data => {
            const sys = safeGet<Record<string, string>>(data, 'system') || {};
            setReportHeader(sys.report_header || '');
            setReportFooter(sys.report_footer || '');
            setShowLogo(sys.report_show_logo !== 'false');
            setDefaultFormat((sys.report_default_format as 'pdf' | 'excel') || 'pdf');
            setPageSize(sys.report_page_size || 'A4');
        }).catch((e) => console.warn(e));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await settingsService.saveSettingsBatch([
                { key: 'report_header', value: reportHeader },
                { key: 'report_footer', value: reportFooter },
                { key: 'report_show_logo', value: String(showLogo) },
                { key: 'report_default_format', value: defaultFormat },
                { key: 'report_page_size', value: pageSize },
            ]);
            showNotify('تم حفظ إعدادات التقارير');
        } catch (e) { console.error(e); alert('خطأ في الحفظ'); }
        finally { setIsSaving(false); }
    };

    return (
        <SectionCard>
            <SectionTitle icon={FileText} label="إعدادات التقارير" sub="تخصيص شكل ومحتوى التقارير" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <FieldLabel>تذييل التقرير</FieldLabel>
                    <InputField value={reportFooter} onChange={e => setReportFooter(e.target.value)} placeholder="شكراً لثقتكم" />
                </div>
                <div>
                    <FieldLabel>حجم الورق</FieldLabel>
                    <InputField value={pageSize} onChange={e => setPageSize(e.target.value)} placeholder="A4" />
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <ToggleRow icon={Image} label="عرض الشعار في التقارير" checked={showLogo} onChange={() => setShowLogo(!showLogo)} />
            </div>

            <div className="mb-6">
                <FieldLabel>الصيغة الافتراضية للتصدير</FieldLabel>
                <div className="flex gap-2 mt-1">
                    {(['pdf', 'excel'] as const).map(f => (
                        <button key={f} onClick={() => setDefaultFormat(f)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${defaultFormat === f ? 'bg-primary-soft text-primary border border-primary' : 'bg-surface text-muted border border-border hover:bg-hover'}`}>
                            <Download size={14} /> {f === 'pdf' ? 'PDF' : 'Excel'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
                <PrimaryBtn onClick={handleSave} loading={isSaving}>حفظ إعدادات التقارير</PrimaryBtn>
            </div>
        </SectionCard>
    );
};
