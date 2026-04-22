import React from 'react';
import { User, X, Phone, Mail, Users, GraduationCap, Calendar, TrendingUp } from 'lucide-react';
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

export const ParentDetails: React.FC<ParentDetailsProps> = ({
    parent,
    details,
    onClose
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col h-fit sticky top-6 rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-left-4 duration-300">
            {/* Header Section */}
            <div className="relative p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <button
                    onClick={onClose}
                    className="absolute left-4 top-4 text-slate-400 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-all"
                >
                    <X size={18} />
                </button>

                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-900 dark:bg-slate-800 flex items-center justify-center rounded-2xl shadow-lg">
                        <User size={32} className="text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">{parent.name}</h3>
                    
                    <div className="flex flex-col gap-1.5 max-w-[240px] mx-auto">
                        <div dir="ltr" className="flex items-center justify-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 rounded-lg">
                            <Phone size={12} className="text-emerald-500" />
                            {parent.phone}
                        </div>
                        {parent.email && (
                            <div dir="ltr" className="flex items-center justify-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 rounded-lg">
                                <Mail size={12} />
                                {parent.email}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: 'الأبناء', value: details.children.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'الاشتراكات', value: details.totalEnrollments, icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                        { label: 'تحصيل الحصص', value: `${details.completedSessions}/${details.totalSessions}`, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'الإنجاز', value: `${details.completionRate}%`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    ].map((stat, idx) => (
                        <div key={idx} className={cn("p-3 border border-transparent rounded-2xl", stat.bg)}>
                            <div className="flex items-center gap-2 mb-1.5">
                                <stat.icon size={14} className={stat.color} />
                                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-tight">{stat.label}</p>
                            </div>
                            <p className="text-sm font-black text-slate-800 dark:text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Children List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">الأبناء المسجلين</h4>
                        <span className="text-[9px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                            {details.children.length} طلاب
                        </span>
                    </div>

                    <div className="space-y-3">
                        {details.children.length > 0 ? details.children.map(child => (
                            <div key={child.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <p className="font-bold text-xs text-slate-800 dark:text-white">{child.name}</p>
                                        <p className="text-[9px] font-bold text-indigo-500 uppercase">{child.grade}</p>
                                    </div>
                                </div>
                                {child.enrollments && child.enrollments.length > 0 && (
                                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                        {child.enrollments.map((en, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-[10px] font-bold">
                                                <span className="text-slate-500 dark:text-slate-400">{en.subject}</span>
                                                <span className="px-2 py-0.5 bg-white dark:bg-slate-900 text-indigo-500 border border-slate-100 dark:border-slate-800 rounded-md font-mono">
                                                    {en.sessionsUsed}/{en.sessionsTotal}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-8 border-2 border-dashed border-slate-50 dark:border-slate-800 rounded-2xl">
                                <Users size={32} className="mx-auto text-slate-100 mb-2" />
                                <p className="text-slate-300 text-[10px] font-bold uppercase">لا يوجد أبناء</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Schedule Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">الجدول العائلي الموحد</h4>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
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
                                <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                                    <div className="mb-2">
                                        <p className="font-bold text-xs text-slate-800 dark:text-white">{group.subject}</p>
                                        <p className="text-[9px] font-bold text-amber-500 uppercase">{group.student}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                                        {group.times.map((t, i) => (
                                            <div key={i} className="flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-800 text-[9px] font-bold text-slate-500 rounded-lg">
                                                <span className="opacity-50">{t.day}</span>
                                                <span className="text-[#5c59f2]">{t.hour} {t.period === 'am' ? 'ص' : 'م'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ));
                        })() : (
                            <div className="text-center py-8 opacity-30">
                                <Calendar size={32} className="mx-auto text-slate-400 mb-2" />
                                <p className="text-[10px] font-bold uppercase">لا يوجد حصص مجدولة</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
