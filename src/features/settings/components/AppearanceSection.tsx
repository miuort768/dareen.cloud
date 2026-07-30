import { Palette, Moon, Sun, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { THEME_PRESETS } from '../types';

interface AppearanceSectionProps {
    theme: string;
    setTheme: (t: string) => void;
    themeColor: string;
    setThemeColor: (c: string) => void;
}

export const AppearanceSection = ({
    theme, setTheme, themeColor, setThemeColor
}: AppearanceSectionProps) => {
    return (
        <section className="bg-card border border-border/20 rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/20">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
                    <Palette size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                    <h2 className="text-sm font-bold text-main">المظهر</h2>
                    <p className="text-[11px] font-bold text-muted mt-0.5">الوضع الداكن وسمة الألوان</p>
                </div>
                <div className="w-16 h-0.5 rounded-full bg-gradient-to-l from-primary/40 to-transparent hidden sm:block" />
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-background border border-border/20 rounded-xl hover:border-border/40 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                            {theme === 'dark'
                                ? <Moon size={16} className="text-primary" />
                                : <Sun size={16} className="text-warning" />
                            }
                        </div>
                        <div>
                            <p className="text-xs font-bold text-main">الوضع الداكن</p>
                            <p className="text-[11px] font-bold text-muted mt-0.5">تفعيل/إلغاء الوضع الليلي</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className={cn(
                            'relative w-12 h-7 rounded-full transition-all duration-300 shrink-0',
                            theme === 'dark' ? 'bg-gradient-to-r from-primary to-primary-active shadow-sm shadow-primary/30' : 'bg-border/60 hover:bg-border'
                        )}
                    >
                        <span className={cn(
                            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300',
                            theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
                        )} />
                    </button>
                </div>

                <div>
                    <p className="text-xs font-bold text-main mb-3 flex items-center gap-2">
                        <Palette size={14} className="text-primary" />
                        سمة الألوان
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3">
                        {THEME_PRESETS.map((preset) => {
                            const isActive = themeColor === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    onClick={() => setThemeColor(preset.id)}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                        isActive
                                            ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110 shadow-md"
                                            : "ring-1 ring-border/40 hover:ring-border hover:shadow-sm"
                                    )}>
                                        <div className="w-full h-full rounded-[10px] shadow-inner relative overflow-hidden"
                                            style={{ backgroundColor: preset.color }}
                                        >
                                            {isActive && (
                                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                                    <Check size={14} className="text-white drop-shadow" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold tracking-tight transition-colors",
                                        isActive ? "text-primary" : "text-muted"
                                    )}>
                                        {preset.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
