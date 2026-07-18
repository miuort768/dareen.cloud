import { useState } from 'react';
import { triggerHaptic } from '../../../lib/haptics';

interface UsePullToRefreshOptions {
    onRefresh: () => Promise<void>;
}

interface UsePullToRefreshReturn {
    isRefreshing: boolean;
    pullDistance: number;
    startY: number;
    setStartY: (v: number) => void;
    setPullDistance: (v: number) => void;
    setIsRefreshing: (v: boolean) => void;
    handleTouchStart: (e: React.TouchEvent) => void;
    handleTouchMove: (e: React.TouchEvent) => void;
    handleTouchEnd: () => void;
}

export const usePullToRefresh = ({ onRefresh }: UsePullToRefreshOptions): UsePullToRefreshReturn => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && !isRefreshing) setStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === 0 || isRefreshing || window.scrollY > 0) return;
        const diff = e.touches[0].clientY - startY;
        if (diff > 0) setPullDistance(Math.min(diff * 0.4, 90));
    };

    const handleTouchEnd = async () => {
        if (pullDistance > 60) {
            setIsRefreshing(true);
            setPullDistance(50);
            triggerHaptic('medium');
            try { await onRefresh(); } catch (e) { console.error('Refresh failed', e); }
            setTimeout(() => { setIsRefreshing(false); setPullDistance(0); setStartY(0); triggerHaptic('light'); }, 800);
        } else {
            setPullDistance(0);
            setStartY(0);
        }
    };

    return { isRefreshing, pullDistance, startY, setStartY, setPullDistance, setIsRefreshing, handleTouchStart, handleTouchMove, handleTouchEnd };
};
