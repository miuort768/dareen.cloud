import React from 'react';
import { Award, Star, Trophy, Crown, Sparkles } from 'lucide-react';
import { Image } from '../../../shared/components/ui';
import { cn } from '../../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
        <Card className="border-border/50 shadow-sm overflow-hidden" dir="rtl">
            <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-warning/10 text-warning ring-1 ring-warning/20">
                        <Trophy size={18} />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold text-main flex items-center gap-2">
                            لوحة الشرف
                            <Sparkles size={13} className="text-warning" />
                        </CardTitle>
                        <CardDescription className="text-[11px] text-muted">الأداء المتميز</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {topStudents.map((student, index) => {
                        const isFirst = index === 0;
                        const isSecond = index === 1;
                        const isThird = index === 2;

                        return (
                            <div key={student.id} className={cn(
                                "relative p-3 transition-all hover:-translate-y-1 flex flex-col items-center text-center rounded-xl border",
                                isFirst ? "bg-warning/5 border-warning/30 shadow-sm" :
                                "bg-card border-border/40 hover:border-border/70 hover:shadow-sm"
                            )}>
                                <div className={cn(
                                    "w-7 h-7 flex items-center justify-center mb-2 rounded-lg",
                                    isFirst ? "bg-warning text-warning" :
                                    isSecond ? "bg-card text-muted border border-border/50" :
                                    "bg-warning/10 text-warning"
                                )}>
                                    {isFirst ? <Crown size={13} /> : isSecond ? <Award size={13} /> : <Star size={11} fill={index < 3 ? "currentColor" : "none"} />}
                                </div>

                                <div className="w-10 h-10 flex items-center justify-center mb-2 relative overflow-hidden rounded-full bg-primary/5 ring-1 ring-border/50 text-sm font-bold text-primary">
                                    {student.name.charAt(0)}
                                </div>

                                <div className="w-full space-y-1">
                                    <p className={cn("text-[11px] font-semibold truncate", isFirst ? "text-warning" : "text-main")}>{student.name}</p>
                                    <div className={cn(
                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold",
                                        isFirst ? "bg-warning/10 text-warning" : "bg-primary/5 text-primary"
                                    )}>
                                        <span className="tabular-nums">{student.totalPoints}</span>
                                        <span className="opacity-70">نقطة</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
