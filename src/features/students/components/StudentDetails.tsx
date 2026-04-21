import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash, RefreshCw, MessageCircle, BookOpen, Snowflake, Play, UserCircle2, CheckCircle2, Zap, Shield, Trophy, Plus } from 'lucide-react';
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
            "fixed inset-0 z-[100] lg:static lg:h-[800px] lg:border-2 lg:border-slate-900 dark:lg:border-white"
        )}>
            {/* Premium Header */}
            <div className="relative overflow-hidden bg-slate-900 dark:bg-black px-8 py-10 border-b-4 border-indigo-600 flex justify-between items-center">
                <div className="absolute top-0 left-0 w-64 h-full bg-indigo-600/10 -skew-x-12 transform -translate-x-32 pointer-events-none"></div>
                
                <div className="flex items-center gap-8 relative z-10">
                    <div className="relative">
                        <div className="w-20 h-20 bg-white text-slate-900 flex items-center justify-center shadow-2xl italic font-black text-3xl">
                            {student.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 border-2 border-white flex items-center justify-center">
                            <Shield size={16} className="text-white" />
                        </div>
                    </div>
                    
                    <div className="text-right" dir="rtl">
                        <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-black text-white text-3xl tracking-tighter uppercase italic">{student.name}</h3>
                            <RankBadge rank={rank} size="sm" />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 uppercase tracking-[2px] italic">
                                {student.grade}
                            </span>
                            <div className="bg-white/10 text-emerald-400 border border-white/10 px-3 py-1 text-[10px] font-black uppercase italic tracking-widest">
                                {points} XP
                            </div>
                            <button 
                                onClick={() => setShowCard(true)}
                                className="bg-white text-slate-900 px-4 py-1 text-[10px] font-black uppercase italic tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:translate-y-1"
                            >
                                <UserCircle2 size={12} className="inline ml-1" />
                                البطاقة الطالبية
                            </button>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onClose} 
                    className="relative z-10 w-14 h-14 bg-white/5 text-white hover:bg-rose-600 transition-all flex items-center justify-center border border-white/10"
                >
                    <X size={28} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar bg-white dark:bg-slate-900">
                
                {/* Visual Rank/Progress Panel */}
                <div className="bg-slate-50 dark:bg-slate-800/20 p-8 border-2 border-slate-900 dark:border-white relative overflow-hidden group" dir="rtl">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-600/5 -skew-x-12 transform -translate-x-16 -translate-y-16"></div>
                    
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-900 dark:bg-black border-2 border-indigo-600 flex items-center justify-center text-indigo-400 shadow-2xl group-hover:scale-110 transition-transform">
                                <Trophy size={32} />
                            </div>
                            <div>
                                <h4 className="font-black text-[10px] uppercase tracking-[4px] text-slate-400 mb-2 italic leading-none">تصنيف النخبة</h4>
                                <p className="text-xl font-black text-slate-900 dark:text-white italic leading-none uppercase tracking-tight">{rank.name}</p>
                            </div>
                        </div>
                        <div className="text-left">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 italic">المستوى التالي</span>
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase italic tracking-tighter">{next?.name || 'MAX RANK'}</span>
                        </div>
                    </div>

                    {next && (
                        <div className="space-y-4 relative z-10">
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-800">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((points / next.minPoints) * 100, 100)}%` }}
                                    className="h-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[3px] text-slate-500 italic">
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <Zap size={12} className="animate-pulse" />
                                    <span>متبقي {pointsNeeded} XP للترقية</span>
                                </div>
                                <span className="tabular-nums font-mono">[{points} / {next.minPoints}]</span>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Account Details Card */}
                <div className="space-y-6" dir="rtl">
                    <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-white pb-3">
                        <h4 className="font-black text-[12px] uppercase tracking-[4px] text-slate-900 dark:text-white italic leading-none">معايير التحقق والوصول</h4>
                        <Shield className="text-indigo-600" size={16} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 border-2 border-slate-100 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.02)]">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">اسم مستخدم المنصة</span>
                            {student.username ? (
                                <span className="font-mono font-black text-base text-indigo-600 dark:text-indigo-400 tracking-tighter italic">@{student.username}</span>
                            ) : (
                                <span className="text-xs text-rose-500 font-black italic uppercase tracking-widest">PNDING SETUP</span>
                            )}
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 border-2 border-slate-100 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.02)] flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">حالة المصادقة</span>
                                <span className={cn("text-[10px] font-black uppercase italic tracking-widest", student.username ? "text-emerald-600" : "text-rose-600")}>
                                    {student.username ? "ACTIVE ACCESS" : "ACCESS DENIED"}
                                </span>
                            </div>
                            <div className={cn("w-3 h-3", student.username ? "bg-emerald-500" : "bg-rose-500")}></div>
                        </div>
                    </div>
                </div>

                {/* Enrollments Section */}
                <div className="space-y-10 pb-20">
                    <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-white pb-4">
                         <div className="flex items-center gap-4">
                            <BookOpen size={20} className="text-indigo-600" />
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[4px] italic leading-none">
                                البرامج الأكاديمية النشطة ({student.enrollments.length})
                            </h4>
                         </div>
                         <div className="w-12 h-1 bg-indigo-600"></div>
                    </div>

                    <div className="space-y-12">
                        {student.enrollments.map((en, i) => {
                            const actualUsed = en.sessionsUsed;
                            const remaining = en.sessionsTotal - actualUsed;
                            const isLow = remaining <= 2;
                            const progressPercent = Math.round((actualUsed / en.sessionsTotal) * 100);

                            return (
                                <div key={i} className={cn(
                                    "p-10 border-2 border-slate-100 dark:border-slate-800 relative transition-all bg-white dark:bg-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.02)] group hover:border-indigo-600 dark:hover:border-indigo-400",
                                    en.isFrozen && "opacity-60 grayscale",
                                    isLow && "border-2 border-rose-600 shadow-[10px_10px_0px_0px_rgba(225,29,72,0.1)]"
                                )}>
                                    {en.isFrozen && (
                                        <div className="absolute top-0 right-0 bg-indigo-600 text-white px-6 py-2 text-[10px] font-black uppercase tracking-[3px] italic flex items-center gap-2">
                                            <Snowflake size={14} />
                                            FROZEN SUBSCRIPTION
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12 text-right" dir="rtl">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <h5 className="font-black text-slate-900 dark:text-white text-3xl tracking-tighter uppercase italic">{en.subject}</h5>
                                                {isLow && (
                                                    <div className="bg-rose-600 text-white px-3 py-1 text-[8px] font-black uppercase italic tracking-widest shadow-lg animate-pulse">رصيد حرج</div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-900 dark:bg-black text-white flex items-center justify-center italic font-black">
                                                    <UserCircle2 size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mb-1">المعلمة المسؤولة</p>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic underline decoration-indigo-500/30">{en.teacher}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform md:translate-x-4 md:group-hover:translate-x-0">
                                            {onFreezeEnrollment && en.id && (
                                                <DetailAction onClick={() => onFreezeEnrollment(en.id!, !en.isFrozen)} icon={en.isFrozen ? Play : Snowflake} color="indigo" title={en.isFrozen ? "تفعيل" : "تجميد"} />
                                            )}
                                            <DetailAction onClick={() => onSendReminder(en)} icon={MessageCircle} color="emerald" title="تذكير" />
                                            <DetailAction onClick={() => onRenewEnrollment(i)} icon={RefreshCw} color="indigo" title="تجديد" />
                                            <DetailAction onClick={() => onDeleteEnrollment(i)} icon={Trash} color="rose" title="حذف" />
                                        </div>
                                    </div>

                                    {/* Attendance Visualizer */}
                                    <div className="mb-12 space-y-4">
                                        <div className="flex justify-between items-center bg-slate-900 dark:bg-black p-4 text-white">
                                            <label className="text-[10px] font-black uppercase tracking-[4px] italic">سجل الحصص التفاعلي</label>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-emerald-500"></div>
                                                <span className="text-[8px] font-black uppercase italic">منجزة</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-12 gap-3 p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                            {[...Array(en.sessionsTotal)].map((_, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={cn(
                                                        "aspect-square border-2 flex items-center justify-center transition-all duration-500",
                                                        idx < actualUsed 
                                                            ? "bg-emerald-600 border-emerald-600 text-white shadow-lg" 
                                                            : idx === actualUsed 
                                                                ? "bg-white dark:bg-slate-900 border-indigo-600 text-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)] animate-pulse" 
                                                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300"
                                                    )}
                                                >
                                                    {idx < actualUsed ? <CheckCircle2 size={16} /> : idx === actualUsed ? <Play size={16} fill="currentColor" /> : <span className="text-[9px] font-black font-mono italic">{idx + 1}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t-2 border-slate-50 dark:border-slate-800">
                                        <div className="space-y-4" dir="rtl">
                                            <div className="flex justify-between items-end">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">معدل الإنجاز</h5>
                                                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono italic leading-none">{progressPercent}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                <div
                                                    className={cn("h-full transition-all duration-1000", isLow ? "bg-rose-600" : "bg-indigo-600")}
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-900 p-5 flex flex-col justify-center items-center">
                                                <span className="text-[8px] text-slate-500 font-black uppercase tracking-[3px] mb-1 italic">الرصيد المتاح</span>
                                                <span className={cn("text-2xl font-black font-mono italic", isLow ? "text-rose-500" : "text-emerald-400")}>{remaining}</span>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-white p-5 flex flex-col justify-center items-center group/btn cursor-pointer active:translate-y-1 transition-all" onClick={() => setAddingSessionsIndex(addingSessionsIndex === i ? null : i)}>
                                                <Plus size={20} className={cn("transition-transform", addingSessionsIndex === i && "rotate-45")} />
                                                <span className="text-[8px] font-black uppercase tracking-widest italic mt-2">إضافة رصيد</span>
                                            </div>
                                        </div>
                                    </div>

                                    {addingSessionsIndex === i && (
                                        <div className="grid grid-cols-4 gap-3 mt-8 p-6 bg-slate-900 shadow-2xl relative animate-in slide-in-from-top-4 duration-300">
                                            <div className="absolute -top-2 right-10 w-4 h-4 bg-slate-900 rotate-45"></div>
                                            {[1, 4, 8, 12].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => { onAddSessions(i, num); setAddingSessionsIndex(null); }}
                                                    className="py-4 bg-white/10 hover:bg-indigo-600 text-white font-black text-sm font-mono italic transition-all border border-white/5"
                                                >
                                                    +{num}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Quick Add Enrollment Panel */}
                        <div className="bg-slate-900 p-10 border-l-8 border-indigo-600 shadow-2xl relative overflow-hidden group" dir="rtl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -skew-x-12 transform translate-x-32 -translate-y-32"></div>
                            <div className="flex items-center gap-6 mb-10 relative z-10">
                                <div className="w-16 h-16 bg-white flex items-center justify-center text-slate-900 shadow-2xl group-hover:rotate-12 transition-transform">
                                    <Plus size={32} />
                                </div>
                                <div className="text-right">
                                    <h4 className="font-black text-xl uppercase tracking-[4px] text-white italic leading-none mb-2">إدراج برنامج جديد</h4>
                                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest italic">توسيع الآفاق الأكاديمية للطالب</p>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <EnrollmentForm teachers={teachers} onSubmit={onAddEnrollment} />
                            </div>
                        </div>
                    </div>
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

const DetailAction = ({ onClick, icon: Icon, color, title }: any) => {
    const colors: any = {
        emerald: "bg-emerald-500 hover:bg-emerald-600",
        rose: "bg-rose-500 hover:bg-rose-700",
        indigo: "bg-indigo-600 hover:bg-indigo-700"
    };
    return (
        <button 
            onClick={onClick} 
            className={cn("w-14 h-14 flex items-center justify-center text-white shadow-xl active:translate-y-1 transition-all", colors[color])}
            title={title}
        >
            <Icon size={20} />
        </button>
    );
};
