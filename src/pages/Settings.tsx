import { useState, useEffect } from 'react';
import { 
    Settings as SettingsIcon, Building2, AlertCircle, Users, UserPlus, 
    Edit, Wallet, Trash2, Activity, Palette, Bell, Shield, Download, Upload, 
    RefreshCw, CheckCircle2, Monitor, Calendar, Archive, Lock, Snowflake, MessageSquare,
    Sparkles
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { GuestChatManager } from '../features/chat/components/GuestChatManager';
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
    { id: 'indigo', label: 'نيلي', class: 'bg-indigo-600' },
    { id: 'blue', label: 'أزرق', class: 'bg-blue-600' },
    { id: 'emerald', label: 'زمردي', class: 'bg-emerald-600' },
    { id: 'rose', label: 'وردي', class: 'bg-rose-600' },
    { id: 'amber', label: 'كهرماني', class: 'bg-amber-600' },
    { id: 'purple', label: 'أرجواني', class: 'bg-purple-600' },
    { id: 'cyan', label: 'سيان', class: 'bg-cyan-600' },
    { id: 'teal', label: 'تركواز', class: 'bg-teal-600' },
    { id: 'orange', label: 'برتقالي', class: 'bg-orange-600' },
    { id: 'slate', label: 'صخري', class: 'bg-slate-600' },
    { id: 'pink', label: 'زهري', class: 'bg-pink-600' },
    { id: 'lime', label: 'ليموني', class: 'bg-lime-600' },
    { id: 'sky', label: 'سماوي', class: 'bg-sky-600' },
    { id: 'fuchsia', label: 'فوشيا', class: 'bg-fuchsia-600' },
    // 14 New Vibrant/Gradient-inspired Colors
    { id: 'sunset', label: 'غروب', class: 'bg-gradient-to-tr from-orange-600 to-rose-600' },
    { id: 'ocean', label: 'محيط', class: 'bg-gradient-to-tr from-blue-600 to-cyan-500' },
    { id: 'forest', label: 'غابة', class: 'bg-gradient-to-tr from-emerald-600 to-lime-500' },
    { id: 'royal', label: 'ملكي', class: 'bg-gradient-to-tr from-purple-700 to-indigo-600' },
    { id: 'electric', label: 'كهربائي', class: 'bg-gradient-to-tr from-violet-600 to-fuchsia-500' },
    { id: 'mint', label: 'نعناع', class: 'bg-gradient-to-tr from-teal-500 to-emerald-400' },
    { id: 'berry', label: 'توت', class: 'bg-gradient-to-tr from-pink-600 to-purple-500' },
    { id: 'gold', label: 'ذهبي', class: 'bg-gradient-to-tr from-amber-500 to-yellow-400' },
    { id: 'crimson', label: 'قرمزي', class: 'bg-gradient-to-tr from-red-700 to-rose-600' },
    { id: 'midnight', label: 'ليل', class: 'bg-gradient-to-tr from-slate-900 to-indigo-900' },
    { id: 'lava', label: 'حمم', class: 'bg-gradient-to-tr from-red-600 to-orange-500' },
    { id: 'lavender', label: 'لافندر', class: 'bg-gradient-to-tr from-purple-400 to-indigo-300' },
    { id: 'spring', label: 'ربيع', class: 'bg-gradient-to-tr from-lime-400 to-emerald-400' },
    { id: 'flame', label: 'لهب', class: 'bg-gradient-to-tr from-orange-500 to-yellow-500' }
];

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
        chatbotEnabled, setChatbotEnabled,
        chatbotWelcomeMsg, setChatbotWelcomeMsg,
        chatbotName, setChatbotName,
        telegramHandle, setTelegramHandle,
        user, users, addUser, editUser, deleteUser
    } = useApp();

    const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'users' | 'chatbot' | 'policies' | 'advanced' | 'audit'>('general');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    // Local form states
    const [localAcademyName, setLocalAcademyName] = useState(academyName);
    const [localAcademyLogo, setLocalAcademyLogo] = useState(academyLogo);
    const [localAcademyTagline, setLocalAcademyTagline] = useState(academyTagline);
    const [localAdminPhone, setLocalAdminPhone] = useState(adminPhone);
    const [localSemesterName, setLocalSemesterName] = useState(semesterName);
    const [localSemesters, setLocalSemesters] = useState(semesters);
    const [localWhatsappTemplate, setLocalWhatsappTemplate] = useState(whatsappTemplate);
    const [localChatbotName, setLocalChatbotName] = useState(chatbotName);
    const [localChatbotWelcomeMsg, setLocalChatbotWelcomeMsg] = useState(chatbotWelcomeMsg);
    const [localTelegramHandle, setLocalTelegramHandle] = useState(telegramHandle);
    const [localPrice, setLocalPrice] = useState(defaultSessionPrice);
    const [localTeacherPrice, setLocalTeacherPrice] = useState(defaultTeacherPrice);
    const [localCurrency, setLocalCurrency] = useState(currencySymbol);
    const [localThreshold, setLocalThreshold] = useState(balanceWarningThreshold);

    // Users form state
    const [newUser, setNewUser] = useState({ username: '', password: '', permissions: [] as string[] });
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<any>(null);

    // Security Modal State
    const [secureAction, setSecureAction] = useState<{type: 'reset' | 'archive', title: string, description: string, confirmWord: string, actionFn: () => void} | null>(null);
    const [secureInput, setSecureInput] = useState('');
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
            if (activeTab === 'audit') fetchLogs();
        }, 300);
        return () => clearTimeout(timer);
    }, [activeTab]);

    useEffect(() => {
        setLocalChatbotName(chatbotName);
        setLocalChatbotWelcomeMsg(chatbotWelcomeMsg);
    }, [chatbotName, chatbotWelcomeMsg]);

    const fetchLogs = async () => {
        try {
            const logs = await settingsService.getAuditLogs();
            setAuditLogs(logs || []);
        } catch (e) { console.error(e); }
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
                setBalanceWarningThreshold(Number(localThreshold))
            ]);
            showNotify('تم حفظ الإعدادات بنجاح');
        } catch (e) { alert('خطأ في الحفظ'); }
        finally { setIsSaving(false); }
    };

    const [notificationMessage, setNotificationMessage] = useState('');

    const showNotify = (msg: string) => {
        setNotificationMessage(msg);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
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

    if (loading) return <div className="p-8 space-y-4"><Skeleton className="h-20" /><Skeleton className="h-64" /></div>;

    return (
        <div className="space-y-6 pb-20 min-h-full bg-slate-50 dark:bg-[#020617] md:animate-in md:fade-in md:duration-700 font-sans" dir="rtl">
            
            {/* ═══════════════ HEADER ═══════════════ */}
            <div className="relative group overflow-hidden bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-white p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] mb-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 -skew-x-12 transform translate-x-32 -translate-y-32 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-[3px] italic">إعدادات النظام</span>
                            <SettingsIcon size={14} className="text-amber-400" />
                        </div>
                        <h1 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                            <span className="text-indigo-600 dark:text-indigo-400">لوحة تحكم</span> الإعدادات والضوابط
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[2px] italic mt-4 flex items-center gap-2">
                            <div className="w-10 h-1 bg-indigo-600"></div>
                            إدارة السياسات، الهوية، وصلاحيات النظام المركزية
                        </p>
                    </div>
                </div>
            </div>

            {/* Ultra-Compact Tabs Navigation - Ensuring all 7 fit */}
            <div className="grid grid-cols-2 lg:flex lg:flex-row gap-2 md:gap-3 mb-10 no-print">
                {[
                    { id: 'general', label: 'الإعدادات العامة', icon: Building2 },
                    { id: 'appearance', label: 'الهوية والمظهر', icon: Palette },
                    { id: 'users', label: 'إدارة المستخدمين', icon: Users },
                    { id: 'chatbot', label: 'المساعد الذكي', icon: MessageSquare },
                    { id: 'policies', label: 'السياسات والقيود', icon: Lock },
                    { id: 'advanced', label: 'الأرشيف والأدوات', icon: Shield },
                    { id: 'audit', label: 'سجل الرقابة', icon: Activity },
                ].map((tab: any) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex flex-1 items-center justify-center lg:justify-center gap-1.5 md:gap-2 px-1.5 lg:px-2 py-3 lg:py-4 font-black text-[9px] lg:text-[11px] uppercase transition-all tracking-tighter border-4 shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1 whitespace-nowrap overflow-hidden group",
                            activeTab === tab.id 
                                ? "bg-indigo-600 text-white border-slate-900 dark:border-white" 
                                : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-900 dark:border-white hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                    >
                        <tab.icon size={14} lg:size={16} strokeWidth={3} className={cn("shrink-0", activeTab === tab.id ? "text-amber-400" : "text-slate-400 group-hover:text-indigo-600")} />
                        <span className="truncate">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="md:animate-in md:fade-in md:slide-in-from-bottom-4 md:duration-500">
                {activeTab === 'general' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] space-y-6">
                            <h2 className="font-black text-xl flex items-center gap-3 uppercase"><Building2 size={24} className="text-indigo-600"/> الهوية الأساسية للأكاديمية</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-black mb-2 opacity-60 uppercase tracking-widest">اسم الأكاديمية</label>
                                    <input value={localAcademyName} onChange={e => setLocalAcademyName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 focus:border-indigo-600 p-4 font-black transition-all outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black mb-2 opacity-60 uppercase tracking-widest">رابط الشعار (URL)</label>
                                    <input value={localAcademyLogo} onChange={e => setLocalAcademyLogo(e.target.value)} placeholder="https://..." className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 focus:border-indigo-600 p-4 font-black transition-all outline-none text-left font-mono" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black mb-2 opacity-60 uppercase tracking-widest">الشعار اللفظي (Tagline)</label>
                                    <input value={localAcademyTagline} onChange={e => setLocalAcademyTagline(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 focus:border-indigo-600 p-4 font-black transition-all outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black mb-2 opacity-60 uppercase tracking-widest">رقم هاتف المسؤول الرئيسي</label>
                                    <input value={localAdminPhone} onChange={e => setLocalAdminPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 focus:border-indigo-600 p-4 font-black transition-all outline-none text-left font-mono tracking-widest" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black mb-2 opacity-60 uppercase tracking-widest">قناة تليجرام (Telegram Handle)</label>
                                    <input value={localTelegramHandle} onChange={e => setLocalTelegramHandle(e.target.value)} placeholder="dareen_app" className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 focus:border-indigo-600 p-4 font-black transition-all outline-none text-left font-mono tracking-widest" />
                                </div>
                            </div>
                            <div className="p-5 mt-4 bg-amber-50 dark:bg-amber-900/10 border-4 border-slate-900 dark:border-amber-900/50 flex items-center justify-between shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                <div><p className="text-sm font-black uppercase">وضع الصيانة</p><p className="text-[10px] font-bold text-slate-500 italic mt-1 pb-1">تعطيل وصول المستخدمين العاديين</p></div>
                                <button onClick={() => {
                                    if (!maintenanceMode) {
                                        setShowMaintenanceModal(true);
                                    } else {
                                        setMaintenanceMode(false).then(() => showNotify('تم إيقاف وضع الصيانة، المنصة متاحة للجميع الآن.'));
                                    }
                                }} className={cn("w-14 h-8 relative transition-colors shrink-0 border-4 border-slate-900", maintenanceMode ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700")}>
                                    <div className={cn("absolute top-0.5 w-5 h-5 bg-white border-2 border-slate-900 transition-all", maintenanceMode ? "translate-x-7" : "translate-x-1")} />
                                </button>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] space-y-8">
                            <div className="flex items-center justify-between pb-2">
                                <h2 className="font-black text-xl flex items-center gap-3 uppercase">
                                    <Wallet size={24} className="text-indigo-600" />
                                    الإعدادات الأكاديمية والمالية
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Academic Controls */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">
                                        <Calendar size={14} /> الضوابط الأكاديمية
                                    </h3>
                                    
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-[11px] font-black mb-2 uppercase opacity-70 group-focus-within:text-indigo-600 transition-colors tracking-widest">
                                            تسمية الفصل الدراسي المنشط
                                        </label>
                                        <div className="relative">
                                            <input 
                                                value={localSemesterName} 
                                                onChange={e => setLocalSemesterName(e.target.value)} 
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 focus:border-indigo-600 p-4 font-black outline-none transition-all"
                                                placeholder="مثلاً: الفصل الدراسي الأول 2024"
                                            />
                                            <Edit size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-500 mt-2 italic pb-2">* يظهر هذا الاسم في كافة تقارير الطلاب وفواتيرهم.</p>
                                    </div>
                                </div>

                                {/* Financial Controls */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                                        <Activity size={14} /> المعايير المالية الافتراضية
                                    </h3>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-1">
                                            <label className="block text-[11px] font-black mb-2 uppercase opacity-70 tracking-widest">سعر الطالب</label>
                                            <div className="relative">
                                                <input type="number" value={localPrice} onChange={e => setLocalPrice(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 focus:border-indigo-600 p-4 font-black outline-none transition-all pl-10 tracking-widest font-mono" />
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-[10px]">{localCurrency}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-[11px] font-black mb-2 uppercase opacity-70 tracking-widest">سعر المعلمة</label>
                                            <div className="relative">
                                                <input type="number" value={localTeacherPrice} onChange={e => setLocalTeacherPrice(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 focus:border-indigo-600 p-4 font-black outline-none transition-all pl-10 tracking-widest font-mono" />
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-[10px]">{localCurrency}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-[11px] font-black mb-2 uppercase opacity-70 tracking-widest">رمز العملة</label>
                                            <input value={localCurrency} onChange={e => setLocalCurrency(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 focus:border-indigo-600 p-4 font-black outline-none transition-all text-center" />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-[11px] font-black mb-2 uppercase opacity-70 text-rose-600 group tracking-widest">تنبيه الرصيد <AlertCircle size={10} className="inline"/></label>
                                            <input type="number" value={localThreshold} onChange={e => setLocalThreshold(Number(e.target.value))} className="w-full bg-rose-50 dark:bg-rose-900/10 border-4 border-rose-300 dark:border-rose-900 focus:border-rose-600 p-4 font-black outline-none transition-all text-center text-rose-600 tracking-widest font-mono" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 italic bg-amber-50 dark:bg-amber-900/10 p-3 border-r-4 border-amber-500 shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                        * هذه القيم يتم تطبيقها تلقائياً عند تسجيل طالب أو معلم جديد لتوفير الوقت.
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveGeneral} 
                                className="group relative w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] transition-all border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_black] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-4 mt-6"
                            >
                                {isSaving ? <RefreshCw className="animate-spin" size={24} /> : (
                                    <>
                                        <CheckCircle2 size={24} />
                                        حفظ الضوابط الجوهرية للنظام
                                    </>
                                )}
                            </button>
                        </section>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:animate-in md:fade-in md:slide-in-from-bottom-4 md:duration-700">
                        {/* System Identity & Logo Preview */}
                        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] space-y-6">
                            <div className="flex items-center gap-3 border-b-4 border-slate-900 dark:border-slate-800 pb-4">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center border-4 border-slate-900 dark:border-white shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                    <Building2 size={24} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tighter">معاينة هوية المنصة</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Identity & Branding Preview</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 dark:bg-slate-800 border-4 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center text-center group">
                                    <div className="w-24 h-24 bg-white dark:bg-slate-950 border-4 border-slate-900 dark:border-white shadow-[6px_6px_0px_0px_black] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] mb-4 flex items-center justify-center p-3 relative overflow-hidden transition-transform group-hover:scale-105">
                                        {academyLogo ? (
                                            <img src={academyLogo} alt="Logo" className="max-w-full max-h-full object-contain relative z-10" />
                                        ) : (
                                            <Monitor size={36} className="text-slate-300 dark:text-slate-700" />
                                        )}
                                    </div>
                                    <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">{academyName}</h3>
                                    <p className="text-[11px] font-bold text-slate-500 mt-2 italic opacity-80">{academyTagline}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 flex items-center justify-between shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center">
                                                <Bell size={18} className="text-amber-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest">الإشعارات المكتبية</p>
                                                <p className="text-[9px] font-bold text-slate-500 italic mt-1 pb-1">Desktop Push Notifications</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={cn("w-14 h-8 relative transition-all duration-300 border-4 border-slate-900", notificationsEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")}>
                                            <div className={cn("absolute top-0.5 w-5 h-5 bg-white border-2 border-slate-900 transition-all", notificationsEnabled ? "translate-x-7" : "translate-x-1")} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Visual Theme & Color Palette */}
                        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] space-y-6">
                            <div className="flex items-center gap-3 border-b-4 border-slate-900 dark:border-slate-800 pb-4">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center border-4 border-slate-900 dark:border-white shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                    <Palette size={24} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tighter">قالب الألوان والسمات</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">System Skin & Theme Palette</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-[11px] font-black mb-6 uppercase tracking-widest text-slate-500 flex items-center gap-2 italic">
                                        <Sparkles size={14} className="text-amber-500" /> اختر اللون المميز لنظامك
                                    </p>
                                    <div className="grid grid-cols-7 gap-4">
                                        {THEME_COLORS.map(c => (
                                            <button 
                                                key={c.id} 
                                                onClick={() => setThemeColor(c.id)} 
                                                className={cn(
                                                    "group relative h-10 w-10 md:h-12 md:w-12 rounded-none transition-all duration-300 p-1 border-4 mx-auto", 
                                                    themeColor === c.id 
                                                        ? "border-slate-900 dark:border-white scale-110 shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]" 
                                                        : "border-transparent hover:scale-110"
                                                )}
                                            >
                                                <div className={cn("w-full h-full transform transition-transform group-hover:rotate-6", c.class)} title={c.label} />
                                                {themeColor === c.id && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-5 h-5 bg-black/30 dark:bg-white/30 flex items-center justify-center backdrop-blur-sm shadow-inner">
                                                            <CheckCircle2 size={12} className="text-white dark:text-white" strokeWidth={4} />
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Full Width Security & Backup Section */}
                        <section className="col-span-1 lg:col-span-2 bg-slate-50 dark:bg-slate-900 border-4 border-slate-900 p-8 relative overflow-hidden group shadow-[8px_8px_0px_0px_black] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                 <div className="flex items-center gap-5">
                                     <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center border-4 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                         <Shield size={28} strokeWidth={3} className="text-blue-600" />
                                     </div>
                                     <div>
                                         <h3 className="text-base font-black uppercase tracking-widest text-slate-800 dark:text-white italic">إدارة الأمان والنسخ الاحتياطي</h3>
                                         <p className="text-[11px] font-bold text-slate-500 mt-1">تأمين قاعدة البيانات والملفات بشكل دوري (System Restore Point)</p>
                                     </div>
                                 </div>
                                 <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
                                    <button className="px-8 py-4 bg-white dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3">
                                        <Download size={18} className="text-blue-600" /> تحميل نسخة احتياطية
                                    </button>
                                    <button className="px-8 py-4 bg-white dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3">
                                        <Upload size={18} className="text-emerald-600" /> استيراد بيانات سابقة
                                    </button>
                                 </div>
                             </div>
                        </section>
                    </div>
                )}

                {activeTab === 'chatbot' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:animate-in md:fade-in md:slide-in-from-bottom-4 md:duration-700">
                        {/* Bot Configuration */}
                        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] space-y-8">
                            <div className="flex items-center justify-between border-b-4 border-slate-900 dark:border-slate-800 pb-4">
                                <h2 className="font-black text-xl flex items-center gap-3 uppercase tracking-tighter">
                                    <MessageSquare size={24} className="text-indigo-600" />
                                    تخصيص المساعد الذكي
                                </h2>
                                <button 
                                    onClick={() => setChatbotEnabled(!chatbotEnabled)} 
                                    className={cn(
                                        "px-4 py-2 border-4 border-slate-900 font-black text-[10px] uppercase transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
                                        chatbotEnabled ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                                    )}
                                >
                                    {chatbotEnabled ? <CheckCircle2 size={14}/> : <Lock size={14}/>}
                                    {chatbotEnabled ? "نشط الآن" : "معطل حالياً"}
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border-4 border-slate-900 dark:border-slate-800 flex items-center justify-between group shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                    <div>
                                        <p className="font-black text-sm text-indigo-900 dark:text-indigo-100 italic">حوار الزوار التلقائي</p>
                                        <p className="text-[10px] font-bold text-indigo-600/60 uppercase tracking-widest mt-1">Enable Automated Concierge</p>
                                    </div>
                                    <button onClick={() => setChatbotEnabled(!chatbotEnabled)} className={cn("w-14 h-8 relative transition-all duration-300 border-4 border-slate-900", chatbotEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")}>
                                        <div className={cn("absolute top-0.5 w-5 h-5 bg-white border-2 border-slate-900 transition-all shadow-md", chatbotEnabled ? "translate-x-7" : "translate-x-1")} />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-[11px] font-black mb-2 uppercase opacity-70 group-focus-within:text-indigo-600 tracking-widest">اسم المساعد (Bot Name)</label>
                                        <div className="relative">
                                            <input 
                                                value={localChatbotName} 
                                                onChange={e => setLocalChatbotName(e.target.value)} 
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 focus:border-indigo-600 p-4 font-black outline-none transition-all pl-10"
                                            />
                                            <Sparkles size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="flex items-center gap-2 text-[11px] font-black mb-2 uppercase opacity-70 group-focus-within:text-indigo-600 tracking-widest">رسالة الترحيب الافتتاحية</label>
                                        <textarea 
                                            value={localChatbotWelcomeMsg} 
                                            onChange={e => setLocalChatbotWelcomeMsg(e.target.value)} 
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 focus:border-indigo-600 p-4 font-black outline-none transition-all h-28 resize-none text-base leading-relaxed"
                                            placeholder="اكتب رسالة الترحيب هنا..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={async () => {
                                    setIsSaving(true);
                                    try {
                                        await setChatbotName(localChatbotName);
                                        await setChatbotWelcomeMsg(localChatbotWelcomeMsg);
                                        showNotify('تم تحديث إعدادات الشات بوت بنجاح');
                                    } catch (e) {
                                        showNotify('حدث خطأ أثناء الحفظ');
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }} 
                                className="group relative w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] transition-all border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_black] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-4 mt-6"
                            >
                                {isSaving ? <RefreshCw className="animate-spin" size={24} /> : (
                                    <>
                                        <Shield size={24} />
                                        تحديث برنامج الذكاء الاصطناعي
                                    </>
                                )}
                            </button>
                        </section>

                        {/* Live Bot Preview */}
                        <section className="bg-slate-900 p-8 border-4 border-slate-900 shadow-[8px_8px_0px_0px_black] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] relative overflow-hidden flex flex-col justify-center min-vh-[400px]">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="text-[10px] font-black text-indigo-400 border border-indigo-500/30 px-3 py-1 uppercase tracking-widest">Live Simulator</span>
                            </div>
                            
                            <div className="relative z-10 w-full max-w-sm mx-auto space-y-6">
                                {/* Simulated Message */}
                                <div className="flex flex-col gap-2 md:animate-in md:slide-in-from-left-4 md:duration-1000">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-indigo-600 flex items-center justify-center text-white border-2 border-white shadow-[2px_2px_0px_0px_black]">
                                            <MessageSquare size={18} />
                                        </div>
                                        <span className="text-[11px] font-black text-white/50 uppercase tracking-widest">{localChatbotName}</span>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md p-5 border-2 border-white/20 text-white text-sm font-bold leading-relaxed shadow-lg">
                                        {localChatbotWelcomeMsg}
                                    </div>
                                    <span className="text-[9px] font-black text-white/30 uppercase text-left tracking-widest mt-1">Just Now</span>
                                </div>

                                {/* Simulated Interaction Button */}
                                <div className="flex justify-end gap-2 md:animate-in md:slide-in-from-right-4 md:duration-1000 md:delay-300">
                                    <div className="bg-indigo-600 px-5 py-3 border-2 border-white text-white text-[11px] font-black shadow-[4px_4px_0px_0px_black] cursor-pointer hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                        كيف يمكنني البدء؟
                                    </div>
                                </div>

                                {/* Simulated Floating Bubble */}
                                <div className="absolute -bottom-10 right-0 transform translate-y-20 flex flex-col items-center gap-3">
                                    <div className="bg-white py-2 px-4 border-4 border-slate-900 shadow-[4px_4px_0px_0px_black]">
                                        <p className="text-[11px] font-black text-slate-900 uppercase">أنا متواجد للمساعدة!</p>
                                    </div>
                                    <div className="w-16 h-16 bg-indigo-600 flex items-center justify-center text-white border-4 border-slate-900 shadow-[6px_6px_0px_0px_black] animate-bounce cursor-pointer">
                                        <MessageSquare size={28} />
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        {/* Guest Conversations Manager - Now full width below */}
                        <div className="col-span-1 lg:col-span-2 mt-4">
                            {chatbotEnabled && user?.id && <GuestChatManager adminId={user.id} />}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:animate-in md:fade-in md:slide-in-from-bottom-4 md:duration-700">
                        {/* Users List */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:animate-in md:fade-in md:slide-in-from-bottom-4 md:duration-700">
                        {/* Users List */}
                        <div className="xl:col-span-2 space-y-6">
                            <div className="flex items-center justify-between border-b-4 border-slate-900 dark:border-slate-800 pb-4">
                                <h2 className="font-black text-2xl flex items-center gap-3 uppercase tracking-tighter">
                                    <Users size={32} className="text-indigo-600" />
                                    الحسابات والمسؤولين
                                </h2>
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 border-4 border-slate-900 shadow-[4px_4px_0px_0px_black] uppercase italic">Admin Registry</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {users.map(u => (
                                    <div key={u.id} className="bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-white p-6 shadow-[8px_8px_0px_0px_black] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-14 h-14 bg-indigo-600 text-white flex items-center justify-center font-black text-2xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_black]">
                                                {u.username[0].toUpperCase()}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingUserId(u.id); setNewUser({username: u.username, password: '', permissions: u.permissions || []}); }} className="p-3 bg-white text-indigo-600 border-4 border-slate-900 shadow-[4px_4px_0px_0px_black] hover:bg-slate-900 hover:text-white transition-all"><Edit size={18}/></button>
                                                {u.id !== user?.id && <button onClick={() => setShowDeleteModal(u)} className="p-3 bg-rose-50 text-rose-600 border-4 border-slate-900 shadow-[4px_4px_0px_0px_black] hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={18}/></button>}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-xl tracking-tight uppercase truncate dark:text-white">{u.name || u.username}</p>
                                            <p className="text-[10px] font-black text-slate-500 flex items-center gap-1 uppercase tracking-widest mt-2">
                                                <Shield size={12} className="text-indigo-600" /> {u.permissions?.includes('*') ? 'Full System Admin' : `${u.permissions?.length || 0} Permissions`}
                                            </p>
                                        </div>
                                        <div className="mt-5 flex flex-wrap gap-2 pt-5 border-t-4 border-dashed border-slate-200 dark:border-slate-800">
                                            {u.permissions?.slice(0, 3).map(p => (
                                                <span key={p} className="text-[9px] font-black bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 border-2 border-slate-900 dark:border-slate-700 uppercase italic whitespace-nowrap">{p}</span>
                                            ))}
                                            {(u.permissions?.length || 0) > 3 && <span className="text-[9px] font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-2 py-1 border-2 border-slate-900 dark:border-slate-700">+{(u.permissions?.length || 0) - 3}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add/Edit Section */}
                        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] h-fit lg:sticky top-4">
                            <div className="flex items-center gap-3 border-b-4 border-slate-900 dark:border-slate-800 pb-4 mb-8">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center border-4 border-slate-900 dark:border-white shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                    <UserPlus size={24} className="text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">{editingUserId ? 'تعديل المسؤول' : 'إضافة حساب جديد'}</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase opacity-70 tracking-widest">اسم الدخول</label>
                                        <input value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 p-4 font-black outline-none focus:border-indigo-600 transition-all text-sm" placeholder="ADMIN_USERNAME" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase opacity-70 tracking-widest">الرقم السري</label>
                                        <input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 p-4 font-black outline-none focus:border-indigo-600 transition-all text-sm font-mono" placeholder="********" />
                                    </div>
                                </div>

                                <div className="space-y-5 pt-5 border-t-4 border-dashed border-slate-200 dark:border-slate-800">
                                    <p className="text-[11px] font-black uppercase text-indigo-600 opacity-90 flex items-center gap-2 tracking-widest">
                                        <Shield size={14} /> قوالب صلاحيات سريعة
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { label: 'مدير نظام', perms: ['*'] },
                                            { label: 'محاسب', perms: ['view_finance', 'manage_finance'] },
                                            { label: 'مشرف تربوي', perms: ['view_students', 'manage_students', 'view_teachers'] },
                                        ].map(role => (
                                            <button key={role.label} onClick={() => setNewUser({...newUser, permissions: role.perms})} className="px-3 py-2 bg-white dark:bg-slate-800 text-[10px] font-black border-4 border-slate-900 shadow-[4px_4px_0px_0px_black] hover:bg-slate-900 hover:text-white transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none whitespace-nowrap">{role.label}</button>
                                        ))}
                                    </div>
                                    
                                    <p className="text-[11px] font-black uppercase opacity-60 tracking-widest mt-8">تخصيص الصلاحيات يدوياً</p>
                                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 border-4 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                        {AVAILABLE_PERMISSIONS.map(p => (
                                            <button key={p.id} onClick={() => {
                                                const perms = newUser.permissions.includes(p.id) ? newUser.permissions.filter(x => x !== p.id) : [...newUser.permissions, p.id];
                                                setNewUser({...newUser, permissions: perms});
                                            }} className={cn("p-3 text-[9px] font-black border-4 transition-all text-right uppercase shadow-[2px_2px_0px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none", newUser.permissions.includes(p.id) ? "bg-indigo-600 text-white border-slate-900" : "bg-white dark:bg-slate-800 border-slate-900 dark:border-slate-700 text-slate-600 dark:text-slate-300")}>
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-6 mt-4">
                                    <button onClick={handleUserAction} className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-xs border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_black] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:bg-indigo-700 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-2">
                                        {editingUserId ? <><RefreshCw size={18} /> Update Administrator</> : <><UserPlus size={18} /> Create System Account</>}
                                    </button>
                                    {editingUserId && <button onClick={() => { setEditingUserId(null); setNewUser({username:'', password:'', permissions:[]}); }} className="w-full py-4 bg-slate-100 dark:bg-slate-800 font-black uppercase text-[11px] tracking-widest border-4 border-slate-900 text-slate-600 dark:text-slate-300 shadow-[4px_4px_0px_0px_black] hover:bg-slate-200 dark:hover:bg-slate-700 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">Cancel Edit</button>}
                                </div>
                            </div>
                        </section>
                    </div>
                )}
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:animate-in md:fade-in md:slide-in-from-bottom-4 md:duration-700">
                        {/* WhatsApp Automation Core */}
                        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] space-y-8">
                            <div className="flex items-center justify-between border-b-4 border-slate-900 dark:border-slate-800 pb-4">
                                <h2 className="font-black text-xl md:text-2xl flex items-center gap-3 uppercase tracking-tighter">
                                    <Monitor size={28} className="text-indigo-600" />
                                    أتمتة الواتساب والرسائل
                                </h2>
                                <span className="hidden md:block text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 border-4 border-slate-900 shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] uppercase italic tracking-widest">Automation Engine</span>
                            </div>

                            <div className="space-y-6">
                                <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 border-4 border-slate-900 flex items-center justify-between group shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                    <div>
                                        <p className="font-black text-sm text-indigo-900 dark:text-indigo-100 italic">إرسال الفواتير تلقائياً</p>
                                        <p className="text-[10px] font-bold text-indigo-600/70 uppercase lg:tracking-widest mt-1">Automatic Notifications</p>
                                    </div>
                                    <button onClick={() => setWhatsappAutoNotify(!whatsappAutoNotify)} className={cn("w-14 h-8 relative transition-all duration-300 border-4 border-slate-900", whatsappAutoNotify ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-800")}>
                                        <div className={cn("absolute top-0.5 w-5 h-5 bg-white border-2 border-slate-900 transition-all shadow-md", whatsappAutoNotify ? "translate-x-7" : "translate-x-1")} />
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[11px] font-black uppercase opacity-70 italic tracking-widest">
                                        <Edit size={14} /> قالب رسالة الحضور
                                    </label>
                                    <textarea 
                                        value={localWhatsappTemplate} 
                                        onChange={e => setLocalWhatsappTemplate(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 p-5 font-bold outline-none focus:border-indigo-600 transition-all min-h-[120px] text-sm leading-relaxed"
                                        placeholder="اكتب رسالتك هنا..."
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {['{Student}', '{Subject}', '{Date}', '{Teacher}', '{Price}'].map(tag => (
                                            <button 
                                                key={tag}
                                                onClick={() => setLocalWhatsappTemplate(prev => prev + ' ' + tag)}
                                                className="px-3 py-2 bg-white dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 text-[10px] font-black hover:bg-slate-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1 hover:translate-x-0.5 hover:translate-y-0.5"
                                            >
                                                + {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => setWhatsappTemplate(localWhatsappTemplate).then(() => showNotify('تم حفظ القالب'))} 
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] transition-all border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_black] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] active:translate-x-1 active:translate-y-1 active:shadow-none mt-4"
                                >
                                    حفظ وتفعيل القالب
                                </button>
                            </div>
                        </section>

                        {/* Archives & Semester Manager */}
                        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] space-y-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b-4 border-slate-900 dark:border-slate-800 pb-4">
                                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center border-4 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                        <Calendar size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-tighter">إدارة الفصول والأرشيف</h2>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Academic Ledger</p>
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <input value={localSemesterName} onChange={e => setLocalSemesterName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 p-4 font-black outline-none focus:border-indigo-600" placeholder="الفصل الحالي" />
                                    <textarea value={localSemesters} onChange={e => setLocalSemesters(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-900 dark:border-slate-700 p-4 font-bold outline-none h-28 resize-none italic" placeholder="الأرشيف التاريخي" />
                                    <button onClick={() => Promise.all([setSemesterName(localSemesterName), setSemesters(localSemesters)]).then(() => showNotify('تم تحديث الأرشيف'))} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-xs border-4 border-slate-900 dark:border-white shadow-[6px_6px_0px_0px_indigo] dark:shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-black transition-all">مزامنة الفصول الدراسية</button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="pt-8 border-t-8 border-slate-900/10 dark:border-white/5 text-center">
                                <button onClick={() => setSecureAction({
                                    type: 'reset',
                                    title: 'تصفير النظام بالكامل',
                                    description: 'سيتم مسح جميع البيانات المتعلقة بالطلاب المعلمين الإيرادات والمصروفات بالكامل لبدء دورة جديدة تماماً للمنصة. هذا الإجراء نهائي ولا يمكن التراجع عنه بأي شكل.',
                                    confirmWord: 'إعادة ضبط المنصة',
                                    actionFn: () => settingsService.systemReset().then(() => { localStorage.clear(); window.location.reload(); })
                                })} className="w-full py-5 bg-rose-50 dark:bg-rose-900/10 text-rose-600 border-4 border-rose-600 border-dashed font-black hover:bg-rose-600 hover:text-white transition-all text-xs shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
                                    إعادة ضبط المصنع (Factory Reset)
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'policies' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:animate-in md:fade-in md:slide-in-from-bottom-4 md:duration-700">
                        {/* System Safeguards & Record Protection */}
                        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(225,29,72,1)] dark:shadow-[8px_8px_0px_0px_rgba(225,29,72,0.5)] space-y-8">
                            <div className="flex items-center justify-between border-b-4 border-slate-900 dark:border-slate-800 pb-4">
                                <h2 className="font-black text-xl md:text-2xl flex items-center gap-3 uppercase tracking-tighter">
                                    <Lock size={28} className="text-rose-600" />
                                    حماية السجلات والقيود
                                </h2>
                                <span className="hidden md:block text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-3 py-1 border-4 border-rose-500 shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] uppercase italic tracking-widest">System Safeguards</span>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-rose-50 dark:bg-rose-900/10 border-4 border-slate-900 dark:border-rose-900 relative overflow-hidden group shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div className="flex-1 text-center sm:text-right">
                                            <p className="font-black text-lg text-rose-900 dark:text-rose-100 flex items-center justify-center sm:justify-start gap-2">
                                                <AlertCircle size={20} /> قفل التعديل بأثر رجعي
                                            </p>
                                            <p className="text-[11px] font-bold text-rose-600/80 mt-2 leading-relaxed italic">
                                                تفعيل هذا الخيار يمنع الموظفين والمعلمين من إضافة أو تعديل الحصص في تواريخ قديمة أو مستقبلية، مما يضمن دقة السجلات المالية ومنع التلاعب.
                                            </p>
                                        </div>
                                        <button onClick={() => setBackdateLockEnabled(!backdateLockEnabled).then(() => showNotify('تـم تحديث خيار الحماية'))} className={cn("w-16 h-8 relative transition-all duration-300 border-4 border-slate-900", backdateLockEnabled ? "bg-rose-600" : "bg-slate-300 dark:bg-slate-700")}>
                                            <div className={cn("absolute top-0.5 w-5 h-5 bg-white border-2 border-slate-900 transition-all shadow-md", backdateLockEnabled ? "translate-x-9" : "translate-x-1")} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6 border-t-4 border-slate-900 dark:border-slate-800">
                                    <div className="flex items-center gap-3 border-b-4 border-slate-900 dark:border-slate-800 pb-3 font-black text-indigo-600 tracking-widest italic">
                                        <Wallet size={20} /> سياسة حساب العمولات
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => setTeacherCommissionType('fixed').then(() => showNotify('تم تغيير الحساب إلى: مبلغ ثابت'))}
                                            className={cn(
                                                "relative p-6 border-4 transition-all group overflow-hidden text-right leading-none", 
                                                teacherCommissionType === 'fixed' 
                                                    ? "border-slate-900 dark:border-white bg-indigo-600 text-white shadow-[6px_6px_0px_0px_black] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]" 
                                                    : "border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                            )}
                                        >
                                            <p className="font-black text-sm uppercase mb-2">مبلغ ثابت</p>
                                            <p className="text-[10px] font-bold opacity-60">Fixed Amount</p>
                                            {teacherCommissionType === 'fixed' && <CheckCircle2 size={20} className="absolute left-3 top-3 text-white" />}
                                        </button>

                                        <button 
                                            onClick={() => setTeacherCommissionType('percentage').then(() => showNotify('تم تغيير الحساب إلى: نسبة مئوية'))}
                                            className={cn(
                                                "relative p-6 border-4 transition-all group overflow-hidden text-right leading-none", 
                                                teacherCommissionType === 'percentage' 
                                                    ? "border-slate-900 dark:border-white bg-indigo-600 text-white shadow-[6px_6px_0px_0px_black] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]" 
                                                    : "border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                            )}
                                        >
                                            <p className="font-black text-sm uppercase mb-2">نسبة مئوية</p>
                                            <p className="text-[10px] font-bold opacity-60">Percentage %</p>
                                            {teacherCommissionType === 'percentage' && <CheckCircle2 size={20} className="absolute left-3 top-3 text-white" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Attendance Policy & Monthly Archive */}
                        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_black] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] space-y-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b-4 border-slate-900 dark:border-slate-800 pb-4">
                                    <div className="w-14 h-14 bg-sky-50 dark:bg-sky-900/20 text-sky-600 flex items-center justify-center border-4 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                        <Snowflake size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-tighter">سياسة الحضور والغياب</h2>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Auto-Freeze Mechanism</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900 border-4 border-slate-900 p-6 shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="flex-1 text-center md:text-right">
                                            <p className="text-sm font-black uppercase mb-2">حد الغياب المسموح</p>
                                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed">إذا تجاوز الطالب هذا العدد من مرات الغياب المتعاقبة، سيتم تجميد اشتراكه تلقائياً لحماية رصيده.</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border-4 border-slate-900 p-3 shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                            <input 
                                                type="number" 
                                                value={autoFreezeThreshold} 
                                                onChange={(e) => setAutoFreezeThreshold(Number(e.target.value))} 
                                                className="w-16 bg-transparent font-black text-3xl text-center outline-none" 
                                                min="1" 
                                                max="15" 
                                            />
                                            <button 
                                                onClick={() => setAutoFreezeThreshold(autoFreezeThreshold).then(() => showNotify('تم حفظ السياسة'))} 
                                                className="bg-indigo-600 text-white px-5 py-3 font-black uppercase text-[10px] hover:bg-slate-900 transition-all border-2 border-slate-900 shadow-[2px_2px_0px_0px_black] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                            >تفعيل</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Month Archive Warning Card */}
                            <div className="pt-8 border-t-8 border-slate-900/10 dark:border-white/5 bg-rose-50/50 dark:bg-rose-950/20 p-6 md:p-8 border-4 border-rose-600 dark:border-rose-900 mt-8 shadow-[8px_8px_0px_0px_rgba(225,29,72,1)] dark:shadow-[8px_8px_0px_0px_rgba(225,29,72,0.3)] group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-rose-600 text-white flex items-center justify-center border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(225,29,72,0.2)] dark:shadow-[4px_4px_0px_0px_black] group-hover:animate-pulse">
                                        <Archive size={32} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-rose-700 dark:text-rose-400 uppercase tracking-tighter leading-none mb-2">إقفال الشهر المالي والأكاديمي</h3>
                                        <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest mt-1 italic">DANGER ZONE: FULL MONTHLY ARCHIVE</p>
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-6 bg-white dark:bg-slate-900 p-5 border-4 border-rose-600/30 italic leading-relaxed">
                                    هذه العملية ستقوم بأرشفة كافة الحصص الحالية وتصفير الإحصائيات الشهرية للبدء في فترة جديدة تماماً. لا تلجأ لهذا الخيار إلا بنهاية الشهر المالي الفعلي للأكاديمية.
                                </p>
                                <button onClick={() => setSecureAction({
                                    type: 'archive',
                                    title: 'إقفال الشهر المالي',
                                    description: 'سيتم أرشفة الإحصائيات الحالية لتتمكن من بدء فترة مالية وأكاديمية جديدة بأرصدة واضحة ومستقلة. لا يمكن التراجع بسهولة.',
                                    confirmWord: 'إقفال الشهر',
                                    actionFn: () => settingsService.archiveMonth().then(() => {
                                        showNotify('تم تجميد وأرشفة بيانات الشهر المالي بنجاح! يتم الآن التحضير...');
                                        setTimeout(() => window.location.reload(), 2000);
                                    }).catch(() => alert('حدث خطأ أثناء إقفال الشهر!'))
                                })} className="w-full py-5 bg-rose-600 hover:bg-slate-900 hover:text-white text-white font-black uppercase tracking-[0.2em] text-sm shadow-[6px_6px_0px_0px_black] dark:shadow-[6px_6px_0px_0px_rgba(225,29,72,0.5)] border-4 border-slate-900 transition-all flex items-center justify-center gap-4 active:translate-x-1 active:translate-y-1 active:shadow-none">
                                    <Lock size={20} />
                                    إقفال الفترة الحالية
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="md:animate-in md:fade-in md:slide-in-from-bottom-4 md:duration-700">
                        <section className="bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
                            <div className="flex items-center justify-between p-6 md:p-8 bg-slate-900 text-white border-b-4 border-slate-900 dark:border-white shadow-[inset_0px_-4px_0px_0px_rgba(79,70,229,1)]">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-indigo-600 flex items-center justify-center border-4 border-white shadow-[4px_4px_0px_0px_white]">
                                        <Activity size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-1">Digital Audit Control</h2>
                                        <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest italic leading-none">Global Activity Audit Log</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={fetchLogs} 
                                    className="p-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 border-4 border-white/20 hover:border-white transition-all flex items-center gap-3 font-black text-[11px] uppercase shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[4px_4px_0px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1"
                                >
                                    <RefreshCw size={20} />
                                    Refresh Buffer
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-right border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800 border-b-4 border-slate-900 dark:border-slate-700">
                                        <tr className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] italic">
                                            <th className="p-6 border-l-4 border-slate-200 dark:border-slate-700">توقيت العملية (Log Time)</th>
                                            <th className="p-6 border-l-4 border-slate-200 dark:border-slate-700">المسؤول المنفذ (Identity)</th>
                                            <th className="p-6">طبيعة الإجراء البرمجي (Action)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-4 divide-slate-100 dark:divide-slate-800">
                                        {auditLogs.length > 0 ? auditLogs.map((log, idx) => (
                                            <tr key={idx} className="group hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
                                                <td className="p-6 font-mono text-xs font-black text-slate-500 dark:text-slate-400 border-l-4 border-slate-100 dark:border-slate-800" dir="ltr">
                                                    {new Date(log.timestamp).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </td>
                                                <td className="p-6 font-black text-sm uppercase italic">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-white dark:bg-slate-800 flex items-center justify-center text-xs border-4 border-slate-900 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-[2px_2px_0px_0px_black]">
                                                            {log.username?.[0]?.toUpperCase() || 'A'}
                                                        </div>
                                                        <span className="tracking-tighter dark:text-white">{log.username}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-3 h-3 bg-indigo-600 animate-pulse border-2 border-slate-900"></div>
                                                        <span className="font-bold text-sm uppercase tracking-tight text-slate-700 dark:text-slate-300">
                                                            {log.action}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="p-24 text-center font-black text-slate-400 dark:text-slate-600 uppercase italic tracking-widest text-lg">
                                                    No activity recorded in the current buffer.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="p-6 bg-slate-50 dark:bg-slate-800 border-t-4 border-slate-900 dark:border-slate-700 flex justify-between items-center text-[11px] font-black text-slate-500 uppercase italic tracking-[0.2em] shadow-[inset_0px_4px_0px_0px_rgba(0,0,0,0.05)]">
                                <span className="flex items-center gap-3"><div className="w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 animate-ping"></div> Monitor Status: Active</span>
                                <span>End of Record Cache</span>
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* Modals & Notifications */}
            {secureAction && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 md:animate-in md:fade-in transition-all">
                    <div className="bg-white dark:bg-slate-900 border-t-8 border-red-600 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 -mr-16 -mt-16 rounded-full blur-3xl"></div>
                        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 shadow-inner mb-2 border border-red-100 dark:border-red-800/50">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{secureAction.title}</h3>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">{secureAction.description}</p>
                            
                            <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-4 mt-6">
                                <p className="text-xs font-black text-slate-700 dark:text-slate-300">لتأكيد العملية الخطيرة، يرجى كتابة العبارة التالية في الصندوق أناه:</p>
                                <div className="text-center font-black text-red-600 bg-red-50 dark:bg-red-900/20 py-2 border border-red-100 dark:border-red-800/30 rounded-lg select-all text-base tracking-widest">{secureAction.confirmWord}</div>
                                
                                <input 
                                    type="text" 
                                    value={secureInput}
                                    onChange={(e) => setSecureInput(e.target.value)}
                                    className="w-full mt-2 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 p-4 font-black text-center text-slate-800 dark:text-white outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-xl transition-all"
                                    placeholder="اكتب العبارة للتحقق..."
                                />
                            </div>

                            <div className="flex gap-3 w-full pt-4">
                                <button onClick={() => { setSecureAction(null); setSecureInput(''); }} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black uppercase text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">تراجع عن القرار</button>
                                <button 
                                    disabled={secureInput !== secureAction.confirmWord}
                                    onClick={() => { secureAction.actionFn(); setSecureAction(null); setSecureInput(''); }} 
                                    className="flex-1 py-4 bg-red-600 text-white font-black uppercase text-xs shadow-xl shadow-red-500/20 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed rounded-xl transition-all"
                                >
                                    تنفيذ نهائي لـ {secureAction.title.split(' ')[0]}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 md:animate-in md:fade-in">
                    <div className="bg-white dark:bg-gray-900 border-t-8 border-red-600 p-8 max-w-md w-full shadow-2xl space-y-4">
                        <h3 className="text-xl font-black">تأكيد حذف المستخدم</h3>
                        <p className="text-sm font-bold opacity-70">هل أنت متأكد من حذف "{showDeleteModal.username}"؟ هذا الإجراء سيمنعه من دخول النظام فوراً.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-4 bg-gray-100 font-black uppercase text-xs">إلغاء</button>
                            <button onClick={() => { deleteUser(showDeleteModal.id); setShowDeleteModal(null); showNotify('تم حذف المستخدم'); }} className="flex-1 py-4 bg-red-600 text-white font-black uppercase text-xs shadow-lg shadow-red-500/20">تأكيد الحذف</button>
                        </div>
                    </div>
                </div>
            )}

            {showMaintenanceModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-md bg-amber-950/20 md:animate-in md:fade-in">
                    <div className="bg-white dark:bg-slate-900 border-4 border-amber-500 p-8 max-w-lg w-full shadow-lg md:shadow-[16px_16px_0px_0px_rgba(245,158,11,0.2)] dark:md:shadow-[16px_16px_0px_0px_rgba(245,158,11,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 -mr-16 -mt-16 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center border-4 border-amber-500 transform -rotate-3">
                                    <Snowflake size={32} strokeWidth={3} className="animate-spin-slow" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">تفعيل وضع الصيانة</h3>
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">System Freeze Protocol</p>
                                </div>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 border-r-4 border-amber-500">
                                <p className="text-sm font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
                                    ⚠️ <span className="underline">تحذير هام:</span> تفعيل هذا الوضع سيؤدي فوريًا لـ:
                                </p>
                                <ul className="mt-3 space-y-2 text-xs font-bold text-amber-800 dark:text-amber-400">
                                    <li className="flex items-center gap-2">• طرد كافة المستخدمين الحاليين من المنصة.</li>
                                    <li className="flex items-center gap-2">• منع المعلمين والطلاب من تسجيل الدخول.</li>
                                    <li className="flex items-center gap-2">• إغلاق كافة الوظائف البرمجية مؤقتًا.</li>
                                </ul>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowMaintenanceModal(false)} className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black uppercase text-xs hover:bg-gray-200 transition-colors">إلغاء الأمر</button>
                                <button 
                                    onClick={() => {
                                        setMaintenanceMode(true).then(() => {
                                            setShowMaintenanceModal(false);
                                            showNotify('تم تفعيل وضع الصيانة، المنصة مغلقة الآن.');
                                        });
                                    }} 
                                    className="flex-1 py-4 bg-amber-500 text-white font-black uppercase text-xs shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all"
                                >
                                    تأكيد الإغلاق الآن
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div className="fixed bottom-4 md:bottom-10 left-4 md:left-10 z-[1000] bg-black text-white p-6 shadow-2xl border-l-4 border-primary-500 flex items-center gap-4 md:animate-in md:slide-in-from-left-4 md:duration-500">
                    <CheckCircle2 color="var(--color-primary)" size={28} />
                    <div className="font-black uppercase tracking-tighter">{notificationMessage || 'تمت العملية بنجاح'}</div>
                </div>
            )}
        </div>
    );
};

export default Settings;
