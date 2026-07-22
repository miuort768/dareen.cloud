import { UserPlus, FilePlus, Calendar, Megaphone, Users, Banknote, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NavButton } from './AdminNavButton';

export const AdminQuickTab = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-4 px-1">
            <div className="flex items-center gap-2 px-1">
                <Sparkles size={14} className="text-primary" />
                <h2 className="text-xs font-bold text-muted">الإجراءات السريعة</h2>
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
                {[
                    { label: 'إضافة طالب جديد', subtext: 'تسجيل جديد', icon: UserPlus, variant: 'info' as const, onClick: () => navigate('/students?action=new') },
                    { label: 'إصدار فاتورة', subtext: 'فاتورة مالية', icon: FilePlus, variant: 'success' as const, onClick: () => navigate('/student-invoices?action=new') },
                    { label: 'الجدول الاسبوعي', subtext: 'إدارة المواعيد', icon: Calendar, variant: 'primary' as const, onClick: () => navigate('/schedule') },
                    { label: 'لوحة الإعلانات', subtext: 'إدارة ونشر', icon: Megaphone, variant: 'warning' as const, onClick: () => navigate('/announcements') },
                    { label: 'المعلمات', subtext: 'إدارة البيانات', icon: Users, variant: 'info' as const, onClick: () => navigate('/teachers') },
                    { label: 'التقارير', subtext: 'إحصائيات', icon: Banknote, variant: 'warning' as const, onClick: () => navigate('/reports') },
                ].map((item, i) => (
                    <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                        <NavButton {...item} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};
