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
    { id: 'fuchsia', label: 'فوشيا', class: 'bg-fuchsia-600' }
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
        <div className="space-y-6 pb-20">
            {/* Premium Brutalist Header */}
            <div className="relative bg-white border-4 border-gray-950 p-8 shadow-[12px_12px_0px_0px_black] overflow-hidden mb-10 rounded-none">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 2px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div className="flex items-center gap-6">
                        <div className="w-18 h-18 bg-gray-950 text-white flex items-center justify-center border-4 border-gray-950 shadow-[4px_4px_0px_0px_black] transform rotate-3">
                            <SettingsIcon size={36} strokeWidth={3} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={14} className="text-amber-500" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-mono italic">SYSTEM CONFIGURATION CONTROL</span>
                            </div>
                            <h1 className="text-2xl md:text-5xl font-black text-gray-950 mb-1 tracking-tighter uppercase leading-none">إعدادات المنصة والنظام</h1>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">
                                <Shield size={14} className="text-primary-600" />
                                تخصيص كامل للهوية والأدوات والصلاحيات البرمجية
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ultra-Compact Tabs Navigation - Ensuring all 7 fit */}
            <div className="grid grid-cols-2 lg:flex lg:flex-row gap-1.5 md:gap-2 mb-10 no-print">
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
                            "flex flex-1 items-center justify-center lg:justify-center gap-1.5 md:gap-2 px-1.5 lg:px-2 py-2 md:py-3 font-black text-[8px] lg:text-[10px] uppercase transition-all tracking-tighter border-2 shadow-[2px_2px_0px_0px_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap overflow-hidden",
                            activeTab === tab.id 
                                ? "bg-gray-950 text-white border-gray-950" 
                                : "bg-white text-gray-950 border-gray-950 hover:bg-gray-50"
                        )}
                    >
                        <tab.icon size={12} lg:size={14} strokeWidth={3} className={cn("shrink-0", activeTab === tab.id ? "text-primary-500" : "text-gray-400")} />
                        <span className="truncate">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'general' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <section className="bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                            <h2 className="font-black text-lg border-b pb-2 flex items-center gap-2 uppercase"><Building2 size={18} className="text-primary-600"/> الهوية الأساسية للأكاديمية</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-black mb-1 opacity-60">اسم الأكاديمية</label>
                                    <input value={localAcademyName} onChange={e => setLocalAcademyName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 p-3 font-bold transition-all outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black mb-1 opacity-60">رابط الشعار (URL)</label>
                                    <input value={localAcademyLogo} onChange={e => setLocalAcademyLogo(e.target.value)} placeholder="https://..." className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 p-3 font-bold transition-all outline-none text-left font-mono" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black mb-1 opacity-60">الشعار اللفظي (Tagline)</label>
                                    <input value={localAcademyTagline} onChange={e => setLocalAcademyTagline(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 p-3 font-bold transition-all outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black mb-1 opacity-60">رقم هاتف المسؤول الرئيسي</label>
                                    <input value={localAdminPhone} onChange={e => setLocalAdminPhone(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 p-3 font-bold transition-all outline-none text-left font-mono" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black mb-1 opacity-60">معرف/رابط قناة تليجرام (Telegram Handle)</label>
                                    <input value={localTelegramHandle} onChange={e => setLocalTelegramHandle(e.target.value)} placeholder="dareen_app" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 p-3 font-bold transition-all outline-none text-left font-mono" />
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex items-center justify-between">
                                <div><p className="text-sm font-black">وضع الصيانة</p><p className="text-[10px] opacity-60">تعطيل وصول المستخدمين العاديين</p></div>
                                <button onClick={() => {
                                    if (!maintenanceMode) {
                                        setShowMaintenanceModal(true);
                                    } else {
                                        setMaintenanceMode(false).then(() => showNotify('تم إيقاف وضع الصيانة، المنصة متاحة للجميع الآن.'));
                                    }
                                }} className={cn("w-12 h-6 rounded-full relative transition-colors shrink-0", maintenanceMode ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-700")}>
                                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", maintenanceMode ? "translate-x-6" : "translate-x-1")} />
                                </button>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                            <h2 className="font-black text-lg border-b pb-2 flex items-center gap-2 uppercase"><Wallet size={18} className="text-emerald-600"/> الإعدادات الأكاديمية والمالية الافتراضية</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-black mb-1 opacity-60">تسمية الفصل الدراسي المنشط</label>
                                    <input value={localSemesterName} onChange={e => setLocalSemesterName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 p-3 font-bold border-none outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black mb-1 opacity-60">سعر الطالب (افتراضي)</label>
                                    <input type="number" value={localPrice} onChange={e => setLocalPrice(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-800 p-3 font-bold border-none outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black mb-1 opacity-60">سعر المعلمة (افتراضي)</label>
                                    <input type="number" value={localTeacherPrice} onChange={e => setLocalTeacherPrice(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-800 p-3 font-bold border-none outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black mb-1 opacity-60">رمز العملة (مثال: ج.م)</label>
                                    <input value={localCurrency} onChange={e => setLocalCurrency(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 p-3 font-bold border-none outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black mb-1 opacity-60">حد تنبيه الرصيد المنخفض</label>
                                    <input type="number" value={localThreshold} onChange={e => setLocalThreshold(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-800 p-3 font-bold border-none outline-none" />
                                </div>
                            </div>
                            <button onClick={handleSaveGeneral} className="w-full py-4 bg-primary-600 text-white font-black uppercase tracking-widest hover:bg-primary-700 shadow-lg shadow-primary-500/20">
                                {isSaving ? <RefreshCw className="animate-spin mx-auto" /> : 'حفظ الإعدادات الكاملة'}
                            </button>
                        </section>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <section className="bg-white dark:bg-gray-900 p-8 border dark:border-gray-800 shadow-sm">
                            <h2 className="font-black text-lg mb-6 flex items-center gap-2 uppercase"><Palette size={18} className="text-primary-600"/> تخصيص المظهر</h2>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-black mb-4 uppercase opacity-60">لون النظام الأساسي</p>
                                    <div className="grid grid-cols-7 gap-3">
                                        {THEME_COLORS.map(c => (
                                            <button key={c.id} onClick={() => setThemeColor(c.id)} className={cn("h-10 border-2 transition-all p-1", themeColor === c.id ? "border-black dark:border-white scale-110" : "border-transparent")}>
                                                <div className={cn("w-full h-full", c.class)} title={c.label} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-between border">
                                    <div className="flex items-center gap-3"><Bell size={20}/><p className="font-bold">الإشعارات المكتبية</p></div>
                                    <button onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={cn("w-12 h-6 rounded-full relative transition-colors", notificationsEnabled ? "bg-primary-600" : "bg-gray-300")}>
                                        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", notificationsEnabled ? "translate-x-6" : "translate-x-1")} />
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-gray-900 p-8 border dark:border-gray-800 shadow-sm space-y-6 text-center">
                             <h2 className="font-black text-lg mb-6 flex items-center justify-center gap-2 uppercase text-blue-600"><Download size={18}/> إدارة النسخ الاحتياطي</h2>
                             <div className="grid grid-cols-1 gap-4">
                                <button className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 text-blue-600 font-bold flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all">
                                    <Download size={20}/> تحميل نسخة احتياطية (Backup)
                                </button>
                                <button className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-emerald-600 font-bold flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white transition-all">
                                    <Upload size={20}/> استيراد بيانات (Import)
                                </button>
                             </div>
                        </section>
                    </div>
                )}

                {activeTab === 'chatbot' && (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <section className="bg-white dark:bg-gray-950 p-8 border dark:border-gray-800 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 -mr-16 -mt-16 rounded-full blur-3xl"></div>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-primary-600/10 flex items-center justify-center border-2 border-primary-600/20 rounded-none transform group-hover:rotate-6 transition-transform">
                                        <MessageSquare className="text-primary-600" size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">إعدادات الروبوت الذكي</h2>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">تخصيص ردود ومظهر الشات بوت التلقائي</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 border dark:border-gray-800">
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase opacity-50">حالة الشات بوت</p>
                                        <p className="text-xs font-bold">{chatbotEnabled ? 'مُفعل حالياً' : 'مُعطل حالياً'}</p>
                                    </div>
                                    <button 
                                        onClick={() => setChatbotEnabled(!chatbotEnabled)} 
                                        className={cn(
                                            "w-14 h-7 rounded-full relative transition-all duration-300", 
                                            chatbotEnabled ? "bg-primary-600" : "bg-gray-400 dark:bg-gray-800"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md", 
                                            chatbotEnabled ? "translate-x-8" : "translate-x-1"
                                        )} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                                        <Edit size={14} /> اسم الشات بوت الظاهر
                                    </label>
                                    <input 
                                        type="text"
                                        value={localChatbotName}
                                        onChange={(e) => setLocalChatbotName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary-500 p-4 font-black transition-all outline-none text-lg"
                                        placeholder="مثلاً: دارين - المساعد الذكي"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                                        <Lock size={14} /> رسالة الترحيب الأولى (Automated)
                                    </label>
                                    <textarea 
                                        rows={4}
                                        value={localChatbotWelcomeMsg}
                                        onChange={(e) => setLocalChatbotWelcomeMsg(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary-500 p-4 font-bold transition-all outline-none resize-none text-base leading-relaxed"
                                        placeholder="اكتب الرسالة التي سيراها الزائر بمجرد فتح الشات..."
                                    />
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-2 italic">* تظهر هذه الرسالة بمجرد تفاعل الزائر مع أيقونة الشات.</p>
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
                                    className="w-full py-5 bg-black dark:bg-white dark:text-black text-white font-black uppercase tracking-[0.2em] hover:bg-primary-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-4"
                                >
                                    {isSaving ? <RefreshCw className="animate-spin" size={20} /> : (
                                        <>
                                            <CheckCircle2 size={20} />
                                            تحديث إعدادات الروبوت
                                        </>
                                    )}
                                </button>
                            </div>
                        </section>
                        {/* Guest Conversations Manager */}
                        {chatbotEnabled && user?.id && <GuestChatManager adminId={user.id} />}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <section className="bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl">
                            <h2 className="font-black text-lg mb-6 flex items-center gap-2 uppercase"><Users size={18} className="text-primary-600"/> إدارة مستخدمي النظام</h2>
                            <div className="overflow-x-auto rounded-xl border dark:border-slate-800 shadow-inner">
                                <table className="w-full text-right text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black">
                                        <tr>
                                            <th className="p-4 border-b dark:border-slate-700">الاسم</th>
                                            <th className="p-4 border-b dark:border-slate-700">اسم الدخول</th>
                                            <th className="p-4 border-b dark:border-slate-700">الصلاحيات</th>
                                            <th className="p-4 text-center border-b dark:border-slate-700">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                                                <td className="p-4 font-black">{u.name}</td>
                                                <td className="p-4 font-mono font-bold text-slate-500 dark:text-slate-400">{u.username}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {u.permissions?.includes('*') 
                                                            ? <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md font-black text-[10px]">مسؤول شامل (Admin)</span> 
                                                            : <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md font-black text-[10px]">{u.permissions?.length} صلاحيات محددة</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-center gap-3">
                                                        <button onClick={() => { setEditingUserId(u.id); setNewUser({ username: u.username, password: '', permissions: u.permissions || [] }); }} className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:scale-110 transition-transform"><Edit size={16}/></button>
                                                        {u.id !== user.id && <button onClick={() => setShowDeleteModal(u)} className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:scale-110 transition-transform"><Trash2 size={16}/></button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-gray-900 p-6 border dark:border-gray-800 shadow-sm max-w-2xl mx-auto">
                            <h2 className="font-black text-lg mb-6 border-b pb-2 flex items-center gap-2 uppercase"><UserPlus size={18} className="text-primary-600"/> {editingUserId ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="اسم الدخول" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="bg-gray-50 dark:bg-gray-800 p-3 font-bold border-none outline-none" />
                                    <input type="password" placeholder={editingUserId ? "تغيير الرقم السري (اختياري)" : "الرقم السري"} value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="bg-gray-50 dark:bg-gray-800 p-3 font-bold border-none outline-none" />
                                </div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    <p className="text-[10px] font-black uppercase opacity-60 w-full mb-1">قوالب صلاحيات جاهزة</p>
                                    {[
                                        { label: 'مدير نظام', perms: ['*'] },
                                        { label: 'محاسب', perms: ['view_finance', 'manage_finance'] },
                                        { label: 'مشرف تربوي', perms: ['view_students', 'manage_students', 'view_teachers'] },
                                        { label: 'موظف استقبال', perms: ['view_students', 'manage_students'] },
                                    ].map(role => (
                                        <button 
                                            key={role.label}
                                            onClick={() => setNewUser({...newUser, permissions: role.perms})}
                                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-[9px] font-bold border border-gray-200 dark:border-gray-700 hover:bg-primary-50 hover:border-primary-200 transition-all"
                                        >
                                            {role.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] font-black uppercase opacity-60">تخصيص الصلاحيات يدوياً</p>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                    {AVAILABLE_PERMISSIONS.map(p => (
                                        <button key={p.id} onClick={() => {
                                            const perms = newUser.permissions.includes(p.id) ? newUser.permissions.filter(x => x !== p.id) : [...newUser.permissions, p.id];
                                            setNewUser({...newUser, permissions: perms});
                                        }} className={cn("p-2 text-[10px] font-black border transition-all text-right", newUser.permissions.includes(p.id) ? "bg-primary-600 text-white border-primary-600" : "bg-gray-50 border-gray-100 text-gray-400")}>
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleUserAction} className="flex-1 py-4 bg-primary-600 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary-500/20">{editingUserId ? 'تحديث البيانات' : 'إنشاء الحساب'}</button>
                                    {editingUserId && <button onClick={() => { setEditingUserId(null); setNewUser({username:'', password:'', permissions:[]}); }} className="px-6 bg-gray-100 font-bold uppercase text-[11px]">إلغاء</button>}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <section className="bg-white dark:bg-gray-900 p-8 border dark:border-gray-800 shadow-sm space-y-6">
                            <h2 className="font-black text-xl mb-4 flex items-center gap-3 uppercase text-green-600"><Monitor size={24}/> أتمتة الواتساب والرسائل</h2>
                            <div className="p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 flex items-center justify-between mb-4">
                                <div><p className="font-black uppercase text-sm">ارسال الفواتير تلقائياً</p><p className="text-[10px] opacity-60">ارسال اشعار فوري لولي الأمر فور تسجيل الحصة</p></div>
                                <button onClick={() => setWhatsappAutoNotify(!whatsappAutoNotify)} className={cn("w-12 h-6 rounded-full relative transition-colors", whatsappAutoNotify ? "bg-green-500" : "bg-gray-300")}>
                                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", whatsappAutoNotify ? "translate-x-6" : "translate-x-1")} />
                                </button>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-black mb-2 opacity-60">قالب رسالة الحضور (WhatsApp Template)</label>
                                <textarea 
                                    value={localWhatsappTemplate} 
                                    onChange={e => setLocalWhatsappTemplate(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 font-bold border-2 border-transparent focus:border-green-500 outline-none min-h-[100px] text-sm"
                                    placeholder="مثال: تم تسجيل حصة {Subject} للطالب {Student} بتاريخ {Date}"
                                />
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {['{Student}', '{Subject}', '{Date}', '{Teacher}', '{Price}'].map(tag => (
                                        <button 
                                            key={tag}
                                            onClick={() => setLocalWhatsappTemplate(prev => prev + ' ' + tag)}
                                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-[9px] font-black border border-gray-200 dark:border-gray-700 hover:bg-green-50 hover:border-green-200 transition-all"
                                        >
                                            + {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setWhatsappTemplate(localWhatsappTemplate).then(() => showNotify('تم حفظ قالب الرسالة'))} className="w-full py-3 bg-green-600 text-white font-black uppercase text-xs">حفظ قالب الرسالة</button>
                        </section>

                        <section className="bg-white dark:bg-gray-900 p-8 border dark:border-gray-800 shadow-sm space-y-6">
                            <h2 className="font-black text-xl mb-4 flex items-center gap-3 uppercase text-blue-600"><Calendar size={24}/> إدارة الأرشيف والفصول</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black mb-2 opacity-60">الفصل الدراسي الحالي (نشط)</label>
                                    <div className="flex gap-2">
                                        <input value={localSemesterName} onChange={e => setLocalSemesterName(e.target.value)} className="flex-1 bg-gray-50 dark:bg-gray-800 p-3 font-bold outline-none" />
                                        <button onClick={() => setSemesterName(localSemesterName).then(() => showNotify('تم تحديث الفصل النشط'))} className="bg-blue-600 text-white px-4 font-black text-xs">تحديث</button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black mb-2 opacity-60">أرشيف الفصول السابقة (مفصولة بفاصلة)</label>
                                    <textarea 
                                        value={localSemesters} 
                                        onChange={e => setLocalSemesters(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 font-bold border-none outline-none min-h-[80px] text-sm"
                                    />
                                </div>
                                
                                <button 
                                    onClick={() => setSemesters(localSemesters).then(() => showNotify('تم تحديث الأرشيف'))}
                                    className="w-full py-3 border-2 border-blue-600 text-blue-600 font-black hover:bg-blue-600 hover:text-white transition-all text-xs"
                                >
                                    حفظ سجل الأرشيف
                                </button>
                            </div>

                            <div className="pt-6 border-t dark:border-gray-800">
                                <h3 className="font-black text-xs text-red-600 dark:text-red-500 mb-4 uppercase flex items-center gap-2"><AlertCircle size={14}/> منطقة الخطر</h3>
                                <button onClick={() => setSecureAction({
                                    type: 'reset',
                                    title: 'تصفير النظام بالكامل',
                                    description: 'سيتم مسح جميع البيانات المتعلقة بالطلاب المعلمين الإيرادات والمصروفات بالكامل لبدء دورة جديدة تماماً للمنصة. هذا الإجراء نهائي ولا يمكن التراجع عنه بأي شكل.',
                                    confirmWord: 'إعادة ضبط المنصة',
                                    actionFn: () => settingsService.systemReset().then(() => { localStorage.clear(); window.location.reload(); })
                                })} className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 font-black hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all text-xs rounded-xl shadow-sm">
                                    تصفير البرنامج بالكامل (System Reset)
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'policies' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <section className="bg-white dark:bg-gray-900 p-8 border dark:border-gray-800 shadow-sm space-y-6">
                            <h2 className="font-black text-xl mb-4 flex items-center gap-3 uppercase text-rose-600"><Lock size={24}/> ضوابط وقيود السجلات (Backdate Lock)</h2>
                            <div className="p-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-black uppercase text-sm">منع التعديل بأثر رجعي (Backdating)</p>
                                        <p className="text-[10px] opacity-80 font-bold mt-1">يمنع المعلمين والموظفين من إضافة أو تعديل حصص في تواريخ سابقة لليوم أو تواريخ مستقبلية، مما يمنع التلاعب بالسجلات.</p>
                                    </div>
                                    <button onClick={() => {
                                        setBackdateLockEnabled(!backdateLockEnabled).then(() => showNotify('تـم تحديث الخيار. سيُطبق فوراً.'));
                                    }} className={cn("w-12 h-6 rounded-full relative transition-colors shrink-0", backdateLockEnabled ? "bg-rose-500" : "bg-gray-300 dark:bg-gray-700")}>
                                        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", backdateLockEnabled ? "translate-x-6" : "translate-x-1")} />
                                    </button>
                                </div>
                            </div>
                            
                            <h2 className="font-black text-xl mb-4 mt-8 flex items-center gap-3 uppercase text-indigo-600 border-t pt-6 dark:border-gray-800"><Wallet size={24}/> سياسة حساب المستحقات المالية</h2>
                            <div>
                                <label className="block text-xs font-black mb-2 opacity-60">نوع عمولة المعلم الافتراضية (Commission Type)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setTeacherCommissionType('fixed').then(() => showNotify('تم تغيير الحساب إلى: مبلغ ثابت'))}
                                        className={cn("p-4 border-2 font-black transition-all", teacherCommissionType === 'fixed' ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400" : "border-gray-100 text-gray-500 hover:border-indigo-200")}
                                    >مبلغ ثابت / حصة
                                    </button>
                                    <button 
                                        onClick={() => setTeacherCommissionType('percentage').then(() => showNotify('تم تغيير الحساب إلى: نسبة مئوية'))}
                                        className={cn("p-4 border-2 font-black transition-all", teacherCommissionType === 'percentage' ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400" : "border-gray-100 text-gray-500 hover:border-indigo-200")}
                                    >نسبة مئوية (%)
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-gray-900 p-8 border dark:border-gray-800 shadow-sm space-y-6">
                            <h2 className="font-black text-xl mb-4 flex items-center gap-3 uppercase text-sky-600"><Snowflake size={24}/> سياسة الحضور والغياب (Auto-Freeze)</h2>
                            <div>
                                <label className="block text-xs font-black mb-2 opacity-60">حد الغياب المسموح قبل التجميد التلقائي</label>
                                <p className="text-[10px] opacity-60 mb-4 font-bold">إذا تجاوز الطالب هذا العدد من مرات الغياب (أو الجلسات المعلقة) المتعاقبة في اشتراك واحد، سيقوم النظام تلقائياً بتغيير حالة اشتراكه إلى "مُجمد" للحفاظ على حصصه وعدم إزعاج المعلم.</p>
                                <div className="flex items-center gap-4">
                                    <input type="number" value={autoFreezeThreshold} onChange={(e) => setAutoFreezeThreshold(Number(e.target.value))} className="w-24 bg-gray-50 dark:bg-gray-800 p-3 font-black text-xl text-center border-2 border-transparent focus:border-sky-500 outline-none" min="1" max="10" />
                                    <button onClick={() => setAutoFreezeThreshold(autoFreezeThreshold).then(() => showNotify('تم حفظ حد الغياب'))} className="bg-sky-600 text-white px-6 py-3 font-black uppercase text-xs">صادق على السياسة</button>
                                </div>
                            </div>

                            <div className="pt-8 border-t dark:border-gray-800 mt-8">
                                <h3 className="font-black text-xl mb-4 flex items-center gap-3 uppercase text-red-600"><Archive size={24}/> ترحيل وإقفال الأرصدة (Month Archive)</h3>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-4 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                    تقوم هذه العملية بـ: تجميد سجلات الدفع الحالية وتصفير الإحصائيات (الحصص والأرباح) للوحة التحكم، لتبدأ شهراً جديداً أو ترميزاً جديداً. مع بقاء الأرصدة المستحقة آمنة.
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
                                })} className="w-full py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-2 border-rose-600/30 dark:border-rose-500/30 font-black hover:bg-rose-600 hover:border-rose-600 hover:text-white dark:hover:bg-rose-600 transition-all text-sm uppercase tracking-widest flex justify-center items-center gap-3 relative overflow-hidden group rounded-xl shadow-sm">
                                    <span className="relative z-10 flex items-center gap-2"><Lock size={18}/> إقفال الشهر المالي الحالي وبدء فترة جديدة</span>
                                    <div className="absolute inset-0 w-0 bg-rose-600 transition-all duration-500 ease-out group-hover:w-full z-0"></div>
                                </button>
                                <p className="text-center text-[11px] font-black text-rose-500 mt-3">* يتطلب صلاحيات الأدمن الرئيسي لإتمام العملية.</p>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <section className="bg-white dark:bg-gray-900 p-8 border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b dark:border-slate-800/80">
                             <h2 className="text-xl font-black flex items-center gap-3 uppercase"><Activity size={24} className="text-primary-600"/> الرقابة: سجل النشاط والعمليات</h2>
                             <button onClick={fetchLogs} className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors shadow-sm"><RefreshCw size={20}/></button>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-800 shadow-inner">
                            <table className="w-full text-right whitespace-nowrap">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-black tracking-widest">
                                    <tr>
                                        <th className="p-4 border-b dark:border-slate-700">التوقيت (التاريخ والساعة)</th>
                                        <th className="p-4 border-b dark:border-slate-700">الموظف/المسؤول</th>
                                        <th className="p-4 border-b dark:border-slate-700">الإجراء المُنفذ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                                    {auditLogs.length > 0 ? auditLogs.map((log, idx) => (
                                        <tr key={idx} className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                                            <td className="p-4 font-mono text-slate-500 dark:text-slate-400" dir="ltr">{new Date(log.timestamp).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                            <td className="p-4 flex items-center gap-2"><Users size={14} className="text-slate-400" /> {log.username}</td>
                                            <td className="p-4"><span className="px-3 py-1.5 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50 rounded-md font-black text-xs">{log.action}</span></td>
                                        </tr>
                                    )) : <tr><td colSpan={3} className="p-20 text-center text-slate-400 dark:text-slate-500 font-black">لا يوجد سجلات حالياً للعمليات المراقبة</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>

            {/* Modals & Notifications */}
            {secureAction && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 animate-in fade-in transition-all">
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
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-in fade-in">
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
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-md bg-amber-950/20 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 border-4 border-amber-500 p-8 max-w-lg w-full shadow-[16px_16px_0px_0px_rgba(245,158,11,0.2)] dark:shadow-[16px_16px_0px_0px_rgba(245,158,11,0.1)] relative overflow-hidden">
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
                <div className="fixed bottom-10 left-10 z-[1000] bg-black text-white p-6 shadow-2xl border-l-4 border-primary-500 flex items-center gap-4 animate-in slide-in-from-left-4 duration-500">
                    <CheckCircle2 color="var(--color-primary)" size={28} />
                    <div className="font-black uppercase tracking-tighter">{notificationMessage || 'تمت العملية بنجاح'}</div>
                </div>
            )}
        </div>
    );
};

export default Settings;
