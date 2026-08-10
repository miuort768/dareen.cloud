import { Clock, MapPin, GraduationCap, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface NextSessionBannerProps {
    todayTasks: { studentName: string; subject: string; teacher: string; time: string; period: string }[];
}

export const NextSessionBanner = ({ todayTasks }: NextSessionBannerProps) => {
    if (todayTasks.length === 0) {
        return (
            <div className="rounded-2xl bg-gradient-to-br from-success/5 via-success/[0.02] to-background dark:from-primary/[0.05] dark:via-primary/[0.02] dark:to-card border border-border dark:border-primary/20 p-6 md:p-7">
                <div className="flex flex-col md:flex-row items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-success/10 dark:bg-primary/15 flex items-center justify-center shrink-0">
                        <Calendar size={28} className="text-success dark:text-primary" />
                    </div>
                    <div className="text-center md:text-start">
                        <p className="text-lg font-bold text-main dark:text-main mb-1">لا توجد حصص اليوم</p>
                        <p className="text-sm font-medium text-muted dark:text-muted">استمتع بيومك مع أبنائك.</p>
                    </div>
                </div>
            </div>
        );
    }

    const next = todayTasks[0];

    return (
        <div className="rounded-2xl bg-card dark:bg-card border border-border dark:border-primary/20 overflow-hidden transition-all duration-300 hover:shadow-elevation-2">
            <div className="bg-gradient-to-l from-primary/10 via-primary/[0.03] to-background dark:from-primary/10 dark:via-primary/[0.03] dark:to-card p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-warning/15 dark:bg-primary/15 flex items-center justify-center">
                        <Clock size={16} className="text-warning dark:text-primary" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-main dark:text-main">الحصة القادمة</h3>
                    <span className="text-xs font-medium text-muted dark:text-muted me-auto">
                        {format(new Date(), 'eeee', { locale: ar })}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-xl font-bold text-primary dark:text-primary">{next.subject.charAt(0)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-base md:text-lg font-bold text-main dark:text-main">{next.subject}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                            <span className="text-xs font-medium text-muted dark:text-muted flex items-center gap-1.5">
                                <GraduationCap size={12} /> {next.teacher}
                            </span>
                            <span className="text-xs font-medium text-muted dark:text-muted flex items-center gap-1.5">
                                <MapPin size={12} /> {next.studentName}
                            </span>
                        </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                        <div className="bg-primary/10 dark:bg-primary/15 text-primary dark:text-primary font-bold text-sm px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                            <Clock size={14} />
                            {next.time}
                        </div>
                        <span className="text-[11px] font-semibold text-muted dark:text-muted bg-surface dark:bg-surface px-2.5 py-1.5 rounded-lg border border-border dark:border-primary/20">
                            {next.period}
                        </span>
                    </div>
                </div>
            </div>

            {todayTasks.length > 1 && (
                <div className="px-5 py-2.5 bg-surface dark:bg-surface border-t border-border/50 dark:border-primary/10">
                    <p className="text-xs font-medium text-muted dark:text-muted text-center">
                        <span className="font-bold text-main dark:text-main">{todayTasks.length - 1}</span> حصص أخرى اليوم
                    </p>
                </div>
            )}
        </div>
    );
};