import { Calendar } from 'lucide-react';

interface AppointmentsHeaderProps {
    todayAppointments: number;
    remainingToday: number;
    totalAppointments: number;
}

export const AppointmentsHeader = ({ todayAppointments, remainingToday, totalAppointments }: AppointmentsHeaderProps) => (
    <div className="bg-card rounded-2xl shadow-sm border border-border px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <Calendar size={22} />
            </div>
            <div>
                <h1 className="text-lg md:text-xl font-black text-main leading-tight">قائمة المواعيد الدراسية</h1>
                <p className="text-xs font-bold text-muted mt-0.5">جدولة ومتابعة الحصص الأكاديمية للطلاب</p>
            </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 text-center rounded-xl bg-primary-soft">
                <p className="text-micro font-bold text-primary">اليوم</p>
                <p className="text-xl font-black tabular-nums leading-none text-primary">{todayAppointments}</p>
            </div>
            <div className="px-3 py-1.5 text-center rounded-xl bg-success-soft">
                <p className="text-micro font-bold text-success-dark">المتبقي</p>
                <p className="text-xl font-black tabular-nums leading-none text-success-dark">{remainingToday}</p>
            </div>
            <div className="px-3 py-1.5 text-center rounded-xl bg-info-soft">
                <p className="text-micro font-bold text-info">الإجمالي</p>
                <p className="text-xl font-black tabular-nums leading-none text-info">{totalAppointments}</p>
            </div>
        </div>
    </div>
);
