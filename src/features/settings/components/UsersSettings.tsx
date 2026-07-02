import { Users, UserPlus, Edit, Trash2, Shield, RefreshCw } from 'lucide-react';
import { SectionCard, SectionTitle, PrimaryBtn, SecondaryBtn, InputField, FieldLabel, AVAILABLE_PERMISSIONS } from './SettingsUI';
import { cn } from '../../../lib/utils';

interface UsersSettingsProps {
    users: Record<string, unknown>[];
    user: Record<string, unknown>;
    setNewUser: (v: Record<string, unknown>) => void;
    onSave: () => void;
    setShowDeleteModal: (v: boolean) => void;
    onDeleteAll: () => void;
    onSync: () => void;
}

export const UsersSettings = ({ users, user, newUser, setNewUser, editingUserId, setEditingUserId, setShowDeleteModal, handleUserAction }: UsersSettingsProps) => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-soft flex items-center justify-center">
                        <Users size={16} className="text-primary" />
                    </div>
                    <p className="text-sm font-normal text-main">الحسابات والمسؤولون</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-primary-soft text-primary">
                    {users.length} حسابات
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {users.map(u => (
                    <div key={u.id} className="bg-card border border-border p-4 shadow-sm group hover:border-primary transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 flex items-center justify-center font-bold text-sm bg-primary-soft text-primary">
                                {u.username[0].toUpperCase()}
                            </div>
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => { setEditingUserId(u.id); setNewUser({ username: u.username, password: '', permissions: u.permissions || [] }); }}
                                    className="p-1.5 bg-hover text-muted border border-border hover:text-primary hover:border-primary transition-all"
                                >
                                    <Edit size={13} />
                                </button>
                                {u.id !== user?.id && (
                                    <button
                                        onClick={() => setShowDeleteModal(u)}
                                        className="p-1.5 bg-error-soft text-error border border-border hover:text-error transition-all"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="font-normal text-sm text-main truncate">{u.name || u.username}</p>
                        <p className="text-[10px] text-muted flex items-center gap-1 mt-1">
                            <Shield size={10} className="text-primary" />
                            {u.permissions?.includes('*') ? 'Admin كامل' : `${u.permissions?.length || 0} صلاحيات`}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border">
                            {u.permissions?.slice(0, 3).map(p => (
                                <span key={p} className="text-[9px] font-normal bg-hover text-muted px-1.5 py-0.5 border border-border">
                                    {p}
                                </span>
                            ))}
                            {(u.permissions?.length || 0) > 3 && (
                                <span className="text-[9px] font-normal bg-primary-soft text-primary px-1.5 py-0.5">
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
                        placeholder="اسم المستخدم"
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

                <div className="pt-2 border-t border-border">
                    <p className="text-[10px] font-normal text-primary flex items-center gap-1.5 mb-2">
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
                                className="px-2.5 py-1 bg-hover hover:bg-primary-soft hover:text-primary text-muted text-[10px] font-normal border border-border transition-all"
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-muted mb-2">تخصيص يدوي</p>
                    <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-surface border border-border">
                        {AVAILABLE_PERMISSIONS.map((p: { id: string; label: string }) => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    const perms = newUser.permissions.includes(p.id)
                                        ? newUser.permissions.filter(x => x !== p.id)
                                        : [...newUser.permissions, p.id];
                                    setNewUser({ ...newUser, permissions: perms });
                                }}
                                className={cn(
                                    'p-2 text-[9px] font-normal border text-right transition-all',
                                    newUser.permissions.includes(p.id)
                                        ? 'bg-primary text-on-primary border-primary'
                                        : 'bg-card text-muted border-border hover:border-primary'
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
);
