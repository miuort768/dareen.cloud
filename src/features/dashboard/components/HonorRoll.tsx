import React from 'react';
import { Award, Star, Trophy, Crown, Sparkles } from 'lucide-react';
import { Image } from '../../../shared/components/ui';
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

    const color = 'var(--bg-warning)';

    return (
        <div className="w-full mt-6" dir="rtl">
            <div className="p-5 bg-white dark:bg-primary-active rounded-2xl shadow-sm border border-border/50 dark:border-border/50 relative group transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}12`, color }}>
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-main dark:text-on-primary flex items-center gap-2">
                                لوحة الشرف
                                <Sparkles style={{ color }} size={14} />
                            </h2>
                            <p className="text-micro font-medium text-muted mt-0.5">الأداء المتميز</p>
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
                                isFirst ? "bg-warning-light/50 border border-warning dark:bg-warning/10 dark:border-warning/30" : 
                                isSecond ? "bg-background border border-border dark:bg-primary-active/40 dark:border-border" :
                                isThird ? "bg-warning-light border border-warning dark:bg-warning/10 dark:border-warning/30" :
                                "border border-border dark:border-border"
                            )} style={!isFirst && !isSecond && !isThird ? { backgroundColor: `${color}05` } : {}}>
                                <div className={cn("w-7 h-7 flex items-center justify-center mb-3 shadow-sm rounded-lg", isFirst ? "bg-warning text-main" : isSecond ? "bg-card text-main" : isThird ? "bg-warning text-on-primary" : "text-on-primary")} style={!isFirst && !isSecond && !isThird ? { backgroundColor: color } : {}}>
                                    {isFirst ? <Crown size={14} /> : isSecond ? <Award size={14} /> : <Star size={12} fill={index < 3 ? "currentColor" : "none"} />}
                                </div>

                                <div className="w-11 h-11 flex items-center justify-center mb-2 relative overflow-hidden rounded-xl shadow-inner text-on-primary" style={{ backgroundColor: `${color}50` }}>
                                    <span className="text-lg font-bold">{student.name.charAt(0)}</span>
                                    {student.avatar && <Image src={student.avatar} alt={student.name} className="absolute inset-0 w-full h-full" />}
                                </div>

                                <div className="w-full">
                                    <p className={cn("text-micro font-bold truncate mb-1", isFirst ? "text-warning dark:text-warning" : "text-main dark:text-on-primary")}>{student.name}</p>
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-on-primary" style={{ backgroundColor: color }}>
                                        <span className="text-micro font-bold tabular-nums">{student.totalPoints}</span>
                                        <span className="text-micro font-medium opacity-70">نقطة</span>
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
