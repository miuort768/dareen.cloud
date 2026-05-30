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

    const color = '#F59E0B';

    return (
        <div className="w-full mt-6" dir="rtl">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 relative group transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}12`, color }}>
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                                لوحة الشرف
                                <Sparkles style={{ color }} size={14} />
                            </h2>
                            <p className="text-[9px] font-medium text-[#64748B] mt-0.5">الأداء المتميز</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {topStudents.map((student, index) => {
                        const isFirst = index === 0;
                        const isSecond = index === 1;
                        const isThird = index === 2;

                        return (
                            <div key={student.id} className={cn(
                                "relative p-3 transition-all hover:-translate-y-1 flex flex-col items-center text-center shadow-sm rounded-xl",
                                isFirst ? "bg-amber-50/50 border border-amber-200 dark:bg-amber-900/10 dark:border-amber-500/30" : 
                                isSecond ? "bg-slate-50 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-700" :
                                isThird ? "bg-orange-50 border border-orange-200 dark:bg-orange-900/10 dark:border-orange-500/30" :
                                "border border-slate-100 dark:border-slate-700"
                            )} style={!isFirst && !isSecond && !isThird ? { backgroundColor: `${color}05` } : {}}>
                                <div className={cn("w-7 h-7 flex items-center justify-center mb-3 shadow-sm rounded-lg", isFirst ? "bg-amber-400 text-slate-950" : isSecond ? "bg-slate-300 text-slate-700" : isThird ? "bg-orange-400 text-white" : "text-white")} style={!isFirst && !isSecond && !isThird ? { backgroundColor: color } : {}}>
                                    {isFirst ? <Crown size={14} /> : isSecond ? <Award size={14} /> : <Star size={12} fill={index < 3 ? "currentColor" : "none"} />}
                                </div>

                                <div className="w-11 h-11 flex items-center justify-center mb-2 relative overflow-hidden rounded-xl shadow-inner text-white" style={{ backgroundColor: `${color}50` }}>
                                    <span className="text-lg font-bold">{student.name.charAt(0)}</span>
                                    {student.avatar && <img src={student.avatar} alt={student.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />}
                                </div>

                                <div className="w-full">
                                    <p className={cn("text-[10px] font-bold truncate mb-1", isFirst ? "text-amber-900 dark:text-amber-400" : "text-[#0F172A] dark:text-white")}>{student.name}</p>
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-white" style={{ backgroundColor: color }}>
                                        <span className="text-[9px] font-bold tabular-nums">{student.totalPoints}</span>
                                        <span className="text-[7px] font-medium opacity-70">نقطة</span>
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
