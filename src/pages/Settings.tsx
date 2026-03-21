import { useState, useEffect, useRef } from 'react';
import { 
    Settings as SettingsIcon, Save, Building2, AlertCircle, Check, Users, UserPlus, 
    Edit, Wallet, Trash2, FileText, Activity, Palette, Bell, Shield, Download, Upload, 
    RefreshCw, CheckCircle2, Moon, Sun, Monitor
} from 'lucide-react';
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
    { id: 'indigo', label: 'نيلي', class: 'bg-indigo-600' },
    { id: 'blue', label: 'أزرق', class: 'bg-blue-600' },
    { id: 'emerald', label: 'زمردي', class: 'bg-emerald-600' },
    { id: 'rose', label: 'وردي', class: 'bg-rose-600' },
    { id: 'amber', label: 'كهرماني', class: 'bg-amber-600' },
    { id: 'purple', label: 'أرجواني', class: 'bg-purple-600' }
];

const Settings = () => {
    const {
        academyName, setAcademyName,
        adminPhone, setAdminPhone,
        themeColor, setThemeColor,
        notificationsEnabled, setNotificationsEnabled,
        maintenanceMode, setMaintenanceMode,
        whatsappAutoNotify, setWhatsappAutoNotify,
        defaultSessionPrice, setDefaultSessionPrice,
        semesterName, setSemesterName,
        balanceWarningThreshold, setBalanceWarningThreshold,
        user, updateUser, users, addUser, editUser, deleteUser
    } = useApp();

    const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'users' | 'advanced' | 'audit'>('general');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    // Local form states
    const [localAcademyName, setLocalAcademyName] = useState(academyName);
    const [localAdminPhone, setLocalAdminPhone] = useState(adminPhone);
    const [localSemesterName, setLocalSemesterName] = useState(semesterName);
    const [localPrice, setLocalPrice] = useState(defaultSessionPrice);
    const [localThreshold, setLocalThreshold] = useState(balanceWarningThreshold);

    // Users form state
    const [newUser, setNewUser] = useState({ username: '', password: '', permissions: [] as string[] });
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<any>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
            if (activeTab === 'audit') fetchLogs();
        }, 300);
        return () => clearTimeout(timer);
    }, [activeTab]);

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
                setAdminPhone(localAdminPhone),
                setSemesterName(localSemesterName),
                setDefaultSessionPrice(Number(localPrice)),
                setBalanceWarningThreshold(Number(localThreshold))
            ]);
            showNotify('تم حفظ الإعدادات بنجاح');
        } catch (e) { alert('خطأ في الحفظ'); }
        finally { setIsSaving(false); }
    };

    const showNotify = (msg: string) => {
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
            {/* Header */}
            <div className="bg-primary-600 p-8 shadow-xl border-b-4 border-primary-500 rounded-none relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1.5px,transparent_0)] bg-[length:24px_24px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30"><SettingsIcon className="text-white" size={30} /></div>
                        <div>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tight">إعدادات النظام</h1>
                            <p className="text-white/60 text-xs font-bold mt-1 uppercase tracking-widest">تخصيص كامل للأكاديمية</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 border-b dark:border-gray-800">
                {[
                    { id: 'general', label: 'العامة', icon: Building2 },
                    { id: 'appearance', label: 'المظهر', icon: Palette },
                    { id: 'users', label: 'المستخدمين', icon: Users },
                    { id: 'advanced', label: 'أدوات ذكية', icon: Shield },
                    { id: 'audit', label: 'سجل العمليات', icon: Activity },
                ].map((tab: any) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 font-bold text-sm uppercase transition-all tracking-tighter",
                            activeTab === tab.id ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"
                        )}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'general' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <section className="bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                            <h2 className="font-black text-lg border-b pb-2 flex items-center gap-2 uppercase"><Building2 size={18} className="text-primary-600"/> الهوية الأساسية</h2>
                            <div>
                                <label className="block text-xs font-black mb-2 opacity-60">اسم الأكاديمية</label>
                                <input value={localAcademyName} onChange={e => setLocalAcademyName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 p-3 font-bold transition-all outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-black mb-2 opacity-60">رقم هاتف المسؤول</label>
                                <input value={localAdminPhone} onChange={e => setLocalAdminPhone(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 p-3 font-bold transition-all outline-none text-left font-mono" />
                            </div>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex items-center justify-between">
                                <div><p className="text-sm font-black">وضع الصيانة</p><p className="text-[10px] opacity-60">تعطيل وصول المستخدمين العاديين</p></div>
                                <button onClick={() => setMaintenanceMode(!maintenanceMode)} className={cn("w-12 h-6 rounded-full relative transition-colors", maintenanceMode ? "bg-amber-500" : "bg-gray-300")}>
                                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", maintenanceMode ? "translate-x-6" : "translate-x-1")} />
                                </button>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                            <h2 className="font-black text-lg border-b pb-2 flex items-center gap-2 uppercase"><Wallet size={18} className="text-emerald-600"/> الإعدادات الأكاديمية والمالية</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-black mb-1 opacity-60">تسمية الفصل الدراسي المنشط</label>
                                    <input value={localSemesterName} onChange={e => setLocalSemesterName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 p-3 font-bold border-none outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black mb-1 opacity-60">سعر الحصة الافتراضي</label>
                                    <input type="number" value={localPrice} onChange={e => setLocalPrice(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-800 p-3 font-bold border-none outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black mb-1 opacity-60">حد تنبيه الرصيد المنخفض</label>
                                    <input type="number" value={localThreshold} onChange={e => setLocalThreshold(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-800 p-3 font-bold border-none outline-none" />
                                </div>
                            </div>
                            <button onClick={handleSaveGeneral} className="w-full py-4 bg-primary-600 text-white font-black uppercase tracking-widest hover:bg-primary-700 shadow-lg shadow-primary-500/20">
                                {isSaving ? <RefreshCw className="animate-spin mx-auto" /> : 'حفظ الإعدادات العامة'}
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
                                    <div className="grid grid-cols-6 gap-3">
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

                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <section className="bg-white dark:bg-gray-900 p-6 border dark:border-gray-800 shadow-sm">
                            <h2 className="font-black text-lg mb-6 flex items-center gap-2 uppercase"><Users size={18} className="text-primary-600"/> إدارة مستخدمي النظام</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-gray-50 dark:bg-gray-800"><tr className="border-b"><th className="p-4">الاسم</th><th className="p-4">اسم الدخول</th><th className="p-4">الصلاحيات</th><th className="p-4 text-center">إجراءات</th></tr></thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} className="border-b dark:border-gray-800 hover:bg-gray-50/50">
                                                <td className="p-4 font-black">{u.name}</td>
                                                <td className="p-4 opacity-70 font-mono tracking-tighter">{u.username}</td>
                                                <td className="p-4"><div className="flex flex-wrap gap-1">{u.permissions?.includes('*') ? <span className="p-1 px-2 bg-red-100 text-red-600 rounded-none font-black text-[9px]">FULL ACCESS</span> : u.permissions?.length}</div></td>
                                                <td className="p-4">
                                                    <div className="flex justify-center gap-3">
                                                        <button onClick={() => { setEditingUserId(u.id); setNewUser({ username: u.username, password: '', permissions: u.permissions || [] }); }} className="text-primary-600 font-black"><Edit size={14}/></button>
                                                        {u.id !== user.id && <button onClick={() => setShowDeleteModal(u)} className="text-red-500 font-black"><Trash2 size={14}/></button>}
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
                                <p className="text-[10px] font-black uppercase opacity-60">صلاحيات الوصول</p>
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <section className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 border dark:border-gray-800 shadow-sm space-y-6">
                            <h2 className="font-black text-xl mb-4 flex items-center gap-3 uppercase text-green-600"><Monitor size={24}/> أتمتة الواتساب والرسائل</h2>
                            <div className="p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 flex items-center justify-between">
                                <div><p className="font-black uppercase text-sm">ارسال الفواتير تلقائياً (WhatsApp Auto-Notify)</p><p className="text-[10px] opacity-60">ارسال اشعار فوري لولي الأمر فور تسجيل الحصة</p></div>
                                <button onClick={() => setWhatsappAutoNotify(!whatsappAutoNotify)} className={cn("w-12 h-6 rounded-full relative transition-colors", whatsappAutoNotify ? "bg-green-500" : "bg-gray-300")}>
                                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", whatsappAutoNotify ? "translate-x-6" : "translate-x-1")} />
                                </button>
                            </div>
                        </section>
                        <section className="bg-white dark:bg-gray-900 p-8 border dark:border-gray-800 shadow-sm text-center">
                            <h2 className="font-black text-lg mb-6 flex items-center justify-center gap-2 uppercase text-red-600"><AlertCircle size={18}/> منطقة الخطر</h2>
                            <button onClick={() => settingsService.systemReset().then(() => { localStorage.clear(); window.location.reload(); })} className="w-full py-4 bg-red-50 text-red-600 border border-red-100 font-black hover:bg-red-600 hover:text-white transition-all text-xs tracking-tighter">
                                تصفير البرنامج بالكامل (System Reset)
                            </button>
                        </section>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <section className="bg-white dark:bg-gray-900 p-8 border dark:border-gray-800 shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b dark:border-gray-800">
                             <h2 className="text-xl font-black flex items-center gap-3 uppercase"><Activity size={24} className="text-primary-600"/> الرقابة: سجل النشاط والعمليات</h2>
                             <button onClick={fetchLogs} className="p-2 hover:bg-gray-100 rounded-none transition-colors"><RefreshCw size={20}/></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-gray-800 uppercase text-[10px] font-black tracking-widest"><tr className="border-b"><th className="p-4">التوقيت</th><th className="p-4">الموظف/المسؤول</th><th className="p-4">الإجراء المُنفذ</th></tr></thead>
                                <tbody>
                                    {auditLogs.length > 0 ? auditLogs.map((log, idx) => (
                                        <tr key={idx} className="border-b dark:border-gray-800 text-xs font-bold hover:bg-gray-50/50">
                                            <td className="p-4 font-mono opacity-60">{new Date(log.timestamp).toLocaleString('ar-EG')}</td>
                                            <td className="p-4">{log.username}</td>
                                            <td className="p-4"><span className="p-1 px-3 bg-blue-50 text-blue-600 font-black">{log.action}</span></td>
                                        </tr>
                                    )) : <tr><td colSpan={3} className="p-20 text-center opacity-40 font-black">لا يوجد سجلات حالياً</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>

            {/* Modals & Notifications */}
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

            {showSuccess && (
                <div className="fixed bottom-10 left-10 z-[1000] bg-black text-white p-6 shadow-2xl border-l-4 border-primary-500 flex items-center gap-4 animate-in slide-in-from-left-4 duration-500">
                    <CheckCircle2 color="var(--color-primary)" size={28} />
                    <div className="font-black uppercase tracking-tighter">تمت العملية بنجاح</div>
                </div>
            )}
        </div>
    );
};

export default Settings;
