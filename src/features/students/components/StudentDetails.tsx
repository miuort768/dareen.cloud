import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash, RefreshCw, MessageCircle, UserCircle2, CheckCircle2, Trophy, Plus, User, Snowflake, Play } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Student, Enrollment } from '../types';
import type { Teacher } from '../../teachers/types';
import { EnrollmentForm } from './EnrollmentForm';
import { StudentHistoryModal } from './StudentHistoryModal';
import { StudentCard } from './StudentCard';
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../../../shared/utils/ranks';
import { RankBadge } from '../../../shared/components/RankBadge';
import { ProgressBar } from '../../../shared/components/ui';

interface StudentDetailsProps {
    student: Student;
    onClose: () => void;
    onAddEnrollment: (data: Record<string, unknown>) => void;
    onDeleteEnrollment?: (index: number) => void;
    onRenewEnrollment?: (index: number) => void;
    onSendReminder?: (enrollment: Enrollment) => void;
    onAddSessions?: (index: number, amount: number) => void;
    onFreezeEnrollment?: (enrollmentId: string, isFrozen: boolean, reason?: string) => void;
    teachers: Teacher[];
    isAddingEnrollment?: boolean;
}

export const StudentDetails = ({
    student,
    onClose,
    onAddEnrollment,
    onDeleteEnrollment,
    onRenewEnrollment,
    onSendReminder,
    onAddSessions,
    onFreezeEnrollment,
    teachers,
    isAddingEnrollment
}: StudentDetailsProps) => {
    const [addingSessionsIndex, setAddingSessionsIndex] = useState<number | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showCard, setShowCard] = useState(false);

    const points = student.totalPoints || 0;
    const rank = getRankByPoints(points, STUDENT_RANKS);
    const { next, pointsNeeded } = getNextRank(points, STUDENT_RANKS);

    return (
        <div className="flex flex-col bg-card border border-border shadow-elevation-1 overflow-hidden mb-12">
            {/* Header Section */}
            <div className="relative p-6 bg-surface border-b border-border" dir="rtl">
                <button
                    onClick={onClose}
                    className="absolute end-4 top-4 text-muted hover:text-error p-2 hover:bg-error-soft transition-all rounded-xl"
                    aria-label="إغلاق"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-on-primary flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                        {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-normal text-base text-main truncate">{student.name}</h3>
                            <RankBadge rank={rank} size="sm" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-micro font-normal text-info bg-info-soft px-1.5 py-0.5 uppercase">{student.grade}</span>
                            <span className="text-micro font-normal text-success bg-success-soft px-1.5 py-0.5">{points} XP</span>
                            <button onClick={() => setShowCard(true)} className="text-micro font-normal text-muted hover:text-info flex items-center gap-1">
                                <UserCircle2 size={12} />
                                بطاقة الطالب
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-5 overflow-y-auto flex-1 custom-scrollbar" dir="rtl">
                {/* Points & Rank Panel */}
                <div className="p-4 bg-card border border-border shadow-elevation-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-info-soft text-info flex items-center justify-center">
                                <Trophy size={18} />
                            </div>
                            <div>
                                <p className="text-micro font-normal text-muted uppercase">الرتبة الحالية</p>
                                <p className="text-sm font-medium text-main">{rank.name}</p>
                            </div>
                        </div>
                        {next && (
                            <div className="text-end">
                                <p className="text-micro font-normal text-muted uppercase">التالي</p>
                                <p className="text-xs font-normal text-info">{next.name}</p>
                            </div>
                        )}
                    </div>

                    {next && (
                        <div className="space-y-2">
                            <div className="h-1.5 bg-surface overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((points / next.minPoints) * 100, 100)}%` }}
                                    className="h-full bg-primary"
                                />
                            </div>
                            <div className="flex justify-between text-micro font-normal text-muted uppercase">
                                <span>متبقي {pointsNeeded} XP</span>
                                <span className="font-mono">{points} / {next.minPoints}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-2 gap-3">
<div className="p-3 bg-surface border border-border rounded-xl">
                        <p className="text-micro font-normal text-muted uppercase mb-1">اسم المستخدم</p>
                        <p className="text-xs font-normal text-info font-mono">@{student.username || '—'}</p>
                    </div>
                    <div className="p-3 bg-surface border border-border rounded-xl">
                        <p className="text-micro font-normal text-muted uppercase mb-1">حالة المصادقة</p>
                        <div className="flex items-center gap-1.5">
                            <div className={cn("w-1.5 h-1.5", student.username ? "bg-success" : "bg-error")} />
                            <p className="text-micro font-normal text-muted">{student.username ? 'مفعل' : 'غير مكتمل'}</p>
                        </div>
                    </div>
                </div>

                {/* Enrollments */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                        <h4 className="text-micro font-normal text-muted uppercase tracking-widest italic">البرامج الأكاديمية النشطة</h4>
                        <span className="text-micro font-normal bg-surface text-muted px-2 py-0.5">{student.enrollments.length} برامج</span>
                    </div>

                    <div className="space-y-4">
                        {student.enrollments.map((en, i) => {
                            const actualUsed = en.sessionsUsed;
                            const remaining = en.sessionsTotal - actualUsed;
                            const isLow = remaining <= 2;
                            const progressPercent = en.sessionsTotal ? Math.round((actualUsed / en.sessionsTotal) * 100) : 0;

                            return (
                                <div key={`detail-${i}`} className={cn(
                                    "p-3 bg-card border border-border shadow-elevation-1 relative",
                                    en.isFrozen && "opacity-50 grayscale",
                                    isLow ? "border-error" : ""
                                )}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h5 className="font-bold text-xs text-main">{en.subject}</h5>
                                                {isLow && <span className="text-micro font-normal text-error bg-error-soft px-1 animate-pulse">رصيد منخفض</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-hover flex items-center justify-center rounded">
                                                     <User size={8} className="text-muted" />
                                                </div>
                                                <span className="text-micro font-normal text-muted">{en.teacher}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {onFreezeEnrollment && en.id && (
                                                <button onClick={() => en.id && onFreezeEnrollment(en.id, !en.isFrozen)} className="w-7 h-7 flex items-center justify-center text-info hover:bg-info-soft transition-all" title={en.isFrozen ? "تفعيل" : "تجميد"} aria-label={en.isFrozen ? "تفعيل" : "تجميد"}>
                                                    {en.isFrozen ? <Play size={14} /> : <Snowflake size={14} />}
                                                </button>
                                            )}
                                            <button onClick={() => onSendReminder?.(en)} className="w-6 h-6 flex items-center justify-center text-success hover:bg-success-soft transition-all" title="تذكير" aria-label="تذكير"><MessageCircle size={12} /></button>
                                            <button onClick={() => onRenewEnrollment?.(i)} className="w-6 h-6 flex items-center justify-center text-info hover:bg-info-soft transition-all" title="تجديد" aria-label="تجديد"><RefreshCw size={12} /></button>
                                            <button onClick={() => onDeleteEnrollment?.(i)} className="w-6 h-6 flex items-center justify-center text-error hover:bg-error-soft transition-all" title="حذف" aria-label="حذف"><Trash size={12} /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            {[...Array(en.sessionsTotal)].map((_, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={cn(
                                                    "w-4 h-4 border flex items-center justify-center text-micro font-normal font-mono transition-all rounded",
                                                     idx < actualUsed 
                                                         ? "bg-success border-success text-inverse" 
                                                         : idx === actualUsed 
                                                             ? "bg-card border-info text-info shadow-sm" 
                                                             : "bg-surface border-border text-muted"
                                                    )}
                                                >
                                                    {idx < actualUsed ? <CheckCircle2 size={10} /> : idx + 1}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-3 border-t border-border flex items-center justify-between">
                                            <div className="flex-1 max-w-[120px]">
                                                <div className="flex justify-between text-micro font-normal text-muted uppercase mb-1">
                                                    <span>الإنجاز</span>
                                                    <span>{progressPercent}%</span>
                                                </div>
                                                <ProgressBar value={progressPercent} size="sm" variant={isLow ? 'error' : 'primary'} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-center px-2 border-s border-border">
                                                    <p className="text-micro font-normal text-muted uppercase leading-none mb-0.5">الرصيد</p>
                                                    <p className={cn("text-xs font-medium font-mono", isLow ? "text-error" : "text-success")}>{remaining}</p>
                                                </div>
                                                <button 
                                                    onClick={() => setAddingSessionsIndex(addingSessionsIndex === i ? null : i)}
                                                    className="w-6 h-6 bg-primary text-on-primary text-micro font-medium flex items-center justify-center hover:bg-primary-hover active:scale-90 transition-all shadow-sm rounded-xl"
                                                    aria-label="إضافة حصص"
                                                    aria-expanded={addingSessionsIndex === i}
                                                >
                                                    <Plus size={12} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {addingSessionsIndex === i && (
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-border animate-in slide-in-from-top-2 duration-200">
                                            {[1, 2, 4, 8].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => { onAddSessions?.(i, num); setAddingSessionsIndex(null); }}
                                                    className="flex-1 py-1.5 bg-hover hover:bg-primary hover:text-on-primary text-muted font-normal text-micro font-mono transition-all"
                                                >
                                                    +{num} حصة
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const val = prompt('أدخل عدد الحصص المراد إضافتها:');
                                                    if (val && !isNaN(Number(val)) && Number(val) > 0) {
                                                        onAddSessions?.(i, Number(val));
                                                        setAddingSessionsIndex(null);
                                                    }
                                                }}
                                                className="flex-1 py-1.5 bg-hover hover:bg-primary hover:text-on-primary text-muted font-normal text-micro font-mono transition-all"
                                            >
                                                مخصص
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Add Enrollment */}
                        <div className="bg-card p-4 border-2 border-dashed border-border relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-primary-soft text-primary flex items-center justify-center shadow-sm">
                                    <Plus size={14} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-xs text-main uppercase tracking-tighter">إدراج مسار أكاديمي</h4>
                                </div>
                            </div>
                            <EnrollmentForm teachers={teachers} onSubmit={onAddEnrollment} isLoading={isAddingEnrollment} />
                        </div>
                    </div>
                </div>
            </div>

            {showHistory && <StudentHistoryModal student={student} onClose={() => setShowHistory(false)} />}
            {showCard && <StudentCard student={student} onClose={() => setShowCard(false)} />}
        </div>
    );
};

