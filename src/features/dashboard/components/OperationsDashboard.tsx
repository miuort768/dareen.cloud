import { 
    BookOpen, 
    FileText,
    CheckCircle2
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DashboardStats as Stats } from '../types';

interface OperationsDashboardProps {
    stats: Stats;
    sessions: any[];
}

export const OperationsDashboard = ({ stats, sessions }: OperationsDashboardProps) => {
    
    // Sample data to match screenshot visuals
    const topCourses = [
        { id: 1, name: 'دورة نور البيان', category: 'تأسيس', students: 124, color: 'bg-indigo-100 text-indigo-600' },
        { id: 2, name: 'تحفيظ القرآن', category: 'قرآن', students: 86, color: 'bg-emerald-100 text-emerald-600' },
        { id: 3, name: 'التجويد العملي', category: 'تجويد', students: 54, color: 'bg-orange-100 text-orange-600' },
    ];

    const recentExams = [
        { id: 1, name: 'اختبار نصف العام', category: 'رياضيات', date: 'منذ يومين', status: 'منتهي' },
        { id: 2, name: 'تقييم تجويد', category: 'قرآن', date: 'أمس', status: 'نشط' },
        { id: 3, name: 'مسابقة الحفظ', category: 'قرآن', date: 'اليوم', status: 'نشط' },
    ];

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10" dir="rtl">
            {/* 1. Top Courses Section */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <BookOpen size={18} className="text-[#5c59f2]" />
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">أفضل الدورات</h3>
                </div>
                <div className="space-y-4">
                    {topCourses.map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-xs", course.color)}>
                                    {course.id}#
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-slate-800 dark:text-white">{course.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{course.category}</p>
                                </div>
                            </div>
                            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{course.students} طالب</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Recent Exams Section */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <FileText size={18} className="text-[#5c59f2]" />
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">أحدث الاختبارات</h3>
                </div>
                <div className="space-y-4">
                    {recentExams.map((exam) => (
                        <div key={exam.id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-slate-800 dark:text-white">{exam.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{exam.date}</p>
                                </div>
                            </div>
                            <span className={cn(
                                "text-[9px] font-black px-2 py-1 rounded-lg",
                                exam.status === 'منتهي' ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-600"
                            )}>
                                {exam.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Attendance Rate Section */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 size={18} className="text-[#5c59f2]" />
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">نسبة الحضور</h3>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="56"
                                cy="56"
                                r="48"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-slate-100 dark:text-slate-800"
                            />
                            <circle
                                cx="56"
                                cy="56"
                                r="48"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={301.59}
                                strokeDashoffset={301.59 * (1 - 0.95)}
                                className="text-[#5c59f2]"
                            />
                        </svg>
                        <span className="absolute text-xl font-black text-slate-900 dark:text-white">95%</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 text-center">أداء ممتاز جداً مقارنة بالشهر الماضي</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 border-t border-slate-50 dark:border-slate-800 pt-4">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 mb-1">حصص مكتملة</p>
                        <p className="text-sm font-black text-emerald-600">{stats.completedSessions}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 mb-1">حصص ملغاة</p>
                        <p className="text-sm font-black text-rose-600">{(sessions || []).filter(s => s?.status === 'cancelled').length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
