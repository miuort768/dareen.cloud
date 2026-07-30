import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Star, Calendar, BookOpen, TrendingUp, Clock, User, GraduationCap, Trophy, Trash2, History } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { ProgressBar } from '../../../shared/components/ui';
import { RATING_OPTIONS } from '../types/constants';
import type { Student, Evaluation } from '../../../types';

interface EvaluationDrawerProps {
    student: Student | null;
    evaluations: Evaluation[];
    canDelete: (ev: Evaluation) => boolean;
    onDelete: (id: string) => void;
    onClose: () => void;
}

const avatarGradients = [
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-sky-500 to-blue-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-sky-600',
];

const getAvatarGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

export const EvaluationDrawer = ({ student, evaluations, canDelete, onDelete, onClose }: EvaluationDrawerProps) => {
    const studentEvals = useMemo(() =>
        (evaluations || [])
            .filter(ev => ev.studentId === student?.id)
            .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()),
    [evaluations, student?.id]);

    if (!student) return null;

    const totalXP = studentEvals.reduce((s, ev) => s + (ev.points || 0), 0);
    const totalEnrollments = (student.enrollments || []).length;
    const totalSessions = (student.enrollments || []).reduce((s, en) => s + en.sessionsTotal, 0);
    const usedSessions = (student.enrollments || []).reduce((s, en) => s + en.sessionsUsed, 0);
    const progress = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0;
    const gradient = getAvatarGradient(student.name);

    const rMap: Record<string, number> = { 'ممتاز': 5, 'جيد جدًا': 4, 'جيد': 3, 'يحتاج تحسين': 2 };
    const avgRating = studentEvals.length > 0
        ? Math.round((studentEvals.reduce((s, ev) => s + (rMap[ev.rating] || 3), 0) / studentEvals.length) * 10) / 10
        : 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[60] flex justify-end"
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-background border-s border-border shadow-elevation-2 overflow-hidden flex flex-col"
                    dir="rtl"
                >
                    {/* Header */}
                    <div className={cn("relative overflow-hidden p-5 bg-gradient-to-br", gradient)}>
                        <div className="absolute inset-0 bg-white/10" />
                        <div className="absolute -top-6 -end-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-6 -start-6 w-16 h-16 bg-black/10 rounded-full blur-xl" />
                        <button onClick={onClose} className="absolute top-3 end-3 w-7 h-7 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-lg transition-all z-10">
                            <X size={14} />
                        </button>
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold text-white ring-2 ring-white/30 shadow-lg shrink-0">
                                {(student.name || '?').charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base font-bold text-white truncate">{student.name}</h2>
                                <p className="text-[10px] text-white/70 mt-0.5">{student.grade || '—'}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-warning-soft/60 rounded text-[8px] font-bold text-warning">
                                        <Award size={8} /> {totalXP} XP
                                    </span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-white/15 rounded text-[8px] font-bold text-white">
                                        <Star size={8} /> {avgRating || '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-5">

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { icon: BookOpen, value: totalEnrollments, label: 'المواد', color: 'text-primary bg-primary-soft' },
                                { icon: Calendar, value: `${usedSessions}/${totalSessions}`, label: 'الحصص', color: 'text-info bg-info-soft' },
                                { icon: TrendingUp, value: `${progress}%`, label: 'الحضور', color: 'text-success bg-success-soft' },
                                { icon: History, value: studentEvals.length, label: 'التقييمات', color: 'text-warning bg-warning-soft' },
                            ].map((item, i) => (
                                <div key={i} className="p-3 bg-card border border-border rounded-xl">
                                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center mb-2", item.color)}>
                                        <item.icon size={12} />
                                    </div>
                                    <p className="text-sm font-bold text-main tabular-nums">{item.value}</p>
                                    <p className="text-[9px] text-muted mt-0.5">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Progress */}
                        {totalSessions > 0 && (
                            <div>
                                <div className="flex justify-between text-[9px] text-muted mb-1.5">
                                    <span>تقدم الحصص</span>
                                    <span className="font-bold">{progress}%</span>
                                </div>
                                <ProgressBar value={progress} variant={progress >= 75 ? 'success' : progress >= 50 ? 'warning' : 'error'} className="h-2" />
                            </div>
                        )}

                        {/* Enrollments */}
                        {(student.enrollments || []).length > 0 && (
                            <div className="space-y-2">
                                <h5 className="text-[9px] font-bold text-muted flex items-center gap-1.5">
                                    <GraduationCap size={10} /> المواد المسجلة
                                </h5>
                                <div className="space-y-1.5">
                                    {(student.enrollments || []).map((en, i) => (
                                        <div key={i} className="flex items-center justify-between px-3 py-2 bg-card border border-border rounded-xl">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-main truncate">{en.subject}</p>
                                                <p className="text-[8px] text-muted">{en.teacher}</p>
                                            </div>
                                            <div className="text-end shrink-0">
                                                <p className="text-[10px] font-bold text-main tabular-nums">{en.sessionsUsed}/{en.sessionsTotal}</p>
                                                <p className="text-[7px] text-muted">حصة</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Evaluations History */}
                        <div className="space-y-2">
                            <h5 className="text-[9px] font-bold text-muted flex items-center gap-1.5">
                                <History size={10} /> سجل التقييمات
                                <span className="px-1.5 py-0.5 bg-primary-soft text-primary text-[8px] font-bold rounded">{studentEvals.length}</span>
                            </h5>
                            <div className="space-y-2">
                                {studentEvals.length > 0 ? studentEvals.map(ev => {
                                    const r = RATING_OPTIONS.find(ro => ro.value === ev.rating) || RATING_OPTIONS[0];
                                    return (
                                        <div key={ev.id} className="p-3 bg-card border border-border rounded-xl hover:border-primary/20 transition-all">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold", r.pill)}>
                                                        <r.icon size={8} />
                                                        {ev.rating}
                                                    </span>
                                                    {ev.points > 0 && (
                                                        <span className="text-[8px] font-bold px-1.5 py-0.5 bg-warning-soft text-warning rounded">+{ev.points} XP</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[8px] text-muted">{format(new Date(ev.created_at || ev.date), 'dd/MM/yyyy')}</span>
                                                    {canDelete(ev) && (
                                                        <button onClick={() => onDelete(ev.id)} className="text-muted hover:text-error p-0.5 rounded">
                                                            <Trash2 size={9} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-[8px] text-muted italic border-s-2 border-primary/20 ps-2 leading-relaxed">
                                                &ldquo;{ev.notes || 'لا يوجد ملاحظات'}&rdquo;
                                            </p>
                                            <p className="text-[7px] text-muted mt-1">بواسطة: {ev.teacherName || 'نظام آلي'}</p>
                                        </div>
                                    );
                                }) : (
                                    <div className="py-8 text-center border border-dashed border-border rounded-xl">
                                        <Trophy size={24} className="mx-auto text-muted mb-2 opacity-30" />
                                        <p className="text-[10px] text-muted">لا يوجد سجل تقييمات</p>
                                        <p className="text-[8px] text-muted/60 mt-0.5">أضف التقييم الأول للطالب</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};