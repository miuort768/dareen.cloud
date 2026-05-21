import { Users, UserPlus, Edit, Trash2, Shield, CheckCircle2, RefreshCw } from 'lucide-react';
import { SectionCard, SectionTitle, PrimaryBtn, SecondaryBtn, InputField, FieldLabel, AVAILABLE_PERMISSIONS } from './SettingsUI';
import { cn } from '../../../lib/utils';

interface UsersSettingsProps {
    users: any[];
    user: any;
    newUser: { username: string; password: string; permissions: string[] };
    setNewUser: (v: any) => void;
    editingUserId: string | null;
    setEditingUserId: (v: string | null) => void;
    setShowDeleteModal: (v: any) => void;
    handleUserAction: () => void;
}

export const UsersSettings = ({ users, user, newUser, setNewUser, editingUserId, setEditingUserId, setShowDeleteModal, handleUserAction }: UsersSettingsProps) => (
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
);
