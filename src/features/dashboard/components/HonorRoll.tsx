import React from 'react';
import { Award, Star, Trophy, Crown, Sparkles, CheckCircle2 } from 'lucide-react';
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
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-none p-5 shadow-sm overflow-hidden relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-950 text-white rounded-none flex items-center justify-center shadow-lg relative group">
                            <Trophy size={20} className="transition-transform group-hover:scale-110" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-none flex items-center justify-center border border-white dark:border-slate-900">
                                <Star size={8} fill="currentColor" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                                لوحة الشرف
                                <Sparkles className="text-amber-500" size={14} />
                            </h2>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 opacity-60">Elite Students</p>
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
                                    "relative p-4 rounded-none border-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 flex flex-col items-center text-center group",
                                    isFirst ? "bg-amber-50/20 border-amber-500 shadow-[4px_4px_0px_0px_rgba(245,158,11,0.1)]" : 
                                    isSecond ? "bg-slate-50/50 border-slate-400 shadow-[4px_4px_0px_0px_rgba(148,163,184,0.1)]" :
                                    isThird ? "bg-orange-50/20 border-orange-500 shadow-[4px_4px_0px_0px_rgba(249,115,22,0.1)]" :
                                    "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-none flex items-center justify-center mb-3 shadow-md border border-slate-950",
                                    isFirst ? "bg-amber-500 text-white" : 
                                    isSecond ? "bg-slate-400 text-white" :
                                    isThird ? "bg-orange-500 text-white" :
                                    "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                )}>
                                    {isFirst ? <Crown size={16} /> : 
                                     isSecond ? <Award size={16} /> : 
                                     <Star size={14} fill="currentColor" />}
                                </div>

                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center mb-2 relative overflow-hidden">
                                     <span className="text-lg font-black text-slate-300 uppercase">{student.name.charAt(0)}</span>
                                </div>

                                <div className="space-y-1.5 w-full">
                                    <p className={cn(
                                        "text-[11px] font-black truncate uppercase tracking-tighter",
                                        isFirst ? "text-amber-600" : "text-slate-950 dark:text-white"
                                    )}>
                                        {student.name}
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-950 text-white rounded-none shadow-sm">
                                        <span className="text-[10px] font-black tabular-nums">{student.totalPoints}</span>
                                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">Pts</span>
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
