import { CreditCard, TrendingUp, Info } from 'lucide-react';

interface TeacherSalaryPreviewProps {
    stats: {
        totalEarnings: number;
        completedSessions: number;
        sessionsGoal: number;
        pricePerSession: number;
    };
}

export const TeacherSalaryPreview = ({ stats }: TeacherSalaryPreviewProps) => {
    const progress = Math.min((stats.completedSessions / stats.sessionsGoal) * 100, 100);

    return (
        <div className="bg-success border-4 border-border p-6 flex flex-col justify-between h-full shadow-[8px_8px_0px_0px_#000] text-on-primary relative overflow-hidden group">
            
            {/* Background pattern */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6 text-white/80">
                    <CreditCard size={18} />
                    <h3 className="font-medium text-xs uppercase tracking-tighter italic">حصالة الأرباح التقديرية</h3>
                </div>

                <div className="mb-8">
                    <p className="text-[10px] font-medium text-white/60 mb-2 uppercase tracking-widest leading-none">أرباحك المجمعة للآن</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-5xl font-medium tracking-tighter leading-none italic animate-in slide-in-from-bottom duration-500">
                            {stats.totalEarnings}
                        </h2>
                        <span className="text-xl font-normal opacity-30">ريال</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-medium uppercase">
                            <span>هدف الحصص: {stats.completedSessions}/{stats.sessionsGoal}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-4 bg-card border-2 border-border shadow-[2px_2px_0px_0px_rgba(255,255,255,0.20)]">
                            <div 
                                className="h-full bg-warning transition-all duration-1000 ease-out" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-success/30 border-2 border-success/50 text-[9px] font-medium uppercase italic leading-relaxed">
                        <Info size={14} className="flex-shrink-0" />
                        <p>بناءً على {stats.completedSessions} حصة منجزة بمعدل {stats.pricePerSession} ريال/للحصة. </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t-2 border-white/20 text-[9px] font-medium uppercase tracking-widest text-white/60 flex items-center gap-2 italic">
                <TrendingUp size={12} />
                <span>كلما أنجزتِ حصصاً أكثر، زادت نقاطك المهنية في اللورد كارد!</span>
            </div>
        </div>
    );
};
