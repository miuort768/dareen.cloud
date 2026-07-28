import { BookOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Enrollment } from './types';

interface ContinueLearningProps {
    enrollments: Enrollment[];
}

export const ContinueLearning = ({ enrollments }: ContinueLearningProps) => {
    const navigate = useNavigate();

    if (enrollments.length === 0) return null;

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <button onClick={() => navigate('/schedule')} className="text-primary text-xs font-bold">عرض الكل</button>
                <h3 className="text-sm font-bold text-main">تابع تعلمك</h3>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide" role="region" aria-label="المتابعة التعلم" tabIndex={0}>
                {enrollments.slice(0, 5).map((en, idx) => {
                    const used = Number(en.sessionsUsed || 0);
                    const total = Number(en.sessionsTotal || 1);
                    const progress = Math.min(Math.round((used / total) * 100), 100);

                    return (
                    <div
                        key={en.id || idx}
                        className="bg-card border border-border rounded-2xl p-4 min-w-[200px] snap-start shrink-0 hover:border-primary/30 transition-colors"
                    >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                                    <BookOpen size={16} className="text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-main truncate">{en.subject || 'دورة'}</h4>
                                    {en.teacherName && (
                                        <p className="text-micro text-muted truncate">{en.teacherName}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-2">
                                <div className="h-1.5 bg-hover rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-micro text-muted">{progress}%</span>
                                <button
                                    onClick={() => navigate('/schedule')}
                                    className="text-primary text-micro font-bold flex items-center gap-1"
                                >
                                    متابعة <ArrowRight size={10} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
