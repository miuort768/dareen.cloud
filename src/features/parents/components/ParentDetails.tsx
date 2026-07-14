import React from 'react';
import { User, X, Phone, Mail, Users, GraduationCap, Calendar, TrendingUp, BookOpen, Clock } from 'lucide-react';
import { StatCard } from '../../../shared/components/ui/StatCard';
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
        <div className="bg-white dark:bg-primary-active border border-border dark:border-border flex flex-col overflow-hidden shadow-sm rounded-2xl">
            
            {/* Header Section */}
            <div className="relative p-8 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary)] border-b border-white/5">
                <div className="absolute top-0 start-0 w-32 h-32 bg-white/10 rotate-45 translate-y-[-50%] translate-x-[30%] blur-3xl pointer-events-none" />
                
                <button
                    onClick={onClose}
                    className="absolute end-4 top-4 text-on-primary/60 hover:text-on-primary p-2 hover:bg-white/10 transition-all z-20 rounded-xl"
                >
                    <X size={18} />
                </button>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <User size={40} className="text-on-primary" />
                    </div>
                    <h3 className="font-bold text-xl text-on-primary uppercase tracking-tighter mb-1">{parent.name}</h3>
                    <div className="flex items-center gap-2">
                         <span className="text-micro font-medium text-on-primary/70 uppercase tracking-widest bg-white/15 backdrop-blur-sm px-3 py-0.5 rounded-lg">
                            ID: {parent.id.substring(0, 8)}
                         </span>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-4 w-full max-w-[280px]">
                        <div dir="ltr" className="flex items-center justify-between px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-on-primary group hover:bg-white/15 transition-colors rounded-xl">
                            <span className="text-on-primary/50 uppercase tracking-widest">Phone</span>
                            <div className="flex items-center gap-2">
                                <Phone size={11} className="text-success" />
                                {parent.phone}
                            </div>
                        </div>
                        {parent.email && (
                            <div dir="ltr" className="flex items-center justify-between px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 text-micro font-medium text-on-primary/80 group hover:bg-white/15 transition-colors rounded-xl">
                                <span className="text-on-primary/50 uppercase tracking-widest">Email</span>
                                <div className="flex items-center gap-2">
                                    <Mail size={11} className="text-info" />
                                    <span className="truncate max-w-[140px]">{parent.email}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-10 space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="الأبناء" value={details.children.length} icon={Users} variant="info" />
                    <StatCard title="الاشتراكات" value={details.totalEnrollments} icon={GraduationCap} variant="primary" />
                    <StatCard title="الحصص" value={`${details.completedSessions}/${details.totalSessions}`} icon={Calendar} variant="success" />
                    <StatCard title="الإنجاز" value={`${details.completionRate}%`} icon={TrendingUp} variant="warning" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Children List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-border dark:border-border pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-primary)] rounded-full" />
                                <h4 className="text-xs font-bold text-main dark:text-on-primary uppercase tracking-[0.2em]">الأبناء المسجلين</h4>
                            </div>
                            <span className="text-micro font-medium bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)] text-on-primary px-3 py-1 rounded-lg">
                                {details.children.length}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {details.children.length > 0 ? details.children.map(child => (
                                <div key={child.id} className="p-5 bg-background dark:bg-primary-active/40 border border-border dark:border-border group hover:bg-white dark:hover:bg-primary-active transition-all shadow-sm rounded-2xl">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <p className="font-bold text-sm text-main dark:text-on-primary uppercase tracking-tight">{child.name}</p>
                                            <p className="text-micro font-medium text-info uppercase tracking-widest mt-0.5">{child.grade}</p>
                                        </div>
                                        <div className="w-9 h-9 bg-white dark:bg-primary-active border border-border dark:border-border flex items-center justify-center text-xs font-medium text-dim dark:text-on-primary rounded-xl">
                                            {child.name.charAt(0)}
                                        </div>
                                    </div>
                                    {child.enrollments && child.enrollments.length > 0 && (
                                        <div className="space-y-3 pt-4 border-t border-border dark:border-border/50">
                                            {child.enrollments.map((en, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs font-normal">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen size={12} className="text-muted shrink-0" />
                                                        <div>
                                                            <span className="block text-main dark:text-on-primary font-bold">{en.subject}</span>
                                                            <span className="block text-micro text-muted dark:text-muted">المعلمة: {en.teacher}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-32 h-2 bg-surface dark:bg-primary-active overflow-hidden rounded-full">
                                                            <div 
                                                                className="h-full bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)] rounded-full" 
                                                                style={{ width: `${(en.sessionsUsed / en.sessionsTotal) * 100}%` }} 
                                                            />
                                                        </div>
                                                        <span className="font-bold font-mono text-micro min-w-[35px] text-start text-main dark:text-dim">
                                                            {en.sessionsUsed}/{en.sessionsTotal}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="text-center py-16 border border-dashed border-border dark:border-border rounded-2xl">
                                    <Users size={40} className="mx-auto text-dim dark:text-main mb-3" />
                                    <p className="text-dim dark:text-main text-xs font-medium uppercase tracking-widest">لا يوجد أبناء مرتبـطين</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Schedule Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-border dark:border-border pb-3">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-[var(--bg-warning)] to-[var(--bg-warning)] rounded-full" />
                            <h4 className="text-xs font-bold text-main dark:text-on-primary uppercase tracking-[0.2em]">الجدول العائلي الموحد</h4>
                        </div>

                        <div className="space-y-3 ps-2">
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
                                    <div key={idx} className="p-4 bg-white dark:bg-primary-active border border-border dark:border-border shadow-sm hover:border-primary/30 dark:hover:border-primary/50 transition-colors rounded-2xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="font-bold text-xs text-main dark:text-on-primary uppercase tracking-tight leading-none">{group.subject}</p>
                                                <p className="text-micro font-medium text-warning uppercase tracking-widest mt-1.5">{group.student}</p>
                                            </div>
                                            <div className="w-8 h-8 bg-primary/5 dark:bg-primary-active flex items-center justify-center rounded-xl">
                                                <Clock size={14} className="text-primary" />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-3 border-t border-border dark:border-border">
                                            {group.times.map((t, i) => (
                                                <div key={i} className="flex items-center gap-3 px-3 py-2 bg-background dark:bg-primary-active border border-border dark:border-border text-micro font-medium rounded-xl">
                                                    <span className="text-muted uppercase">{t.day}</span>
                                                    <span className="w-1 h-1 bg-primary rounded-full" />
                                                    <span className="text-primary font-mono">{t.hour} {t.period === 'am' ? 'صباحاً' : 'مساءً'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ));
                            })() : (
                                <div className="text-center py-20 opacity-20">
                                    <Calendar size={48} className="mx-auto text-muted mb-3" />
                                    <p className="text-xs font-medium uppercase tracking-widest">خالٍ من الجلسات</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
