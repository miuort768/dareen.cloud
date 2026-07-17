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
        <section className="bg-card border border-border shadow-soft p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-9 h-9 flex items-center justify-center bg-primary-soft">
                    <Palette size={18} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold text-main">
                    المظهر
                </h2>
            </div>
            <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-warning" />}
                        <div>
                            <p className="font-normal text-sm text-main">الوضع الداكن</p>
                            <p className="text-xs text-muted">تفعيل/إلغاء الوضع الليلي</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className={`relative w-12 h-7 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-border'
                            }`}
                    >
                        <span
                            className={`absolute top-1 w-5 h-5 bg-card rounded-full transition-transform transform duration-300 ${theme === 'dark' ? 'translate-x-[2px] dark:start-[2px] dark:end-auto' : '-translate-x-[26px] start-auto end-[2px]'
                                }`}
                        ></span>
                    </button>
                </div>

                {/* Theme Color Selector */}
                <div>
                    <p className="font-normal text-sm text-main mb-3 flex items-center gap-2">
                        <Palette size={14} className="text-primary" />
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
                                        ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-soft"
                                        : "ring-1 ring-border hover:ring-border-strong scale-100"
                                )}>
                                    <div
                                        className="w-6 h-6 rounded-full shadow-inner transition-transform group-hover:scale-90"
                                        style={{ backgroundColor: preset.color }}
                                    />
                                </div>
                                <span className={cn(
                                    "text-micro font-medium tracking-tight transition-colors whitespace-nowrap",
                                    themeColor === preset.id ? "text-primary" : "text-dim"
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
