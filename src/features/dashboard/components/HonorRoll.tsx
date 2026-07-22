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
        <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-warning-soft flex items-center justify-center">
                    <Trophy size={16} className="text-warning" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-main flex items-center gap-1.5">
                        لوحة الشرف
                        <Sparkles size={11} className="text-warning" />
                    </h3>
                    <p className="text-[10px] text-muted">الأداء المتميز</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {topStudents.map((student, index) => {
                    const isFirst = index === 0;
                    const isSecond = index === 1;

                    return (
                        <div key={student.id} className={cn(
                            "relative p-3 transition-colors flex flex-col items-center text-center rounded-xl border",
                            isFirst
                                ? "bg-warning-soft border-warning/20"
                                : "bg-surface border-border hover:bg-hover"
                        )}>
                            {/* Position badge */}
                            <div className={cn(
                                "w-7 h-7 flex items-center justify-center mb-2 rounded-lg",
                                isFirst ? "bg-warning text-on-warning" :
                                isSecond ? "bg-muted text-on-primary" :
                                "bg-warning-soft text-warning"
                            )}>
                                {isFirst ? <Crown size={12} /> : isSecond ? <Award size={12} /> : <Star size={11} fill={index < 3 ? "currentColor" : "none"} />}
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 flex items-center justify-center mb-2 rounded-full bg-primary-soft text-sm font-bold text-primary">
                                {student.name.charAt(0)}
                            </div>

                            <div className="w-full space-y-1">
                                <p className={cn(
                                    "text-[11px] font-bold truncate",
                                    isFirst ? "text-warning" : "text-main"
                                )}>
                                    {student.name}
                                </p>
                                <div className={cn(
                                    "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[9px] font-bold border",
                                    isFirst
                                        ? "bg-warning/10 text-warning border-warning/20"
                                        : "bg-primary-soft text-primary border-primary/10"
                                )}>
                                    <span className="tabular-nums">{student.totalPoints}</span>
                                    <span className="opacity-70">نقطة</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
