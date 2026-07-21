import React, { useRef, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useCurrentUser, useSidebarCollapsed } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { PageLoader } from '../ui/PageLoader';
import { ErrorBoundary } from '../ErrorBoundary';
import { BottomNav } from './BottomNav';
import { triggerHaptic } from '../../lib/haptics';

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
            className="min-h-screen flex font-sans text-main transition-colors duration-300 relative bg-white dark:bg-card"
        dir="rtl"
        >
            <Helmet>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[200] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:rounded-card focus:shadow-lg focus:outline-none"
            >
                تخطي إلى المحتوى
            </a>
            {!isChatOnly && (
                <div className={cn(
                    "hidden lg:block shrink-0 transition-all duration-300",
                    isChatOnly ? "w-0" : (sidebarCollapsed ? "w-[72px]" : "w-[260px]")
                )}>
                    <div className={cn("transition-all duration-300", isChatOnly ? "w-0" : (sidebarCollapsed ? "w-[72px]" : "w-[260px]"))} />
                </div>
            )}
            {!isChatOnly && <Sidebar />}

            <div className="flex-1 flex flex-col transition-all duration-300 min-w-0 max-w-full">
                {(!isChatOnly && !location.pathname.includes('/chat') && !location.pathname.includes('/student-dashboard')) && <Header />}

                <main id="main-content" className={cn(
                    "flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative min-w-0 max-w-full w-full",
                    (isChatOnly || location.pathname.includes('/chat') || location.pathname.includes('/student-dashboard'))
                        ? "p-0"
                        : "px-2 md:px-5 lg:px-8 pt-2 md:pt-4 pb-20 lg:pb-8 z-10"
                )}>
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                            <div key={location.pathname} className="animate-page-enter w-full h-full">
                                <Outlet />
                            </div>
                        </Suspense>
                    </ErrorBoundary>
                </main>
            </div>

            {!isChatOnly && <BottomNav />}
        </div>
    );
};
