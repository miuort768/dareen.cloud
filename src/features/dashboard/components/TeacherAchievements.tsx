import { TrendingUp } from 'lucide-react';
import type { DashboardStats as Stats, LowBalanceStudent } from '../types';
import { cn } from '../../../lib/utils';
import { getRankByPoints, TEACHER_RANKS } from '../../../shared/utils/ranks';

interface TeacherAchievementsProps {
    stats: Stats;
    lowBalanceStudents: LowBalanceStudent[];
    isTeacher: boolean;
}

export const TeacherAchievements = ({ stats, lowBalanceStudents, isTeacher }: TeacherAchievementsProps) => {
    const rank = getRankByPoints(stats.teacherPoints || 0, TEACHER_RANKS);

    return (
        <div className="bg-white border-4 border-gray-950 p-8 dark:bg-gray-950 dark:border-gray-800 shadow-[10px_10px_0px_0px_black] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.05)] relative overflow-hidden flex flex-col justify-between h-full group rounded-none">
            <div className="absolute top-0 right-0 w-2 h-full bg-emerald-600 border-l-2 border-gray-950"></div>
            <div>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-600 text-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_#444]">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-xs md:text-sm text-gray-950 dark:text-white uppercase tracking-tighter">{isTeacher ? 'إنجازاتك التعليمية' : 'التحصيل المالي المتوقع'}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">مؤشرات الأداء الشهري</p>
                        </div>
                    </div>
                    {isTeacher && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1 border-2 border-gray-950 shadow-[3px_3px_0px_0px_black] text-[9px] font-black uppercase text-white",
                            rank.badgeColor
                        )}>
                            <span>{rank.icon}</span>
                            <span>{rank.name}</span>
                        </div>
                    )}
                </div>
                
                <div className="mb-10 text-center flex flex-col items-center py-4 bg-gray-50/50 border-y-2 border-gray-100 dark:bg-gray-800/20 dark:border-gray-800">
                    <p className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">{isTeacher ? 'صافي أرباحك (لهذا الشهر التقديري)' : 'الإجمالي المستهدف من التجديد'}</p>
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-950 dark:text-white tracking-tighter">
                        {isTeacher ? (stats.monthNetProfit || 0).toLocaleString() : stats.expectedCollection.toLocaleString()} <span className="text-xl opacity-30">ج.م</span>
                    </h2>
                    {isTeacher && (
                        <div className="mt-4 flex items-center gap-1.5 px-4 py-1.5 bg-yellow-400 border-2 border-gray-950 font-black text-[11px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest">
                            <span>نقاطك المهنية: {stats.teacherPoints || 0} XP</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border-2 border-gray-950 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_black]">
                        <span className="text-[9px] font-black text-rose-600 uppercase mb-1 tracking-widest">تنبيه انتهاء</span>
                        <span className="font-mono font-black text-2xl text-rose-700">{lowBalanceStudents.filter(s => s.remainingSessions === 0).length}</span>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-2 border-gray-950 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_black]">
                        <span className="text-[9px] font-black text-amber-600 uppercase mb-1 tracking-widest">أوشك على الانتهاء</span>
                        <span className="font-mono font-black text-2xl text-amber-700">{lowBalanceStudents.filter(s => s.remainingSessions > 0).length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
