import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../config/api';
import { cn } from '../lib/utils';
import {
    Save, User, Building2, Lock, Download, Upload, Database, Check,
    Settings as SettingsIcon, Bell, Moon, Sun, Shield,
    Calendar, Palette, UserPlus, Users, Edit, Trash2, AlertCircle, X,
    Server
} from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { StatsCard } from '../shared/components/StatsCard';
import { Skeleton } from '../components/ui/Skeleton';

const AVAILABLE_PERMISSIONS = [
    { id: 'dashboard', label: 'الرئيسية' },
    { id: 'students', label: 'الطلاب' },
    { id: 'attendance', label: 'الحضور والغياب' },
    { id: 'finance', label: 'المالية العامة' },
    { id: 'student-invoices', label: 'فواتير الطلاب' },
    { id: 'teacher-invoices', label: 'فواتير المعلمين' },
    { id: 'reports', label: 'التقارير' },
    { id: 'schedule', label: 'الجدول الدراسي' },
    { id: 'teachers', label: 'المعلمين' },
    { id: 'parents', label: 'أولياء الأمور' },
    { id: 'appointments', label: 'المواعيد' },
    { id: 'settings', label: 'الإعدادات' },
];

const THEME_PRESETS = [
    { id: 'indigo', color: '#4f46e5', label: 'نيلي' },
    { id: 'blue', color: '#2563eb', label: 'أزرق' },
    { id: 'emerald', color: '#10b981', label: 'زمردي' },
    { id: 'rose', color: '#e11d48', label: 'وردي' },
    { id: 'amber', color: '#d97706', label: 'عسلي' },
    { id: 'purple', color: '#7c3aed', label: 'بنفسجي' },
    { id: 'cyan', color: '#0891b2', label: 'سماوي' },
    { id: 'teal', color: '#0d9488', label: 'فيروزي' },
    { id: 'orange', color: '#ea580c', label: 'برتقالي' },
    { id: 'slate', color: '#475569', label: 'صخري' },
    { id: 'pink', color: '#db2777', label: 'زهري' },
    { id: 'lime', color: '#65a30d', label: 'ليموني' },
    { id: 'sky', color: '#0284c7', label: 'سماوي فاتح' },
    { id: 'fuchsia', color: '#c026d3', label: 'أرجواني' },
];

