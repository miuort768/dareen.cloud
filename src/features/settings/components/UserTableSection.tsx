import { Edit, Trash2, Users } from 'lucide-react';
import type { User as GlobalUser } from '../../../types/auth';
import { AVAILABLE_PERMISSIONS } from '../types';

interface UserTableSectionProps {
    users: GlobalUser[];
    currentUser: GlobalUser;
    onStartEditing: (user: GlobalUser) => void;
    onDeleteRequest: (user: GlobalUser) => void;
}

export const UserTableSection = ({
    users,
    currentUser,
    onStartEditing,
    onDeleteRequest
}: UserTableSectionProps) => {
    return (
        <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-primary-100 rounded-xl dark:bg-primary-900/30">
                    <Users size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-lg font-normal text-gray-900 dark:text-white">
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
                                        ? <span className="text-primary-600 font-normal">وصول كامل (Admin)</span>
                                        : u.permissions?.map(p => {
                                            const label = AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p;
                                            return label;
                                        }).join('، ') || 'بلا صلاحيات'
                                    }
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onStartEditing(u)}
                                            className="text-primary-500 hover:text-primary-700 font-normal text-xs flex items-center gap-1"
                                        >
                                            <Edit size={14} />
                                            تعديل
                                        </button>
                                        {u.id !== currentUser.id && u.id !== 'admin_1' && (
                                            <button
                                                onClick={() => onDeleteRequest(u)}
                                                className="text-red-500 hover:text-red-700 font-normal text-xs flex items-center gap-1"
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
    );
};
