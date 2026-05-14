import { TrendingUp, Award, AlertCircle, Clock } from 'lucide-react';
import type { DashboardStats as Stats, LowBalanceStudent } from '../types';
import { getRankByPoints, TEACHER_RANKS } from '../../../shared/utils/ranks';
import { RankBadge } from '../../../shared/components/RankBadge';

interface TeacherAchievementsProps {
    stats: Stats;
    lowBalanceStudents: LowBalanceStudent[];
    isTeacher: boolean;
}

export const TeacherAchievements = ({ stats, lowBalanceStudents, isTeacher }: TeacherAchievementsProps) => {
    const rank = getRankByPoints(stats.teacherPoints || 0, TEACHER_RANKS);
    const expiredCount = lowBalanceStudents.filter(s => s.remainingSessions === 0).length;
    const lowCount = lowBalanceStudents.filter(s => s.remainingSessions > 0).length;

    return (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 rounded-none h-full flex flex-col relative group overflow-hidden transition-all duration-500 hover:border-indigo-600">
            <div className="absolute top-0 right-0 w-2 h-full bg-slate-900 group-hover:bg-indigo-600 transition-colors" />
            
            <div className="p-8 flex flex-col h-full">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-none flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                {isTeacher ? 'إنجازاتك التعليمية' : 'التحصيل المالي المتوقع'}
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-[0.2em]">Annual Performance Index</p>
                        </div>
                    </div>
                    {isTeacher && (
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 shadow-xl">
                             <RankBadge rank={rank} size="md" />
                        </div>
                    )}
                </div>

                {/* Main Hero Metric */}
                <div className="flex-1 flex flex-col items-center justify-center py-12 bg-slate-900 text-white rounded-none mb-10 relative overflow-hidden group/hero shadow-2xl border-b-8 border-indigo-600">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600 opacity-10 -mr-24 -mt-24 rotate-45 pointer-events-none" />
                    
                    <div className="flex items-center gap-3 mb-4">
                        <Award size={18} className="text-indigo-400 animate-bounce" />
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">
                            {isTeacher ? 'صافي أرباح الشهر (تقديري)' : 'إجمالي التحصيل المستهدف'}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-4 relative z-10">
                        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
                            {isTeacher ? (stats.monthNetProfit || 0).toLocaleString() : stats.expectedCollection.toLocaleString()}
                        </h2>
                        <span className="text-xl font-black text-indigo-500 uppercase italic">EGP</span>
                    </div>
                    
                    {isTeacher && (
                        <div className="mt-8 px-8 py-3 bg-white text-slate-900 font-black text-xs tracking-widest uppercase hover:bg-indigo-50 transition-all shadow-xl active:scale-95">
                            {stats.teacherPoints || 0} XP EXPERTISE
                        </div>
                    )}
                </div>

                {/* Bottom Alert Counters */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 flex flex-col gap-3 group/counter">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 bg-rose-600 text-white rounded-none flex items-center justify-center shadow-lg group-hover/counter:rotate-12 transition-transform">
                                <AlertCircle size={20} />
                            </div>
                            <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">تنبيه انتهاء</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{expiredCount}</span>
                            <span className="text-[10px] text-slate-400 font-black uppercase">Students</span>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 flex flex-col gap-3 group/counter">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 bg-amber-500 text-white rounded-none flex items-center justify-center shadow-lg group-hover/counter:rotate-12 transition-transform">
                                <Clock size={20} />
                            </div>
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">على وشك</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{lowCount}</span>
                            <span className="text-[10px] text-slate-400 font-black uppercase">Students</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

