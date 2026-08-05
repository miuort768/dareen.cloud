import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BookOpen, Clock } from 'lucide-react';
import type { Student } from '../../types';

interface ChildrenCardsProps {
    children: Student[];
}

export const ChildrenCards = ({ children: kids }: ChildrenCardsProps) => {
    const navigate = useNavigate();

    if (kids.length === 0) return null;

    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-bold text-main">الأبناء</h3>
                <button
                    onClick={() => navigate('/parent-students')}
                    className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline"
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
                            className="w-full flex items-center gap-3 p-3 bg-surface rounded-xl border border-border text-end transition-all hover:bg-hover active:scale-[0.98]"
                        >
                            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-primary">
                                    {(child.name || 'ط').charAt(0)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-main truncate">{child.name}</p>
                                <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
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
                            <div className="shrink-0 flex flex-col items-center">
                                <div className="relative w-9 h-9">
                                    <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3" />
                                        <circle
                                            cx="18" cy="18" r="15" fill="none"
                                            stroke="var(--bg-primary)" strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(progress / 100) * 94.2} 94.2`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[11px] font-bold text-main">{progress}%</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
