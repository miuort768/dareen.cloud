import { BookOpen, CheckCircle, Trophy, Target } from 'lucide-react';
import type { Student } from '../../types';

interface AcademicPerformanceProps {
    sessions: Student[];
    children: Student[];
    points: number;
    rank: { name: string };
}

const Ring = ({ value, size = 56, stroke = 5, color = 'var(--bg-primary)', label, icon: Icon }: {
    value: number; size?: number; stroke?: number; color?: string; label: string; icon: typeof BookOpen;
}) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(value, 100) / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
                    <circle
                        cx={size / 2} cy={size / 2} r={radius} fill="none"
                        stroke={color} strokeWidth={stroke} strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        className="transition-all duration-700"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon size={12} className="text-muted mb-0.5" />
                    <span className="text-micro font-bold text-main">{value}%</span>
                </div>
            </div>
            <span className="text-micro text-muted font-bold text-center">{label}</span>
        </div>
    );
};

export const AcademicPerformance = ({ sessions, children: kids, points, rank }: AcademicPerformanceProps) => {
    const completed = sessions.filter(s => s.status === 'completed').length;
    const totalRecorded = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled').length;
    const attendanceRate = totalRecorded > 0 ? Math.round((completed / totalRecorded) * 100) : 0;

    let sessionsUsed = 0;
    let sessionsTotal = 0;
    kids.forEach(c => {
        (c.enrollments || []).forEach((en: { sessionsUsed?: number; sessionsTotal?: number }) => {
            sessionsUsed += Number(en.sessionsUsed || 0);
            sessionsTotal += Number(en.sessionsTotal || 0);
        });
    });
    const curriculumProgress = sessionsTotal > 0 ? Math.round((sessionsUsed / sessionsTotal) * 100) : 0;

    const totalSubjects = kids.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0);

    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-bold text-main mb-4">التقدم الأكاديمي</h3>

            <div className="grid grid-cols-4 gap-3 mb-4">
                <Ring value={curriculumProgress} color="var(--bg-primary)" label="المنهج" icon={BookOpen} />
                <Ring value={attendanceRate} color="var(--bg-success)" label="الحضور" icon={CheckCircle} />
                <Ring value={totalSubjects > 0 ? Math.round((sessionsUsed / Math.max(totalSubjects, 1)) * 100) : 0} color="var(--bg-info)" label="الواجبات" icon={Target} />
                <Ring value={points > 0 ? 75 : 0} color="var(--bg-warning)" label="XP" icon={Trophy} />
            </div>

            <div className="flex items-center justify-between p-3 bg-surface rounded-xl">
                <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <div>
                        <p className="text-xs font-bold text-main">{rank.name}</p>
                        <p className="text-micro text-muted">{points} نقطة</p>
                    </div>
                </div>
                <span className="text-xs font-bold text-primary bg-primary-soft px-2.5 py-1 rounded-lg">{points} نقطة</span>
            </div>
        </div>
    );
};
