import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BookOpen, Clock, TrendingUp, Users } from 'lucide-react';
import type { Student } from '../../types';

interface ChildrenCardsProps {
    children: Student[];
}

export const ChildrenCards = ({ children: kids }: ChildrenCardsProps) => {
    const navigate = useNavigate();

    if (kids.length === 0) return null;

    return (
        <div className="bg-surface dark:bg-card border border-border dark:border-border rounded-2xl p-5 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-soft dark:bg-primary/10 flex items-center justify-center">
                        <Users size={16} className="text-primary dark:text-primary" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-main dark:text-main">الأبناء</h3>
                        <p className="text-[10px] text-muted dark:text-muted">{kids.length} {kids.length === 1 ? 'ابن' : 'أبناء'}</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/parent-students')}
                    className="text-[11px] font-semibold text-primary dark:text-primary flex items-center gap-1 hover:underline transition-all"
                >
                    عرض الكل <ChevronLeft size={12} />
                </button>
            </div>
            <div className="space-y-3">
                {kids.map((child) => {
                    const enrollments = child.enrollments || [];
                    const totalUsed = enrollments.reduce((s, en) => s + Number(en.sessionsUsed || 0), 0);
                    const totalSessions = enrollments.reduce((s, en) => s + Number(en.sessionsTotal || 0), 0);
                    const progress = totalSessions > 0 ? Math.round((totalUsed / totalSessions) * 100) : 0;

                    return (
                        <button
                            key={child.id}
                            onClick={() => navigate('/parent-students')}
                            className="w-full flex items-center gap-3 p-3.5 bg-surface dark:bg-surface rounded-xl border border-border dark:border-border text-end transition-all duration-200 hover:bg-hover dark:hover:bg-hover active:scale-[0.98] hover:shadow-sm group"
                        >
                            <div className="w-11 h-11 rounded-xl bg-primary dark:bg-primary flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-on-primary dark:text-on-primary">
                                    {(child.name || 'ط').charAt(0)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-main dark:text-main truncate">{child.name}</p>
                                <div className="flex items-center gap-2 text-[11px] text-muted dark:text-muted mt-0.5">
                                    {child.grade && (
                                        <span className="inline-flex items-center gap-1">
                                            <BookOpen size={9} /> {child.grade}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1">
                                        <Clock size={9} /> {enrollments.length} مواد
                                    </span>
                                </div>
                            </div>
                            <div className="shrink-0 flex flex-col items-center gap-1">
                                <div className="relative w-10 h-10">
                                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                                         <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" className="text-border dark:text-border" strokeWidth="3" />
                                         <circle
                                             cx="18" cy="18" r="15" fill="none"
                                             stroke="currentColor" strokeWidth="3" className="text-primary dark:text-primary"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(progress / 100) * 94.2} 94.2`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                         <span className="text-[10px] font-bold text-main dark:text-main">{progress}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-0.5 text-[9px] text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrendingUp size={8} />
                                    <span>التفاصيل</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
