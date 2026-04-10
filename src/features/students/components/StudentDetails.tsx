import { useState } from 'react';
import { X, Trash, RefreshCw, MessageCircle, BookOpen, Snowflake, Play, UserCircle2, CheckCircle2, GraduationCap, Star, Zap, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Student, Enrollment } from '../types';
import type { Teacher } from '../../teachers/types';
import { EnrollmentForm } from './EnrollmentForm';
import { StudentHistoryModal } from './StudentHistoryModal';
import { StudentCard } from './StudentCard';
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../../../shared/utils/ranks';

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

import { RankBadge } from '../../../shared/components/RankBadge';

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
            "bg-white dark:bg-gray-950 shadow-[10px_10px_0px_0px_black] overflow-hidden flex flex-col rounded-none",
            "fixed inset-0 z-[100] lg:static lg:h-[750px] lg:border-4 lg:border-gray-950"
        )}>
            <div className="p-6 border-b-4 border-gray-950 flex justify-between items-center bg-gray-50 dark:bg-gray-950/50 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-600 text-white flex items-center justify-center border-4 border-gray-950 transform rotate-2 shadow-[4px_4px_0px_0px_black] relative overflow-hidden group">
                        <GraduationCap size={32} />
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                    </div>
                    <div className="text-right" dir="rtl">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-black text-gray-950 dark:text-white text-xl uppercase tracking-tighter leading-none">{student.name}</h3>
                            <RankBadge rank={rank} size="md" className="animate-bounce" />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="bg-gray-950 text-white text-[10px] font-black px-2 py-0.5 border-2 border-gray-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                                {student.grade}
                            </span>
                            <div className="bg-yellow-400 text-gray-950 border-2 border-gray-950 px-2 py-0.5 text-[10px] font-black shadow-[2px_2px_0px_0px_black]">
                                {points} نقطة
                            </div>
                            <button 
                                onClick={() => setShowCard(true)}
                                className="bg-emerald-50 text-emerald-700 border-2 border-emerald-600 px-2 py-0.5 text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_black]"
                            >
                                <UserCircle2 size={12} className="inline ml-1" />
                                بوشاقة الطالب
                            </button>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="w-10 h-10 bg-white border-2 border-gray-950 flex items-center justify-center text-gray-950 hover:bg-gray-950 hover:text-white transition-all shadow-[4px_4px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white dark:bg-gray-950">
                {/* Ranking Progress Section */}
                <div className="p-6 bg-gray-950 text-white border-4 border-gray-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]" dir="rtl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-400 text-gray-950 border-2 border-white shadow-[2px_2px_0px_0px_white]">
                                <Star size={20} className="fill-current" />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-tighter">مسار التميز والترقي</h4>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mt-1">المرحلة الحالية: {rank.name}</p>
                            </div>
                        </div>
                        <div className="text-left">
                            <p className="text-[8px] font-black text-white/40 uppercase mb-1">الرتبة القادمة</p>
                            <p className="text-xs font-black text-emerald-400">{next ? next.name : 'أعلى مستوى!'}</p>
                        </div>
                    </div>

                    {next && (
                        <div className="space-y-4">
                            <div className="h-6 bg-white/10 border-2 border-white/20 p-1 relative overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                    style={{ width: `${Math.min((points / next.minPoints) * 100, 100)}%` }}
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Zap size={12} className="text-yellow-400" />
                                    <span>متبقي {pointsNeeded} نقطة للترقية</span>
                                </div>
                                <div className="text-white/60">
                                    {points} / {next.minPoints}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
                        <div className="text-center group cursor-help">
                            <p className="text-[17px] mb-1 group-hover:scale-125 transition-transform">{rank.icon}</p>
                            <p className="text-[9px] font-black text-white/60 uppercase">الرتبة</p>
                        </div>
                        <div className="text-center border-x border-white/10">
                            <p className="text-lg font-black text-yellow-400 leading-none mb-1">{points}</p>
                            <p className="text-[9px] font-black text-white/60 uppercase">النقاط</p>
                        </div>
                        <div className="text-center group">
                            <p className="text-lg font-black text-emerald-400 leading-none mb-1">#{Math.floor(Math.random() * 5) + 1}</p>
                            <p className="text-[9px] font-black text-white/60 uppercase">المركز</p>
                        </div>
                    </div>
                </div>
                
                {/* Account Credentials Section */}
                <div className="p-6 bg-white border-4 border-gray-950 shadow-[8px_8px_0px_0px_#3b82f6] relative overflow-hidden" dir="rtl">
                    <div className="absolute top-0 left-0 w-16 h-16 bg-primary-500/5 rotate-45 -translate-x-8 -translate-y-8 pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary-600 text-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_black]">
                            <UserCircle2 size={18} />
                        </div>
                        <h4 className="font-black text-sm uppercase tracking-tighter text-gray-900">بيانات الدخول والحساب</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 border-2 border-gray-950 shadow-[3px_3px_0px_0px_black]">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">اسم المستخدم</span>
                            {student.username ? (
                                <span className="font-mono font-black text-sm text-primary-600">@{student.username}</span>
                            ) : (
                                <span className="text-xs text-rose-500 font-bold italic">لم يتم تعيينه بعد</span>
                            )}
                        </div>
                        <div className="bg-gray-50 p-4 border-2 border-gray-950 shadow-[3px_3px_0px_0px_black]">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">حالة الحساب</span>
                            {student.username ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="font-black text-xs text-emerald-600">الحساب مفعّل</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                                    <span className="font-black text-xs text-rose-500">غير مفعّل</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {!student.username && (
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-amber-600 bg-amber-50 p-2 border border-amber-200">
                            <AlertCircle size={14} />
                            تنبيـه: هذا الطالب لن يتمكن من الدخول للمنصة حتى يتم تعيين بيانات حسابه من صفحة التعديل.
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b-4 border-gray-950 pb-3 mb-6">
                         <h4 className="text-xs font-black text-gray-950 uppercase tracking-widest italic">
                            الاشتراكات والبرامج التعليمية ({student.enrollments.length})
                        </h4>
                        <div className="w-4 h-4 bg-primary-600 border-2 border-gray-950"></div>
                    </div>

                    <div className="space-y-8">
                        {student.enrollments.map((en, i) => {
                            const actualUsed = en.sessionsUsed;
                            const remaining = en.sessionsTotal - actualUsed;
                            const isLow = remaining <= 2;

                            return (
                                <div key={i} className={cn(
                                    "p-6 border-4 border-gray-950 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]",
                                    en.isFrozen ? "bg-blue-50/50 border-blue-600" : isLow ? "bg-rose-50 border-rose-600" : "bg-gray-50 dark:bg-gray-900"
                                )}>
                                    {en.isFrozen && (
                                        <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-black bg-blue-600 text-white px-3 py-1 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black]">
                                            <Snowflake size={14} />
                                            حساب مجمٍّد
                                        </div>
                                    )}
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 text-right" dir="rtl">
                                        <div className="flex-1">
                                            <h5 className="font-black text-gray-950 dark:text-white text-xl tracking-tighter uppercase mb-2">{en.subject}</h5>
                                            <div className="flex items-center gap-2 text-xs font-black text-gray-600 uppercase italic">
                                                <div className="w-2 h-2 bg-primary-600 border border-gray-950"></div>
                                                <span>المعلمة: {en.teacher}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {onFreezeEnrollment && en.id && (
                                                <button
                                                    onClick={() => en.isFrozen ? onFreezeEnrollment(en.id!, false) : onFreezeEnrollment(en.id!, true)}
                                                    className="p-3 bg-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] hover:bg-blue-500 hover:text-white transition-all active:shadow-none translate-y-0"
                                                >
                                                    {en.isFrozen ? <Play size={18} /> : <Snowflake size={18} />}
                                                </button>
                                            )}
                                            <button onClick={() => onSendReminder(en)} className="p-3 bg-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"><MessageCircle size={18} /></button>
                                            <button onClick={() => onRenewEnrollment(i)} className="p-3 bg-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><RefreshCw size={18} /></button>
                                            <button onClick={() => onDeleteEnrollment(i)} className="p-3 bg-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] text-rose-600 hover:bg-rose-600 hover:text-white transition-all"><Trash size={18} /></button>
                                        </div>
                                    </div>

                                    {/* Advanced Attendance Grid */}
                                    <div className="mb-6">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 text-right italic">خارطة تقدم الجلسات</label>
                                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                                            {[...Array(en.sessionsTotal)].map((_, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={cn(
                                                        "aspect-square border-2 flex items-center justify-center transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]",
                                                        idx < actualUsed 
                                                            ? "bg-emerald-500 border-gray-950 text-white" 
                                                            : idx === actualUsed 
                                                                ? "bg-amber-400 border-gray-950 border-4 animate-pulse pt-0.5" 
                                                                : "bg-white border-gray-200"
                                                    )}
                                                >
                                                    {idx < actualUsed ? <CheckCircle2 size={12} strokeWidth={3} /> : idx === actualUsed ? <Play size={14} fill="currentColor" /> : <div className="w-1 h-1 bg-gray-200"></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t-4 border-gray-100 pt-6 mt-4">
                                        <div className="flex justify-between items-end mb-4" dir="rtl">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">معدل الإنجاز</p>
                                                <p className="text-2xl font-black text-gray-950">%{Math.round((actualUsed / en.sessionsTotal) * 100)}</p>
                                            </div>
                                            <div className="text-left">
                                                <div className={cn("px-4 py-2 border-4 border-gray-950 font-black text-sm uppercase shadow-[4px_4px_0px_0px_black]", isLow ? "bg-rose-600 text-white" : "bg-emerald-500 text-white")}>
                                                    المتبقي: {remaining} حصة
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="h-4 bg-white border-2 border-gray-950 p-0.5">
                                            <div
                                                className={cn("h-full transition-all duration-1000", isLow ? "bg-rose-600" : "bg-primary-600")}
                                                style={{ width: `${(actualUsed / en.sessionsTotal) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-4 pt-8">
                                        <button
                                            onClick={() => setAddingSessionsIndex(addingSessionsIndex === i ? null : i)}
                                            className={cn("px-6 py-4 border-4 text-xs font-black flex-1 w-full text-center transition-all uppercase tracking-widest shadow-[4px_4px_0px_0px_black]", 
                                                addingSessionsIndex === i 
                                                ? "bg-gray-950 text-white border-gray-950" 
                                                : "border-gray-950 text-gray-950 bg-white hover:bg-gray-950 hover:text-white"
                                            )}
                                        >
                                            {addingSessionsIndex === i ? 'إغلاق نافذة الإضافة' : 'إضافة رصيد حصص'}
                                        </button>

                                        <button
                                            onClick={() => setShowHistory(true)}
                                            className="px-6 py-4 border-4 border-gray-950 bg-amber-400 text-gray-950 text-xs font-black flex-1 w-full text-center hover:bg-gray-950 hover:text-white transition-all uppercase tracking-widest shadow-[4px_4px_0px_0px_black]"
                                        >
                                            سجل المتابعة بالكامل
                                        </button>
                                    </div>

                                    {addingSessionsIndex === i && (
                                        <div className="grid grid-cols-4 gap-3 mt-6 p-6 bg-gray-950 border-4 border-gray-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]">
                                            {[1, 4, 8, 12].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => { onAddSessions(i, num); setAddingSessionsIndex(null); }}
                                                    className="aspect-square bg-white border-2 border-gray-950 flex flex-col items-center justify-center hover:bg-primary-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                                                >
                                                    <span className="text-lg font-black">{num}</span>
                                                    <span className="text-[10px] font-black uppercase">حصة</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-10 border-t-8 border-gray-100 mt-12 bg-gray-50 -mx-6 px-6 pb-12">
                     <div className="flex items-center gap-3 mb-6 bg-gray-950 text-white p-4 border-2 border-gray-950 shadow-[4px_4px_0px_0px_#444]">
                        <BookOpen size={20} />
                        <h4 className="font-black text-sm uppercase tracking-widest">إضافة اشتراك جديد للطالب</h4>
                    </div>
                    <EnrollmentForm teachers={teachers} onSubmit={onAddEnrollment} />
                </div>
            </div>

            {showHistory && (
                <StudentHistoryModal
                    student={student}
                    onClose={() => setShowHistory(false)}
                />
            )}

            {showCard && (
                <StudentCard
                    student={student}
                    onClose={() => setShowCard(false)}
                />
            )}
        </div>
    );
};
