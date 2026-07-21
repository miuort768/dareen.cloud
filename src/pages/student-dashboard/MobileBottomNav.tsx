import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, User, Library, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
    { id: 'more', label: 'المزيد', icon: MoreHorizontal, path: '/forum' },
    { id: 'profile', label: 'الملف الشخصي', icon: User, path: '/student-dashboard' },
    { id: 'home', label: 'الرئيسية', icon: Home, path: '/student-dashboard', isCenter: true },
    { id: 'library', label: 'مكتبة الدورات', icon: Library, path: '/schedule' },
    { id: 'main', label: 'الرئيسية', icon: Home, path: '/' },
];

export const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 end-0 start-0 z-50">
            <div className="h-2 bg-white dark:bg-black" />
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur-2xl border-t border-white/20 dark:border-white/10 shadow-2xl shadow-black/5 pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-around h-[68px] px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.id === 'home' && location.pathname.includes('student-dashboard'));
                        const isCenter = item.isCenter;
                        return (
                            <motion.button key={item.id} whileTap={{ scale: 0.9 }} onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 touch-manipulation relative ${isCenter ? 'w-14 h-14 -mt-6' : 'w-full h-full'}`}>
                                {isCenter ? (
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
                                        <Icon size={26} className="text-white" />
                                    </div>
                                ) : (
                                    <>
                                        <div className={cn("rounded-xl p-1 transition-all duration-300", isActive && "bg-gradient-to-br from-primary/10 to-purple-500/10")}>
                                            <Icon size={20}
                                                className={cn("transition-colors duration-300", isActive ? "text-primary" : "text-muted")}
                                                strokeWidth={isActive ? 2 : 1.5} />
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
        </nav>
    );
};
