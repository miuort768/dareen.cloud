import { UserPlus, FilePlus, Calendar, Megaphone, Users, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../../../lib/haptics';
import { NavButton } from './AdminNavButton';

export const AdminQuickTab = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-3">
            <p className="text-micro font-bold text-muted px-1">الإجراءات السريعة</p>
            <div className="grid grid-cols-2 gap-3">
                <NavButton label="إضافة طالب جديد" subtext="تسجيل جديد" icon={UserPlus} variant="info" onClick={() => { triggerHaptic('medium'); navigate('/students?action=new'); }} />
                <NavButton label="إصدار فاتورة" subtext="فاتورة مالية" icon={FilePlus} variant="success" onClick={() => { triggerHaptic('medium'); navigate('/student-invoices?action=new'); }} />
                <NavButton label="الجدول الاسبوعي" subtext="إدارة المواعيد" icon={Calendar} variant="primary" onClick={() => { triggerHaptic('medium'); navigate('/schedule'); }} />
                <NavButton label="لوحة الإعلانات" subtext="إدارة ونشر" icon={Megaphone} variant="warning" onClick={() => { triggerHaptic('medium'); navigate('/announcements'); }} />
                <NavButton label="المعلمات" subtext="إدارة البيانات" icon={Users} variant="info" onClick={() => { triggerHaptic('medium'); navigate('/teachers'); }} />
                <NavButton label="التقارير" subtext="إحصائيات" icon={Banknote} variant="warning" onClick={() => { triggerHaptic('medium'); navigate('/reports'); }} />
            </div>
        </div>
    );
};
