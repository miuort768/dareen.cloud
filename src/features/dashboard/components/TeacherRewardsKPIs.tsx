import { Target, CheckCircle2, Users, Star, Award } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getNextRank, TEACHER_RANKS } from '../../../shared/utils/ranks';

interface TeacherRewardsKPIsProps {
    stats: {
        attendanceRate: number;
        studentsCount: number;
        evaluationsCompleted: number;
        teacherPoints: number;
    };
}

export const TeacherRewardsKPIs = ({ stats }: TeacherRewardsKPIsProps) => {
    const { next, pointsNeeded } = getNextRank(stats.teacherPoints || 0, TEACHER_RANKS);

    const goals = [
        { name: 'معدل الحضور', value: stats.attendanceRate, goal: 90, unit: '%', icon: <CheckCircle2 size={14} />, color: 'emerald' },
        { name: 'عدد الطلاب النشطين', value: stats.studentsCount, goal: 10, unit: '', icon: <Users size={14} />, color: 'blue' },
        { name: 'تقييمات الحصص', value: stats.evaluationsCompleted, goal: 30, unit: 'حصة', icon: <Star size={14} />, color: 'yellow' },
    ];

    return (
        <div className="bg-white border-4 border-border p-6 dark:bg-card dark:border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
            
            <div className="flex items-center gap-2 mb-6 text-main dark:text-on-primary">
                <Target size={20} className="text-primary" />
                <h3 className="font-medium text-xs uppercase tracking-tighter">أهداف المكافآت المهنية (KPIs)</h3>
            </div>

            <div className="space-y-6">
                {goals.map((goal, idx) => {
                    const progress = Math.min((goal.value / goal.goal) * 100, 100);
                    const isAchieved = progress >= 100;

                    return (
                        <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn("p-1.5 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", 
                                        isAchieved ? "bg-success text-on-primary" : "bg-surface text-muted"
                                    )}>
                                        {goal.icon}
                                    </div>
                                    <span className="text-micro font-medium text-main dark:text-on-primary uppercase">{goal.name}</span>
                                </div>
                                <div className="text-micro font-medium">
                                    <span className={cn(isAchieved ? "text-success" : "text-primary")}>{goal.value}{goal.unit}</span>
                                    <span className="text-dim mx-1">/</span>
                                    <span className="text-muted">{goal.goal}{goal.unit}</span>
                                </div>
                            </div>
                            
                            <div className="h-3 bg-surface dark:bg-card border-2 border-border overflow-hidden">
                                <div 
                                    className={cn("h-full transition-all duration-1000", 
                                        isAchieved ? "bg-success" : "bg-primary"
                                    )}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 p-4 bg-card text-on-primary border-2 border-border flex items-center justify-between group-hover:bg-primary transition-colors">
                <div className="flex items-center gap-3">
                    <Award size={20} className="text-warning animate-bounce" />
                    <div>
                        <p className="text-micro font-medium text-white/60 leading-none mb-1 uppercase tracking-widest">المكافأة الموالية</p>
                        <h4 className="text-xs font-medium uppercase tracking-tighter">{next ? next.name : 'أعلى رتبة (لورد مطلق)'}</h4>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-micro font-medium opacity-30 uppercase tracking-widest leading-none">نقاط متبقية</p>
                    <p className="text-lg font-medium tracking-tighter italic">{next ? pointsNeeded : 'MAX'}</p>
                </div>
            </div>
        </div>
    );
};
