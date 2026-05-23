import React, { useRef, Suspense } from 'react';
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

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

export const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const sidebarCollapsed = useSidebarCollapsed();
    const isChatOnly = currentUser?.role === 'chat_user';

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
            className="min-h-screen flex font-dash dark:text-slate-100 transition-colors duration-300 relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20"
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
                                <Suspense fallback={<PageLoader />}>
                                    <Outlet />
                                </Suspense>
                            </ErrorBoundary>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {!isChatOnly && <BottomNav />}
        </div>
    );
};
