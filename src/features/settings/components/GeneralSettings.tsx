import { Building2, Wallet, Monitor, Lock, CheckCircle2 } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, InputField, PrimaryBtn, ToggleRow } from './SettingsUI';

interface GeneralSettingsProps {
    localAcademyName: string;
    setLocalAcademyName: (v: string) => void;
    localAcademyLogo: string;
    setLocalAcademyLogo: (v: string) => void;
    localAcademyTagline: string;
    setLocalAcademyTagline: (v: string) => void;
    localAdminPhone: string;
    setLocalAdminPhone: (v: string) => void;
    localTelegramHandle: string;
    setLocalTelegramHandle: (v: string) => void;
    maintenanceMode: boolean;
    setMaintenanceMode: (v: boolean) => Promise<void>;
    showNotify: (msg: string) => void;
    localSemesterName: string;
    setLocalSemesterName: (v: string) => void;
    localPrice: number;
    setLocalPrice: (v: number) => void;
    localTeacherPrice: number;
    setLocalTeacherPrice: (v: number) => void;
    localCurrency: string;
    setLocalCurrency: (v: string) => void;
    localThreshold: number;
    setLocalThreshold: (v: number) => void;
    localAutoFreeze: number;
    setLocalAutoFreeze: (v: number) => void;
    localBackdateLock: boolean;
    setLocalBackdateLock: (v: boolean) => void;
    setShowMaintenanceModal: (v: boolean) => void;
    handleSaveGeneral: () => void;
    isSaving: boolean;
}

export const GeneralSettings = ({
    localAcademyName, setLocalAcademyName,
    localAcademyLogo, setLocalAcademyLogo,
    localAcademyTagline, setLocalAcademyTagline,
    localAdminPhone, setLocalAdminPhone,
    localTelegramHandle, setLocalTelegramHandle,
    maintenanceMode, setMaintenanceMode,
    showNotify,
    localSemesterName, setLocalSemesterName,
    localPrice, setLocalPrice,
    localTeacherPrice, setLocalTeacherPrice,
    localCurrency, setLocalCurrency,
    localThreshold, setLocalThreshold,
    localAutoFreeze, setLocalAutoFreeze,
    localBackdateLock, setLocalBackdateLock,
    setShowMaintenanceModal,
    handleSaveGeneral, isSaving
}: GeneralSettingsProps) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard className="rounded-none">
            <SectionTitle icon={Building2} label="الهوية الأساسية" sub="Academy Identity" />
            <div className="space-y-3">
                <div>
                    <FieldLabel>اسم الأكاديمية</FieldLabel>
                    <InputField value={localAcademyName} onChange={e => setLocalAcademyName(e.target.value)} />
                </div>
                <div>
                    <FieldLabel>رابط الشعار (URL)</FieldLabel>
                    <InputField value={localAcademyLogo} onChange={e => setLocalAcademyLogo(e.target.value)} placeholder="https://..." dir="ltr" className="font-mono text-xs" />
                </div>
                <div>
                    <FieldLabel>الشعار اللفظي</FieldLabel>
                    <InputField value={localAcademyTagline} onChange={e => setLocalAcademyTagline(e.target.value)} />
                </div>
                <div>
                    <FieldLabel>رقم هاتف المسؤول</FieldLabel>
                    <InputField value={localAdminPhone} onChange={e => setLocalAdminPhone(e.target.value)} dir="ltr" className="font-mono tracking-wider" />
                </div>
                <div>
                    <FieldLabel>قناة تليجرام</FieldLabel>
                    <InputField value={localTelegramHandle} onChange={e => setLocalTelegramHandle(e.target.value)} placeholder="dareen_app" dir="ltr" className="font-mono" />
                </div>
                <ToggleRow
                    icon={Monitor}
                    label="وضع الصيانة"
                    sub="تعطيل وصول المستخدمين العاديين"
                    checked={maintenanceMode}
                    onChange={() => {
                        if (!maintenanceMode) setShowMaintenanceModal(true);
                        else setMaintenanceMode(false).then(() => showNotify('تم إيقاف وضع الصيانة'));
                    }}
                />
            </div>
        </SectionCard>

        <SectionCard className="rounded-none">
            <SectionTitle icon={Wallet} label="الإعدادات المالية والأكاديمية" sub="Financial & Academic" />
            <div className="space-y-3">
                <div>
                    <FieldLabel>تسمية الفصل الدراسي</FieldLabel>
                    <InputField value={localSemesterName} onChange={e => setLocalSemesterName(e.target.value)} placeholder="الفصل الأول 2024" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <FieldLabel>سعر الطالب</FieldLabel>
                        <InputField type="number" value={localPrice} onChange={e => setLocalPrice(Number(e.target.value))} />
                    </div>
                    <div>
                        <FieldLabel>سعر المعلم</FieldLabel>
                        <InputField type="number" value={localTeacherPrice} onChange={e => setLocalTeacherPrice(Number(e.target.value))} />
                    </div>
                    <div>
                        <FieldLabel>رمز العملة</FieldLabel>
                        <InputField value={localCurrency} onChange={e => setLocalCurrency(e.target.value)} className="text-center" />
                    </div>
                    <div>
                        <FieldLabel>تنبيه الرصيد</FieldLabel>
                        <InputField type="number" value={localThreshold} onChange={e => setLocalThreshold(Number(e.target.value))} className="text-center text-rose-600 bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <FieldLabel>عدد أيام التجميد</FieldLabel>
                        <InputField type="number" value={localAutoFreeze} onChange={e => setLocalAutoFreeze(Number(e.target.value))} />
                        <p className="text-[9px] text-slate-400 mt-1">تجميد حساب الطالب تلقائياً بعد غياب متواصل</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <ToggleRow
                            icon={Lock}
                            label="قفل التاريخ القديم"
                            sub="منع تسجيل حصص بتواريخ سابقة"
                            checked={localBackdateLock}
                            onChange={() => setLocalBackdateLock(!localBackdateLock)}
                        />
                    </div>
                </div>

                <p className="text-[10px] text-slate-400 bg-amber-50 dark:bg-amber-900/10 px-3 py-2 rounded-lg border-r-2 border-amber-400">
                    القيم تُطبَّق تلقائياً عند تسجيل طالب أو معلم جديد.
                </p>
                <PrimaryBtn onClick={handleSaveGeneral} loading={isSaving} className="w-full mt-2 rounded-none">
                    <CheckCircle2 size={14} /> حفظ الإعدادات الأساسية
                </PrimaryBtn>
            </div>
        </SectionCard>
    </div>
);
