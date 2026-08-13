import { useMemo } from 'react';
import { Users, UserPlus, Edit, Trash2, Shield, Check } from 'lucide-react';
import { SectionCard, SectionTitle, PrimaryBtn, SecondaryBtn, InputField, FieldLabel, AVAILABLE_PERMISSIONS } from './SettingsUI';
import { cn } from '../../../lib/utils';

interface UserRecord { id: string; username: string; name?: string; password?: string; permissions?: string[]; [key: string]: unknown; }
interface UserFormData { username: string; password: string; permissions: string[]; }
interface UsersSettingsProps {
    users: UserRecord[]; user: UserRecord | null; newUser: UserFormData;
    setNewUser: (v: UserFormData) => void; onSave: () => void;
    setShowDeleteModal: (v: boolean | UserRecord) => void; onDeleteAll: () => void; onSync: () => void;
    editingUserId: string | null; setEditingUserId: (id: string | null) => void; handleUserAction: () => void;
}

const QUICK_TEMPLATES = [
    { label: 'مدير نظام', perms: ['*'] },
    { label: 'محاسب', perms: ['finance', 'student_invoices', 'teacher_invoices', 'reports'] },
    { label: 'مشرف عام', perms: ['dashboard', 'students', 'teachers', 'parents', 'evaluations'] },
    { label: 'معلمين', perms: ['dashboard', 'attendance', 'schedule', 'evaluations', 'chat'] },
];

export const UsersSettings = ({ users, user, newUser, setNewUser, editingUserId, setEditingUserId, setShowDeleteModal, handleUserAction }: UsersSettingsProps) => {
    const groups = useMemo(() => {
        const g: Record<string, typeof AVAILABLE_PERMISSIONS> = {};
        AVAILABLE_PERMISSIONS.forEach(p => { (g[p.group] ||= []).push(p); });
        return g;
    }, []);

    const togglePerm = (id: string) => {
        if (id === '*') {
            setNewUser({ ...newUser, permissions: newUser.permissions.includes('*') ? [] : ['*'] });
            return;
        }
        if (newUser.permissions.includes('*')) {
            setNewUser({ ...newUser, permissions: [id] });
            return;
        }
        const perms = newUser.permissions.includes(id)
            ? newUser.permissions.filter(x => x !== id)
            : [...newUser.permissions, id];
        setNewUser({ ...newUser, permissions: perms });
    };

    return (
        <div className="space-y-4">
            <SectionCard>
                <SectionTitle
                    icon={editingUserId ? Edit : UserPlus}
                    label={editingUserId ? 'تعديل المسؤول' : 'إضافة حساب جديد'}
                    sub={editingUserId ? 'تحديث بيانات وصلاحيات المستخدم' : 'إنشاء حساب جديد بصلاحيات مخصصة'}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>اسم الدخول</FieldLabel>
                        <InputField value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder="اسم المستخدم" />
                    </div>
                    <div>
                        <FieldLabel>الرقم السري</FieldLabel>
                        <InputField type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" />
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/20">
                    <p className="text-[11px] font-bold text-primary flex items-center gap-1.5 mb-2">
                        <Shield size={11} /> قوالب صلاحيات سريعة
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {QUICK_TEMPLATES.map(role => (
                            <button
                                key={role.label}
                                onClick={() => setNewUser({ ...newUser, permissions: role.perms })}
                                className="px-3 py-1.5 bg-background hover:bg-primary-soft hover:text-primary text-muted text-[11px] font-bold border border-border/20 rounded-lg transition-all"
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/20">
                    <p className="text-[11px] font-bold text-primary flex items-center gap-1.5 mb-3">
                        <Shield size={11} /> تخصيص يدوي — كل صفحات النظام
                    </p>
                    <div className="space-y-4">
                        {Object.entries(groups).map(([groupName, perms]) => (
                            <div key={groupName}>
                                <p className="text-[11px] font-bold text-muted mb-2">{groupName}</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {perms.map(p => {
                                        const isSelected = newUser.permissions.includes(p.id);
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => togglePerm(p.id)}
                                                className={cn(
                                                    'px-2.5 py-2 text-[11px] font-bold border rounded-lg text-start transition-all flex items-center gap-1.5',
                                                    isSelected
                                                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                                                        : 'bg-card text-muted border-border/20 hover:border-primary/50 hover:text-main'
                                                )}
                                            >
                                                {isSelected && <Check size={11} className="shrink-0" />}
                                                {p.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-5 mt-5 border-t border-border/20">
                    <PrimaryBtn onClick={handleUserAction} className="flex-1">
                        <UserPlus size={13} /> {editingUserId ? 'تحديث الحساب' : 'إنشاء حساب'}
                    </PrimaryBtn>
                    {editingUserId && (
                        <SecondaryBtn onClick={() => { setEditingUserId(null); setNewUser({ username: '', password: '', permissions: [] }); }} className="sm:w-40">
                            إلغاء التعديل
                        </SecondaryBtn>
                    )}
                </div>
            </SectionCard>

            <SectionCard>
                <SectionTitle icon={Users} label="الحسابات والمسؤولون" sub="إدارة الحسابات الموجودة" />
                <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-[11px] font-bold px-3 py-1.5 bg-primary-soft text-primary rounded-lg">
                        {users.length} حساب
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {users.map(u => (
                        <div key={u.id} className="bg-card border border-border/20 rounded-xl p-4 group hover:border-primary/30 hover:shadow-sm transition-all duration-200">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-primary-soft text-primary">
                                    {u.username[0].toUpperCase()}
                                </div>
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setEditingUserId(u.id); setNewUser({ username: u.username, password: '', permissions: u.permissions || [] }); }}
                                        className="p-2 bg-background border border-border/30 text-muted hover:text-primary hover:border-primary rounded-lg transition-all"
                                        title="تعديل"
                                    >
                                        <Edit size={13} />
                                    </button>
                                    {u.id !== user?.id && (
                                        <button
                                            onClick={() => setShowDeleteModal(u)}
                                            className="p-2 bg-error-soft border border-error/20 text-error hover:bg-error/20 rounded-lg transition-all"
                                            title="حذف"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm font-bold text-main truncate">{u.name || u.username}</p>
                            <p className="text-[11px] text-muted flex items-center gap-1 mt-1">
                                <Shield size={10} className="text-primary" />
                                {u.permissions?.includes('*') ? 'Admin كامل' : `${u.permissions?.length || 0} صلاحيات`}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border/20">
                                {u.permissions?.slice(0, 3).map(p => (
                                    <span key={p} className="text-[11px] bg-background text-muted px-2 py-0.5 rounded-md border border-border/20">
                                        {p}
                                    </span>
                                ))}
                                {(u.permissions?.length || 0) > 3 && (
                                    <span className="text-[11px] bg-primary-soft text-primary px-2 py-0.5 rounded-md font-bold">
                                        +{(u.permissions?.length || 0) - 3}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
};
