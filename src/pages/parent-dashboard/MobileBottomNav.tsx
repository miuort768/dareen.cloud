import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Users, MessageSquare, User, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { triggerHaptic } from '../../lib/haptics';

const navItems = [
    { id: 'more', label: 'المزيد', icon: MoreHorizontal, path: '/parent-announcements' },
    { id: 'profile', label: 'حسابي', icon: User, path: '/parent-profile' },
    { id: 'home', label: 'الرئيسية', icon: Home, path: '/parent-dashboard', isCenter: true },
    { id: 'children', label: 'الأبناء', icon: Users, path: '/parent-students' },
    { id: 'chat', label: 'المحادثة', icon: MessageSquare, path: '/chat' },
];

export const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 end-0 start-0 z-50" aria-label="التنقل الرئيسي">
            <div className="bg-card/95 dark:bg-surface/95 backdrop-blur-xl border-t border-border dark:border-primary/15 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-end justify-around h-[72px] px-1 pt-1.5 pb-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.id === 'home' && location.pathname === '/parent-dashboard');
                        const isCenter = item.isCenter;
                        return (
                            <motion.button
                                key={item.id}
                                whileTap={{ scale: 0.85 }}
                                onClick={() => { triggerHaptic('light'); navigate(item.path); }}
                                className={cn(
                                    "flex flex-col items-center justify-center relative touch-manipulation",
                                    isCenter ? "w-16 h-16 -mt-5" : "flex-1 h-full pt-1.5 pb-1"
                                )}
                            >
                                {isCenter ? (
                                    <>
                                        <div className="absolute inset-0 bg-primary/10 dark:bg-primary/15 rounded-2xl blur-md scale-110" />
                                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-deep dark:from-primary dark:to-warning flex items-center justify-center shadow-lg shadow-primary/25 dark:shadow-primary/25">
                                            <Icon size={24} className="text-on-primary dark:text-on-primary" strokeWidth={2.2} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className={cn(
                                            "rounded-xl p-1.5 transition-all duration-200",
                                            isActive ? "bg-primary/10 dark:bg-primary/15" : "bg-transparent"
                                        )}>
                                            <Icon
                                                size={20}
                                                className={cn(
                                                    "transition-colors duration-200",
                                                    isActive ? "text-primary dark:text-primary" : "text-muted dark:text-dim"
                                                )}
                                                strokeWidth={isActive ? 2.2 : 1.5}
                                            />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-bold transition-colors duration-200 mt-0.5",
                                            isActive ? "text-primary dark:text-primary" : "text-muted dark:text-dim"
                                        )}>
                                            {item.label}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="parent-tab-dot"
                                                className="absolute top-0 w-1 h-1 rounded-full bg-primary dark:bg-primary"
                                            />
                                        )}
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
