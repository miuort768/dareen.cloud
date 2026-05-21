import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useDarkMode } from '../../../shared/hooks/useDarkMode';
import { settingsService } from '../services/settingsService';

export const useSettings = () => {
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
        setAutoBackup,
        showNotification
    } = useApp();

    const [theme, setTheme] = useDarkMode();
    const [loading, setLoading] = useState(true);

    // Form/Local state
    const [localName, setLocalName] = useState(user.name);
    const [localUsername, setLocalUsername] = useState(user.username);
    const [localPassword, setLocalPassword] = useState('');
    const [localAcademyName, setLocalAcademyName] = useState(academyName);
    const [localAdminPhone, setLocalAdminPhone] = useState(adminPhone);

    // User management state
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [newUserUsername, setNewUserUsername] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserPermissions, setNewUserPermissions] = useState<string[]>([]);

    // UI states
    const [userToDelete, setUserToDelete] = useState<{ id: string; username: string } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetPassword, setResetPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    const formRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleSaveGeneral = () => {
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
        showNotification('تم حفظ الإعدادات العامة بنجاح!');
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
            const updates: Record<string, unknown> = {
                username: newUserUsername,
                name: newUserUsername,
                permissions: newUserPermissions
            };
            if (newUserPassword) updates.password = newUserPassword;

            editUser(editingUserId, updates);
            setEditingUserId(null);
            showNotification('تم تحديث بيانات المستخدم وصلاحياته بنجاح');
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
            showNotification('تم إنشاء المستخدم الجديد بنجاح');
        }

        setNewUserUsername('');
        setNewUserPassword('');
        setNewUserPermissions([]);
    };

    const startEditingUser = (userToEdit: { id: string; username: string; permissions?: string[] }) => {
        setEditingUserId(userToEdit.id);
        setNewUserUsername(userToEdit.username);
        setNewUserPassword('');
        setNewUserPermissions(userToEdit.permissions || []);
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelEditingUser = () => {
        setEditingUserId(null);
        setNewUserUsername('');
        setNewUserPassword('');
        setNewUserPermissions([]);
    };

    const handleExport = async () => {
        try {
            const backupData = await settingsService.getBackup();
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

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const backupData = JSON.parse(event.target?.result as string);
                if (backupData.data) {
                    await settingsService.restoreBackup(backupData.data);
                }

                if (backupData.settings) {
                    const settings = backupData.settings;
                    if (settings.academy) setLocalAcademyName(settings.academy.name);
                    if (settings.user) {
                        setLocalName(settings.user.name);
                        setLocalUsername(settings.user.username);
                    }
                    if (settings.appSettings) {
                        setNotificationsEnabled(settings.appSettings.notifications);
                        setAutoBackup(settings.appSettings.autoBackup);
                        if (settings.appSettings.themeColor) setThemeColor(settings.appSettings.themeColor);
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
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSystemReset = async () => {
        if (!resetPassword) {
            alert('يرجى إدخال كلمة المرور للمتابعة');
            return;
        }

        if (resetPassword !== user.password) {
            alert('كلمة المرور غير صحيحة');
            return;
        }

        setResetLoading(true);
        try {
            await settingsService.systemReset();
            localStorage.removeItem('auth_token');
            localStorage.removeItem('app_current_user');
            localStorage.removeItem('app_isAuthenticated');

            showNotification('تم تصفير بيانات النظام بنجاح! سيتم إعادة تحميل الصفحة...');
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            console.error('System reset error:', err);
            alert('حدث خطأ أثناء تصفير النظام');
        } finally {
            setResetLoading(false);
            setShowResetModal(false);
        }
    };

    return {
        state: {
            user,
            users,
            loading,
            theme,
            themeColor,
            autoBackup,
            localName,
            localUsername,
            localPassword,
            localAcademyName,
            localAdminPhone,
            editingUserId,
            newUserUsername,
            newUserPassword,
            newUserPermissions,
            userToDelete,
            showDeleteModal,
            showResetModal,
            resetPassword,
            resetLoading
        },
        refs: {
            formRef,
            fileInputRef
        },
        actions: {
            setLocalName,
            setLocalUsername,
            setLocalPassword,
            setLocalAcademyName,
            setLocalAdminPhone,
            setNewUserUsername,
            setNewUserPassword,
            setTheme,
            setThemeColor,
            setUserToDelete,
            setShowDeleteModal,
            setShowResetModal,
            setResetPassword,
            handleSaveGeneral,
            handleTogglePermission,
            handleUserSubmit,
            startEditingUser,
            cancelEditingUser,
            handleExport,
            handleImportFile,
            handleSystemReset,
            deleteUser,
            confirmDeleteUser: () => {
                if (userToDelete) {
                    deleteUser(userToDelete.id);
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                    showNotification('تم حذف المستخدم بنجاح');
                }
            }
        }
    };
};
