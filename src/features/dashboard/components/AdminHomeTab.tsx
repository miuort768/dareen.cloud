import { UserPlus, FilePlus, Calendar, Megaphone, Users, BookOpen, TrendingUp, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../../shared/components/ui';
import { triggerHaptic } from '../../../lib/haptics';
import { QuickLink } from './AdminQuickLink';

interface AdminHomeTabProps {
    stats: Record<string, unknown>;
    completionRate: number;
    completedSessions: number;
    todaySessions: number;
    onTabChange: (tab: 'home' | 'quick' | 'finance' | 'alerts') => void;
}

const smallIconProps = { size: 14, strokeWidth: 1.5 };

export const AdminHomeTab = ({ stats, completionRate, completedSessions, todaySessions, onTabChange }: AdminHomeTabProps) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                <div onClick={() => { triggerHaptic('light'); navigate('/students'); }} className="cursor-pointer" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerHaptic('light'); navigate('/students'); } }}>
                    <StatCard title="الطلاب" value={stats.studentsCount} icon={Users} variant="info" />
                </div>
                <div onClick={() => { triggerHaptic('light'); navigate('/schedule'); }} className="cursor-pointer" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerHaptic('light'); navigate('/schedule'); } }}>
                    <StatCard title="الاشتراكات" value={stats.totalEnrollments} icon={BookOpen} variant="success" />
                </div>
                <div onClick={() => { triggerHaptic('light'); onTabChange('finance'); }} className="cursor-pointer" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerHaptic('light'); onTabChange('finance'); } }}>
                    <StatCard title="صافي الربح" value={`${(stats.totalNetProfit || 0).toLocaleString()}`} icon={TrendingUp} variant="primary" />
                </div>
            </div>

            <div className="bg-card rounded-card p-5 shadow-soft border border-border">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-success-soft flex items-center justify-center">
                            <Award {...smallIconProps} className="text-success" />
                        </div>
                        <div>
                            <span className="text-micro font-bold text-success">اليوم</span>
                            <h3 className="text-xs font-bold text-main">معدل تنفيذ الحصص</h3>
                        </div>
                    </div>
                    <span className="text-lg font-bold text-success tabular-nums">{completionRate}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface dark:bg-card rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--bg-primary)] to-[var(--bg-info)] transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(completionRate, 100)}%` }}
                    />
                </div>
                <p className="text-micro font-medium text-muted mt-2">تم تنفيذ {completedSessions} من {todaySessions} حصة</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <QuickLink icon={UserPlus} label="طالب جديد" variant="info" onClick={() => { triggerHaptic('medium'); navigate('/students?action=new'); }} />
                <QuickLink icon={FilePlus} label="فاتورة" variant="success" onClick={() => { triggerHaptic('medium'); navigate('/student-invoices?action=new'); }} />
                <QuickLink icon={Calendar} label="الجدول" variant="primary" onClick={() => { triggerHaptic('medium'); navigate('/schedule'); }} />
                <QuickLink icon={Megaphone} label="لوحة الإعلانات" variant="warning" onClick={() => { triggerHaptic('medium'); navigate('/announcements'); }} />
            </div>
        </div>
    );
};
