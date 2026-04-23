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
        .slice(0, 5);

    if (topStudents.length === 0) return null;

    return (
        <div className="w-full mt-6" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-5 shadow-sm overflow-hidden relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-xl flex items-center justify-center shadow-sm relative group">
                            <Trophy size={20} className="transition-transform group-hover:scale-110" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-md flex items-center justify-center border border-white dark:border-slate-900">
                                <Star size={8} fill="currentColor" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                لوحة الشرف
                                <Sparkles className="text-amber-500" size={14} />
                            </h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">نخبة الدارسين</p>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {topStudents.map((student, index) => {
                        const isFirst = index === 0;
                        const isSecond = index === 1;
                        const isThird = index === 2;

                        return (
                            <div 
                                key={student.id} 
                                className={cn(
                                    "relative p-4 rounded-3xl border transition-all hover:-translate-y-1 flex flex-col items-center text-center group",
                                    isFirst ? "bg-amber-50/30 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20" : 
                                    isSecond ? "bg-slate-50 border-slate-100 dark:bg-slate-800/30 dark:border-slate-700" :
                                    isThird ? "bg-orange-50/20 border-orange-100 dark:bg-orange-900/10" :
                                    "bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center mb-3 shadow-sm",
                                    isFirst ? "bg-amber-400 text-white" : 
                                    isSecond ? "bg-slate-300 text-slate-700" :
                                    isThird ? "bg-orange-400 text-white" :
                                    "bg-slate-50 dark:bg-slate-800 text-slate-400"
                                )}>
                                    {isFirst ? <Crown size={16} /> : 
                                     isSecond ? <Award size={16} /> : 
                                     <Star size={14} fill="currentColor" />}
                                </div>

                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center mb-2 relative overflow-hidden">
                                     <span className="text-lg font-bold text-slate-200">{student.name.charAt(0)}</span>
                                </div>

                                <div className="space-y-1.5 w-full">
                                    <p className={cn(
                                        "text-[11px] font-bold truncate",
                                        isFirst ? "text-amber-700 dark:text-amber-500" : "text-slate-800 dark:text-white"
                                    )}>
                                        {student.name}
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-slate-800 rounded-full border border-slate-50 dark:border-slate-700 shadow-sm">
                                        <span className="text-[10px] font-bold text-indigo-600 tabular-nums">{student.totalPoints}</span>
                                        <span className="text-[8px] font-bold text-slate-400">نقطة</span>
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
