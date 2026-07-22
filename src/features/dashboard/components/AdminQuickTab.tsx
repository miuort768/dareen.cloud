import { UserPlus, FilePlus, Calendar, Megaphone, Users, Banknote, ClipboardList, MessageSquare, GraduationCap, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

const actionGroups = [
    { label: 'إدارة', items: [
        { label: 'طالب جديد', icon: UserPlus, variant: 'info' as const, onClick: () => navigate('/students?action=new') },
        { label: 'إصدار فاتورة', icon: FilePlus, variant: 'success' as const, onClick: () => navigate('/student-invoices?action=new') },
        { label: 'المعلمات', icon: Users, variant: 'info' as const, onClick: () => navigate('/teachers') },
        { label: 'الحضور', icon: ClipboardList, variant: 'primary' as const, onClick: () => navigate('/attendance') },
    ]},
    { label: 'المحتوى', items: [
        { label: 'الجدول الأسبوعي', icon: Calendar, variant: 'primary' as const, onClick: () => navigate('/schedule') },
        { label: 'الإعلانات', icon: Megaphone, variant: 'warning' as const, onClick: () => navigate('/announcements') },
        { label: 'التقارير', icon: Banknote, variant: 'success' as const, onClick: () => navigate('/reports') },
        { label: 'المحادثات', icon: MessageSquare, variant: 'info' as const, onClick: () => navigate('/chat') },
    ]},
];

const variantStyles = {
    info: 'bg-info-soft text-info ring-info/20',
    success: 'bg-success-soft text-success ring-success/20',
    primary: 'bg-primary-soft text-primary ring-primary/20',
    warning: 'bg-warning-soft text-warning ring-warning/20',
};

export const AdminQuickTab = () => {
    return (
        <div className="space-y-5">
            {actionGroups.map((group, gi) => (
                <motion.div key={group.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.08 }}>
                    <p className="text-[10px] font-bold text-dim mb-2 px-1">{group.label}</p>
                    <div className="grid grid-cols-2 gap-2">
                        {group.items.map((item, i) => (
                            <motion.button key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: gi * 0.08 + i * 0.03 }}
                                onClick={item.onClick}
                                className="flex items-center gap-3 p-3.5 bg-card border border-border/50 rounded-xl active:scale-[0.97] transition-transform text-start"
                            >
                                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ring-1", variantStyles[item.variant])}>
                                    <item.icon size={16} strokeWidth={1.5} />
                                </div>
                                <span className="text-[11px] font-bold text-main">{item.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
