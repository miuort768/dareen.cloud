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

interface StudentDetailsProps {
    student: Student;
    onClose: () => void;
    onAddEnrollment: (data: any) => void;
    onDeleteEnrollment: (index: number) => void;
    onRenewEnrollment: (index: number) => void;
    onSendReminder: (enrollment: Enrollment) => void;
    onAddSessions: (index: number, amount: number) => void;
    onFreezeEnrollment?: (enrollmentId: string, isFrozen: boolean, reason?: string) => void;
    teachers: Teacher[];
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
    teachers
}: StudentDetailsProps) => {
    const [addingSessionsIndex, setAddingSessionsIndex] = useState<number | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showCard, setShowCard] = useState(false);

    const points = student.totalPoints || 0;
    const rank = getRankByPoints(points, STUDENT_RANKS);
    const { next, pointsNeeded } = getNextRank(points, STUDENT_RANKS);

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            {/* Header Section */}
            <div className="relative p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800" dir="rtl">
                <button
                    onClick={onClose}
                    className="absolute left-4 top-4 text-slate-400 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-all"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                        {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-base text-slate-800 dark:text-white truncate">{student.name}</h3>
                            <RankBadge rank={rank} size="sm" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{student.grade}</span>
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">{points} XP</span>
                            <button onClick={() => setShowCard(true)} className="text-[10px] font-bold text-slate-400 hover:text-indigo-500 flex items-center gap-1">
                                <UserCircle2 size={12} />
                                بطاقة الطالب
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-5 overflow-y-auto flex-1 custom-scrollbar" dir="rtl">
                {/* Points & Rank Panel */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Trophy size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">الرتبة الحالية</p>
                                <p className="text-sm font-black text-slate-800 dark:text-white">{rank.name}</p>
                            </div>
                        </div>
                        {next && (
                            <div className="text-left">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">التالي</p>
                                <p className="text-[11px] font-bold text-indigo-500">{next.name}</p>
                            </div>
                        )}
                    </div>

                    {next && (
                        <div className="space-y-2">
                            <div className="h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((points / next.minPoints) * 100, 100)}%` }}
                                    className="h-full bg-indigo-500"
                                />
                            </div>
                            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                                <span>متبقي {pointsNeeded} XP</span>
                                <span className="font-mono">{points} / {next.minPoints}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">اسم المستخدم</p>
                        <p className="text-xs font-bold text-indigo-500 font-mono">@{student.username || '—'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">حالة المصادقة</p>
                        <div className="flex items-center gap-1.5">
                            <div className={cn("w-1.5 h-1.5 rounded-full", student.username ? "bg-emerald-500" : "bg-rose-500")} />
                            <p className="text-[10px] font-bold text-slate-600">{student.username ? 'مفعل' : 'غير مكتمل'}</p>
                        </div>
                    </div>
                </div>

                {/* Enrollments */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">البرامج الأكاديمية النشطة</h4>
                        <span className="text-[9px] font-bold bg-slate-50 text-slate-400 px-2 py-0.5 rounded-md">{student.enrollments.length} برامج</span>
                    </div>

                    <div className="space-y-4">
                        {student.enrollments.map((en, i) => {
                            const actualUsed = en.sessionsUsed;
                            const remaining = en.sessionsTotal - actualUsed;
                            const isLow = remaining <= 2;
                            const progressPercent = Math.round((actualUsed / en.sessionsTotal) * 100);

                            return (
                                <div key={i} className={cn(
                                    "p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm relative",
                                    en.isFrozen && "opacity-50 grayscale",
                                    isLow ? "border-rose-100" : ""
                                )}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h5 className="font-bold text-xs text-slate-800 dark:text-white">{en.subject}</h5>
                                                {isLow && <span className="text-[8px] font-bold text-rose-500 bg-rose-50 px-1 rounded animate-pulse">رصيد منخفض</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-slate-100 rounded flex items-center justify-center">
                                                    <User size={8} className="text-slate-400" />
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-500">{en.teacher}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {onFreezeEnrollment && en.id && (
                                                <button onClick={() => onFreezeEnrollment(en.id!, !en.isFrozen)} className="w-7 h-7 flex items-center justify-center text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all" title={en.isFrozen ? "تفعيل" : "تجميد"}>
                                                    {en.isFrozen ? <Play size={14} /> : <Snowflake size={14} />}
                                                </button>
                                            )}
                                            <button onClick={() => onSendReminder(en)} className="w-6 h-6 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="تذكير"><MessageCircle size={12} /></button>
                                            <button onClick={() => onRenewEnrollment(i)} className="w-6 h-6 flex items-center justify-center text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all" title="تجديد"><RefreshCw size={12} /></button>
                                            <button onClick={() => onDeleteEnrollment(i)} className="w-6 h-6 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="حذف"><Trash size={12} /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            {[...Array(en.sessionsTotal)].map((_, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={cn(
                                                        "w-4 h-4 border flex items-center justify-center rounded-sm text-[7px] font-bold font-mono transition-all",
                                                        idx < actualUsed 
                                                            ? "bg-emerald-500 border-emerald-500 text-white" 
                                                            : idx === actualUsed 
                                                                ? "bg-white border-indigo-500 text-indigo-500 shadow-sm" 
                                                                : "bg-slate-50 border-slate-100 text-slate-300"
                                                    )}
                                                >
                                                    {idx < actualUsed ? <CheckCircle2 size={10} /> : idx + 1}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex-1 max-w-[120px]">
                                                <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase mb-1">
                                                    <span>الإنجاز</span>
                                                    <span>{progressPercent}%</span>
                                                </div>
                                                <div className="h-1 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={cn("h-full", isLow ? "bg-rose-500" : "bg-indigo-500")} style={{ width: `${progressPercent}%` }} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-center px-2 border-r border-slate-100 dark:border-slate-800">
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-0.5">الرصيد</p>
                                                    <p className={cn("text-xs font-black font-mono", isLow ? "text-rose-500" : "text-emerald-500")}>{remaining}</p>
                                                </div>
                                                <button 
                                                    onClick={() => setAddingSessionsIndex(addingSessionsIndex === i ? null : i)}
                                                    className="w-6 h-6 bg-slate-900 text-white rounded text-[10px] font-black flex items-center justify-center hover:bg-indigo-600 active:scale-90 transition-all shadow-sm"
                                                >
                                                    <Plus size={12} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {addingSessionsIndex === i && (
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
                                            {[1, 2, 4, 8].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => { onAddSessions(i, num); setAddingSessionsIndex(null); }}
                                                    className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500 hover:text-white text-slate-600 dark:text-slate-300 font-bold text-[10px] font-mono rounded transition-all"
                                                >
                                                    +{num} حصة
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const val = prompt('أدخل عدد الحصص المراد إضافتها:');
                                                    if (val && !isNaN(Number(val)) && Number(val) > 0) {
                                                        onAddSessions(i, Number(val));
                                                        setAddingSessionsIndex(null);
                                                    }
                                                }}
                                                className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500 hover:text-white text-slate-600 dark:text-slate-300 font-bold text-[10px] font-mono rounded transition-all"
                                            >
                                                مخصص
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Add Enrollment */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-none border-2 border-dashed border-indigo-200 dark:border-indigo-900/30 relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-none flex items-center justify-center shadow-sm">
                                    <Plus size={14} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-tighter">إدراج مسار أكاديمي</h4>
                                </div>
                            </div>
                            <EnrollmentForm teachers={teachers} onSubmit={onAddEnrollment} />
                        </div>
                    </div>
                </div>
            </div>

            {showHistory && <StudentHistoryModal student={student} onClose={() => setShowHistory(false)} />}
            {showCard && <StudentCard student={student} onClose={() => setShowCard(false)} />}
        </div>
    );
};
