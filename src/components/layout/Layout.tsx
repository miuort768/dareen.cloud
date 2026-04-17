import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';


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
                {!isChatOnly && <Header />}
                <main className={cn(
                    "flex-1 overflow-y-auto custom-scrollbar relative",
                    (isChatOnly || location.pathname.includes('/chat')) ? "p-0" : "px-0 pt-0 md:p-5 lg:p-8 pb-28 lg:pb-8"
                )}>
                    {/* Page Content with Local Suspense to keep Sidebar visible during navigation */}
                    <div key={location.pathname} className={cn(
                        "animate-in fade-in duration-500 ease-out h-full",
                        !isChatOnly && "slide-in-from-bottom-4"
                    )}>
                        {/* We use specific loaders inside pages, but this handles lazy chunk loading */}
                        <React.Suspense fallback={
                            <div className="flex items-center justify-center h-full min-h-[50vh]">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                                    <p className="text-gray-400 font-bold text-sm">جاري تحميل المحتوى...</p>
                                </div>
                            </div>
                        }>
                            <Outlet />
                        </React.Suspense>
                    </div>
                </main>
            </div>

        </div>
    );
};
