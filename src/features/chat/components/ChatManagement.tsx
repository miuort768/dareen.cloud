import React from 'react';
import { UserPlus, Edit2, Trash2, MessageCircle } from 'lucide-react';
import type { ChatUser } from '../../../types/chat.types';

interface ChatManagementProps {
    profiles: ChatUser[];
    setEditingProfile: (profile: ChatUser | null) => void;
    setProfileData: (data: { name: string; username: string; password: '' }) => void;
    setShowProfileForm: (val: boolean) => void;
    confirmDeleteProfile: (id: string) => void;
}

export const ChatManagement: React.FC<ChatManagementProps> = ({
    profiles,
    setEditingProfile,
    setProfileData,
    setShowProfileForm,
    confirmDeleteProfile
}) => {
    return (
        <div className="flex-1 flex flex-col p-4 lg:p-8 bg-white dark:bg-background lg:rounded-none lg:shadow-sm border border-white/20 dark:border-border/50 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-medium text-main dark:text-on-primary tracking-tight">إدارة المستخدمين</h2>
                    <p className="text-muted font-normal text-sm mt-1">التحكم في حسابات الدردشة الإضافية وصلاحياتها</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProfile(null);
                        setProfileData({ name: '', username: '', password: '' });
                        setShowProfileForm(true);
                    }}
                    className="bg-primary text-on-primary px-6 py-3 font-medium rounded-none shadow-sm shadow-primary/20 hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm"
                >
                    <UserPlus size={20} />
                    إضافة مستخدم جديد
                </button>
            </div>

            <div className="overflow-x-auto rounded-none border border-border dark:border-border/50 shadow-sm">
                <table className="w-full text-end border-collapse">
                    <thead>
                        <tr className="bg-background dark:bg-card border-b border-border dark:border-border">
                            <th className="p-4 lg:p-5 text-xs font-medium text-muted uppercase tracking-widest">المستخدم</th>
                            <th className="p-4 lg:p-5 text-xs font-medium text-muted uppercase tracking-widest">اسم المستخدم</th>
                            <th className="p-4 lg:p-5 text-xs font-medium text-muted uppercase tracking-widest text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-border bg-white dark:bg-background">
                        {profiles.map(p => (
                            <tr key={p.id} className="group hover:bg-surface/50 dark:hover:bg-primary/10 transition-colors">
                                <td className="p-4 lg:p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-soft text-primary dark:bg-primary/30 dark:text-primary rounded-none flex items-center justify-center font-medium text-lg border border-primary dark:border-primary/50 shadow-sm transition-transform group-hover:scale-110">
                                            {p.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="font-medium text-main dark:text-dim block">{p.name}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-0.5 bg-success-light text-success dark:bg-success/30 dark:text-success text-micro font-medium rounded uppercase border border-success dark:border-success">متصل</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 lg:p-6">
                                    <div className="flex flex-col">
                                        <span className="font-normal text-main dark:text-dim">@{p.username}</span>
                                        <span className="text-micro text-muted font-normal uppercase tracking-widest mt-0.5 opacity-60">ID: {p.id.substring(0, 8)}</span>
                                    </div>
                                </td>
                                <td className="p-4 lg:p-5">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingProfile(p);
                                                setProfileData({ name: p.name, username: p.username, password: '' });
                                                setShowProfileForm(true);
                                            }}
                                            className="w-10 h-10 flex items-center justify-center text-muted hover:text-primary hover:bg-primary-soft dark:hover:bg-primary/20 rounded-none transition-all"
                                            title="تعديل"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => confirmDeleteProfile(p.id)}
                                            className="w-10 h-10 flex items-center justify-center text-muted hover:text-error hover:bg-error-light dark:hover:bg-error/20 rounded-none transition-all"
                                            title="حذف"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {profiles.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-16 text-center text-muted">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-background dark:bg-card rounded-none flex items-center justify-center mb-4">
                                            <MessageCircle size={32} className="opacity-20" />
                                        </div>
                                        <p className="font-normal">لا يوجد مستخدمون حالياً</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
