import React from 'react';
import { Award, Star, Trophy, Crown, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { GlassCard } from '@/shared/components/ui';

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
        <GlassCard dir="rtl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-warning to-amber-500 flex items-center justify-center shadow-lg shadow-warning/20">
                    <Trophy size={18} className="text-white" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-main flex items-center gap-2">
                        لوحة الشرف
                        <Sparkles size={13} className="text-warning" />
                    </h3>
                    <p className="text-xs text-muted">الأداء المتميز</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {topStudents.map((student, index) => {
                    const isFirst = index === 0;
                    const isSecond = index === 1;
                    const isThird = index === 2;

                    return (
                        <div key={student.id} className={cn(
                            "relative p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg flex flex-col items-center text-center rounded-2xl border backdrop-blur-sm",
                            isFirst
                                ? "bg-gradient-to-br from-warning/10 via-amber-500/5 to-warning/5 border-warning/30 shadow-md shadow-warning/10"
                                : "bg-white/40 dark:bg-white/5 border-white/20 hover:border-white/30 hover:shadow-md"
                        )}>
                            {/* Position badge */}
                            <div className={cn(
                                "w-8 h-8 flex items-center justify-center mb-2 rounded-xl",
                                isFirst ? "bg-gradient-to-br from-warning to-amber-500 text-white shadow-md shadow-warning/30" :
                                isSecond ? "bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-md" :
                                "bg-gradient-to-br from-amber-600/20 to-amber-700/10 text-warning"
                            )}>
                                {isFirst ? <Crown size={14} /> : isSecond ? <Award size={14} /> : <Star size={12} fill={index < 3 ? "currentColor" : "none"} />}
                            </div>

                            {/* Avatar */}
                            <div className="w-12 h-12 flex items-center justify-center mb-2 relative overflow-hidden rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 ring-2 ring-white/50 shadow-sm text-base font-bold text-primary">
                                {student.name.charAt(0)}
                            </div>

                            <div className="w-full space-y-1.5">
                                <p className={cn(
                                    "text-xs font-bold truncate",
                                    isFirst ? "text-warning" : "text-main"
                                )}>
                                    {student.name}
                                </p>
                                <div className={cn(
                                    "inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold border",
                                    isFirst
                                        ? "bg-warning/10 text-warning border-warning/20"
                                        : "bg-primary/5 text-primary border-primary/10"
                                )}>
                                    <span className="tabular-nums">{student.totalPoints}</span>
                                    <span className="opacity-70">نقطة</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
};
