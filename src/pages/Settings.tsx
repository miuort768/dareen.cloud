import { useState, useEffect, useRef } from 'react';
import { 
    Settings as SettingsIcon, 
    Save, 
    Building2, 
    AlertCircle, 
    Check, 
    Users, 
    UserPlus, 
    Edit,
    Wallet,
    Trash2,
    FileText,
    Activity
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

const Settings = () => {
    const {
        academyName,
        setAcademyName,
        adminPhone,
        setAdminPhone,
        maintenanceMode,
        setMaintenanceMode,
        whatsappAutoNotify,
        setWhatsappAutoNotify,
        defaultSessionPrice,
        setDefaultSessionPrice,
        semesterName,
        setSemesterName,
        balanceWarningThreshold,
        setBalanceWarningThreshold,
        user,
        updateUser,
        users,
        addUser,
        editUser,
        deleteUser
    } = useApp();

    const [localName, setLocalName] = useState(user?.name || '');
    const [localUsername, setLocalUsername] = useState(user?.username || '');
    const [localPassword, setLocalPassword] = useState('');
    const [localAcademyName, setLocalAcademyName] = useState(academyName || '');
    const [localAdminPhone, setLocalAdminPhone] = useState(adminPhone || '');
    const [localMaintenanceMode, setLocalMaintenanceMode] = useState(maintenanceMode || false);

    const [newUserUsername, setNewUserUsername] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserPermissions, setNewUserPermissions] = useState<string[]>([]);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    const [userToDelete, setUserToDelete] = useState<{ id: string; username: string } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Advanced Tools State
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'settings' | 'audit' | 'tools'>('settings');

    // Category 2 States
    const [localDefaultPrice, setLocalDefaultPrice] = useState(defaultSessionPrice);
    const [localSemesterName, setLocalSemesterName] = useState(semesterName);
    const [localThreshold, setLocalThreshold] = useState(balanceWarningThreshold);
    const [localWhatsappNotify, setLocalWhatsappNotify] = useState(whatsappAutoNotify);

    // Scroll to form ref
    const formRef = useRef<HTMLDivElement>(null);

    // Notification State
    const [showSuccess, setShowSuccess] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
            fetchAdvancedData();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const fetchAdvancedData = async () => {
        try {
            const logs = await settingsService.getAuditLogs();
            setAuditLogs(logs || []);
        } catch (e) {
            console.error("Error fetching advanced data:", e);
        }
    };

    useEffect(() => {
        if (academyName) setLocalAcademyName(academyName);
        if (adminPhone) setLocalAdminPhone(adminPhone);
        if (maintenanceMode !== undefined) setLocalMaintenanceMode(maintenanceMode);
        setLocalDefaultPrice(defaultSessionPrice);
        setLocalSemesterName(semesterName);
        setLocalThreshold(balanceWarningThreshold);
        setLocalWhatsappNotify(whatsappAutoNotify);
        if (user) {
            setLocalName(user.name);
            setLocalUsername(user.username);
        }
    }, [academyName, adminPhone, maintenanceMode, user, defaultSessionPrice, semesterName, balanceWarningThreshold, whatsappAutoNotify]);

    const showNotification = (message: string) => {
        setNotificationMessage(message);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await Promise.all([
                setAcademyName(localAcademyName),
                setAdminPhone(localAdminPhone),
                setDefaultSessionPrice(Number(localDefaultPrice)),
                setSemesterName(localSemesterName),
                setBalanceWarningThreshold(Number(localThreshold)),
                setWhatsappAutoNotify(localWhatsappNotify)
            ]);

            const updates: { name?: string; username: string; password?: string } = {
                username: localUsername,
                name: localName
            };

            if (localPassword) {
                updates.password = localPassword;
            }

            await updateUser(updates);

            await settingsService.createAuditLog({
                action: 'تعديل الإعدادات',
                details: 'تم تحديث الإعدادات العامة للنظام',
                userId: user.id,
                username: user.username
            });

            showNotification('تم حفظ الإعدادات العامة بنجاح!');
            fetchAdvancedData();
        } catch (error) {
            console.error('Save settings error:', error);
            alert('حدث خطأ أثناء حفظ الإعدادات');
        } finally {
            setIsSaving(false);
            setLocalPassword('');
        }
    };

    const handleTogglePermission = (id: string) => {
        setNewUserPermissions(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleUserSubmit = () => {
        if (!newUserUsername) {
            alert('يرجى تعبئة اسم المستخدم');
            return;
        }

        if (editingUserId) {
            const updates: { username: string; name: string; permissions: string[]; password?: string } = {
                username: newUserUsername,
                name: newUserUsername,
                permissions: newUserPermissions
            };
            if (newUserPassword) updates.password = newUserPassword;
            editUser(editingUserId, updates);
            setEditingUserId(null);
            showNotification('تم تحديث بيانات المستخدم بنجاح');
        } else {
            if (!newUserPassword) {
                alert('يرجى تعبئة كلمة المرور');
                return;
            }
            addUser({
                name: newUserUsername,
                username: newUserUsername,
                password: newUserPassword,
                permissions: newUserPermissions,
                role: 'admin'
            });
            showNotification('تم إضافة المستخدم بنجاح');
        }
        setNewUserUsername('');
        setNewUserPassword('');
        setNewUserPermissions([]);
    };

    const handleDeleteUser = async () => {
        if (userToDelete) {
            deleteUser(userToDelete.id);
            setShowDeleteModal(false);
            setUserToDelete(null);
            showNotification('تم حذف المستخدم بنجاح');
        }
    };

    const startEditing = (u: any) => {
        setEditingUserId(u.id);
        setNewUserUsername(u.username);
        setNewUserPermissions(u.permissions || []);
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSystemReset = async () => {
        try {
            await settingsService.systemReset();
            localStorage.removeItem('auth_token');
            window.location.reload();
        } catch (err) {
            alert('حدث خطأ أثناء الصيانة');
        } finally {
            setShowResetModal(false);
        }
    };

    if (loading) {
        return <div className="p-8"><Skeleton className="h-64 mb-6" /><Skeleton className="h-96" /></div>;
    }

    return (
        <div className="space-y-6 pb-32">
            <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden mb-6 border-b-4 border-primary-500 rounded-none">
                <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }}></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group">
                            <SettingsIcon size={36} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-white mb-1 tracking-tight uppercase">إعدادات النظام</h1>
                            <div className="flex items-center gap-4 mt-2">
                                {['settings', 'audit', 'tools'].map((t) => (
                                    <button 
                                        key={t}
                                        onClick={() => setActiveTab(t as any)}
                                        className={cn(
                                            "px-4 py-1 text-[10px] font-black uppercase tracking-widest border transition-all",
                                            activeTab === t ? "bg-white text-primary-700 border-white" : "text-white/60 border-white/20 hover:text-white"
                                        )}
                                    >
                                        {t === 'settings' ? 'عام' : t === 'audit' ? 'سجل العمليات' : 'أدوات ذكية'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {activeTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b dark:border-gray-700">
                                <Building2 size={20} className="text-primary-600" />
                                <h2 className="text-lg font-bold">إعدادات الأكاديمية</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2">اسم الأكاديمية</label>
                                    <input type="text" value={localAcademyName} onChange={(e) => setLocalAcademyName(e.target.value)} className="w-full bg-gray-50 border p-3 dark:bg-gray-800 dark:border-gray-700 font-bold" />
                                </div>
                                <div className="pt-2">
                                    <label className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle size={20} className={cn(localMaintenanceMode ? "text-amber-500" : "text-gray-400")} />
                                            <div>
                                                <p className="text-sm font-black">وضع الصيانة</p>
                                                <p className="text-[10px] opacity-60">حظر وصول المستخدمين العاديين</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setLocalMaintenanceMode(!localMaintenanceMode); setMaintenanceMode(!localMaintenanceMode); }} className={cn("w-12 h-6 rounded-full transition-colors relative", localMaintenanceMode ? "bg-amber-500" : "bg-gray-300")}>
                                            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-transform", localMaintenanceMode ? "translate-x-6" : "translate-x-1")} />
                                        </button>
                                    </label>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b dark:border-gray-700">
                                <Wallet size={20} className="text-emerald-600" />
                                <h2 className="text-lg font-bold">المنطق الأكاديمي والمالي</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold mb-2">تسمية الفصل الدراسي</label>
                                    <input type="text" value={localSemesterName} onChange={(e) => setLocalSemesterName(e.target.value)} className="w-full bg-gray-50 border p-3 dark:bg-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">سعر الحصة الافتراضي</label>
                                    <input type="number" value={localDefaultPrice} onChange={(e) => setLocalDefaultPrice(Number(e.target.value))} className="w-full bg-gray-50 border p-3 dark:bg-gray-800" />
                                </div>
                                <div className="md:col-span-2">
                                <label className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20">
                                    <div>
                                        <p className="text-sm font-black text-gray-900 dark:text-white">حد رصيد التنبيه (Sessions Threshold)</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">عدد الحصص المتبقية التي يظهر عندها تنبيه "رصيد منخفض"</p>
                                    </div>
                                    <input 
                                        type="number"
                                        value={localThreshold}
                                        onChange={(e) => setLocalThreshold(Number(e.target.value))}
                                        className="w-20 bg-white border border-primary-200 rounded-none px-3 py-2 text-center font-black dark:bg-gray-800"
                                    />
                                </label>
                            </div>
                            </div>
                        </section>

                        <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b dark:border-gray-700">
                                <Users size={20} className="text-primary-600" />
                                <h2 className="text-lg font-bold">إدارة المستخديمن</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-3">المستخدم</th>
                                            <th className="p-3">اسم الدخول</th>
                                            <th className="p-3">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} className="border-b dark:border-gray-800">
                                                <td className="p-3 font-bold">{u.name}</td>
                                                <td className="p-3 opacity-70">{u.username}</td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => startEditing(u)} className="text-primary-600 font-bold flex items-center gap-1"><Edit size={12}/> تعديل</button>
                                                        {u.id !== user.id && (
                                                            <button onClick={() => { setUserToDelete(u); setShowDeleteModal(true); }} className="text-red-500 font-bold flex items-center gap-1"><Trash2 size={12}/> حذف</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 shadow-sm" ref={formRef}>
                             <div className="flex items-center gap-3 mb-6 pb-4 border-b dark:border-gray-700">
                                <UserPlus size={20} className="text-primary-600" />
                                <h2 className="text-lg font-bold">{editingUserId ? 'تعديل مستخدم' : 'إضافة مستخدم'}</h2>
                            </div>
                            <div className="space-y-4">
                                <input placeholder="اسم المستخدم" value={newUserUsername} onChange={e => setNewUserUsername(e.target.value)} className="w-full border p-3 bg-gray-50 dark:bg-gray-800" />
                                <input type="password" placeholder="كلمة المرور" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full border p-3 bg-gray-50 dark:bg-gray-800" />
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {AVAILABLE_PERMISSIONS.map(p => (
                                        <label key={p.id} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <input type="checkbox" checked={newUserPermissions.includes(p.id)} onChange={() => handleTogglePermission(p.id)} />
                                            <span className="text-[10px] font-bold">{p.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <button onClick={handleUserSubmit} className="w-full py-3 bg-primary-600 text-white font-black hover:bg-primary-700 transition-colors uppercase text-xs tracking-widest">
                                    {editingUserId ? 'حفظ التغييرات' : 'إضافة المستخدم للنظام'}
                                </button>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b dark:border-gray-700 text-red-600">
                                <AlertCircle size={20} />
                                <h2 className="text-lg font-bold">منطقة الخطر</h2>
                            </div>
                            <button onClick={() => setShowResetModal(true)} className="w-full py-3 bg-red-50 text-red-600 border border-red-100 font-black hover:bg-red-600 hover:text-white transition-all uppercase text-[10px] tracking-widest">
                                إعادة ضبط المصنع بالكامل
                            </button>
                        </section>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-primary-600 text-white px-8 py-3 rounded-none flex items-center justify-center gap-3 hover:bg-primary-700 font-black shadow-lg transition-all h-20 w-full"
                        >
                            {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={24} />}
                            <span className="text-xl">{isSaving ? 'جاري الحفظ...' : 'حفظ جميع التغييرات'}</span>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'audit' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <section className="bg-white border border-gray-200 p-8 dark:bg-gray-900 shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between mb-8 border-b pb-4 dark:border-gray-800">
                            <h2 className="text-xl font-black">سجل نشاط النظام</h2>
                            <button onClick={fetchAdvancedData} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><Activity size={20} /></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-4 text-[10px] font-black uppercase">الوقت</th>
                                        <th className="px-4 py-4 text-[10px] font-black uppercase">المستخدم</th>
                                        <th className="px-4 py-4 text-[10px] font-black uppercase">الإجراء</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs.map(log => (
                                        <tr key={log.id} className="border-b dark:border-gray-800 text-sm">
                                            <td className="px-4 py-4 font-mono text-xs opacity-60">{new Date(log.timestamp).toLocaleString('ar-EG')}</td>
                                            <td className="px-4 py-4 font-bold">{log.username}</td>
                                            <td className="px-4 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black">{log.action}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'tools' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="lg:col-span-2">
                        <section className="bg-white border border-gray-200 p-8 dark:bg-gray-900 shadow-xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-green-50 text-green-600"><FileText size={24} /></div>
                                <h2 className="text-xl font-black">أدوات الواتساب والأتمتة</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 border">
                                    <div className="font-bold text-sm">إرسال التنبيهات تلقائياً (Auto-Notify)</div>
                                    <button onClick={() => setLocalWhatsappNotify(!localWhatsappNotify)} className={cn("w-12 h-6 rounded-full transition-colors relative", localWhatsappNotify ? "bg-green-500" : "bg-gray-300")}>
                                        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-transform", localWhatsappNotify ? "translate-x-6" : "translate-x-1")} />
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {showResetModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 p-8 border-t-8 border-red-600 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-black mb-4">تحذير أمني خطير</h2>
                        <p className="text-sm opacity-70 mb-8 font-bold italic">سيتم مسح كافة البيانات التشغيلية للنظام بشكل نهائي وحذف جميع السجلات.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowResetModal(false)} className="flex-1 py-4 bg-gray-100 font-bold uppercase text-xs">إلغاء</button>
                            <button onClick={handleSystemReset} className="flex-1 py-4 bg-red-600 text-white font-black uppercase text-xs shadow-xl">تأكيد التصفير</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 p-8 border-t-8 border-red-600 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-black mb-4">تأكيد الحذف</h2>
                        <p className="text-sm opacity-70 mb-8 font-bold italic">هل أنت متأكد من حذف المستخدم "{userToDelete?.username}"؟ لا يمكن التراجع عن هذا الإجراء.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-gray-100 font-bold uppercase text-xs">إلغاء</button>
                            <button onClick={handleDeleteUser} className="flex-1 py-4 bg-red-600 text-white font-black uppercase text-xs shadow-xl">حذف نهائي</button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div className="fixed bottom-8 left-8 bg-black text-white p-6 shadow-2xl border-l-4 border-primary-500 animate-in slide-in-from-left-4 duration-500 min-w-[300px]">
                    <div className="flex items-center gap-4">
                        <Check size={28} className="text-primary-500" />
                        <div>
                            <p className="font-black uppercase tracking-tighter">{notificationMessage}</p>
                            <p className="text-[10px] opacity-60">تم تحديث النظام بنجاح</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
