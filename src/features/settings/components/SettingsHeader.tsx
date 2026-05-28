import { Settings as SettingsIcon, Save } from 'lucide-react';

interface SettingsHeaderProps {
    onSave: () => void;
}

export const SettingsHeader = ({ onSave }: SettingsHeaderProps) => {
    return (
        <div className="bg-[#2563EB] p-6 shadow-sm transition-colors duration-500">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3 mb-1">
                        <div className="p-2" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                            <SettingsIcon size={28} className="text-white" />
                        </div>
                        الإعدادات
                    </h1>
                    <p className="text-white/70 text-sm font-bold">إدارة إعدادات النظام والحساب</p>
                </div>
                <button
                    onClick={onSave}
                    className="bg-white text-[#2563EB] px-6 py-2.5 flex items-center gap-2 hover:bg-white/90 active:bg-white/80 transition-all font-bold shadow-sm"
                >
                    <Save size={18} />
                    <span>حفظ جميع التغييرات</span>
                </button>
            </div>
        </div>
    );
};