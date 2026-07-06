import { TrendingUp, Star, Sparkles, BookOpen } from 'lucide-react';

interface TeacherWeeklySummaryProps {
    stats: {
        weekTotalSessions: number;
        newBadgesRecommended: number;
        bestStudentName?: string;
        pointsEarnedThisWeek: number;
    };
}

export const TeacherWeeklySummary = ({ stats }: TeacherWeeklySummaryProps) => {
    return (
        <div className="bg-primary border-4 border-border p-6 flex flex-col justify-between h-full shadow-[8px_8px_0px_0px_#000] text-on-primary relative overflow-hidden group">
            
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45 pointer-events-none group-hover:bg-white/20 transition-all"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6 text-white/80">
                    <Sparkles size={20} className="text-warning" />
                    <h3 className="font-medium text-xs uppercase tracking-tighter">حصاد الأسبوع التعليمي</h3>
                </div>

                <div className="mb-8">
                    <p className="text-[10px] font-medium text-white/60 mb-2 uppercase tracking-widest leading-none">نقاط مهنية جديدة (آخر ٧ أيام)</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-5xl font-medium tracking-tighter leading-none italic animate-pulse">
                            +{stats.weekTotalSessions * 5}
                        </h2>
                        <span className="text-xl font-normal opacity-30">PT</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white text-main border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.50)]">
                        <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-primary" />
                            <span className="text-[10px] font-medium uppercase">الحصص المنجزة</span>
                        </div>
                        <span className="font-mono font-medium text-lg">{stats.weekTotalSessions}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white text-main border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.50)]">
                        <div className="flex items-center gap-2">
                            <Star size={14} className="text-warning" />
                            <span className="text-[10px] font-medium uppercase">توصيات أوسمة</span>
                        </div>
                        <span className="font-mono font-medium text-lg">{stats.newBadgesRecommended}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t-2 border-white/20 text-[9px] font-medium uppercase tracking-widest text-white/60 flex items-center gap-2 italic">
                <TrendingUp size={12} />
                <span>أداء متميز هذا الأسبوع! بطل مجموعتك هو: <span className="text-on-primary">{stats.bestStudentName || 'قيد التحديد'}</span></span>
            </div>
        </div>
    );
};
