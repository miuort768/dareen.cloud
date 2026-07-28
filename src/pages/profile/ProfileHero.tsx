import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../shared/components/ui';

interface ProfileHeroProps {
    name: string;
    role: 'student' | 'teacher' | 'parent';
    subtitle?: string;
    points?: number;
    rank?: { name: string; icon: string };
    attendanceRate?: number;
}

const ROLE_CONFIG = {
    student: { label: 'طالب', color: 'bg-primary-soft text-primary', dashboard: '/student-dashboard' },
    teacher: { label: 'معلمة', color: 'bg-info-soft text-info', dashboard: '/teacher-dashboard' },
    parent: { label: 'ولي أمر', color: 'bg-warning-soft text-warning', dashboard: '/parent-dashboard' },
};

export const ProfileHero = ({ name, role, subtitle, points, rank, attendanceRate }: ProfileHeroProps) => {
    const navigate = useNavigate();
    const config = ROLE_CONFIG[role];

    return (
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => navigate(config.dashboard)}
                    className="flex items-center gap-1.5 text-micro font-bold text-muted hover:text-primary transition-colors"
                    aria-label="العودة للوحة التحكم"
                >
                    <ArrowRight size={14} />
                    لوحة التحكم
                </button>
            </div>

            <div className="flex items-center gap-4">
                <Avatar name={name} size="xl" />
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-main leading-tight mb-1">{name}</h1>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-micro font-bold px-2 py-0.5 rounded-lg ${config.color}`}>
                            {config.label}
                        </span>
                        {subtitle && (
                            <span className="text-micro font-medium text-muted">{subtitle}</span>
                        )}
                    </div>
                </div>
            </div>

            {(points !== undefined || attendanceRate !== undefined) && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                    {rank && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm">{rank.icon}</span>
                            <div>
                                <p className="text-micro text-muted">اللقب</p>
                                <p className="text-xs font-bold text-main">{rank.name}</p>
                            </div>
                        </div>
                    )}
                    {points !== undefined && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-lg bg-warning-soft flex items-center justify-center">
                                <span className="text-micro">⭐</span>
                            </div>
                            <div>
                                <p className="text-micro text-muted">النقاط</p>
                                <p className="text-xs font-bold text-main">{points}</p>
                            </div>
                        </div>
                    )}
                    {attendanceRate !== undefined && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-lg bg-success-soft flex items-center justify-center">
                                <span className="text-micro">✓</span>
                            </div>
                            <div>
                                <p className="text-micro text-muted">الحضور</p>
                                <p className="text-xs font-bold text-main">{attendanceRate}%</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
