import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Trophy, Video, Headphones, Megaphone, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminPhone } from '../../context/AppContext';

interface QuickAccessItem {
    id: string;
    label: string;
    icon: LucideIcon;
    variant: string;
}

const quickAccessItems: QuickAccessItem[] = [
    { id: 'courses', label: 'دوراتي', icon: BookOpen, variant: 'success' },
    { id: 'certificates', label: 'الشهادات', icon: GraduationCap, variant: 'info' },
    { id: 'challenges', label: 'التحديات', icon: Trophy, variant: 'primary' },
    { id: 'live', label: 'بث مباشر', icon: Video, variant: 'warning' },
    { id: 'consult', label: 'الاستشارات', icon: Headphones, variant: 'success' },
    { id: 'announcements', label: 'الإعلانات', icon: Megaphone, variant: 'warning' },
];

const variantBg: Record<string, string> = {
    success: 'bg-success-soft', info: 'bg-info-soft', primary: 'bg-primary-soft', warning: 'bg-warning-soft',
};
const variantText: Record<string, string> = {
    success: 'text-success', info: 'text-info', primary: 'text-primary', warning: 'text-warning',
};

export const QuickAccessGrid = () => {
    const navigate = useNavigate();
    const adminPhone = useAdminPhone();

    return (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {quickAccessItems.map((item) => {
                const Icon = item.icon;
                return (
                    <motion.button key={item.id} whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            if (item.id === 'courses') navigate('/schedule');
                            else if (item.id === 'live') navigate('/chat');
                            else if (item.id === 'announcements') navigate('/parent-announcements');
                            else if (item.id === 'consult') {
                                const phone = adminPhone?.replace(/\D/g, '').replace(/^0/, '965');
                                window.open(`https://wa.me/${phone}`, '_blank');
                            }
                        }}
                        className="flex flex-col items-center gap-1.5">
                        <div className={`w-12 h-12 rounded-card flex items-center justify-center shadow-sm ${variantBg[item.variant]}`}>
                            <Icon size={22} className={variantText[item.variant]} />
                        </div>
                        <span className="text-micro font-semibold text-muted text-center leading-tight">{item.label}</span>
                    </motion.button>
                );
            })}
        </div>
    );
};