export const Settings = () => {
    const {
        user,
        users,
        academyName,
        setAcademyName,
        updateUser,
        addUser,
        editUser,
        deleteUser,
        themeColor,
        setThemeColor,
        notificationsEnabled,
        setNotificationsEnabled,
        adminPhone,
        setAdminPhone,
        autoBackup,
        setAutoBackup
    } = useApp();

    const [theme, setTheme] = useDarkMode();

    // User Settings
    const [localName, setLocalName] = useState(user.name);
    const [localUsername, setLocalUsername] = useState(user.username);
    const [localPassword, setLocalPassword] = useState('');

    // Academy Settings
    const [localAcademyName, setLocalAcademyName] = useState(academyName);
    const [localAdminPhone, setLocalAdminPhone] = useState(adminPhone);

    // New/Edit User State
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [newUserUsername, setNewUserUsername] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserPermissions, setNewUserPermissions] = useState<string[]>([]);
    const [userToDelete, setUserToDelete] = useState<{ id: string; username: string } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    // Scroll to form ref
    const formRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Notification State
    const [showSuccess, setShowSuccess] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    useEffect(() => {
        // Simulate loading for better UX
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const showNotification = (message: string) => {
        setNotificationMessage(message);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleSave = () => {
        // Save Global Context Data
        setAcademyName(localAcademyName);
        setAdminPhone(localAdminPhone);

        const updates: { name?: string; username: string; password?: string } = {
            name: localName,
            username: localUsername
        };

        if (localPassword) {
            updates.password = localPassword;
        }

        updateUser(updates);

        // Show notification
        showNotification('تم حفظ الإعدادات العامة بنجاح!');
    };

    const handleTogglePermission = (id: string) => {
        setNewUserPermissions(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id]
        );
    };

    const handleUserSubmit = () => {
        if (!newUserUsername) {
            alert('يرجى تعبئة اسم المستخدم');
            return;
        }

        if (editingUserId) {
            // Edit Mode
            const updates: { username: string; name: string; permissions: string[]; password?: string } = {
                username: newUserUsername,
                name: newUserUsername,
                permissions: newUserPermissions
            };
            if (newUserPassword) {
                updates.password = newUserPassword;
            }

            editUser(editingUserId, updates);
            setEditingUserId(null);
            showNotification('تم تحديث بيانات المستخدم وصلاحياته بنجاح');
        } else {
            // Create Mode
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
            showNotification('تم إنشاء المستخدم الجديد بنجاح');
        }

        // Reset form
        setNewUserUsername('');
        setNewUserPassword('');
        setNewUserPermissions([]);
    };

    const startEditing = (userToEdit: { id: string; username: string; permissions?: string[] }) => {
        setEditingUserId(userToEdit.id);
        setNewUserUsername(userToEdit.username);
        setNewUserPassword('');
        setNewUserPermissions(userToEdit.permissions || []);

        // Scroll to form
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelEditing = () => {
        setEditingUserId(null);
        setNewUserUsername('');
        setNewUserPassword('');
        setNewUserPermissions([]);
    };

    const handleExport = async () => {
        try {
            // Fetch complete backup from server
            const response = await fetch(`${API_BASE_URL}/system/backup`);
            const backupData = await response.json();

            // Add settings data
            const completeBackup = {
                ...backupData,
                settings: {
                    user: { ...user, name: localName, username: localUsername },
                    academy: { name: localAcademyName },
                    appSettings: {
                        notifications: notificationsEnabled,
                        autoBackup,
                        themeColor
                    },
                    users: users
                }
            };

            const blob = new Blob([JSON.stringify(completeBackup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `academy_full_backup_${new Date().toISOString().slice(0, 10)}_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showNotification('تم تصدير النسخة الاحتياطية الكاملة بنجاح!');
        } catch (error) {
            console.error('Backup error:', error);
            alert('حدث خطأ أثناء إنشاء النسخة الاحتياطية');
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const backupData = JSON.parse(event.target?.result as string);

                // Restore database data if available
                if (backupData.data) {
                    const response = await fetch(`${API_BASE_URL}/system/restore`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ data: backupData.data })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to restore database');
                    }

                    const result = await response.json();
                    console.log('Database restored:', result);
                }

                // Restore settings
                if (backupData.settings) {
                    const settings = backupData.settings;

                    if (settings.academy) {
                        setLocalAcademyName(settings.academy.name);
                    }

                    if (settings.user) {
                        setLocalName(settings.user.name);
                        setLocalUsername(settings.user.username);
                    }

                    if (settings.appSettings) {
                        setNotificationsEnabled(settings.appSettings.notifications);
                        setAutoBackup(settings.appSettings.autoBackup);
                        if (settings.appSettings.themeColor) {
                            setThemeColor(settings.appSettings.themeColor);
                        }
                    }

                    if (settings.users && Array.isArray(settings.users)) {
                        localStorage.setItem('app_users', JSON.stringify(settings.users));
                    }
                }

                showNotification('تم استيراد النسخة الاحتياطية بنجاح! سيتم إعادة تحميل الصفحة...');
                setTimeout(() => window.location.reload(), 2000);
            } catch (err) {
                console.error('Import error:', err);
                alert('حدث خطأ أثناء قراءة الملف. تأكد من صحة الملف.');
            }
        };
        reader.readAsText(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSystemReset = async () => {
        setResetLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/system/system-reset`, {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Reset failed');

            // Clear Session Data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('app_current_user');
            localStorage.removeItem('app_isAuthenticated');

            showNotification('تم تصفير بيانات النظام بنجاح! سيتم إعادة تحميل الصفحة...');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (err) {
            console.error('System reset error:', err);
            alert('حدث خطأ أثناء تصفير النظام');
        } finally {
            setResetLoading(false);
            setShowResetModal(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-none" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-96 rounded-none" />
                    <Skeleton className="h-96 rounded-none" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Enhanced Header - Dynamic Color */}
            <div className="bg-primary-600 p-6 shadow-lg transition-colors duration-500">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3 mb-1">
                            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-none">
                                <SettingsIcon size={28} />
                            </div>
                            الإعدادات
                        </h1>
                        <p className="text-white text-sm">إدارة إعدادات النظام والحساب</p>
                    </div>
                    <button
                        onClick={handleSave}
                        className="bg-white text-primary-600 px-6 py-2.5 rounded-none flex items-center gap-2 hover:bg-white/90 active:bg-white/80 transition-all font-bold shadow-lg transform hover:-translate-y-0.5"
                    >
                        <Save size={18} />
                        <span>حفظ جميع التغييرات</span>
                    </button>
                </div>
            </div>

            {/* System Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="المستخدمين النشطين"
                    value={users.length}
                    icon={Users}
                    color="blue"
                />
                <StatsCard
                    title="حالة النظام"
                    value="متصل"
                    icon={Server}
                    color="emerald"
                    trend="قاعدة البيانات تعمل"
                />
                <StatsCard
                    title="الوضع الليلي"
                    value={theme === 'dark' ? 'مفعل' : 'معطل'}
                    icon={Moon}
                    color="purple"
                />
                <StatsCard
                    title="النسخ الاحتياطي"
                    value={autoBackup ? 'تلقائي' : 'يدوي'}
                    icon={Database}
                    color="amber"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Academy Settings */}
                    <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-primary-100 rounded-none dark:bg-primary-900/30">
                                <Building2 size={20} className="text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                إعدادات الأكاديمية
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 dark:text-gray-300">
                                    اسم الأكاديمية
                                </label>
                                <input
                                    type="text"
                                    value={localAcademyName}
                                    onChange={(e) => setLocalAcademyName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-none px-4 py-3 focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
                                    placeholder="أدخل اسم الأكاديمية"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 dark:text-gray-300">
                                    رقم هاتف مدير النظام (لاستقبال تنبيهات المعلمين)
                                </label>
                                <input
                                    type="text"
                                    value={localAdminPhone}
                                    onChange={(e) => setLocalAdminPhone(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-none px-4 py-3 focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
                                    placeholder="01xxxxxxxxx"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Create/Edit User Section */}
                    <section ref={formRef} className={`bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow ${editingUserId ? 'ring-2 ring-primary-500' : ''}`}>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-primary-100 rounded-none dark:bg-primary-900/30">
                                <UserPlus size={20} className="text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingUserId ? 'تعديل بيانات المستخدم' : 'إنشاء مستخدم جديد'}
                            </h2>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 dark:text-gray-300">
                                        اسم المستخدم
                                    </label>
                                    <input
                                        type="text"
                                        value={newUserUsername}
                                        onChange={(e) => setNewUserUsername(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-none px-4 py-3 focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
                                        placeholder="username"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 dark:text-gray-300">
                                        {editingUserId ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور'}
                                    </label>
                                    <input
                                        type="password"
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-none px-4 py-3 focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
                                        placeholder={editingUserId ? "اتركها فارغة للإبقاء على الحالية" : "••••••••"}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-3 dark:text-gray-300 flex items-center gap-2">
                                    <Shield size={14} />
                                    صلاحيات الوصول
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {AVAILABLE_PERMISSIONS.map((perm) => (
                                        <label
                                            key={perm.id}
                                            className={`
                                                flex items-center gap-3 p-3 border cursor-pointer transition-all
                                                ${newUserPermissions.includes(perm.id)
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                                                }
                                            `}
                                        >
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                                checked={newUserPermissions.includes(perm.id)}
                                                onChange={() => handleTogglePermission(perm.id)}
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                {perm.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-2 gap-3">
                                {editingUserId && (
                                    <button
                                        onClick={cancelEditing}
                                        className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-none font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                )}
                                <button
                                    onClick={handleUserSubmit}
                                    className="bg-primary-600 text-white px-6 py-2.5 rounded-none font-bold hover:bg-primary-700 transition-colors flex items-center gap-2"
                                >
                                    <UserPlus size={18} />
                                    {editingUserId ? 'حفظ التعديلات' : 'إضافة المستخدم'}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* User Management Section */}
                    <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-primary-100 rounded-none dark:bg-primary-900/30">
                                <Users size={20} className="text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                إدارة المستخدمين
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                    <tr>
                                        <th className="px-4 py-3">المستخدم</th>
                                        <th className="px-4 py-3">اسم الدخول</th>
                                        <th className="px-4 py-3">الصلاحيات</th>
                                        <th className="px-4 py-3">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                {u.name}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                {u.username}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">
                                                {u.permissions?.includes('*')
                                                    ? <span className="text-primary-600 font-bold">وصول كامل (Admin)</span>
                                                    : u.permissions?.map(p => {
                                                        const label = AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p;
                                                        return label;
                                                    }).join('، ') || 'بلا صلاحيات'
                                                }
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => startEditing(u)}
                                                        className="text-primary-500 hover:text-primary-700 font-bold text-xs flex items-center gap-1"
                                                    >
                                                        <Edit size={14} />
                                                        تعديل
                                                    </button>
                                                    {u.id !== user.id && u.id !== 'admin_1' && (
                                                        <button
                                                            onClick={() => {
                                                                setUserToDelete(u);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1"
                                                        >
                                                            <Trash2 size={14} />
                                                            حذف
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Data Management */}
                    <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-primary-100 rounded-none dark:bg-primary-900/30">
                                <Database size={20} className="text-primary-600 dark:text-primary-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    إدارة البيانات والنسخ الاحتياطي
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    نسخ احتياطي كامل لقاعدة البيانات والإعدادات
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 mb-6 dark:bg-blue-900/10 dark:border-blue-700">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">
                                        النسخة الاحتياطية الكاملة تشمل:
                                    </p>
                                    <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                                        <li>✓ جميع بيانات الطلاب والتسجيلات</li>
                                        <li>✓ بيانات المعلمين وأولياء الأمور</li>
                                        <li>✓ الجلسات والمواعيد</li>
                                        <li>✓ فواتير الطلاب والمعلمين</li>
                                        <li>✓ إعدادات النظام والمستخدمين</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handleExport}
                                className="flex items-center justify-center gap-3 p-6 rounded-none border-2 border-primary-200 bg-primary-50 hover:bg-primary-100 transition-all text-primary-700 font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 group"
                            >
                                <Download size={24} className="group-hover:animate-bounce" />
                                <div className="text-right">
                                    <p className="font-black">تصدير نسخة احتياطية كاملة</p>
                                    <p className="text-xs font-normal opacity-75">حفظ جميع البيانات والإعدادات</p>
                                </div>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center gap-3 p-6 rounded-none border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all text-gray-600 hover:text-primary-700 font-bold dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 group"
                            >
                                <Upload size={24} className="group-hover:animate-bounce" />
                                <div className="text-right">
                                    <p className="font-black">استيراد نسخة احتياطية</p>
                                    <p className="text-xs font-normal opacity-75">استرجاع من ملف JSON</p>
                                </div>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImport}
                                accept=".json"
                                className="hidden"
                            />
                        </div>
                    </section>
                </div>

                {/* Right Column - Quick Settings */}
                <div className="space-y-6">
                    {/* User Profile */}
                    <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-primary-100 rounded-none dark:bg-primary-900/30">
                                <User size={20} className="text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                الملف الشخصي
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                    {localName.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900 dark:text-white truncate">{localName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">مدير النظام</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 dark:text-gray-300">
                                    الاسم الظاهر
                                </label>
                                <input
                                    type="text"
                                    value={localName}
                                    onChange={(e) => setLocalName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-none px-3 py-2 text-sm focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
                                    disabled={true}
                                />
                                <p className="text-[10px] text-gray-400 mt-1">يمكنك تحديث بياناتك من خلال زر "حفظ جميع التغييرات"</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 dark:text-gray-300">
                                    اسم المستخدم
                                </label>
                                <input
                                    type="text"
                                    value={localUsername}
                                    onChange={(e) => setLocalUsername(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-none px-3 py-2 text-sm focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-2 dark:text-gray-300">
                                    <Lock size={12} />
                                    كلمة المرور الجديدة
                                </label>
                                <input
                                    type="password"
                                    placeholder="اتركها فارغة للتجاهل"
                                    value={localPassword}
                                    onChange={(e) => setLocalPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-none px-3 py-2 text-sm focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Appearance */}
                    <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-primary-100 rounded-none dark:bg-primary-900/30">
                                <Palette size={20} className="text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                المظهر
                            </h2>
                        </div>
                        <div className="space-y-6">
                            {/* Dark Mode Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {theme === 'dark' ? <Moon size={18} className="text-primary-600" /> : <Sun size={18} className="text-amber-500" />}
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">الوضع الداكن</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">تفعيل/إلغاء الوضع الليلي</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform transform duration-300 ${theme === 'dark' ? 'translate-x-[2px]' : '-translate-x-[26px]'
                                            }`}
                                        style={{ right: theme === 'dark' ? 'auto' : '2px', left: theme === 'dark' ? '2px' : 'auto' }}
                                    ></span>
                                </button>
                            </div>

                            {/* Theme Color Selector */}
                            <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Palette size={14} className="text-primary-500" />
                                    سمة الألوان
                                </p>
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
                                    {THEME_PRESETS.map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => setThemeColor(preset.id)}
                                            className="flex flex-col items-center gap-2 group"
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                                themeColor === preset.id
                                                    ? "ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900 scale-110 shadow-lg shadow-primary-500/20"
                                                    : "ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-gray-300 dark:hover:ring-gray-600 scale-100"
                                            )}>
                                                <div
                                                    className="w-6 h-6 rounded-full shadow-inner transition-transform group-hover:scale-90"
                                                    style={{ backgroundColor: preset.color }}
                                                />
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black tracking-tight transition-colors whitespace-nowrap",
                                                themeColor === preset.id ? "text-primary-600 dark:text-primary-400" : "text-gray-500"
                                            )}>
                                                {preset.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notifications */}
                    <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-primary-100 rounded-none dark:bg-primary-900/30">
                                <Bell size={20} className="text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                الإشعارات
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">إشعارات النظام</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">تنبيهات داخل التطبيق</p>
                                </div>
                                <button
                                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${notificationsEnabled ? 'bg-primary-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform transform duration-300 ${notificationsEnabled ? 'translate-x-[2px]' : '-translate-x-[26px]'
                                            }`}
                                        style={{ right: notificationsEnabled ? 'auto' : '2px', left: notificationsEnabled ? '2px' : 'auto' }}
                                    ></span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Security */}
                    <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-primary-100 rounded-none dark:bg-primary-900/30">
                                <Shield size={20} className="text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                الأمان
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">النسخ الاحتياطي التلقائي</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">حفظ تلقائي يومي</p>
                                </div>
                                <button
                                    onClick={() => setAutoBackup(!autoBackup)}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${autoBackup ? 'bg-primary-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform transform duration-300 ${autoBackup ? 'translate-x-[2px]' : '-translate-x-[26px]'
                                            }`}
                                        style={{ right: autoBackup ? 'auto' : '2px', left: autoBackup ? '2px' : 'auto' }}
                                    ></span>
                                </button>
                            </div>
                            <div className="bg-primary-50 border border-primary-200 p-4 rounded-none dark:bg-primary-900/10 dark:border-primary-900/30">
                                <p className="text-xs text-primary-800 dark:text-primary-400 font-bold mb-2">
                                    آخر نسخة احتياطية
                                </p>
                                <p className="text-xs text-primary-600 dark:text-primary-500 flex items-center gap-2">
                                    <Calendar size={14} />
                                    {new Date().toLocaleDateString('ar-EG')}
                                </p>
                            </div>

                            {/* System Reset Section */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-black text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    منطقة الخطر
                                </h3>
                                <p className="text-[10px] text-gray-500 mb-4 leading-relaxed">
                                    سيؤدي هذا الإجراء إلى حذف كافة البيانات التشغيلية (الطلاب، المعلمين، الفواتير، المواعيد) وإعادة النظام إلى حالة المصنع.
                                    <br />
                                    <span className="text-red-600 font-bold italic">ملاحظة: سيتم الاحتفاظ بحسابات مديري النظام والمشرفين فقط.</span>
                                </p>
                                <button
                                    onClick={() => {
                                        setShowResetModal(true);
                                    }}
                                    className="w-full py-3 bg-red-50 text-red-600 border border-red-100 font-bold text-xs hover:bg-red-600 hover:text-white transition-all rounded-none shadow-sm flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={14} />
                                    إعادة ضبط المصنع وتطهير النظام
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Premium Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowDeleteModal(false)}
                    ></div>
                    <div className="relative bg-white dark:bg-gray-900 w-full max-w-md shadow-2xl border-t-4 border-red-600 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600">
                                    <AlertCircle size={32} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">تأكيد الحذف</h3>
                                    <p className="text-sm text-slate-500 dark:text-gray-400 font-bold">هذا الإجراء لا يمكن التراجع عنه</p>
                                </div>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="bg-slate-50 dark:bg-gray-800/50 p-6 border-r-4 border-slate-200 dark:border-gray-700 mb-8">
                                <p className="text-slate-700 dark:text-gray-200 font-medium leading-relaxed">
                                    هل أنت متأكد من رغبتك في حذف المستخدم <span className="font-black text-red-600 dark:text-red-400">"{userToDelete?.username}"</span>؟ سيفقد كافة صلاحيات الوصول للنظام فوراً.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-6 py-4 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 font-black hover:bg-slate-200 dark:hover:bg-gray-700 transition-all uppercase tracking-widest text-xs"
                                >
                                    تراجع
                                </button>
                                <button
                                    onClick={() => {
                                        if (userToDelete) {
                                            deleteUser(userToDelete.id);
                                            setShowDeleteModal(false);
                                            setUserToDelete(null);
                                            showNotification('تم حذف المستخدم بنجاح');
                                        }
                                    }}
                                    className="flex-1 px-6 py-4 bg-red-600 text-white font-black hover:bg-red-700 transition-all shadow-[0_10px_20px_-10px_rgba(220,38,38,0.5)] transform active:scale-95 uppercase tracking-widest text-xs"
                                >
                                    تأكيد الحذف
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* System Reset Confirmation Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-500"
                        onClick={() => !resetLoading && setShowResetModal(false)}
                    ></div>
                    <div className="relative bg-white dark:bg-gray-900 w-full max-w-md shadow-2xl border-t-8 border-red-600 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0">
                                    <AlertCircle size={40} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter">تحذير أمني خطير</h3>
                                    <p className="text-sm text-red-600 dark:text-red-400 font-bold uppercase tracking-widest">تصفير النظام بالكامل</p>
                                </div>
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    disabled={resetLoading}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/10 p-6 border-r-4 border-red-600 mb-8">
                                <p className="text-slate-800 dark:text-gray-200 font-bold leading-relaxed text-sm">
                                    أنت على وشك مسح كافة بيانات النظام بشكل نهائي. سيتم حذف جميع الطلاب، المعلمين، والحسابات المالية.
                                    <br />
                                    <span className="text-red-700 dark:text-red-400 underline italic mt-2 block">لن يتم حذف حسابات مدير النظام والمشرفين.</span>
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    disabled={resetLoading}
                                    className="flex-1 px-6 py-4 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 font-black hover:bg-slate-200 dark:hover:bg-gray-700 transition-all uppercase tracking-widest text-xs"
                                >
                                    إلغاء العملية
                                </button>
                                <button
                                    onClick={handleSystemReset}
                                    disabled={resetLoading}
                                    className={cn(
                                        "flex-[1.5] px-6 py-4 bg-red-600 text-white font-black transition-all shadow-xl transform active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2",
                                        resetLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
                                    )}
                                >
                                    {resetLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            جاري الحذف...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={16} />
                                            تأكيد الحذف النهائي
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            <div
                className={`fixed bottom-8 left-8 z-[150] transform transition-all duration-500 ease-in-out ${showSuccess
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-20 opacity-0 pointer-events-none'
                    }`}
            >
                <div className="bg-primary-600/95 backdrop-blur-md text-white px-6 py-4 shadow-2xl flex items-center gap-4 border-r-4 border-primary-400 rounded-l-lg rounded-r-none min-w-[320px]">
                    <div className="bg-white/20 p-2.5 rounded-full shrink-0 animate-pulse">
                        <Check size={24} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg">{notificationMessage || 'تمت العملية بنجاح!'}</span>
                        <span className="text-sm font-normal opacity-90 text-primary-100">تم تحديث النظام وحفظ التغييرات</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
