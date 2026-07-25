import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, Star, LayoutDashboard, BookOpen, MoreHorizontal
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
    { id: 'profile', label: 'حسابي', icon: User, path: '/parent-dashboard' },
    { id: 'favorites', label: 'المفضلة', icon: Star, path: '/schedule' },
    { id: 'home', label: 'الرئيسية', icon: LayoutDashboard, path: '/parent-dashboard', isCenter: true },
    { id: 'files', label: 'ملفاتي', icon: BookOpen, path: '/parent-students' },
    { id: 'more', label: 'المزيد', icon: MoreHorizontal, path: '/forum' },
];

export const ParentBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    return (
        <div className="block md:hidden fixed bottom-0 end-0 start-0 z-50">
            <div className="h-2 bg-background" />
            <div className="bg-card border-t border-border shadow-2xl shadow-black/5 pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-around h-[68px] px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.id === 'home' && location.pathname === '/parent-dashboard');
                        const isCenter = item.isCenter;
                        return (
                            <motion.button key={item.id} whileTap={{ scale: 0.9 }} onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 touch-manipulation relative ${isCenter ? 'w-14 h-14 -mt-6' : 'w-full h-full'}`}>
                                {isCenter ? (
                                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                        <Icon size={26} className="text-on-primary" />
                                    </div>
                                ) : (
                                    <>
                                        <div className={cn("rounded-xl p-1.5 transition-all duration-300", isActive && "bg-primary-soft")}>
                                            <Icon size={20}
                                                className={cn("transition-colors duration-300", isActive ? "text-primary" : "text-muted")}
                                                strokeWidth={isActive ? 2.5 : 1.5} />
                                        </div>
                                        <span className={cn("text-[10px] font-bold transition-all duration-300", isActive ? "text-primary" : "text-muted")}>
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
