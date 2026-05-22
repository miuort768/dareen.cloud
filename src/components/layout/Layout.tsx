import React, { useRef, useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useCurrentUser, useSidebarCollapsed } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { PageLoader } from '../ui/PageLoader';
import { ErrorBoundary } from '../ErrorBoundary';
import { BottomNav } from './BottomNav';
import { triggerHaptic } from '../../lib/haptics';
import { Plus, X } from 'lucide-react';

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

const fabActions = [
    { label: 'طالب جديد', path: '/students?action=new', icon: '👤' },
    { label: 'فاتورة', path: '/student-invoices?action=new', icon: '💰' },
    { label: 'حصة', path: '/schedule', icon: '📅' },
    { label: 'إعلان', path: '/announcements?action=new', icon: '📢' },
];

export const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const sidebarCollapsed = useSidebarCollapsed();
    const isChatOnly = currentUser?.role === 'chat_user';
    const [showFab, setShowFab] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setShowFab(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
                setShowFab(false);
            }
        };
        if (showFab) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside, { passive: true });
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [showFab]);

    const handleFabAction = (path: string) => {
        triggerHaptic('medium');
        setShowFab(false);
        navigate(path);
    };

    // Swipe-back gesture
    const touchStartX = useRef(0);
    const handleTouchStart = (e: React.TouchEvent) => {
        if (location.pathname !== '/') {
            touchStartX.current = e.touches[0].clientX;
        }
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (diff > 80 && location.pathname !== '/') {
            triggerHaptic('light');
            navigate(-1);
        }
        touchStartX.current = 0;
    };

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="min-h-screen flex font-sans dark:text-slate-100 transition-colors duration-300 relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20"
            dir="rtl"
        >
            {!isChatOnly && (
                <div className={cn(
                    "hidden lg:block shrink-0 transition-all duration-300",
                    isChatOnly ? "w-0" : (sidebarCollapsed ? "w-20" : "w-72")
                )}>
                    <div className={cn("transition-all duration-300", isChatOnly ? "w-0" : (sidebarCollapsed ? "w-20" : "w-72"))} />
                </div>
            )}
            {!isChatOnly && <Sidebar />}

            <div className="flex-1 flex flex-col transition-all duration-300 w-full max-w-full">
                {(!isChatOnly && !location.pathname.includes('/chat')) && <Header />}

                <main className={cn(
                    "flex-1 overflow-x-hidden custom-scrollbar relative max-w-full w-full",
                    (isChatOnly || location.pathname.includes('/chat'))
                        ? "p-0"
                        : "px-2 md:px-5 lg:px-8 pt-2 md:pt-4 pb-20 lg:pb-8 z-10"
                )}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="h-full max-w-full overflow-x-hidden"
                        >
                            <ErrorBoundary>
                                <React.Suspense fallback={<PageLoader />}>
                                    <Outlet />
                                </React.Suspense>
                            </ErrorBoundary>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {!isChatOnly && <BottomNav />}

            {/* FAB - Mobile Only */}
            {!isChatOnly && !location.pathname.includes('/chat') && (
                <div ref={fabRef} className="md:hidden fixed bottom-24 left-4 z-[60] flex flex-col items-end gap-3">
                    <AnimatePresence>
                        {showFab && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-2 mb-1"
                            >
                                {fabActions.map((action, i) => (
                                    <motion.button
                                        key={action.path}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: i * 0.03 }}
                                        onClick={() => handleFabAction(action.path)}
                                        className="flex items-center gap-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-white px-4 py-3 shadow-lg border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
                                    >
                                        <span className="text-lg">{action.icon}</span>
                                        <span className="text-xs font-medium whitespace-nowrap">{action.label}</span>
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            triggerHaptic('light');
                            setShowFab(!showFab);
                        }}
                        className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center active:scale-90 transition-all"
                    >
                        <motion.div
                            animate={{ rotate: showFab ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Plus size={24} />
                        </motion.div>
                    </motion.button>
                </div>
            )}
        </div>
    );
};
