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
            <div className="bg-primary p-3 md:p-4 shadow-sm relative overflow-hidden group rounded-2xl">
                <div className="absolute top-0 end-0 w-16 h-16 bg-white/10 blur-2xl -translate-y-8 translate-x-8 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-micro md:text-micro font-medium text-on-primary uppercase tracking-widest mb-0.5 opacity-80">إجمالي نقاط الإنجاز</p>
                        <h2 className="text-xl md:text-3xl font-medium text-on-primary tracking-tight flex items-center gap-2">
                            {totalPoints.toLocaleString()}
                            <div className="p-0.5 md:p-1 bg-white/20 rounded">
                                <Star size={12} className="fill-current text-warning md:w-3.5 md:h-3.5" />
                            </div>
                        </h2>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 flex items-center justify-center rounded-xl border border-white/20">
                        <Trophy size={16} className="text-on-primary md:w-5 md:h-5" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Badges Collection */}
                <div className="bg-card border border-border p-3 md:p-4 shadow-sm rounded-2xl">
                    <h3 className="font-medium text-micro md:text-micro uppercase tracking-widest text-dim mb-3 flex items-center gap-1.5">
                        <Award size={12} className="text-primary" /> الأوسمة المكتسبة
                    </h3>
                    <div className="grid grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
                        {parsedBadges.length > 0 ? parsedBadges.map((badge, idx) => (
                            <div 
                                key={idx} 
                                className={cn(
                                    "flex flex-col items-center gap-1 p-1.5 border transition-all hover:bg-surface dark:hover:bg-hover cursor-help",
                                    badge.color === 'blue' ? "bg-primary-soft border-primary-soft text-primary" :
                                    badge.color === 'amber' ? "bg-warning-soft border-warning-soft text-warning dark:bg-warning-soft" :
                                    badge.color === 'emerald' ? "bg-success-soft border-success-soft text-success dark:bg-success-soft" :
                                    "bg-error-soft border-error-soft text-error dark:bg-error-soft"
                                )}
                                title={`تم الحصول عليه في ${format(new Date(badge.date), 'yyyy/MM/dd')}`}
                            >
                                <Award size={14} strokeWidth={2.5} className="md:w-4 md:h-4" />
                                <span className="text-[6px] md:text-micro font-medium uppercase text-center leading-none">{badge.name}</span>
                            </div>
                        )) : (
                            <div className="col-span-4 py-4 text-center bg-surface dark:bg-hover border border-dashed border-border opacity-40 rounded-lg">
                                <p className="text-micro font-medium uppercase tracking-widest">لا توجد أوسمة</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Points History */}
                <div className="bg-card border border-border p-3 md:p-4 shadow-sm flex flex-col">
                    <h3 className="font-medium text-micro md:text-micro uppercase tracking-widest text-dim mb-3 flex items-center gap-1.5">
                        <History size={12} className="text-primary" /> سجل النشاط الأخير
                    </h3>
                    <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[150px] md:max-h-[200px] custom-scrollbar pe-1">
                        {pointLogs.length > 0 ? pointLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-2 bg-surface dark:bg-hover border border-border transition-colors hover:border-primary dark:hover:border-primary rounded-xl">
                                <div className="min-w-0">
                                    <p className="text-micro md:text-micro font-medium text-main truncate">{log.action}</p>
                                    <p className="text-[6px] md:text-micro text-dim font-normal mt-0.5">{format(new Date(log.timestamp), 'yyyy/MM/dd', { locale: ar })}</p>
                                </div>
                                <span className={cn(
                                    "font-medium text-micro md:text-micro shrink-0 me-1.5",
                                    log.amount > 0 ? "text-success" : "text-error"
                                )}>
                                    {log.amount > 0 ? '+' : ''}{log.amount}
                                </span>
                            </div>
                        )) : (
                            <p className="text-center py-6 text-micro font-normal text-dim uppercase tracking-widest">لا توجد سجلات</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

