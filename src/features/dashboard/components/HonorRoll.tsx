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
        <div className="w-full" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 p-8 rounded-none shadow-xl overflow-hidden relative group">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-900 text-white rounded-none flex items-center justify-center shadow-lg relative transition-transform group-hover:rotate-6">
                            <Trophy size={28} />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-600 text-white rounded-none flex items-center justify-center border border-white dark:border-slate-900 shadow-lg">
                                <Crown size={12} fill="currentColor" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                                قائمة التميز الأكاديمي
                                <Sparkles className="text-amber-500 animate-pulse" size={18} />
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Elite Academic Honor Roll</p>
                        </div>
                    </div>
                </div>

                {/* Grid - Responsive Layout */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {topStudents.map((student, index) => {
                        const isFirst = index === 0;
                        const isSecond = index === 1;
                        const isThird = index === 2;

                        return (
                            <div 
                                key={student.id} 
                                className={cn(
                                    "relative p-6 rounded-none border-2 transition-all hover:border-indigo-600 hover:shadow-2xl flex flex-col items-center text-center",
                                    isFirst ? "bg-amber-50/20 border-amber-500 shadow-[8px_8px_0px_0px_rgba(245,158,11,0.1)]" : 
                                    isSecond ? "bg-slate-50 dark:bg-slate-800/20 border-slate-300 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]" :
                                    isThird ? "bg-orange-50/10 border-orange-400 shadow-[8px_8px_0px_0px_rgba(251,146,60,0.1)]" :
                                    "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-none flex items-center justify-center mb-6 shadow-xl",
                                    isFirst ? "bg-amber-500 text-white" : 
                                    isSecond ? "bg-slate-400 text-white" :
                                    isThird ? "bg-orange-500 text-white" :
                                    "bg-slate-900 text-white"
                                )}>
                                    {isFirst ? <Crown size={24} /> : 
                                     isSecond ? <Award size={24} /> : 
                                     <Star size={20} fill={index < 3 ? "currentColor" : "none"} />}
                                </div>

                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-none border-2 border-slate-900 dark:border-slate-700 shadow-xl flex items-center justify-center mb-5 relative overflow-hidden group/avatar">
                                     <span className="text-2xl font-black text-slate-200 dark:text-slate-600 group-hover/avatar:scale-125 transition-transform">{student.name.charAt(0)}</span>
                                     {student.avatar && <img src={student.avatar} alt={student.name} className="absolute inset-0 w-full h-full object-cover" />}
                                     <div className="absolute bottom-0 right-0 w-full h-1 bg-indigo-600" />
                                </div>

                                <div className="space-y-4 w-full">
                                    <p className={cn(
                                        "text-xs font-black truncate uppercase tracking-tighter",
                                        isFirst ? "text-amber-700 dark:text-amber-500" : "text-slate-900 dark:text-white"
                                    )}>
                                        {student.name}
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-none border border-slate-800 shadow-lg">
                                        <span className="text-xs font-black tabular-nums">{student.totalPoints}</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">PTS</span>
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

