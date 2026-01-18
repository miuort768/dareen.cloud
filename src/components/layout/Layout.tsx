import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PageLoader } from '../ui/PageLoader';
import { useIsFetching } from '@tanstack/react-query';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { GlobalMeeting } from '../../features/chat/components/GlobalMeeting';

export const Layout = () => {
    const location = useLocation();
    const isFetching = useIsFetching({
        predicate: (query) => {
            // Exclude chat polling from global loader if they already have data
            const isChatQuery = query.queryKey.includes('messages') || query.queryKey.includes('conversations');
            if (isChatQuery && query.state.status === 'success') {
                return false;
            }
            return true;
        }
    });
    const { currentUser } = useApp();
    const isLoading = isFetching > 0;
    const isChatOnly = currentUser?.role === 'chat_user';

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300 relative" dir="rtl">
            {/* Global Video Call Portal */}
            <GlobalMeeting />

            {/* Page Loader */}
            {isLoading && <PageLoader />}

            {/* Sidebar - Hidden for chat users */}
            {!isChatOnly && <Sidebar />}

            {/* Main Content */}
            <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden">
                {!isChatOnly && <Header />}
                <main className={cn(
                    "flex-1 overflow-y-auto custom-scrollbar",
                    (isChatOnly || location.pathname.includes('/chat')) ? "p-0" : "p-4 pt-0 lg:p-8 pb-24 lg:pb-8"
                )}>
                    <div key={location.pathname} className={cn(
                        "animate-in fade-in duration-500 ease-out h-full",
                        !isChatOnly && "slide-in-from-bottom-4"
                    )}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
