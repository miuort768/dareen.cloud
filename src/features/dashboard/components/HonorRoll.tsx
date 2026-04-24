import React from 'react';
import { Award, Star, Trophy, Crown, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Student {
    id: string;
    name: string;
    totalPoints?: number;
    avatar?: string;
}

interface HonorRollProps {
    students: Student[];
}

export const HonorRoll: React.FC<HonorRollProps> = ({ students }) => {
    const topStudents = [...students]
        .filter(s => (s.totalPoints || 0) > 0)
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .slice(0, 6);

    if (topStudents.length === 0) return null;

    return (
        <div className="w-full mt-8" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-sm overflow-hidden relative group">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-500 rounded-2xl flex items-center justify-center shadow-sm relative transition-transform group-hover:rotate-6">
                            <Trophy size={24} />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-lg flex items-center justify-center border-2 border-white dark:border-slate-900">
                                <Star size={10} fill="currentColor" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                لوحة الشرف
                                <Sparkles className="text-amber-500" size={16} />
                            </h2>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Elite Students</p>
                        </div>
                    </div>
                </div>

                {/* Grid - Responsive Layout */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {topStudents.map((student, index) => {
                        const isFirst = index === 0;
                        const isSecond = index === 1;
                        const isThird = index === 2;

                        return (
                            <div 
                                key={student.id} 
                                className={cn(
                                    "relative p-5 rounded-3xl border transition-all hover:-translate-y-2 flex flex-col items-center text-center shadow-sm",
                                    isFirst ? "bg-amber-50/40 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20" : 
                                    isSecond ? "bg-slate-50 border-slate-100 dark:bg-slate-800/30 dark:border-slate-700" :
                                    isThird ? "bg-orange-50/30 border-orange-100 dark:bg-orange-900/10" :
                                    "bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shadow-sm",
                                    isFirst ? "bg-amber-400 text-white" : 
                                    isSecond ? "bg-slate-300 text-slate-700" :
                                    isThird ? "bg-orange-400 text-white" :
                                    "bg-indigo-50 dark:bg-slate-800 text-indigo-500"
                                )}>
                                    {isFirst ? <Crown size={20} /> : 
                                     isSecond ? <Award size={20} /> : 
                                     <Star size={18} fill={index < 3 ? "currentColor" : "none"} />}
                                </div>

                                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full border-2 border-white dark:border-slate-700 shadow-md flex items-center justify-center mb-3 relative overflow-hidden">
                                     <span className="text-xl font-bold text-slate-300 dark:text-slate-600">{student.name.charAt(0)}</span>
                                     {student.avatar && <img src={student.avatar} alt={student.name} className="absolute inset-0 w-full h-full object-cover" />}
                                </div>

                                <div className="space-y-2 w-full">
                                    <p className={cn(
                                        "text-xs md:text-sm font-bold truncate",
                                        isFirst ? "text-amber-700 dark:text-amber-500" : "text-slate-800 dark:text-white"
                                    )}>
                                        {student.name}
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <span className="text-xs font-bold text-indigo-600 tabular-nums">{student.totalPoints}</span>
                                        <span className="text-[10px] font-bold text-slate-400">نقطة</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
