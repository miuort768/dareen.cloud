import { useCallback, useRef, useState } from 'react';
import { triggerHaptic } from '../../../lib/haptics';

interface PullToRefreshOptions {
    onRefresh: () => Promise<void> | void;
    threshold?: number;
}

/** Finds the nearest scrollable ancestor so the gesture respects real scroll state. */
const getScrollableParent = (el: HTMLElement | null): HTMLElement | null => {
    let node = el?.parentElement ?? null;
    while (node) {
        const style = getComputedStyle(node);
        if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) return node;
        node = node.parentElement;
    }
    return null;
};

/**
 * Native-app style pull-to-refresh state machine.
 * Returns handlers for the pull container plus the current pull distance.
 * `distance > 0` when pulling; `refreshing` while onRefresh runs.
 */
export const usePullToRefresh = ({ onRefresh, threshold = 55 }: PullToRefreshOptions) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const startY = useRef(0);
    const pulling = useRef(false);
    const scroller = useRef<HTMLElement | null>(null);

    const isAtTop = () => !scroller.current || scroller.current.scrollTop <= 0;

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (isRefreshing) return;
        const touch = e.touches[0];
        if (!touch) return;
        scroller.current = getScrollableParent(e.currentTarget as HTMLElement);
        if (!isAtTop()) return;
        startY.current = touch.clientY;
        pulling.current = true;
    }, [isRefreshing]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!pulling.current || isRefreshing) return;
        if (!isAtTop()) return;
        const touch = e.touches[0];
        if (!touch) return;
        const diff = touch.clientY - startY.current;
        if (diff > 0) {
            setPullDistance(Math.min(diff * 0.4, 90));
        } else {
            setPullDistance(0);
        }
    }, [isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (!pulling.current) return;
        pulling.current = false;
        if (pullDistance > threshold) {
            triggerHaptic('medium');
            setIsRefreshing(true);
            setPullDistance(threshold);
            try {
                await onRefresh();
            } catch (e) {
                console.error('Refresh failed', e);
            } finally {
                setTimeout(() => {
                    setIsRefreshing(false);
                    setPullDistance(0);
                    triggerHaptic('light');
                }, 300);
            }
        } else {
            setPullDistance(0);
        }
    }, [pullDistance, threshold, onRefresh]);

    return {
        isRefreshing,
        pullDistance,
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
    };
};
