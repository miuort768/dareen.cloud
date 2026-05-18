import { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon, Building2, AlertCircle, Users, UserPlus,
    Edit, Wallet, Trash2, Activity, Palette, Bell, Shield, Download, Upload,
    RefreshCw, CheckCircle2, Monitor, Calendar, Archive, Lock, Snowflake, Smartphone,
    Sparkles, Phone, Zap
} from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';
import { useApp } from '../context/useApp';
import { Skeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/utils';
import { settingsService } from '../features/settings/services/settingsService';

const AVAILABLE_PERMISSIONS = [
    { id: '*', label: 'وصول كامل (Admin)' },
    { id: 'view_students', label: 'عرض الطلاب' },
    { id: 'manage_students', label: 'إدارة الطلاب' },
    { id: 'view_teachers', label: 'عرض المعلمين' },
    { id: 'manage_teachers', label: 'إدارة المعلمين' },
    { id: 'view_finance', label: 'عرض المالية' },
    { id: 'manage_finance', label: 'إدارة المالية' },
    { id: 'manage_system', label: 'إدارة النظام' }
];

const THEME_COLORS = [
    { id: 'indigo', label: 'نيلي', class: 'bg-indigo-500' },
    { id: 'blue', label: 'أزرق', class: 'bg-blue-500' },
    { id: 'emerald', label: 'زمردي', class: 'bg-emerald-500' },
    { id: 'rose', label: 'وردي', class: 'bg-rose-500' },
    { id: 'amber', label: 'كهرماني', class: 'bg-amber-500' },
    { id: 'purple', label: 'أرجواني', class: 'bg-purple-500' },
    { id: 'cyan', label: 'سيان', class: 'bg-cyan-500' },
    { id: 'teal', label: 'تركواز', class: 'bg-teal-500' },
    { id: 'orange', label: 'برتقالي', class: 'bg-orange-500' },
    { id: 'slate', label: 'صخري', class: 'bg-slate-500' },
    { id: 'pink', label: 'زهري', class: 'bg-pink-500' },
    { id: 'lime', label: 'ليموني', class: 'bg-lime-500' },
    { id: 'sky', label: 'سماوي', class: 'bg-sky-500' },
    { id: 'fuchsia', label: 'فوشيا', class: 'bg-fuchsia-500' },
    { id: 'sunset', label: 'غروب', class: 'bg-gradient-to-tr from-orange-500 to-rose-500' },
    { id: 'ocean', label: 'محيط', class: 'bg-gradient-to-tr from-blue-500 to-cyan-400' },
    { id: 'forest', label: 'غابة', class: 'bg-gradient-to-tr from-emerald-500 to-lime-400' },
    { id: 'royal', label: 'ملكي', class: 'bg-gradient-to-tr from-purple-600 to-indigo-500' },
    { id: 'electric', label: 'كهربائي', class: 'bg-gradient-to-tr from-violet-500 to-fuchsia-400' },
    { id: 'berry', label: 'توت', class: 'bg-gradient-to-tr from-pink-500 to-purple-400' },
    { id: 'gold', label: 'ذهبي', class: 'bg-amber-400' },
    { id: 'crimson', label: 'قرمزي', class: 'bg-rose-600' },
    { id: 'midnight', label: 'ليلي', class: 'bg-slate-900' },
    { id: 'lava', label: 'حمم', class: 'bg-orange-600' },
    { id: 'mint', label: 'نعناع', class: 'bg-emerald-400' },
    { id: 'lavender', label: 'خزامي', class: 'bg-indigo-300' },
    { id: 'spring', label: 'ربيعي', class: 'bg-lime-400' },
    { id: 'flame', label: 'لهب', class: 'bg-orange-500' },
    { id: 'nebula', label: 'سديم', class: 'bg-gradient-to-tr from-violet-600 to-indigo-400' },
    { id: 'aurora', label: 'شفق', class: 'bg-gradient-to-tr from-emerald-400 to-cyan-400' },
    { id: 'fire', label: 'نار', class: 'bg-gradient-to-tr from-red-600 to-orange-500' },
    { id: 'ice', label: 'جليد', class: 'bg-gradient-to-tr from-sky-400 to-blue-500' },
    { id: 'jungle', label: 'أدغال', class: 'bg-gradient-to-tr from-green-600 to-emerald-400' },
    { id: 'desert', label: 'صحراء', class: 'bg-gradient-to-tr from-yellow-600 to-amber-500' },
    { id: 'coffee', label: 'قهوة', class: 'bg-stone-600' },
];

type TabId = 'general' | 'appearance' | 'users' | 'mobile' | 'policies' | 'advanced' | 'audit';

// ── Reusable sub-components ───────────────────────────────────────────────────

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-5',
        className
    )}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, label, sub }: { icon: any; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
            <Icon size={16} className="text-[#5c59f2]" />
        </div>
        <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
        {children}
    </label>
);

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={cn(
            'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
            'rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 dark:text-white',
            'focus:outline-none focus:border-[#5c59f2] focus:ring-2 focus:ring-[#5c59f2]/10 transition-all',
            props.className
        )}
    />
);

const TextAreaField = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        {...props}
        className={cn(
            'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
            'rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 dark:text-white resize-none',
            'focus:outline-none focus:border-[#5c59f2] focus:ring-2 focus:ring-[#5c59f2]/10 transition-all',
            props.className
        )}
    />
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
        onClick={onChange}
        className={cn(
            'w-11 h-6 rounded-full relative transition-all duration-300 shrink-0',
            checked ? 'bg-[#5c59f2]' : 'bg-slate-200 dark:bg-slate-700'
        )}
    >
        <div className={cn(
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300',
            checked ? 'translate-x-5' : 'translate-x-0.5'
        )} />
    </button>
);

