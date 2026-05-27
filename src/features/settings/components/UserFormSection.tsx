import React from 'react';
import { UserPlus, Shield } from 'lucide-react';
import { AVAILABLE_PERMISSIONS } from '../types';

interface UserFormSectionProps {
    editingUserId: string | null;
    username: string;
    setUsername: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    permissions: string[];
    onTogglePermission: (id: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    formRef: React.RefObject<HTMLDivElement>;
}

export const UserFormSection = ({
    editingUserId,
    username,
    setUsername,
    password,
    setPassword,
    permissions,
    onTogglePermission,
    onSubmit,
    onCancel,
    formRef
}: UserFormSectionProps) => {
    return (
        <section ref={formRef} className={`bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-sm transition-shadow ${editingUserId ? 'ring-2 ring-primary-500' : ''}`}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-primary-100 rounded-xl dark:bg-primary-900/30">
                    <UserPlus size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-lg font-normal text-gray-900 dark:text-white">
                    {editingUserId ? 'تعديل بيانات المستخدم' : 'إنشاء مستخدم جديد'}
                </h2>
            </div>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-normal text-gray-700 mb-2 dark:text-gray-300">
                            اسم المستخدم
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
                            placeholder="username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-normal text-gray-700 mb-2 dark:text-gray-300">
                            {editingUserId ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور'}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
                            placeholder={editingUserId ? "اتركها فارغة للإبقاء على الحالية" : "••••••••"}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-normal text-gray-700 mb-3 dark:text-gray-300 flex items-center gap-2">
                        <Shield size={14} />
                        صلاحيات الوصول
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {AVAILABLE_PERMISSIONS.map((perm) => (
                            <label
                                key={perm.id}
                                className={`
                                    flex items-center gap-3 p-3 border cursor-pointer transition-all
                                    ${permissions.includes(perm.id)
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                                    }
                                `}
                            >
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                    checked={permissions.includes(perm.id)}
                                    onChange={() => onTogglePermission(perm.id)}
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
                            onClick={onCancel}
                            className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-lg font-normal hover:bg-gray-200 transition-colors"
                        >
                            إلغاء
                        </button>
                    )}
                    <button
                        onClick={onSubmit}
                        className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-normal hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                        <UserPlus size={18} />
                        {editingUserId ? 'حفظ التعديلات' : 'إضافة المستخدم'}
                    </button>
                </div>
            </div>
        </section>
    );
};
