import { ArrowLeft, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface NextSessionBannerProps {
    todayTasks: { studentName: string; subject: string; teacher: string; time: string; period: string }[];
}

export const NextSessionBanner = ({ todayTasks }: NextSessionBannerProps) => {
    if (todayTasks.length === 0) {
        return (
            <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-xl bg-info-soft flex items-center justify-center">
                        <Clock size={13} className="text-info" />
                    </div>
                    <h3 className="text-sm font-bold text-main">الحصة القادمة</h3>
                </div>
                <div className="py-6 text-center border-2 border-dashed border-border rounded-xl">
                    <Clock size={24} className="mx-auto text-muted mb-2" />
                    <p className="text-muted font-medium text-micro">لا توجد حصص اليوم</p>
                    <p className="text-muted text-micro mt-0.5">يوم هادئ بلا حصص</p>
                </div>
            </div>
        );
    }

    const next = todayTasks[0];

    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-warning-soft flex items-center justify-center">
                        <Clock size={13} className="text-warning" />
                    </div>
                    <h3 className="text-sm font-bold text-main">الحصة القادمة</h3>
                </div>
                <span className="text-micro text-muted font-medium">
                    {format(new Date(), 'eeee', { locale: ar })}
                </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{next.subject.charAt(0)}</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-main">{next.subject}</p>
                        <p className="text-micro text-muted">{next.studentName} • {next.teacher}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary bg-primary-soft px-2 py-1 rounded-lg">{next.time}</span>
                    <ArrowLeft size={14} className="text-muted" />
                </div>
            </div>
            {todayTasks.length > 1 && (
                <p className="text-micro text-muted text-center mt-2">
                    +{todayTasks.length - 1} حصص أخرى اليوم
                </p>
            )}
        </div>
    );
};