const PrimaryBtn = ({ onClick, loading, children, className = '' }: {
    onClick?: () => void; loading?: boolean; children: React.ReactNode; className?: string
}) => (
    <button
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-[#5c59f2] hover:bg-indigo-700',
            'text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all',
            className
        )}
    >
        {loading ? <RefreshCw size={14} className="animate-spin" /> : children}
    </button>
);

const SecondaryBtn = ({ onClick, children, className = '' }: {
    onClick?: () => void; children: React.ReactNode; className?: string
}) => (
    <button
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800',
            'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300',
            'text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all',
            className
        )}
    >
        {children}
    </button>
);

const DangerBtn = ({ onClick, children, className = '' }: {
    onClick?: () => void; children: React.ReactNode; className?: string
}) => (
    <button
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-900/20',
            'hover:bg-rose-600 hover:text-white text-rose-600',
            'text-xs font-bold px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 transition-all',
            className
        )}
    >
        {children}
    </button>
);

const ToggleRow = ({
    icon: Icon, label, sub, checked, onChange
}: { icon: any; label: string; sub?: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <Icon size={14} className="text-slate-400" />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</p>
                {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
        <Toggle checked={checked} onChange={onChange} />
    </div>
);

// ── Main Settings Component ────────────────────────────────────────────────────

const Settings = () => {
    const {
        academyName, setAcademyName,
        academyLogo, setAcademyLogo,
        academyTagline, setAcademyTagline,
        adminPhone, setAdminPhone,
        themeColor, setThemeColor,
        notificationsEnabled, setNotificationsEnabled,
        maintenanceMode, setMaintenanceMode,
        whatsappAutoNotify, setWhatsappAutoNotify,
        whatsappTemplate, setWhatsappTemplate,
        defaultSessionPrice, setDefaultSessionPrice,
        defaultTeacherPrice, setDefaultTeacherPrice,
        currencySymbol, setCurrencySymbol,
        semesterName, setSemesterName,
        semesters, setSemesters,
        balanceWarningThreshold, setBalanceWarningThreshold,
        backdateLockEnabled, setBackdateLockEnabled,
        teacherCommissionType, setTeacherCommissionType,
        autoFreezeThreshold, setAutoFreezeThreshold,
        telegramHandle, setTelegramHandle,
        heroBanners, setHeroBanners,
        user, users, addUser, editUser, deleteUser
    } = useApp();

    const [activeTab, setActiveTab] = useState<TabId>('general');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    const [localAcademyName, setLocalAcademyName] = useState(academyName);
    const [localAcademyLogo, setLocalAcademyLogo] = useState(academyLogo);
    const [localAcademyTagline, setLocalAcademyTagline] = useState(academyTagline);
    const [localAdminPhone, setLocalAdminPhone] = useState(adminPhone);
    const [localSemesterName, setLocalSemesterName] = useState(semesterName);
    const [localSemesters, setLocalSemesters] = useState(semesters);
    const [localWhatsappTemplate, setLocalWhatsappTemplate] = useState(whatsappTemplate);
    const [localTelegramHandle, setLocalTelegramHandle] = useState(telegramHandle);
    
    // Parse the heroBanners string into an array, or fallback to defaults
    const [localHeroBanners, setLocalHeroBanners] = useState<string[]>(() => {
        try {
            return JSON.parse(heroBanners);
        } catch {
            return ["", "", "", ""];
        }
    });

    const [localPrice, setLocalPrice] = useState(defaultSessionPrice);
    const [localTeacherPrice, setLocalTeacherPrice] = useState(defaultTeacherPrice);
    const [localCurrency, setLocalCurrency] = useState(currencySymbol);
    const [localThreshold, setLocalThreshold] = useState(balanceWarningThreshold);
    const [localBackdateLock, setLocalBackdateLock] = useState(backdateLockEnabled);
    const [localAutoFreeze, setLocalAutoFreeze] = useState(autoFreezeThreshold);

    const [newUser, setNewUser] = useState({ username: '', password: '', permissions: [] as string[] });
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<any>(null);
    const [secureAction, setSecureAction] = useState<{
        type: 'reset' | 'archive'; title: string; description: string;
        confirmWord: string; actionFn: () => void
    } | null>(null);
    const [secureInput, setSecureInput] = useState('');
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    
    // Mobile Specific Settings
    const [hapticEnabled, setHapticEnabled] = useState(() => localStorage.getItem('haptic_enabled') !== 'false'); // Default true

    const handleExportBackup = async () => {
        setIsSaving(true);
        try {
            const backupData = await settingsService.getBackup();
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `darin_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            showNotify('تم تحميل النسخة الاحتياطية بنجاح');
        } catch (e: any) {
            alert('فشل تصدير البيانات: ' + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm('⚠️ تحذير: استيراد البيانات سيؤدي إلى استبدال كافة البيانات الحالية بالبيانات الموجودة في الملف. هل أنت متأكد؟')) {
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            setIsSaving(true);
            try {
                const content = event.target?.result as string;
                const backupData = JSON.parse(content);
                
                await settingsService.restoreBackup(backupData);
                
                showNotify('تم استيراد البيانات بنجاح! سيتم تحديث الصفحة...');
                setTimeout(() => window.location.reload(), 2000);
            } catch (e: any) {
                console.error('Import Error:', e);
                alert(`⚠️ عذراً: فشل الاستيراد - ${e.message}`);
            } finally {
                setIsSaving(false);
                if (e.target) e.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const triggerReset = () => {
        setSecureAction({
            type: 'reset',
            title: 'تصفير كافة الحسابات والبيانات',
            description: 'هذا الإجراء سيقوم بحذف كافة السجلات المالية وحصص الطلاب والمعلمين وتصفير الأرصدة. لا يمكن التراجع عن هذا الإجراء.',
            confirmWord: 'RESET-ALL-DATA',
            actionFn: async () => {
                setIsSaving(true);
                try {
                    await settingsService.systemReset();
                    showNotify('تم تصفير النظام بنجاح');
                    window.location.reload();
                } catch (e: any) { alert(e.message); }
                finally { setIsSaving(false); }
            }
        });
    };

    const triggerArchive = () => {
        setSecureAction({
            type: 'archive',
            title: 'أرشفة بيانات الموسم الحالي',
            description: 'سيتم نقل كافة السجلات الحالية إلى الأرشيف التاريخي وبدء موسم جديد ببيانات نظيفة.',
            confirmWord: 'ARCHIVE-NOW',
            actionFn: async () => {
                setIsSaving(true);
                try {
                    await settingsService.archiveMonth();
                    showNotify('تمت الأرشفة بنجاح');
                } catch (e: any) { alert(e.message); }
                finally { setIsSaving(false); }
            }
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
            if (activeTab === 'audit') fetchLogs();
        }, 300);
        return () => clearTimeout(timer);
    }, [activeTab]);

    useEffect(() => {
        setLocalAcademyName(academyName);
        setLocalAcademyLogo(academyLogo);
        setLocalAcademyTagline(academyTagline);
        setLocalAdminPhone(adminPhone);
        setLocalSemesterName(semesterName);
        setLocalSemesters(semesters);
        setLocalPrice(defaultSessionPrice);
        setLocalTeacherPrice(defaultTeacherPrice);
        setLocalCurrency(currencySymbol);
        setLocalThreshold(balanceWarningThreshold);
        setLocalTelegramHandle(telegramHandle);
        setLocalBackdateLock(backdateLockEnabled);
        setLocalAutoFreeze(autoFreezeThreshold);
    }, [
        academyName, academyLogo, academyTagline, adminPhone, 
        semesterName, semesters, defaultSessionPrice, 
        defaultTeacherPrice, currencySymbol, balanceWarningThreshold,
        telegramHandle, backdateLockEnabled, autoFreezeThreshold
    ]);



    useEffect(() => {
        try {
            setLocalHeroBanners(JSON.parse(heroBanners));
        } catch {
            // keep existing if parse fails
        }
    }, [heroBanners]);

    const fetchLogs = async () => {
        try {
            const logs = await settingsService.getAuditLogs();
            setAuditLogs(logs || []);
        } catch (e) { console.error(e); }
    };

    const showNotify = (msg: string) => {
        setNotificationMessage(msg);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleSaveGeneral = async () => {
        setIsSaving(true);
        try {
            await Promise.all([
                setAcademyName(localAcademyName),
                setAcademyLogo(localAcademyLogo),
                setAcademyTagline(localAcademyTagline),
                setAdminPhone(localAdminPhone),
                setSemesterName(localSemesterName),
                setTelegramHandle(localTelegramHandle),
                setDefaultSessionPrice(Number(localPrice)),
                setDefaultTeacherPrice(Number(localTeacherPrice)),
                setCurrencySymbol(localCurrency),
                setBalanceWarningThreshold(Number(localThreshold)),
                setBackdateLockEnabled(localBackdateLock),
                setAutoFreezeThreshold(Number(localAutoFreeze))
            ]);
            showNotify('تم حفظ الإعدادات بنجاح');
        } catch (e) { alert('خطأ في الحفظ'); }
        finally { setIsSaving(false); }
    };

    const handleUserAction = () => {
        if (!newUser.username) return;
        if (editingUserId) {
            editUser(editingUserId, { username: newUser.username, name: newUser.username, permissions: newUser.permissions, password: newUser.password || undefined });
            setEditingUserId(null);
        } else {
            addUser({ ...newUser, name: newUser.username, role: 'admin' });
        }
        setNewUser({ username: '', password: '', permissions: [] });
    };

    const TABS: { id: TabId; label: string; icon: any }[] = [
        { id: 'general', label: 'الإعدادات', icon: SettingsIcon },
        { id: 'appearance', label: 'الهوية', icon: Palette },
        { id: 'users', label: 'المستخدمون', icon: Users },
        { id: 'mobile', label: 'الموبايل', icon: Smartphone },
        { id: 'policies', label: 'السياسات', icon: Lock },
        { id: 'advanced', label: 'الأرشيف', icon: Shield },
        { id: 'audit', label: 'السجلات', icon: Activity },
    ];

    if (loading) return (
        <div className="p-4 space-y-3">
            <Skeleton className="h-14 rounded-2xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
        </div>
    );

    return (
        <div className="space-y-4 pb-20 min-h-full bg-[#f1f5f9] dark:bg-[#020617] md:animate-in md:fade-in md:duration-700 font-sans" dir="rtl">

            {/* ── Header ── */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-0 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.3)] shrink-0 bg-white/5 backdrop-blur-md">
                        <img src="/chat-avatar.jpg" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-800 dark:text-white">إعدادات النظام</h1>
                        <p className="text-[10px] text-slate-400">إدارة السياسات والهوية والصلاحيات</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Sparkles size={12} className="text-amber-400" />
                    {activeTab && TABS.find(t => t.id === activeTab)?.label}
                </div>
            </div>

            {/* ── Tab Navigation ── */}
            <div className="px-0 md:px-0">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none p-2 shadow-sm">
                    <div className="flex overflow-x-auto no-scrollbar gap-2 px-0">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-black whitespace-nowrap transition-all uppercase tracking-tight',
                                    activeTab === tab.id
                                        ? 'bg-[#5c59f2] text-white shadow-md transform scale-105 z-10'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50'
                                )}
                            >
                                <tab.icon size={15} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div className="px-0 md:animate-in md:fade-in md:slide-in-from-bottom-2 md:duration-400">

                {/* ── GENERAL ── */}
                {activeTab === 'general' && (
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
                )}

                {/* ── MOBILE SETTINGS ── */}
                {activeTab === 'mobile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SectionCard className="rounded-none">
                            <SectionTitle icon={Smartphone} label="تخصيص تجربة الموبايل" sub="Mobile App Experience" />
                            <div className="space-y-4">
                                <ToggleRow
                                    icon={Zap}
                                    label="الاهتزاز التفاعلي (Haptics)"
                                    sub="ردود فعل لمسية عند الضغط على الأزرار"
                                    checked={hapticEnabled}
                                    onChange={() => {
                                        const newVal = !hapticEnabled;
                                        setHapticEnabled(newVal);
                                        localStorage.setItem('haptic_enabled', String(newVal));
                                        if (newVal) triggerHaptic('light');
                                        showNotify(newVal ? 'تم تفعيل الاهتزاز' : 'تم إيقاف الاهتزاز');
                                    }}
                                />

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-r-4 border-blue-500 rounded-none">
                                    <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 mb-1">لماذا تستخدم هذه المميزات؟</h4>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed">
                                        تفعيل الاهتزاز يجعل التطبيق يشعر وكأنه جزء أصيل من هاتفك، مما يزيد من سهولة الاستخدام اليومي.
                                    </p>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard className="rounded-none border-dashed border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Smartphone size={32} className="text-slate-400" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">إصدار التطبيق</h4>
                            <p className="text-xs text-slate-500 mb-4">V 2.1.0 (Darin Seven Edition)</p>
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                                التحقق من وجود تحديثات
                            </button>
                        </SectionCard>
                    </div>
                )}

                {/* ── APPEARANCE ── */}
                {activeTab === 'appearance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SectionCard>
                            <SectionTitle icon={Building2} label="معاينة هوية المنصة" sub="Identity & Branding" />
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 flex flex-col items-center text-center border border-dashed border-slate-200 dark:border-slate-700 mb-4">
                                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center mb-3 overflow-hidden">
                                    {academyLogo
                                        ? <img src={academyLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                                        : <Monitor size={28} className="text-slate-300" />}
                                </div>
                                <p className="font-bold text-sm text-slate-800 dark:text-white">{academyName}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{academyTagline}</p>
                            </div>
                            <ToggleRow
                                icon={Bell}
                                label="الإشعارات المكتبية"
                                sub="Desktop Push Notifications"
                                checked={notificationsEnabled}
                                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                            />
                        </SectionCard>

                        <SectionCard>
                            <SectionTitle icon={Palette} label="لوحة الألوان والسمات" sub="Theme Palette" />
                            <p className="text-[10px] text-slate-400 mb-3 flex items-center gap-1.5">
                                <Sparkles size={11} className="text-amber-400" /> اختر اللون المميز للنظام
                            </p>
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {THEME_COLORS.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setThemeColor(c.id)}
                                        title={c.label}
                                        className={cn(
                                            'w-8 h-8 rounded-lg transition-all relative mx-auto',
                                            c.class,
                                            themeColor === c.id
                                                ? 'ring-2 ring-offset-2 ring-[#5c59f2] scale-110'
                                                : 'hover:scale-110 opacity-70 hover:opacity-100'
                                        )}
                                    >
                                        {themeColor === c.id && (
                                            <CheckCircle2 size={12} className="absolute inset-0 m-auto text-white drop-shadow" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard className="lg:col-span-2">
                            <SectionTitle icon={Sparkles} label="إعدادات بطاقات الرئيسية" sub="Home Page Banners" />
                            <p className="text-[10px] text-slate-400 mb-4">
                                قم بتعديل الجمل الأربع التي تظهر في أسفل القسم الرئيسي بالصفحة العامة (الهيرو).
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                {localHeroBanners.map((banner, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <FieldLabel>البطاقة {idx + 1}</FieldLabel>
                                        <InputField 
                                            value={banner}
                                            onChange={(e) => {
                                                const newBanners = [...localHeroBanners];
                                                newBanners[idx] = e.target.value;
                                                setLocalHeroBanners(newBanners);
                                            }}
                                            placeholder={`جملة البطاقة ${idx + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <PrimaryBtn
                                loading={isSaving}
                                onClick={async () => {
                                    setIsSaving(true);
                                    try {
                                        await setHeroBanners(JSON.stringify(localHeroBanners));
                                        showNotify('تم حفظ البطاقات بنجاح');
                                    } catch(e) {
                                        alert('خطأ في الحفظ');
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                            >
                                <CheckCircle2 size={14} /> حفظ البطاقات
                            </PrimaryBtn>
                        </SectionCard>

                        <SectionCard className="lg:col-span-2">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                                        <Shield size={16} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">إدارة الأمان والنسخ الاحتياطي</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">System Restore Point</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                    <input
                                        type="file"
                                        id="import-backup"
                                        className="hidden"
                                        accept=".json,.sql"
                                        onChange={handleImportBackup}
                                    />
                                    <SecondaryBtn onClick={handleExportBackup} className="flex-1 md:flex-none">
                                        <Download size={14} className="text-blue-500" /> تحميل نسخة احتياطية
                                    </SecondaryBtn>
                                    <SecondaryBtn onClick={() => document.getElementById('import-backup')?.click()} className="flex-1 md:flex-none">
                                        <Upload size={14} className="text-emerald-500" /> استيراد بيانات
                                    </SecondaryBtn>
                                    <button 
                                        onClick={triggerReset}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-black px-4 py-2.5 rounded-xl border border-rose-100 transition-all uppercase tracking-tight"
                                    >
                                        <RefreshCw size={14} /> تصفير النظام
                                    </button>
                                    <button 
                                        onClick={triggerArchive}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-600 text-[10px] font-black px-4 py-2.5 rounded-xl border border-amber-100 transition-all uppercase tracking-tight"
                                    >
                                        <Archive size={14} /> أرشفة الموسم
                                    </button>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                )}

                {/* ── MOBILE SETTINGS ── */}
                {activeTab === 'mobile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SectionCard className="rounded-none">
                            <SectionTitle icon={Smartphone} label="تخصيص تجربة الموبايل" sub="Mobile App Experience" />
                            <div className="space-y-4">
                                <ToggleRow
                                    icon={Zap}
                                    label="الاهتزاز التفاعلي (Haptics)"
                                    sub="ردود فعل لمسية عند الضغط على الأزرار"
                                    checked={hapticEnabled}
                                    onChange={() => {
                                        const newVal = !hapticEnabled;
                                        setHapticEnabled(newVal);
                                        localStorage.setItem('haptic_enabled', String(newVal));
                                        if (newVal) triggerHaptic('light');
                                        showNotify(newVal ? 'تم تفعيل الاهتزاز' : 'تم إيقاف الاهتزاز');
                                    }}
                                />

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-r-4 border-blue-500 rounded-none">
                                    <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 mb-1">لماذا تستخدم هذه المميزات؟</h4>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed">
                                        تفعيل الاهتزاز يجعل التطبيق يشعر وكأنه جزء أصيل من هاتفك، مما يزيد من سهولة الاستخدام اليومي.
                                    </p>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard className="rounded-none border-dashed border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Smartphone size={32} className="text-slate-400" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">إصدار التطبيق</h4>
                            <p className="text-xs text-slate-500 mb-4">V 2.1.0 (Darin Seven Edition)</p>
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                                التحقق من وجود تحديثات
                            </button>
                        </SectionCard>
                    </div>
                )}



                {/* ── USERS ── */}
                {activeTab === 'users' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        <div className="xl:col-span-2 space-y-3">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                        <Users size={16} className="text-[#5c59f2]" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">الحسابات والمسؤولون</p>
                                </div>
                                <span className="text-[10px] font-bold text-[#5c59f2] bg-[#eef2ff] dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg">
                                    {users.length} حسابات
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {users.map(u => (
                                    <div key={u.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm group hover:border-[#5c59f2]/30 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-10 h-10 bg-[#5c59f2] text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                                {u.username[0].toUpperCase()}
                                            </div>
                                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setEditingUserId(u.id); setNewUser({ username: u.username, password: '', permissions: u.permissions || [] }); }}
                                                    className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-[#5c59f2] hover:border-[#5c59f2]/30 transition-all"
                                                >
                                                    <Edit size={13} />
                                                </button>
                                                {u.id !== user?.id && (
                                                    <button
                                                        onClick={() => setShowDeleteModal(u)}
                                                        className="p-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-400 rounded-lg border border-rose-100 dark:border-rose-800 hover:text-rose-600 transition-all"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{u.name || u.username}</p>
                                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                                            <Shield size={10} className="text-[#5c59f2]" />
                                            {u.permissions?.includes('*') ? 'Admin كامل' : `${u.permissions?.length || 0} صلاحيات`}
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                                            {u.permissions?.slice(0, 3).map(p => (
                                                <span key={p} className="text-[9px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">
                                                    {p}
                                                </span>
                                            ))}
                                            {(u.permissions?.length || 0) > 3 && (
                                                <span className="text-[9px] font-bold bg-[#eef2ff] dark:bg-indigo-900/30 text-[#5c59f2] px-1.5 py-0.5 rounded-md">
                                                    +{(u.permissions?.length || 0) - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <SectionCard className="h-fit xl:sticky top-4">
                            <SectionTitle
                                icon={editingUserId ? Edit : UserPlus}
                                label={editingUserId ? 'تعديل المسؤول' : 'إضافة حساب جديد'}
                                sub="User Management"
                            />
                            <div className="space-y-3">
                                <div>
                                    <FieldLabel>اسم الدخول</FieldLabel>
                                    <InputField
                                        value={newUser.username}
                                        onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                        placeholder="admin_username"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>الرقم السري</FieldLabel>
                                    <InputField
                                        type="password"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-[#5c59f2] flex items-center gap-1.5 mb-2">
                                        <Shield size={11} /> قوالب صلاحيات سريعة
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {[
                                            { label: 'مدير نظام', perms: ['*'] },
                                            { label: 'محاسب', perms: ['view_finance', 'manage_finance'] },
                                            { label: 'مشرف', perms: ['view_students', 'manage_students', 'view_teachers'] },
                                        ].map(role => (
                                            <button
                                                key={role.label}
                                                onClick={() => setNewUser({ ...newUser, permissions: role.perms })}
                                                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-[#eef2ff] dark:hover:bg-indigo-900/30 hover:text-[#5c59f2] text-slate-500 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-all"
                                            >
                                                {role.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mb-2">تخصيص يدوي</p>
                                    <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                        {AVAILABLE_PERMISSIONS.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    const perms = newUser.permissions.includes(p.id)
                                                        ? newUser.permissions.filter(x => x !== p.id)
                                                        : [...newUser.permissions, p.id];
                                                    setNewUser({ ...newUser, permissions: perms });
                                                }}
                                                className={cn(
                                                    'p-2 text-[9px] font-bold rounded-lg border text-right transition-all',
                                                    newUser.permissions.includes(p.id)
                                                        ? 'bg-[#5c59f2] text-white border-[#5c59f2]'
                                                        : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-[#5c59f2]/30'
                                                )}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-2">
                                    <PrimaryBtn onClick={handleUserAction} className="w-full">
                                        {editingUserId ? <><RefreshCw size={13} /> تحديث الحساب</> : <><UserPlus size={13} /> إنشاء حساب</>}
                                    </PrimaryBtn>
                                    {editingUserId && (
                                        <SecondaryBtn onClick={() => { setEditingUserId(null); setNewUser({ username: '', password: '', permissions: [] }); }} className="w-full">
                                            إلغاء التعديل
                                        </SecondaryBtn>
                                    )}
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                )}

                {/* ── MOBILE SETTINGS ── */}
                {activeTab === 'mobile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SectionCard className="rounded-none">
                            <SectionTitle icon={Smartphone} label="تخصيص تجربة الموبايل" sub="Mobile App Experience" />
                            <div className="space-y-4">
                                <ToggleRow
                                    icon={Zap}
                                    label="الاهتزاز التفاعلي (Haptics)"
                                    sub="ردود فعل لمسية عند الضغط على الأزرار"
                                    checked={hapticEnabled}
                                    onChange={() => {
                                        const newVal = !hapticEnabled;
                                        setHapticEnabled(newVal);
                                        localStorage.setItem('haptic_enabled', String(newVal));
                                        if (newVal) triggerHaptic('light');
                                        showNotify(newVal ? 'تم تفعيل الاهتزاز' : 'تم إيقاف الاهتزاز');
                                    }}
                                />

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-r-4 border-blue-500 rounded-none">
                                    <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 mb-1">لماذا تستخدم هذه المميزات؟</h4>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed">
                                        تفعيل الاهتزاز يجعل التطبيق يشعر وكأنه جزء أصيل من هاتفك، مما يزيد من سهولة الاستخدام اليومي.
                                    </p>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard className="rounded-none border-dashed border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Smartphone size={32} className="text-slate-400" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">إصدار التطبيق</h4>
                            <p className="text-xs text-slate-500 mb-4">V 2.1.0 (Darin Seven Edition)</p>
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                                التحقق من وجود تحديثات
                            </button>
                        </SectionCard>
                    </div>
                )}

                {/* ── POLICIES ── */}
                {activeTab === 'policies' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SectionCard>
                            <SectionTitle icon={Lock} label="حماية السجلات والقيود" sub="System Safeguards" />
                            <div className="space-y-3">
                                <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
                                                <AlertCircle size={13} /> قفل التعديل بأثر رجعي
                                            </p>
                                            <p className="text-[10px] text-rose-500 mt-1.5 leading-relaxed">
                                                يمنع الموظفين من إضافة أو تعديل حصص في تواريخ قديمة لضمان دقة السجلات المالية.
                                            </p>
                                        </div>
                                        <Toggle
                                            checked={backdateLockEnabled}
                                            onChange={() => setBackdateLockEnabled(!backdateLockEnabled).then(() => showNotify('تم تحديث خيار الحماية'))}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-[11px] font-bold text-[#5c59f2] flex items-center gap-1.5 mb-3">
                                        <Wallet size={13} /> سياسة حساب العمولات
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'fixed', label: 'مبلغ ثابت', sub: 'Fixed Amount' },
                                            { id: 'percentage', label: 'نسبة مئوية', sub: 'Percentage %' }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setTeacherCommissionType(opt.id as any).then(() => showNotify(`الحساب: ${opt.label}`))}
                                                className={cn(
                                                    'p-3 rounded-xl border text-right transition-all',
                                                    teacherCommissionType === opt.id
                                                        ? 'bg-[#5c59f2] text-white border-[#5c59f2] shadow-sm'
                                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-[#5c59f2]/30'
                                                )}
                                            >
                                                <p className="text-xs font-bold">{opt.label}</p>
                                                <p className={cn('text-[9px] mt-0.5', teacherCommissionType === opt.id ? 'text-white/60' : 'text-slate-400')}>{opt.sub}</p>
                                                {teacherCommissionType === opt.id && <CheckCircle2 size={12} className="mt-1 text-white/80" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard>
                            <SectionTitle icon={Snowflake} label="سياسة الحضور والغياب" sub="Auto-Freeze Mechanism" />
                            <div className="space-y-3">
                                <div className="p-4 bg-sky-50 dark:bg-sky-900/10 rounded-xl border border-sky-100 dark:border-sky-900">
                                    <p className="text-xs font-bold text-sky-800 dark:text-sky-200 mb-1">حد الغياب المسموح</p>
                                    <p className="text-[10px] text-sky-500 leading-relaxed mb-3">
                                        إذا تجاوز الطالب هذا العدد من مرات الغياب المتعاقبة، يتم تجميد اشتراكه تلقائياً.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <InputField
                                            type="number"
                                            value={autoFreezeThreshold}
                                            onChange={e => setAutoFreezeThreshold(Number(e.target.value))}
                                            min={1} max={15}
                                            className="w-20 text-center font-bold text-lg"
                                        />
                                        <PrimaryBtn
                                            onClick={() => setAutoFreezeThreshold(autoFreezeThreshold).then(() => showNotify('تم حفظ السياسة'))}
                                            className="flex-1"
                                        >
                                            <CheckCircle2 size={13} /> تفعيل
                                        </PrimaryBtn>
                                    </div>
                                </div>

                                <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-200 dark:border-rose-800">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center">
                                            <Archive size={14} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-rose-700 dark:text-rose-300">إقفال الشهر المالي</p>
                                            <p className="text-[9px] text-rose-400">Danger Zone</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                                        أرشفة كافة الحصص الحالية وتصفير الإحصائيات الشهرية. لا تستخدم هذا إلا بنهاية الشهر الفعلي.
                                    </p>
                                    <DangerBtn
                                        className="w-full"
                                        onClick={() => setSecureAction({
                                            type: 'archive',
                                            title: 'إقفال الشهر المالي',
                                            description: 'سيتم أرشفة الإحصائيات الحالية لبدء فترة مالية جديدة. لا يمكن التراجع بسهولة.',
                                            confirmWord: 'إقفال الشهر',
                                            actionFn: () => settingsService.archiveMonth().then(() => {
                                                showNotify('تم تجميد وأرشفة بيانات الشهر المالي!');
                                                setTimeout(() => window.location.reload(), 2000);
                                            }).catch(() => alert('حدث خطأ أثناء إقفال الشهر!'))
                                        })}
                                    >
                                        <Lock size={13} /> إقفال الفترة الحالية
                                    </DangerBtn>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                )}

                {/* ── MOBILE SETTINGS ── */}
                {activeTab === 'mobile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SectionCard className="rounded-none">
                            <SectionTitle icon={Smartphone} label="تخصيص تجربة الموبايل" sub="Mobile App Experience" />
                            <div className="space-y-4">
                                <ToggleRow
                                    icon={Zap}
                                    label="الاهتزاز التفاعلي (Haptics)"
                                    sub="ردود فعل لمسية عند الضغط على الأزرار"
                                    checked={hapticEnabled}
                                    onChange={() => {
                                        const newVal = !hapticEnabled;
                                        setHapticEnabled(newVal);
                                        localStorage.setItem('haptic_enabled', String(newVal));
                                        if (newVal) triggerHaptic('light');
                                        showNotify(newVal ? 'تم تفعيل الاهتزاز' : 'تم إيقاف الاهتزاز');
                                    }}
                                />

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-r-4 border-blue-500 rounded-none">
                                    <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 mb-1">لماذا تستخدم هذه المميزات؟</h4>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed">
                                        تفعيل الاهتزاز يجعل التطبيق يشعر وكأنه جزء أصيل من هاتفك، مما يزيد من سهولة الاستخدام اليومي.
                                    </p>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard className="rounded-none border-dashed border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Smartphone size={32} className="text-slate-400" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">إصدار التطبيق</h4>
                            <p className="text-xs text-slate-500 mb-4">V 2.1.0 (Darin Seven Edition)</p>
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                                التحقق من وجود تحديثات
                            </button>
                        </SectionCard>
                    </div>
                )}

                {/* ── ADVANCED ── */}
                {activeTab === 'advanced' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SectionCard>
                            <SectionTitle icon={Phone} label="أتمتة الواتساب والرسائل" sub="WhatsApp Automation" />
                            <div className="space-y-3">
                                <ToggleRow
                                    icon={Bell}
                                    label="إرسال الفواتير تلقائياً"
                                    sub="Automatic Notifications"
                                    checked={whatsappAutoNotify}
                                    onChange={() => setWhatsappAutoNotify(!whatsappAutoNotify)}
                                />
                                <div>
                                    <FieldLabel>قالب رسالة الحضور</FieldLabel>
                                    <TextAreaField
                                        value={localWhatsappTemplate}
                                        onChange={e => setLocalWhatsappTemplate(e.target.value)}
                                        rows={5}
                                        placeholder="اكتب رسالتك هنا..."
                                    />
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {['{Student}', '{Subject}', '{Date}', '{Teacher}', '{Price}'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setLocalWhatsappTemplate(prev => prev + ' ' + tag)}
                                            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-[#eef2ff] dark:hover:bg-indigo-900/30 hover:text-[#5c59f2] text-slate-500 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-all font-mono"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <PrimaryBtn
                                    className="w-full"
                                    onClick={() => setWhatsappTemplate(localWhatsappTemplate).then(() => showNotify('تم حفظ القالب'))}
                                >
                                    <CheckCircle2 size={13} /> حفظ وتفعيل القالب
                                </PrimaryBtn>
                            </div>
                        </SectionCard>

                        <SectionCard>
                            <SectionTitle icon={Calendar} label="إدارة الفصول والأرشيف" sub="Academic Ledger" />
                            <div className="space-y-3">
                                <div>
                                    <FieldLabel>الفصل الحالي</FieldLabel>
                                    <InputField value={localSemesterName} onChange={e => setLocalSemesterName(e.target.value)} placeholder="الفصل الأول 2024" />
                                </div>
                                <div>
                                    <FieldLabel>الأرشيف التاريخي</FieldLabel>
                                    <TextAreaField
                                        value={localSemesters}
                                        onChange={e => setLocalSemesters(e.target.value)}
                                        rows={4}
                                        placeholder="الأرشيف التاريخي..."
                                    />
                                </div>
                                <PrimaryBtn
                                    className="w-full"
                                    onClick={() => Promise.all([setSemesterName(localSemesterName), setSemesters(localSemesters)]).then(() => showNotify('تم تحديث الأرشيف'))}
                                >
                                    <RefreshCw size={13} /> مزامنة الفصول
                                </PrimaryBtn>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <DangerBtn
                                    className="w-full"
                                    onClick={() => setSecureAction({
                                        type: 'reset',
                                        title: 'تصفير النظام بالكامل',
                                        description: 'سيتم مسح جميع البيانات المتعلقة بالطلاب والمعلمين والإيرادات للبدء من جديد. هذا الإجراء نهائي.',
                                        confirmWord: 'إعادة ضبط المنصة',
                                        actionFn: () => settingsService.systemReset().then(() => { localStorage.clear(); window.location.reload(); })
                                    })}
                                >
                                    <Trash2 size={13} /> إعادة ضبط المصنع (Factory Reset)
                                </DangerBtn>
                            </div>
                        </SectionCard>
                    </div>
                )}

                {/* ── MOBILE SETTINGS ── */}
                {activeTab === 'mobile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SectionCard className="rounded-none">
                            <SectionTitle icon={Smartphone} label="تخصيص تجربة الموبايل" sub="Mobile App Experience" />
                            <div className="space-y-4">
                                <ToggleRow
                                    icon={Zap}
                                    label="الاهتزاز التفاعلي (Haptics)"
                                    sub="ردود فعل لمسية عند الضغط على الأزرار"
                                    checked={hapticEnabled}
                                    onChange={() => {
                                        const newVal = !hapticEnabled;
                                        setHapticEnabled(newVal);
                                        localStorage.setItem('haptic_enabled', String(newVal));
                                        if (newVal) triggerHaptic('light');
                                        showNotify(newVal ? 'تم تفعيل الاهتزاز' : 'تم إيقاف الاهتزاز');
                                    }}
                                />

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-r-4 border-blue-500 rounded-none">
                                    <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 mb-1">لماذا تستخدم هذه المميزات؟</h4>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed">
                                        تفعيل الاهتزاز يجعل التطبيق يشعر وكأنه جزء أصيل من هاتفك، مما يزيد من سهولة الاستخدام اليومي.
                                    </p>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard className="rounded-none border-dashed border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Smartphone size={32} className="text-slate-400" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">إصدار التطبيق</h4>
                            <p className="text-xs text-slate-500 mb-4">V 2.1.0 (Darin Seven Edition)</p>
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                                التحقق من وجود تحديثات
                            </button>
                        </SectionCard>
                    </div>
                )}

                {/* ── AUDIT ── */}
                {activeTab === 'audit' && (
                    <SectionCard>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
                                    <Activity size={16} className="text-[#5c59f2]" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">سجل الرقابة</p>
                                    <p className="text-[10px] text-slate-400">Global Activity Audit Log</p>
                                </div>
                            </div>
                            <SecondaryBtn onClick={fetchLogs}>
                                <RefreshCw size={13} /> تحديث
                            </SecondaryBtn>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                            <table className="w-full text-right text-sm">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">التوقيت</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">المسؤول</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">الإجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {auditLogs.length > 0 ? auditLogs.map((log, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-4 py-3 font-mono text-[10px] text-slate-400" dir="ltr">
                                                {new Date(log.timestamp).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-[#eef2ff] dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-[10px] font-bold text-[#5c59f2]">
                                                        {log.username?.[0]?.toUpperCase() || 'A'}
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{log.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-[#5c59f2] rounded-full" />
                                                    <span className="text-xs text-slate-600 dark:text-slate-300">{log.action}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="py-16 text-center">
                                                <CheckCircle2 className="mx-auto mb-2 text-emerald-400" size={24} />
                                                <p className="text-sm font-bold text-slate-400">لا توجد سجلات</p>
                                                <p className="text-[10px] text-slate-300 mt-1">No activity recorded</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between mt-3 px-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                                Monitor Active
                            </div>
                            <span className="text-[10px] text-slate-300">{auditLogs.length} سجل</span>
                        </div>
                    </SectionCard>
                )}
            </div>

            {/* ── Secure Action Modal ── */}
            {secureAction && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-rose-100 dark:border-rose-900">
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-500 mb-1">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-white">{secureAction.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{secureAction.description}</p>

                            <div className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3 text-right mt-2">
                                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">اكتب للتأكيد:</p>
                                <div className="text-center font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 py-1.5 rounded-lg text-xs select-all border border-rose-100 dark:border-rose-800">
                                    {secureAction.confirmWord}
                                </div>
                                <InputField
                                    value={secureInput}
                                    onChange={e => setSecureInput(e.target.value)}
                                    placeholder="اكتب العبارة للتحقق..."
                                    className="text-center"
                                />
                            </div>

                            <div className="flex gap-2 w-full pt-2">
                                <SecondaryBtn onClick={() => { setSecureAction(null); setSecureInput(''); }} className="flex-1">
                                    تراجع
                                </SecondaryBtn>
                                <button
                                    disabled={secureInput !== secureAction.confirmWord}
                                    onClick={() => { secureAction.actionFn(); setSecureAction(null); setSecureInput(''); }}
                                    className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    تنفيذ نهائي
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete User Modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center">
                                <Trash2 size={18} className="text-rose-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">تأكيد حذف المستخدم</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">هذا الإجراء نهائي</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                            هل أنت متأكد من حذف "<span className="font-bold text-slate-700 dark:text-slate-200">{showDeleteModal.username}</span>"؟
                        </p>
                        <div className="flex gap-2">
                            <SecondaryBtn onClick={() => setShowDeleteModal(null)} className="flex-1">إلغاء</SecondaryBtn>
                            <button
                                onClick={() => { deleteUser(showDeleteModal.id); setShowDeleteModal(null); showNotify('تم حذف المستخدم'); }}
                                className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all"
                            >
                                تأكيد الحذف
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showMaintenanceModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/40 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-none border-4 border-amber-500 max-w-md w-full shadow-[12px_12px_0px_rgba(245,158,11,0.2)] p-0 overflow-hidden">
                        <div className="bg-amber-500 p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white mb-3">
                                <Snowflake size={32} className="animate-spin-slow" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">وضع الصيانة الشامل</h3>
                            <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-1">System Freeze Protocol</p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0 border border-amber-200 dark:border-amber-800">
                                        <Lock size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase">تعطيل الدخول</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">سيتم منع كافة الطلاب والمعلمين من تسجيل الدخول فوراً.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-9 h-9 bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 shrink-0 border border-rose-200 dark:border-rose-800">
                                        <Activity size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase">إنهاء الجلسات</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">سيتم تسجيل خروج كافة المستخدمين المتصلين حالياً.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowMaintenanceModal(false)}
                                    className="flex-1 py-3 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    إلغاء الأمر
                                </button>
                                <button
                                    onClick={() => {
                                        setMaintenanceMode(true).then(() => {
                                            setShowMaintenanceModal(false);
                                            showNotify('تم تفعيل وضع الصيانة بنجاح');
                                        });
                                    }}
                                    className="flex-1 py-3 bg-amber-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-[4px_4px_0px_#b45309]"
                                >
                                    تأكيد التجميد
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Success Toast ── */}
            {showSuccess && (
                <div className="fixed bottom-6 left-6 z-[2000] flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-xl animate-in slide-in-from-bottom-4 duration-300">
                    <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                        <CheckCircle2 size={15} className="text-emerald-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{notificationMessage || 'تمت العملية بنجاح'}</p>
                </div>
            )}
        </div>
    );
};

export default Settings;
