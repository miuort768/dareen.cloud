import React from 'react';
import { Award, Star, Trophy, Crown, Sparkles, Medal } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

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

    const maxPoints = topStudents[0]?.totalPoints || 1;

    return (
        <div className="w-full" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-5 md:p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center">
                            <Trophy size={16} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                لوحة الشرف
                                <Sparkles size={12} className="text-amber-500" />
                            </h2>
                            <p className="text-[9px] font-medium text-slate-400">الأداء المتميز</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {topStudents.map((student, index) => {
                        const isFirst = index === 0;
                        const isSecond = index === 1;
                        const isThird = index === 2;
                        const progress = Math.round(((student.totalPoints || 0) / maxPoints) * 100);

                        return (
                            <motion.div
                                key={student.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.06, duration: 0.3 }}
                                className={cn(
                                    "relative p-4 border transition-all hover:-translate-y-1 flex flex-col items-center text-center shadow-sm rounded-2xl",
                                    isFirst ? "bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-900/10 dark:to-slate-900 border-amber-200 dark:border-amber-500/30" :
                                    isSecond ? "bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700" :
                                    isThird ? "bg-gradient-to-b from-orange-50/80 to-white dark:from-orange-900/10 dark:to-slate-900 border-orange-200 dark:border-orange-500/30" :
                                    "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                                )}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.06 + 0.15, type: 'spring', stiffness: 200 }}
                                    className={cn(
                                        "w-8 h-8 border flex items-center justify-center mb-3 shadow-sm rounded-xl",
                                        isFirst ? "bg-amber-400 text-slate-950 border-amber-300" :
                                        isSecond ? "bg-slate-300 text-slate-700 border-slate-200" :
                                        isThird ? "bg-orange-400 text-white border-orange-300" :
                                        "bg-blue-50 dark:bg-slate-700 text-blue-500 dark:text-blue-400 border-blue-100 dark:border-slate-600"
                                    )}
                                >
                                    {isFirst ? <Crown size={14} /> :
                                     isSecond ? <Medal size={14} /> :
                                     isThird ? <Award size={14} /> :
                                     <Star size={12} fill={index < 3 ? "currentColor" : "none"} />}
                                </motion.div>

                                <div className="w-12 h-12 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center mb-2 relative overflow-hidden rounded-xl shadow-inner">
                                    <span className="text-base font-medium text-slate-200 dark:text-slate-500">{student.name.charAt(0)}</span>
                                    {student.avatar && <img src={student.avatar} alt={student.name} className="absolute inset-0 w-full h-full object-cover" />}
                                </div>

                                <div className="w-full">
                                    <p className={cn(
                                        "text-[10px] font-medium truncate mb-2",
                                        isFirst ? "text-amber-900 dark:text-amber-400" : "text-slate-900 dark:text-white"
                                    )}>
                                        {student.name}
                                    </p>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.06 + 0.3 }}
                                            className={cn(
                                                "h-full rounded-full",
                                                isFirst ? "bg-gradient-to-l from-amber-400 to-amber-500" :
                                                isSecond ? "bg-slate-400" :
                                                isThird ? "bg-orange-400" :
                                                "bg-blue-400"
                                            )}
                                        />
                                    </div>
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-lg">
                                        <span className="text-[9px] font-medium tabular-nums">{student.totalPoints}</span>
                                        <span className="text-[7px] font-medium opacity-70">نقطة</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
