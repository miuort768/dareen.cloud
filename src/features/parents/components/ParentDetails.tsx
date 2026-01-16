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
        <div className="bg-white border border-slate-200 flex flex-col h-fit dark:bg-gray-900 dark:border-gray-800 animate-in slide-in-from-left-4 sticky top-6 rounded-none overflow-hidden shadow-2xl">
            {/* Header Section */}
            <div className="relative p-8 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-primary-600"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/5 rotate-45 pointer-events-none"></div>

                <button
                    onClick={onClose}
                    className="absolute left-4 top-4 text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50"
                >
                    <X size={20} />
                </button>

                <div className="text-center pt-2 relative z-10">
                    <div className="w-20 h-20 mx-auto mb-4 bg-primary-600 flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-700">
                        <User size={40} className="text-white" />
                    </div>
                    <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-2 tracking-tight uppercase">
                        {parent.name}
                    </h3>

                    <div className="flex flex-col gap-2 max-w-[260px] mx-auto">
                        <div dir="ltr" className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-xs font-black text-primary-600 font-mono shadow-sm dark:bg-gray-800 dark:border-gray-700">
                            <Phone size={14} />
                            {parent.phone}
                        </div>
                        {parent.email && (
                            <div dir="ltr" className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-400 font-mono italic shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                <Mail size={14} />
                                {parent.email}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'الأبناء', value: details.children.length, icon: Users, color: 'blue' },
                        { label: 'الاشتراكات', value: details.totalEnrollments, icon: GraduationCap, color: 'purple' },
                        { label: 'تحصيل الحصص', value: `${details.completedSessions}/${details.totalSessions}`, icon: Calendar, color: 'emerald' },
                        { label: 'نسبة الإنجاز', value: `${details.completionRate}%`, icon: TrendingUp, color: 'amber' },
                    ].map((stat, idx) => (
                        <div key={idx} className={`bg-${stat.color}-50/50 p-4 border border-${stat.color}-100 dark:bg-${stat.color}-900/10 dark:border-${stat.color}-900/20`}>
                            <div className="flex items-center gap-2 mb-2">
                                <stat.icon size={16} className={`text-${stat.color}-600`} />
                                <p className={`text-[10px] font-black uppercase text-${stat.color}-600 tracking-widest`}>{stat.label}</p>
                            </div>
                            <p className={`text-xl font-black text-${stat.color}-700 dark:text-${stat.color}-400`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Children List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-r-4 border-r-primary-600 pr-4">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">الأبناء المسجلين</h4>
                        <span className="text-[10px] font-black bg-primary-100 text-primary-700 px-2 py-0.5 dark:bg-primary-900/30 dark:text-primary-400">
                            {details.children.length} أبناء
                        </span>
                    </div>

                    <div className="grid gap-3">
                        {details.children.length > 0 ? details.children.map(child => (
                            <div key={child.id} className="group bg-slate-50 border border-slate-100 p-4 transition-all hover:border-primary-200 hover:bg-white dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-800 shadow-sm relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 group-hover:bg-primary-600 transition-colors"></div>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-black text-base text-slate-900 dark:text-white mb-0.5">{child.name}</p>
                                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-tighter">{child.grade}</p>
                                    </div>
                                </div>
                                {child.enrollments && child.enrollments.length > 0 && (
                                    <div className="grid gap-1.5 border-t border-slate-200 pt-3 dark:border-gray-700">
                                        {child.enrollments.map((en, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-[11px] font-bold">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400">
                                                    <div className="w-1.5 h-1.5 bg-primary-500"></div>
                                                    {en.subject}
                                                </div>
                                                <div className="bg-white px-2 py-0.5 border border-slate-200 font-mono text-primary-600 dark:bg-gray-900 dark:border-gray-700">
                                                    {en.sessionsUsed}/{en.sessionsTotal}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-8 border-2 border-dashed border-slate-100 dark:border-gray-800">
                                <Users size={32} className="mx-auto text-slate-200 mb-2" />
                                <p className="text-slate-400 text-xs font-bold">لا يوجد أبناء مرتبطين</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Schedule Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-r-4 border-r-amber-500 pr-4">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">الجدول العائلي</h4>
                        <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 dark:bg-amber-900/30 dark:text-amber-400">
                            إدارة الحصص
                        </span>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                        {details.familySchedule.length > 0 ? (() => {
                            const grouped = details.familySchedule.reduce((acc, current) => {
                                const key = `${current.studentName}-${current.subject}`;
                                if (!acc[key]) {
                                    acc[key] = {
                                        student: current.studentName,
                                        subject: current.subject,
                                        times: []
                                    };
                                }
                                acc[key].times.push(current);
                                return acc;
                            }, {} as Record<string, { student: string, subject: string, times: FamilyScheduleItem[] }>);

                            return Object.values(grouped).map((group, idx) => (
                                <div key={idx} className="bg-slate-50 border border-slate-100 p-4 transition-all hover:border-amber-200 hover:bg-white dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-800 shadow-sm relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-black text-sm text-slate-900 dark:text-white mb-0.5">{group.subject}</p>
                                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">{group.student}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-gray-700">
                                        {group.times.map((t, i) => (
                                            <div key={i} className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 dark:bg-gray-900 dark:border-gray-600 rounded-none shadow-sm">
                                                <span className="text-[9px] font-black text-slate-400 border-l border-slate-100 pl-1 ml-1 uppercase">{t.day}</span>
                                                <span className="text-[10px] font-black text-primary-600">{t.hour} {t.period === 'am' ? 'ص' : 'م'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ));
                        })() : (
                            <div className="text-center py-8 border-2 border-dashed border-slate-100 dark:border-gray-800">
                                <Calendar size={32} className="mx-auto text-slate-200 mb-2" />
                                <p className="text-slate-400 text-xs font-bold">لا توجد حصص مجدولة لعائلتكم</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
