import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PageLoader } from '../ui/PageLoader';
import { useIsFetching } from '@tanstack/react-query';

export const Layout = () => {
    const location = useLocation();
    const isFetching = useIsFetching();
    const isLoading = isFetching > 0;

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300 relative" dir="rtl">
            {/* Page Loader */}
            {isLoading && <PageLoader />}

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden">
                <Header />
                <main className="flex-1 p-4 pt-0 lg:p-8 pb-24 lg:pb-8 overflow-y-auto custom-scrollbar">
                    <div key={location.pathname} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
