import React from 'react';
import { UserPlus, Edit2, Trash2 } from 'lucide-react';
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
        <div className="flex-1 flex flex-col p-8 bg-gray-50/30 dark:bg-gray-950">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">إدارة مستخدمي الدردشة</h2>
                    <p className="text-gray-500 font-bold text-sm mt-1">إنشاء وتعديل حسابات الدردشة للمعهد</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProfile(null);
                        setProfileData({ name: '', username: '', password: '' });
                        setShowProfileForm(true);
                    }}
                    className="bg-primary-600 text-white px-8 py-4 font-black rounded-none shadow-xl shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center gap-3 uppercase text-xs tracking-widest"
                >
                    <UserPlus size={18} />
                    إضافة مستخدم جديد
                </button>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden rounded-none">
                <table className="w-full text-right">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">المستخدم</th>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">اسم المستخدم</th>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {profiles.map(p => (
                            <tr key={p.id} className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all border-b border-gray-100 dark:border-gray-800 last:border-0">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-600/10 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 flex items-center justify-center font-black text-lg border border-primary-600/20 shadow-sm transition-transform group-hover:scale-105">
                                            {p.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="font-black text-gray-900 dark:text-white block">{p.name}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-[8px] font-black uppercase tracking-tighter border border-indigo-100 dark:border-indigo-800">حساب دردشة</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 dark:text-gray-100">@{p.username}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">المعرف: {p.id.substring(0, 8)}</span>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingProfile(p);
                                                setProfileData({ name: p.name, username: p.username, password: '' });
                                                setShowProfileForm(true);
                                            }}
                                            className="p-3 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => confirmDeleteProfile(p.id)}
                                            className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {profiles.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-12 text-center text-gray-400 font-bold">لا يوجد مستخدمون حالياً</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
