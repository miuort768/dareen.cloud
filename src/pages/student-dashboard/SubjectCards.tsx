import { BookOpen, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Enrollment } from './types';

interface SubjectCardsProps {
    enrollments: Enrollment[];
}

const subjectColors = [
    { bg: 'bg-primary-soft dark:bg-primary/10', text: 'text-primary', bar: 'bg-primary' },
    { bg: 'bg-success-soft dark:bg-success/10', text: 'text-success', bar: 'bg-success' },
    { bg: 'bg-info-soft dark:bg-info/10', text: 'text-info', bar: 'bg-info' },
    { bg: 'bg-warning-soft dark:bg-warning/10', text: 'text-warning', bar: 'bg-warning' },
    { bg: 'bg-error-soft dark:bg-error/10', text: 'text-error', bar: 'bg-error' },
];

export const SubjectCards = ({ enrollments }: SubjectCardsProps) => {
    const navigate = useNavigate();

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigate('/schedule')} className="text-primary dark:text-primary text-[11px] font-semibold hover:underline transition-all">عرض الكل</button>
                <h3 className="text-[13px] font-bold text-main dark:text-main">المواد</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {enrollments.map((en, idx) => {
                    const used = Number(en.sessionsUsed || 0);
                    const total = Number(en.sessionsTotal || 1);
                    const progress = Math.min(Math.round((used / total) * 100), 100);
                    const color = subjectColors[idx % subjectColors.length];

                    return (
                    <div
                        key={en.id || idx}
                        className="bg-surface dark:bg-card border border-border dark:border-border rounded-2xl p-4 hover:shadow-elevation-1 transition-all duration-200"
                    >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center shrink-0`}>
                                    <BookOpen size={18} className={color.text} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[13px] font-bold text-main dark:text-main truncate">{en.subject || 'دورة'}</h4>
                                    {en.teacherName && (
                                        <p className="text-[11px] text-muted dark:text-muted flex items-center gap-1">
                                            <User size={9} /> {en.teacherName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-2">
                                <div className="h-1.5 bg-border dark:bg-border rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${color.bar} transition-all duration-500`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-muted dark:text-muted">{used} من {total} حصة</span>
                                <span className={`text-[11px] font-bold ${color.text}`}>{progress}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
