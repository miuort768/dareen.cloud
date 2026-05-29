import { useEffect, useRef, useCallback } from 'react';
import { Plus, RotateCcw, X, Sparkles } from 'lucide-react';
import { useTasbeehStore } from '../../store/tasbeehStore';

export const FloatingTasbeehWidget = () => {
    const { isOpen, count, position, toggle, close, increment, reset, setPosition } = useTasbeehStore();
    const dragRef = useRef<HTMLDivElement>(null);
    const dragState = useRef({ isDragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                increment();
            }
            if (e.key === 'Escape') {
                close();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, increment, close]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const state = dragState.current;
        state.isDragging = true;
        state.startX = e.clientX;
        state.startY = e.clientY;
        state.origX = position.x;
        state.origY = position.y;

        const onMove = (ev: MouseEvent) => {
            if (!state.isDragging) return;
            const dx = ev.clientX - state.startX;
            const dy = ev.clientY - state.startY;
            setPosition({ x: state.origX + dx, y: state.origY + dy });
        };

        const onUp = () => {
            state.isDragging = false;
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [position, setPosition]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        const state = dragState.current;
        state.isDragging = true;
        state.startX = touch.clientX;
        state.startY = touch.clientY;
        state.origX = position.x;
        state.origY = position.y;

        const onMove = (ev: TouchEvent) => {
            if (!state.isDragging) return;
            const t = ev.touches[0];
            const dx = t.clientX - state.startX;
            const dy = t.clientY - state.startY;
            setPosition({ x: state.origX + dx, y: state.origY + dy });
        };

        const onEnd = () => {
            state.isDragging = false;
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onEnd);
        };

        window.addEventListener('touchmove', onMove);
        window.addEventListener('touchend', onEnd);
    }, [position, setPosition]);

    if (!isOpen) {
        return (
            <button
                onClick={toggle}
                className="fixed z-[9999] flex items-center justify-center w-12 h-12 bg-[#1e3a5f] hover:bg-[#2563EB] text-white rounded-2xl shadow-xl border border-white/10 active:scale-95 transition-all"
                style={{ left: position.x, top: position.y }}
                title="المسبحة"
            >
                <Sparkles size={20} strokeWidth={1.5} />
            </button>
        );
    }

    return (
        <div
            ref={dragRef}
            className="fixed z-[9999] bg-gradient-to-br from-[#1e3a5f] to-[#0d2137] border border-white/10 rounded-2xl shadow-2xl w-44 select-none"
            style={{ left: position.x, top: position.y }}
            dir="rtl"
        >
            <div
                className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing bg-white/5 rounded-t-2xl border-b border-white/5"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <span className="text-white/60 text-[9px] font-bold tracking-wider">المسبحة</span>
                <button
                    onClick={close}
                    className="w-5 h-5 flex items-center justify-center bg-red-500/60 hover:bg-red-500 text-white rounded-full"
                >
                    <X size={10} />
                </button>
            </div>

            <div className="flex flex-col items-center gap-3 p-4">
                <div className="w-20 h-20 flex items-center justify-center rounded-full border-[3px] border-[#2563EB]/40 bg-white/5">
                    <span className="text-3xl font-black text-white tabular-nums">
                        {count}
                    </span>
                </div>

                <div className="flex items-center gap-2 w-full">
                    <button
                        onClick={increment}
                        className="flex-1 h-9 flex items-center justify-center gap-1 bg-[#2563EB] hover:bg-[#1d4ed8] active:scale-95 text-white rounded-xl text-xs font-bold transition-all"
                    >
                        <Plus size={14} />
                        تعد
                    </button>
                    <button
                        onClick={reset}
                        className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 rounded-xl transition-all"
                    >
                        <RotateCcw size={12} />
                    </button>
                </div>

                <span className="text-white/25 text-[7px]">مسافة أو Enter للعد</span>
            </div>
        </div>
    );
};
