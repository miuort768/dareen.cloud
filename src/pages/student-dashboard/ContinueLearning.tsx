import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/shared/components/ui';

interface Enrollment {
    subject?: string;
    teacher?: string;
    sessionsUsed?: number;
    sessionsTotal?: number;
    schedule?: { day: string; hour: string; period: string }[];
    nextSessionNotes?: string;
    teacherName?: string;
    progress?: number;
    image?: string;
    level?: string;
}

interface ContinueLearningProps {
    enrollments: Enrollment[];
}

export const ContinueLearning = ({ enrollments }: ContinueLearningProps) => {
    const navigate = useNavigate();

    return (
        <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
                <button onClick={() => navigate('/schedule')} className="text-primary text-sm font-bold">عرض الكل</button>
                <h2 className="text-lg font-bold text-main">تابع تعلمك</h2>
            </div>

            {enrollments.length > 0 ? (
                <div className="space-y-3">
                    {enrollments.slice(0, 3).map((en, idx) => {
                        const used = Number(en.sessionsUsed || 0);
                        const total = Number(en.sessionsTotal || 1);
                        const progress = Math.min(Math.round((used / total) * 100), 100);
                        return (
                            <motion.div key={idx} initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                                <GlassCard className="p-4 flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-active flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                                        <BookOpen size={22} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-micro font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-card">متابعة</span>
                                            <h3 className="text-sm font-semibold text-main truncate max-w-[140px]">{en.subject || 'دورة تعليمية'}</h3>
                                        </div>
                                        <p className="text-micro text-dim text-start mb-2">{en.level || `${used} من ${total} حصة`}</p>
                                        <div className="relative">
                                            <div className="h-2 bg-hover rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                                                    className="h-full rounded-full bg-gradient-to-l from-primary to-primary-active shadow-lg shadow-primary/30" />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-micro font-bold text-primary">{progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <GlassCard className="p-4 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-active flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                        <span className="text-2xl">💻</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-micro font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-card">متابعة</span>
                            <h3 className="text-sm font-semibold text-main">أساسيات البرمجة</h3>
                        </div>
                        <p className="text-micro text-dim text-start mb-2">المستوى المبتدئ</p>
                        <div className="relative">
                            <div className="h-2 bg-hover rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '60%' }}
                                    transition={{ duration: 0.8, delay: 0.3 }} className="h-full rounded-full bg-gradient-to-l from-primary to-primary-active shadow-lg shadow-primary/30" />
                            </div>
                            <span className="text-micro font-bold text-primary mt-1 block text-end">60%</span>
                        </div>
                    </div>
                </GlassCard>
            )}
        </div>
    );
};
