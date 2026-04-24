import { Trophy, Star, Award, History } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Badge {
    name: string;
    color: string;
    date: string;
}

interface PointLog {
    id: string;
    amount: number;
    action: string;
    timestamp: string;
}

interface GamificationCardProps {
    totalPoints: number;
    badges: string | Badge[];
    pointLogs?: PointLog[];
}

export const GamificationCard = ({ totalPoints, badges, pointLogs = [] }: GamificationCardProps) => {
    const parsedBadges: Badge[] = typeof badges === 'string' ? JSON.parse(badges || '[]') : badges;

    return (
        <div className="space-y-3 md:space-y-4">
            {/* Total Points Card - Compact Style */}
            <div className="bg-indigo-600 dark:bg-indigo-600 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg shadow-indigo-600/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 blur-2xl rounded-full -translate-y-8 translate-x-8 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-[7px] md:text-[8px] font-black text-indigo-100 uppercase tracking-widest mb-0.5 opacity-80">إجمالي نقاط الإنجاز</p>
                        <h2 className="text-xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                            {totalPoints.toLocaleString()}
                            <div className="p-0.5 md:p-1 bg-white/20 rounded-lg">
                                <Star size={12} className="fill-current text-yellow-300 md:w-3.5 md:h-3.5" />
                            </div>
                        </h2>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <Trophy size={16} className="text-white md:w-5 md:h-5" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Badges Collection */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm">
                    <h3 className="font-black text-[8px] md:text-[9px] uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                        <Award size={12} className="text-indigo-600" /> الأوسمة المكتسبة
                    </h3>
                    <div className="grid grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
                        {parsedBadges.length > 0 ? parsedBadges.map((badge, idx) => (
                            <div 
                                key={idx} 
                                className={cn(
                                    "flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-help",
                                    badge.color === 'blue' ? "bg-blue-50/50 border-blue-100 text-blue-600 dark:bg-blue-900/10" :
                                    badge.color === 'amber' ? "bg-amber-50/50 border-amber-100 text-amber-600 dark:bg-amber-900/10" :
                                    badge.color === 'emerald' ? "bg-emerald-50/50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/10" :
                                    "bg-rose-50/50 border-rose-100 text-rose-600 dark:bg-rose-900/10"
                                )}
                                title={`تم الحصول عليه في ${format(new Date(badge.date), 'yyyy/MM/dd')}`}
                            >
                                <Award size={14} strokeWidth={2.5} className="md:w-4 md:h-4" />
                                <span className="text-[6px] md:text-[7px] font-black uppercase text-center leading-none">{badge.name}</span>
                            </div>
                        )) : (
                            <div className="col-span-4 py-4 text-center bg-slate-50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg opacity-40">
                                <p className="text-[7px] font-black uppercase tracking-widest">لا توجد أوسمة</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Points History */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm flex flex-col">
                    <h3 className="font-black text-[8px] md:text-[9px] uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                        <History size={12} className="text-indigo-600" /> سجل النشاط الأخير
                    </h3>
                    <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[150px] md:max-h-[200px] custom-scrollbar pr-1">
                        {pointLogs.length > 0 ? pointLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors hover:border-indigo-200 dark:hover:border-indigo-900">
                                <div className="min-w-0">
                                    <p className="text-[8px] md:text-[9px] font-black text-slate-900 dark:text-white truncate">{log.action}</p>
                                    <p className="text-[6px] md:text-[7px] text-slate-400 font-bold mt-0.5">{format(new Date(log.timestamp), 'yyyy/MM/dd', { locale: ar })}</p>
                                </div>
                                <span className={cn(
                                    "font-black text-[8px] md:text-[10px] shrink-0 ml-1.5",
                                    log.amount > 0 ? "text-emerald-600" : "text-rose-600"
                                )}>
                                    {log.amount > 0 ? '+' : ''}{log.amount}
                                </span>
                            </div>
                        )) : (
                            <p className="text-center py-6 text-[7px] font-bold text-slate-400 uppercase tracking-widest">لا توجد سجلات</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
