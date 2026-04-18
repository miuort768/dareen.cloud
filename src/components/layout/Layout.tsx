import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { PageLoader } from '../ui/PageLoader';
import { InstallPWA } from '../ui/InstallPWA';




export const Layout = () => {
    const location = useLocation();
    const { currentUser } = useApp();
    const isChatOnly = currentUser?.role === 'chat_user';

    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex font-sans dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 relative" dir="rtl">
            {/* Sidebar - Hidden for chat users */}
            {!isChatOnly && <Sidebar />}

            {/* Main Content */}
            <div className="flex-1 flex flex-col transition-all duration-300">
                {(!isChatOnly && !location.pathname.includes('/chat')) && <Header />}

                <main className={cn(
                    "flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative max-w-full",
                    (isChatOnly || location.pathname.includes('/chat')) 
                        ? "p-0" 
                        : "px-4 pt-1 md:p-5 lg:p-8 pb-32 lg:pb-8 lg:rounded-none rounded-t-[32px] sm:bg-transparent bg-gray-50/50 dark:bg-slate-950/50 -mt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10"
                )}>
                    {/* Page Content with Local Suspense to keep Sidebar visible during navigation */}
                    <div key={location.pathname} className={cn(
                        "animate-in fade-in duration-500 ease-out h-full",
                        !isChatOnly && "slide-in-from-bottom-4"
                    )}>
                        {/* We use specific loaders inside pages, but this handles lazy chunk loading */}
                        <React.Suspense fallback={<PageLoader />}>

                            <Outlet />
                        </React.Suspense>
                    </div>
                </main>
            </div>

        </div>
    );
};


