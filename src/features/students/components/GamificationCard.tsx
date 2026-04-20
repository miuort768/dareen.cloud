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
        <div className="space-y-6">
            {/* Total Points Big Card */}
            <div className="bg-black dark:bg-black p-5 md:p-6 border-r-4 md:border-r-8 border-primary-600 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/10 blur-3xl rounded-full -translate-y-12 translate-x-12"></div>
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-[9px] md:text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-2">رصيد الإنجاز الذهبي</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter flex items-center gap-3">
                            {totalPoints.toLocaleString()}
                            <div className="p-1.5 md:p-2 bg-primary-600 animate-pulse">
                                <Star size={18} className="fill-current text-white md:w-5 md:h-5" />
                            </div>
                        </h2>
                    </div>
                    <Trophy size={48} className="text-primary-600/20 group-hover:scale-110 transition-transform duration-700 md:w-16 md:h-16" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Badges Collection */}
                <div className="bg-white dark:bg-gray-900 border-4 border-gray-950 dark:border-gray-800 p-6 shadow-xl">
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                        <Award size={16} className="text-primary-600" /> مجموعة الأوسمة
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {parsedBadges.length > 0 ? parsedBadges.map((badge, idx) => (
                            <div 
                                key={idx} 
                                className={cn(
                                    "flex flex-col items-center gap-1.5 p-3 md:p-4 border-2 transition-all hover:scale-105 cursor-help min-w-[80px] md:min-w-[100px]",
                                    badge.color === 'blue' ? "bg-blue-50 border-blue-600 text-blue-700" :
                                    badge.color === 'amber' ? "bg-amber-50 border-amber-600 text-amber-700" :
                                    badge.color === 'emerald' ? "bg-emerald-50 border-emerald-600 text-emerald-700" :
                                    "bg-rose-50 border-rose-600 text-rose-700"
                                )}
                                title={`تم الحصول عليه في ${format(new Date(badge.date), 'yyyy/MM/dd')}`}
                            >
                                <Award size={24} strokeWidth={2.5} className="md:w-[28px] md:h-[28px]" />
                                <span className="text-[9px] md:text-[10px] font-black uppercase text-center">{badge.name}</span>
                            </div>
                        )) : (
                            <div className="w-full py-8 text-center bg-gray-50 dark:bg-gray-800/20 border-2 border-dashed border-gray-200 dark:border-gray-700 opacity-30">
                                <p className="text-[10px] font-black uppercase tracking-widest">لا توجد أوسمة بعد</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Points History */}
                <div className="bg-white dark:bg-gray-900 border-4 border-gray-950 dark:border-gray-800 p-6 shadow-xl flex flex-col">
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                        <History size={16} className="text-primary-600" /> سجل النقاط الأخير
                    </h3>
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                        {pointLogs.length > 0 ? pointLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-r-2 border-primary-600">
                                <div>
                                    <p className="text-[10px] font-black text-gray-900 dark:text-white">{log.action}</p>
                                    <p className="text-[8px] text-gray-400 font-bold mt-0.5">{format(new Date(log.timestamp), 'yyyy/MM/dd HH:mm', { locale: ar })}</p>
                                </div>
                                <span className={cn(
                                    "font-black text-xs",
                                    log.amount > 0 ? "text-emerald-600" : "text-rose-600"
                                )}>
                                    {log.amount > 0 ? '+' : ''}{log.amount}
                                </span>
                            </div>
                        )) : (
                            <p className="text-center py-10 text-[9px] font-bold text-gray-400 uppercase tracking-widest">لا توجد سجلات بعد</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
