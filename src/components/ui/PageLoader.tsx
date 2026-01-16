import React from 'react';
import { cn } from '../../lib/utils';

interface PageLoaderProps {
    className?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ className }) => {
    return (
        <div className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm dark:bg-gray-950/60 transition-all duration-500",
            className
        )}>
            <div className="relative">
                {/* Outer Ring */}
                <div className="w-16 h-16 rounded-full border-4 border-primary-100 dark:border-primary-900/30"></div>

                {/* Animated Inner Ring */}
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"></div>

                {/* Inner Pulsing Circle */}
                <div className="absolute inset-0 m-auto w-4 h-4 bg-primary-600 rounded-full animate-pulse shadow-lg shadow-primary-600/50"></div>

                {/* Subtle Glow */}
                <div className="absolute -inset-4 bg-primary-600/10 rounded-full blur-xl animate-pulse"></div>
            </div>
        </div>
    );
};
