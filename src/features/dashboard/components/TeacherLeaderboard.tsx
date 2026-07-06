import { Trophy, Star, TrendingUp, Zap } from 'lucide-react';
import { getRankByPoints, STUDENT_RANKS } from '../../../shared/utils/ranks';
import { cn } from '../../../lib/utils';

interface TeacherLeaderboardProps {
    students: { id: string; name: string; grade?: string; totalPoints?: number }[];
    onStudentClick?: (student: { id: string; name: string; grade?: string; totalPoints?: number }) => void;
}

import { RankBadge } from '../../../shared/components/RankBadge';

export const TeacherLeaderboard = ({ students, onStudentClick }: TeacherLeaderboardProps) => {
    if (!students || students.length === 0) return null;

    return (
        <div className="bg-white border-4 border-border p-6 dark:bg-card dark:border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-main dark:text-on-primary">
                <Trophy size={20} className="text-warning fill-current" />
                <h3 className="font-medium text-xs uppercase tracking-tighter">أبطال مجموعتك (أعلى النقاط)</h3>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar ps-1">
                {students.map((student, index) => {
                    const rank = getRankByPoints(student.totalPoints || 0, STUDENT_RANKS);
                    
                    return (
                        <div 
                            key={student.id} 
                            onClick={() => onStudentClick?.(student)}
                            className="flex items-center justify-between p-3 bg-background dark:bg-card border-2 border-border group/item hover:bg-warning-light dark:hover:bg-warning/10 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn("w-8 h-8 flex items-center justify-center font-medium text-xs border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                                    index === 0 ? 'bg-warning' : index === 1 ? 'bg-card' : index === 2 ? 'bg-warning' : 'bg-white text-muted'
                                )}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-medium text-main dark:text-on-primary uppercase tracking-tighter">
                                            {student.name}
                                        </h4>
                                        {index < 3 && (
                                            <div className="flex items-center gap-1 bg-warning text-main px-1.5 py-0.5 text-micro font-medium border border-border shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] animate-pulse">
                                                <Zap size={8} className="fill-current" />
                                                <span>أداء مبهر</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <RankBadge rank={rank} size="sm" />
                                        <p className="text-micro font-medium text-muted uppercase tracking-widest leading-none">{student.grade}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1 text-warning">
                                        <Star size={10} className="fill-current" />
                                        <span className="text-sm font-medium tracking-tighter">{student.totalPoints || 0}</span>
                                    </div>
                                    <span className="text-micro font-medium text-muted uppercase leading-none">نقطة</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-6 border-t-2 border-border dark:border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-success" />
                    <span className="text-micro font-medium text-muted">نشاط المجموعة مرتفع هذا الأسبوع</span>
                </div>
            </div>
        </div>
    );
};
