import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { PageLoader } from '../ui/PageLoader';
import { ErrorBoundary } from '../ErrorBoundary';
import { BottomNav } from './BottomNav';





export const Layout = () => {
    const location = useLocation();
    const { currentUser, sidebarCollapsed } = useApp();
    const isChatOnly = currentUser?.role === 'chat_user';

    return (
        <div className="min-h-screen flex font-sans dark:text-slate-100 transition-colors duration-300 relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20" dir="rtl">
            {/* Sidebar - Hidden for chat users, and we use a placeholder div for fixed desktop sidebar */}
            {!isChatOnly && (
                <div className={cn(
                    "hidden lg:block shrink-0 transition-all duration-300",
                    isChatOnly ? "w-0" : (sidebarCollapsed ? "w-20" : "w-72")
                )}>
                    {/* This div just takes up space on the right so content doesn't go under fixed sidebar */}
                    <div className={cn("transition-all duration-300", isChatOnly ? "w-0" : (sidebarCollapsed ? "w-20" : "w-72"))} />
                </div>
            )}
            {!isChatOnly && <Sidebar />}

            {/* Main Content Area - Now scrolls with the body */}
            <div className="flex-1 flex flex-col transition-all duration-300 w-full max-w-full">
                {(!isChatOnly && !location.pathname.includes('/chat')) && <Header />}

                <main className={cn(
                    "flex-1 overflow-x-hidden custom-scrollbar relative max-w-full w-full",
                    (isChatOnly || location.pathname.includes('/chat')) 
                        ? "p-0" 
                        : "px-2 md:px-5 lg:px-8 pt-2 md:pt-4 pb-20 lg:pb-8 rounded-none md:rounded-t-[32px] lg:rounded-[40px] sm:bg-transparent bg-gray-50/50 dark:bg-slate-950/50 md:shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10"
                )}>
                    {/* Page Content with Local Suspense to keep Sidebar visible during navigation */}
                    <div key={location.pathname} className={cn(
                        "md:animate-in md:fade-in duration-500 ease-out h-full max-w-full overflow-x-hidden",
                        !isChatOnly && "md:slide-in-from-bottom-4"
                    )}>
                        {/* We use specific loaders inside pages, but this handles lazy chunk loading */}
                        <ErrorBoundary>
                            <React.Suspense fallback={<PageLoader />}>
                                <Outlet />
                            </React.Suspense>
                        </ErrorBoundary>
                    </div>
                </main>
            </div>

            {/* Bottom Navigation for Mobile */}
            {!isChatOnly && <BottomNav />}
        </div>
    );
};


