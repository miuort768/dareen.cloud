import { Palette, Moon, Sun } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { THEME_PRESETS } from '../types';

interface AppearanceSectionProps {
    theme: string;
    setTheme: (t: string) => void;
    themeColor: string;
    setThemeColor: (c: string) => void;
}

export const AppearanceSection = ({
    theme,
    setTheme,
    themeColor,
    setThemeColor
}: AppearanceSectionProps) => {
    return (
        <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-primary-100 rounded-xl dark:bg-primary-900/30">
                    <Palette size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-lg font-normal text-gray-900 dark:text-white">
                    المظهر
                </h2>
            </div>
            <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? <Moon size={18} className="text-primary-600" /> : <Sun size={18} className="text-amber-500" />}
                        <div>
                            <p className="font-normal text-sm text-gray-900 dark:text-white">الوضع الداكن</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">تفعيل/إلغاء الوضع الليلي</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className={`relative w-12 h-7 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform transform duration-300 ${theme === 'dark' ? 'translate-x-[2px]' : '-translate-x-[26px]'
                                }`}
                            style={{ right: theme === 'dark' ? 'auto' : '2px', left: theme === 'dark' ? '2px' : 'auto' }}
                        ></span>
                    </button>
                </div>

                {/* Theme Color Selector */}
                <div>
                    <p className="font-normal text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Palette size={14} className="text-primary-500" />
                        سمة الألوان
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
                        {THEME_PRESETS.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => setThemeColor(preset.id)}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                    themeColor === preset.id
                                        ? "ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900 scale-110 shadow-sm shadow-primary-500/20"
                                        : "ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-gray-300 dark:hover:ring-gray-600 scale-100"
                                )}>
                                    <div
                                        className="w-6 h-6 rounded-full shadow-inner transition-transform group-hover:scale-90"
                                        style={{ backgroundColor: preset.color }}
                                    />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium tracking-tight transition-colors whitespace-nowrap",
                                    themeColor === preset.id ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-gray-500"
                                )}>
                                    {preset.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
