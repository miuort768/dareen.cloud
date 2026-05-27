import { Settings as SettingsIcon, Save } from 'lucide-react';

interface SettingsHeaderProps {
    onSave: () => void;
}

export const SettingsHeader = ({ onSave }: SettingsHeaderProps) => {
    return (
        <div className="bg-primary-600 p-6 shadow-sm transition-colors duration-500">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-normal text-white flex items-center gap-3 mb-1">
                        <div className="p-2 bg-white/10  rounded-xl">
                            <SettingsIcon size={28} />
                        </div>
                        الإعدادات
                    </h1>
                    <p className="text-white text-sm">إدارة إعدادات النظام والحساب</p>
                </div>
                <button
                    onClick={onSave}
                    className="bg-white text-primary-600 px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-white/90 active:bg-white/80 transition-all font-normal shadow-sm transform hover:-translate-y-0.5"
                >
                    <Save size={18} />
                    <span>حفظ جميع التغييرات</span>
                </button>
            </div>
        </div>
    );
};
