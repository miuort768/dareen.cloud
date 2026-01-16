import { TrendingUp } from 'lucide-react';
import type { DashboardStats as Stats, LowBalanceStudent } from '../types';

interface TeacherAchievementsProps {
    stats: Stats;
    lowBalanceStudents: LowBalanceStudent[];
    isTeacher: boolean;
}

export const TeacherAchievements = ({ stats, lowBalanceStudents, isTeacher }: TeacherAchievementsProps) => {
    return (
        <div className="bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-xl relative overflow-hidden flex flex-col justify-between h-full group">
            <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500 group-hover:w-1.5 transition-all"></div>
            <div>
                <div className="flex items-center gap-2 mb-6 text-emerald-600">
                    <TrendingUp size={20} />
                    <h3 className="font-black text-xs uppercase">{isTeacher ? 'إنجازاتك التعليمية' : 'التحصيل المالي المتوقع'}</h3>
                </div>
                <div className="mb-8 text-center flex flex-col items-center">
                    <p className="text-[10px] font-black text-gray-400 mb-1">{isTeacher ? 'صافي أرباحك (لهذا الشهر)' : 'الإجمالي المستهدف من التجديد'}</p>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {isTeacher ? (stats.monthNetProfit || 0).toLocaleString() : stats.expectedCollection.toLocaleString()} <span className="text-lg opacity-30">ج.م</span>
                    </h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-r-2 border-rose-500">
                        <span className="text-[10px] font-black text-gray-500">منتهي</span>
                        <span className="font-mono font-black text-rose-600">{lowBalanceStudents.filter(s => s.remainingSessions === 0).length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-r-2 border-amber-500">
                        <span className="text-[10px] font-black text-gray-500">أوشك على الانتهاء</span>
                        <span className="font-mono font-black text-amber-600">{lowBalanceStudents.filter(s => s.remainingSessions > 0).length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
