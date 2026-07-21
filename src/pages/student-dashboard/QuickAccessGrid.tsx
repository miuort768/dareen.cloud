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

const variantGradient: Record<string, string> = {
    success: 'from-success to-emerald-500 shadow-success/20',
    info: 'from-info to-blue-500 shadow-info/20',
    primary: 'from-primary to-purple-500 shadow-primary/20',
    warning: 'from-warning to-orange-500 shadow-warning/20',
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
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg ${variantGradient[item.variant]}`}>
                            <Icon size={20} className="text-white" />
                        </div>
                        <span className="text-micro font-semibold text-muted text-center leading-tight">{item.label}</span>
                    </motion.button>
                );
            })}
        </div>
    );
};
