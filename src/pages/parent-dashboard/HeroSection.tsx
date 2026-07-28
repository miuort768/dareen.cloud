import { Users, Calendar, Star } from 'lucide-react';
import type { Student } from '../../types';

interface HeroSectionProps {
    name: string;
    children: Student[];
    attendanceRate: number;
    academicProgress: number;
}

const getGreeting = (): string => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء الخير';
};

export const HeroSection = ({ name, children, attendanceRate, academicProgress }: HeroSectionProps) => {
    const firstName = name.split(' ')[0] || name;
    const totalEnrollments = children.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0);

    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted font-bold mb-1">{getGreeting()}</p>
                    <h2 className="text-xl font-bold text-main leading-tight mb-2">
                        {firstName}
                    </h2>
                    <p className="text-micro text-muted font-medium">
                        {children.length} {children.length === 1 ? 'ابن' : 'أبناء'} مسجلين • {totalEnrollments} {totalEnrollments === 1 ? 'مادة' : 'مواد'}
                    </p>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="4" />
                            <circle
                                cx="32" cy="32" r="28" fill="none"
                                stroke="var(--bg-success)" strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={`${(attendanceRate / 100) * 175.9} 175.9`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-sm font-bold text-main">{attendanceRate}%</span>
                            <span className="text-micro text-muted">حضور</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-info-soft flex items-center justify-center">
                        <Users size={12} className="text-info" />
                    </div>
                    <div>
                        <p className="text-micro text-muted">الأبناء</p>
                        <p className="text-xs font-bold text-main">{children.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-primary-soft flex items-center justify-center">
                        <Calendar size={12} className="text-primary" />
                    </div>
                    <div>
                        <p className="text-micro text-muted">المواد</p>
                        <p className="text-xs font-bold text-main">{totalEnrollments}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-success-soft flex items-center justify-center">
                        <Star size={12} className="text-success" />
                    </div>
                    <div>
                        <p className="text-micro text-muted">الالتزام</p>
                        <p className="text-xs font-bold text-main">{academicProgress}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
