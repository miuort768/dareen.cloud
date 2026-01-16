import { Building2 } from 'lucide-react';

interface AcademySettingsSectionProps {
    academyName: string;
    setAcademyName: (name: string) => void;
    adminPhone: string;
    setAdminPhone: (phone: string) => void;
}

export const AcademySettingsSection = ({
    academyName,
    setAcademyName,
    adminPhone,
    setAdminPhone
}: AcademySettingsSectionProps) => {
    return (
        <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-primary-100 rounded-none dark:bg-primary-900/30">
                    <Building2 size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    إعدادات الأكاديمية
                </h2>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 dark:text-gray-300">
                        اسم الأكاديمية
                    </label>
                    <input
                        type="text"
                        value={academyName}
                        onChange={(e) => setAcademyName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-none px-4 py-3 focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
                        placeholder="أدخل اسم الأكاديمية"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 dark:text-gray-300">
                        رقم هاتف مدير النظام (لاستقبال تنبيهات المعلمين)
                    </label>
                    <input
                        type="text"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-none px-4 py-3 focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
                        placeholder="01xxxxxxxxx"
                        dir="ltr"
                    />
                </div>
            </div>
        </section>
    );
};
