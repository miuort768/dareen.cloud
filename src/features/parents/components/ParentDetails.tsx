import React from 'react';
import { User, X, Phone, Mail, Users, GraduationCap, Calendar, TrendingUp, BookOpen, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Parent, Student } from '../../../types';
import type { FamilyScheduleItem } from '../types';

interface ParentDetailsProps {
    parent: Parent;
    details: {
        children: Student[];
        familySchedule: FamilyScheduleItem[];
        totalEnrollments: number;
        totalSessions: number;
        completedSessions: number;
        completionRate: number;
    };
    onClose: () => void;
}

const StatCard = ({ label, value, icon: Icon, gradient }: { label: string, value: string | number, icon: any, gradient: string }) => (
    <div className={cn("relative overflow-hidden p-4 rounded-none shadow-sm text-white", gradient)}>
        <div className="absolute -left-2 -bottom-2 opacity-10"><Icon size={48} /></div>
        <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-white/15 rounded-none flex items-center justify-center">
                <Icon size={12} className="text-white" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/70">{label}</p>
        </div>
        <p className="text-lg font-black font-mono leading-none">{value}</p>
    </div>
);

export const ParentDetails: React.FC<ParentDetailsProps> = ({
    parent,
    details,
    onClose
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col rounded-none overflow-hidden shadow-2xl animate-in slide-in-from-left-4 duration-500">
            
            {/* Header Section */}
            <div className="relative p-6 bg-slate-950 border-b border-white/5">
                {/* Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rotate-45 translate-y-[-50%] translate-x-[30%] blur-3xl pointer-events-none" />
                
                <button
                    onClick={onClose}
                    className="absolute left-4 top-4 text-slate-500 hover:text-white p-2 hover:bg-white/10 rounded-none transition-all z-20"
                >
                    <X size={18} />
                </button>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-700 p-0.5 rounded-none shadow-xl mb-4">
                        <div className="w-full h-full bg-slate-950 flex items-center justify-center rounded-none overflow-hidden relative">
                             <div className="absolute inset-0 bg-indigo-600/10 animate-pulse" />
                             <User size={40} className="text-white relative z-10" />
                        </div>
                    </div>
                    <h3 className="font-black text-xl text-white uppercase tracking-tighter mb-1">{parent.name}</h3>
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-400/10 px-2 py-0.5 border border-indigo-400/20">
                            ID: {parent.id.substring(0, 8)}
                         </span>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-4 w-full max-w-[280px]">
                        <div dir="ltr" className="flex items-center justify-between px-4 py-2 bg-white/5 border border-white/10 text-[11px] font-black text-slate-300 rounded-none group hover:bg-white/10 transition-colors">
                            <span className="text-slate-500 uppercase tracking-widest">Phone</span>
                            <div className="flex items-center gap-2">
                                <Phone size={11} className="text-emerald-400" />
                                {parent.phone}
                            </div>
                        </div>
                        {parent.email && (
                            <div dir="ltr" className="flex items-center justify-between px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 rounded-none group hover:bg-white/10 transition-colors">
                                <span className="text-slate-500 uppercase tracking-widest">Email</span>
                                <div className="flex items-center gap-2">
                                    <Mail size={11} className="text-indigo-400" />
                                    <span className="truncate max-w-[140px]">{parent.email}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-10 space-y-12">
                {/* Stats Grid - 4 cards on 1 row for desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="الأبناء" value={details.children.length} icon={Users} gradient="bg-gradient-to-br from-blue-600 to-indigo-700" />
                    <StatCard label="الاشتراكات" value={details.totalEnrollments} icon={GraduationCap} gradient="bg-gradient-to-br from-purple-600 to-pink-700" />
                    <StatCard label="الحصص" value={`${details.completedSessions}/${details.totalSessions}`} icon={Calendar} gradient="bg-gradient-to-br from-emerald-600 to-teal-700" />
                    <StatCard label="الإنجاز" value={`${details.completionRate}%`} icon={TrendingUp} gradient="bg-gradient-to-br from-amber-500 to-orange-700" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Children List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-indigo-600 rounded-none" />
                                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">الأبناء المسجلين</h4>
                            </div>
                            <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-none">
                                {details.children.length}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {details.children.length > 0 ? details.children.map(child => (
                                <div key={child.id} className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-none group hover:bg-white dark:hover:bg-slate-800 transition-all border-l-4 border-l-indigo-600 shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <p className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tight">{child.name}</p>
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">{child.grade}</p>
                                        </div>
                                        <div className="w-9 h-9 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-xs font-black text-slate-300">
                                            {child.name.charAt(0)}
                                        </div>
                                    </div>
                                    {child.enrollments && child.enrollments.length > 0 && (
                                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                            {child.enrollments.map((en, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-[11px] font-bold">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen size={12} className="text-slate-400" />
                                                        <span className="text-slate-600 dark:text-slate-400">{en.subject}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-32 h-2 bg-slate-100 dark:bg-slate-900 rounded-none overflow-hidden">
                                                            <div 
                                                                className="h-full bg-indigo-600" 
                                                                style={{ width: `${(en.sessionsUsed / en.sessionsTotal) * 100}%` }} 
                                                            />
                                                        </div>
                                                        <span className="font-black font-mono text-[10px] min-w-[35px] text-right">
                                                            {en.sessionsUsed}/{en.sessionsTotal}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-none">
                                    <Users size={40} className="mx-auto text-slate-100 dark:text-slate-800 mb-3" />
                                    <p className="text-slate-300 dark:text-slate-700 text-xs font-black uppercase tracking-widest">لا يوجد أبناء مرتبـطين</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Schedule Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="w-1.5 h-6 bg-amber-500 rounded-none" />
                            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">الجدول العائلي الموحد</h4>
                        </div>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {details.familySchedule.length > 0 ? (() => {
                                const grouped = details.familySchedule.reduce((acc, current) => {
                                    const key = `${current.studentName}-${current.subject}`;
                                    if (!acc[key]) {
                                        acc[key] = { student: current.studentName, subject: current.subject, times: [] };
                                    }
                                    acc[key].times.push(current);
                                    return acc;
                                }, {} as Record<string, { student: string, subject: string, times: FamilyScheduleItem[] }>);

                                return Object.values(grouped).map((group, idx) => (
                                    <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-tight leading-none">{group.subject}</p>
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1.5">{group.student}</p>
                                            </div>
                                            <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                                <Clock size={14} className="text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-50 dark:border-slate-800">
                                            {group.times.map((t, i) => (
                                                <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] font-black rounded-none">
                                                    <span className="text-slate-400 uppercase">{t.day}</span>
                                                    <span className="w-1 h-1 bg-indigo-600 rounded-full" />
                                                    <span className="text-indigo-600 font-mono">{t.hour} {t.period === 'am' ? 'صباحاً' : 'مساءً'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ));
                            })() : (
                                <div className="text-center py-20 opacity-20">
                                    <Calendar size={48} className="mx-auto text-slate-400 mb-3" />
                                    <p className="text-xs font-black uppercase tracking-widest">خالٍ من الجلسات</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
