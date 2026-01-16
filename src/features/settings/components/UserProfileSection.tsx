import { User, Lock } from 'lucide-react';

interface UserProfileSectionProps {
    name: string;
    username: string;
    setUsername: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
}

export const UserProfileSection = ({
    name,
    username,
    setUsername,
    password,
    setPassword
}: UserProfileSectionProps) => {
    return (
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
                        {name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">مدير النظام</p>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 dark:text-gray-300">
                        الاسم الظاهر
                    </label>
                    <input
                        type="text"
                        value={name}
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
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-none px-3 py-2 text-sm focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
                    />
                </div>
            </div>
        </section>
    );
};
