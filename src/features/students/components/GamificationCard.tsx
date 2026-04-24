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
        <div className="space-y-4">
            {/* Total Points Card - Dashboard Style */}
            <div className="bg-indigo-600 dark:bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-600/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 blur-2xl rounded-full -translate-y-10 translate-x-10 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-[8px] font-black text-indigo-100 uppercase tracking-widest mb-1 opacity-80">إجمالي نقاط الإنجاز</p>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                            {totalPoints.toLocaleString()}
                            <div className="p-1 bg-white/20 rounded-lg">
                                <Star size={14} className="fill-current text-yellow-300" />
                            </div>
                        </h2>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <Trophy size={20} className="text-white" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Badges Collection */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                    <h3 className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <Award size={14} className="text-indigo-600" /> الأوسمة المكتسبة
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                        {parsedBadges.length > 0 ? parsedBadges.map((badge, idx) => (
                            <div 
                                key={idx} 
                                className={cn(
                                    "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-help",
                                    badge.color === 'blue' ? "bg-blue-50/50 border-blue-100 text-blue-600 dark:bg-blue-900/10" :
                                    badge.color === 'amber' ? "bg-amber-50/50 border-amber-100 text-amber-600 dark:bg-amber-900/10" :
                                    badge.color === 'emerald' ? "bg-emerald-50/50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/10" :
                                    "bg-rose-50/50 border-rose-100 text-rose-600 dark:bg-rose-900/10"
                                )}
                                title={`تم الحصول عليه في ${format(new Date(badge.date), 'yyyy/MM/dd')}`}
                            >
                                <Award size={18} strokeWidth={2.5} />
                                <span className="text-[7px] font-black uppercase text-center leading-none">{badge.name}</span>
                            </div>
                        )) : (
                            <div className="col-span-4 py-6 text-center bg-slate-50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl opacity-40">
                                <p className="text-[8px] font-black uppercase tracking-widest">لا توجد أوسمة</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Points History */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col">
                    <h3 className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <History size={14} className="text-indigo-600" /> سجل النشاط الأخير
                    </h3>
                    <div className="flex-1 space-y-2 overflow-y-auto max-h-[200px] custom-scrollbar pr-2">
                        {pointLogs.length > 0 ? pointLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors hover:border-indigo-200 dark:hover:border-indigo-900">
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-slate-900 dark:text-white truncate">{log.action}</p>
                                    <p className="text-[7px] text-slate-400 font-bold mt-0.5">{format(new Date(log.timestamp), 'yyyy/MM/dd HH:mm', { locale: ar })}</p>
                                </div>
                                <span className={cn(
                                    "font-black text-[10px] shrink-0 ml-2",
                                    log.amount > 0 ? "text-emerald-600" : "text-rose-600"
                                )}>
                                    {log.amount > 0 ? '+' : ''}{log.amount}
                                </span>
                            </div>
                        )) : (
                            <p className="text-center py-8 text-[8px] font-bold text-slate-400 uppercase tracking-widest">لا توجد سجلات</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
