import { Users, UserPlus, Edit, Trash2, Shield } from 'lucide-react';
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

export const UsersSettings = ({ users, user, newUser, setNewUser, editingUserId, setEditingUserId, setShowDeleteModal, handleUserAction }: UsersSettingsProps) => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-1 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Users size={16} className="text-primary" />
                    </div>
                    <p className="text-sm font-bold text-main">الحسابات والمسؤولون</p>
                </div>
                <span className="text-[11px] font-bold px-3 py-1.5 bg-primary/10 text-primary rounded-lg">
                    {users.length} حسابات
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {users.map(u => (
                    <div key={u.id} className="bg-card border border-border/20 rounded-xl p-4 group hover:border-primary/30 hover:shadow-sm transition-all duration-200">
                        <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                                {u.username[0].toUpperCase()}
                            </div>
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => { setEditingUserId(u.id); setNewUser({ username: u.username, password: '', permissions: u.permissions || [] }); }}
                                    className="p-2 bg-background border border-border/30 text-muted hover:text-primary hover:border-primary rounded-lg transition-all"
                                >
                                    <Edit size={13} />
                                </button>
                                {u.id !== user?.id && (
                                    <button
                                        onClick={() => setShowDeleteModal(u)}
                                        className="p-2 bg-error/5 border border-error/20 text-error hover:bg-error/10 rounded-lg transition-all"
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
                                <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">
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
                sub={editingUserId ? 'تحديث صلاحيات المستخدم' : 'إنشاء حساب مسؤول جديد'}
            />
            <div className="space-y-3">
                <div>
                    <FieldLabel>اسم الدخول</FieldLabel>
                    <InputField value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder="اسم المستخدم" />
                </div>
                <div>
                    <FieldLabel>الرقم السري</FieldLabel>
                    <InputField type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" />
                </div>

                <div className="pt-3 border-t border-border/20">
                    <p className="text-[11px] font-bold text-primary flex items-center gap-1.5 mb-2">
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
                                className="px-3 py-1.5 bg-background hover:bg-primary/10 hover:text-primary text-muted text-[11px] font-bold border border-border/20 rounded-lg transition-all"
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-[11px] text-muted mb-2">تخصيص يدوي</p>
                    <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-background border border-border/20 rounded-xl">
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
                                    'p-2 text-[11px] font-bold border rounded-lg text-start transition-all',
                                    newUser.permissions.includes(p.id)
                                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                                        : 'bg-card text-muted border-border/20 hover:border-primary/50'
                                )}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                    <PrimaryBtn onClick={handleUserAction} className="w-full">
                        <UserPlus size={13} /> {editingUserId ? 'تحديث الحساب' : 'إنشاء حساب'}
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
