import { useState } from 'react';
import { X, Trash, RefreshCw, MessageCircle, BookOpen, Snowflake, Play, UserCircle2, CheckCircle2, GraduationCap, Zap, Shield, Trophy, Plus } from 'lucide-react';
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
        <div className={cn(
            "bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col rounded-none",
            "fixed inset-0 z-[100] lg:static lg:h-[750px] lg:border lg:border-slate-100 dark:lg:border-slate-800"
        )}>
            {/* Premium Header */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 px-6 py-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
                <div className="absolute top-0 right-0 w-32 h-full bg-emerald-500/5 -skew-x-12 transform translate-x-16 pointer-events-none"></div>
                
                <div className="flex items-center gap-5 relative z-10">
                    <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-tr from-[#5c59f2] to-[#7c79ff] text-white flex items-center justify-center shadow-lg rotate-2">
                            <GraduationCap size={32} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-sm">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    
                    <div className="text-right" dir="rtl">
                        <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="font-black text-slate-800 dark:text-white text-xl tracking-tighter uppercase">{student.name}</h3>
                            <RankBadge rank={rank} size="sm" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-black px-2 py-0.5 tracking-widest uppercase">
                                {student.grade}
                            </span>
                            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-100 dark:border-amber-900/50 px-2 py-0.5 text-[9px] font-black uppercase">
                                {points} نقطة خبرة
                            </div>
                            <button 
                                onClick={() => setShowCard(true)}
                                className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800 px-2 py-0.5 text-[9px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all"
                            >
                                <UserCircle2 size={12} className="inline ml-1" />
                                عرض البطاقة
                            </button>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onClose} 
                    className="relative z-10 w-11 h-11 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white dark:bg-slate-900">
                
                {/* Visual Rank/Progress Panel */}
                <div className="bg-slate-900 text-white p-6 border-r-4 border-r-[#5c59f2] rounded-none overflow-hidden relative" dir="rtl">
                    <div className="absolute top-0 left-0 w-48 h-full bg-[#5c59f2]/5 rotate-12 -translate-x-24"></div>
                    
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shadow-xl">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-xs uppercase tracking-[3px] text-slate-400 mb-1">المسار الأكاديمي</h4>
                                <p className="text-sm font-black text-white italic">{rank.name}</p>
                            </div>
                        </div>
                        <div className="text-left">
                            <span className="text-[10px] font-black text-white/30 uppercase block mb-1">المستوى التالي</span>
                            <span className="text-xs font-black text-[#7c79ff]">{next?.name || 'أعلى مستوى'}</span>
                        </div>
                    </div>

                    {next && (
                        <div className="space-y-4 relative z-10">
                            <div className="h-2 bg-white/5 rounded-none overflow-hidden border border-white/10 p-0.5">
                                <div 
                                    className="h-full bg-gradient-to-r from-[#5c59f2] to-[#7c79ff] transition-all duration-1000 shadow-[0_0_15px_rgba(92,89,242,0.3)]"
                                    style={{ width: `${Math.min((points / next.minPoints) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <Zap size={12} className="animate-pulse" />
                                    <span>متبقي {pointsNeeded} نقطة للترقية</span>
                                </div>
                                <span className="tabular-nums">{points} / {next.minPoints}</span>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Account Details Card */}
                <div className="bg-slate-50 dark:bg-slate-800/20 p-6 border border-slate-100 dark:border-slate-800 rounded-none" dir="rtl">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="text-[#5c59f2]" size={16} />
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 underline decoration-[#5c59f2] decoration-2 underline-offset-4">بيانات الوصول والتحقق</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <span className="text-[9px] font-black text-slate-300 uppercase block mb-1">اسم المستخدم</span>
                            {student.username ? (
                                <span className="font-mono font-black text-sm text-[#5c59f2] tracking-tighter">@{student.username}</span>
                            ) : (
                                <span className="text-xs text-rose-500 font-bold italic">غير معرّف</span>
                            )}
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-[9px] font-black text-slate-300 uppercase block mb-1">حالة الحساب</span>
                                <span className={cn("text-[10px] font-black uppercase", student.username ? "text-emerald-500" : "text-rose-500")}>
                                    {student.username ? "مفعل بالكامل" : "متوقف - يحتاج إعداد"}
                                </span>
                            </div>
                            <div className={cn("w-2 h-2 rounded-full", student.username ? "bg-emerald-500" : "bg-rose-500")}></div>
                        </div>
                    </div>
                </div>

                {/* Enrollments Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-6">
                         <div className="flex items-center gap-3">
                            <BookOpen size={18} className="text-[#5c59f2]" />
                            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest italic">
                                المسارات التعليمية المسجلة ({student.enrollments.length})
                            </h4>
                         </div>
                         <div className="w-2 h-2 bg-[#5c59f2] rotate-45"></div>
                    </div>

                    <div className="space-y-10">
                        {student.enrollments.map((en, i) => {
                            const actualUsed = en.sessionsUsed;
                            const remaining = en.sessionsTotal - actualUsed;
                            const isLow = remaining <= 2;
                            const progressPercent = Math.round((actualUsed / en.sessionsTotal) * 100);

                            return (
                                <div key={i} className={cn(
                                    "p-8 border border-slate-100 dark:border-slate-800 relative transition-all bg-white dark:bg-slate-900 group shadow-sm hover:shadow-xl",
                                    en.isFrozen && "opacity-70 grayscale",
                                    isLow && "border-r-4 border-r-rose-500"
                                )}>
                                    {en.isFrozen && (
                                        <div className="absolute top-0 left-0 bg-blue-500 text-white px-4 py-1.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Snowflake size={14} />
                                            اشتراك مجمّد مؤقتاً
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 text-right" dir="rtl">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h5 className="font-black text-slate-800 dark:text-white text-xl tracking-tighter uppercase">{en.subject}</h5>
                                                {isLow && (
                                                    <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-100 px-2 py-0.5 text-[8px] font-black">رصيد منخفض</div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#5c59f2]">
                                                    <UserCircle2 size={16} />
                                                </div>
                                                <span>أستاذة: <span className="text-slate-700 dark:text-slate-200">{en.teacher}</span></span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {onFreezeEnrollment && en.id && (
                                                <button
                                                    onClick={() => onFreezeEnrollment(en.id!, !en.isFrozen)}
                                                    className="w-10 h-10 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                    title={en.isFrozen ? "تفعيل" : "تجميد"}
                                                >
                                                    {en.isFrozen ? <Play size={18} /> : <Snowflake size={18} />}
                                                </button>
                                            )}
                                            <button onClick={() => onSendReminder(en)} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="إرسال رسالة"><MessageCircle size={18} /></button>
                                            <button onClick={() => onRenewEnrollment(i)} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#5c59f2] hover:bg-[#5c59f2] hover:text-white transition-all shadow-sm" title="تجديد"><RefreshCw size={18} /></button>
                                            <button onClick={() => onDeleteEnrollment(i)} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="حذف"><Trash size={18} /></button>
                                        </div>
                                    </div>

                                    {/* Attendance Visualizer */}
                                    <div className="mb-8 space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">سجل الإنجاز والمتابعة الكلي</label>
                                        <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-12 gap-2">
                                            {[...Array(en.sessionsTotal)].map((_, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={cn(
                                                        "aspect-square border flex items-center justify-center transition-all duration-300",
                                                        idx < actualUsed 
                                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
                                                            : idx === actualUsed 
                                                                ? "bg-amber-100 border-[#5c59f2] animate-pulse" 
                                                                : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800"
                                                    )}
                                                >
                                                    {idx < actualUsed ? <CheckCircle2 size={12} /> : idx === actualUsed ? <Play size={12} className="text-[#5c59f2]" /> : <span className="text-[8px] text-slate-300 font-bold tabular-nums">{idx + 1}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                                        <div className="flex justify-between items-end mb-4" dir="rtl">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">نسبة التقدم الأكاديمي</p>
                                                <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">%{progressPercent}</p>
                                            </div>
                                            <div className="text-left bg-slate-900 px-4 py-2">
                                                <p className="text-[8px] text-slate-500 uppercase font-black mb-1">الرصيد المتاح</p>
                                                <p className={cn("text-sm font-black tabular-nums", isLow ? "text-rose-500" : "text-emerald-400")}>{remaining} حصة</p>
                                            </div>
                                        </div>
                                        
                                        <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all duration-1000", isLow ? "bg-rose-500" : "bg-[#5c59f2]")}
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-3 mt-8">
                                        <button
                                            onClick={() => setAddingSessionsIndex(addingSessionsIndex === i ? null : i)}
                                            className={cn("px-6 py-3 text-[10px] font-black flex-1 w-full text-center transition-all uppercase tracking-widest border", 
                                                addingSessionsIndex === i 
                                                ? "bg-slate-900 text-white border-slate-900" 
                                                : "border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            إضافة حصص رصيد
                                        </button>

                                        <button
                                            onClick={() => setShowHistory(true)}
                                            className="px-6 py-3 bg-amber-50 dark:bg-amber-900/10 text-amber-600 border border-amber-100 dark:border-amber-900/50 text-[10px] font-black flex-1 w-full text-center hover:bg-amber-500 hover:text-white transition-all uppercase tracking-widest"
                                        >
                                            سجل الجلسات المفصل
                                        </button>
                                    </div>

                                    {addingSessionsIndex === i && (
                                        <div className="grid grid-cols-4 gap-2 mt-4 p-4 bg-slate-50 dark:bg-slate-800 shadow-inner">
                                            {[1, 4, 8, 12].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => { onAddSessions(i, num); setAddingSessionsIndex(null); }}
                                                    className="py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-black text-sm text-slate-700 hover:bg-[#5c59f2] hover:text-white transition-all"
                                                >
                                                    +{num}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Add Enrollment Panel */}
                <div className="bg-slate-50 dark:bg-slate-800/20 p-8 border border-slate-100 dark:border-slate-800 rounded-none relative overflow-hidden" dir="rtl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center">
                            <Plus size={20} />
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-widest text-slate-800 dark:text-white">إدراج برنامج تعليمي جديد</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">تحديد المعلمة، المادة، وخطة الجلسات</p>
                        </div>
                    </div>
                    <EnrollmentForm teachers={teachers} onSubmit={onAddEnrollment} />
                </div>
            </div>

            {showHistory && (
                <StudentHistoryModal student={student} onClose={() => setShowHistory(false)} />
            )}

            {showCard && (
                <StudentCard student={student} onClose={() => setShowCard(false)} />
            )}
        </div>
    );
};
