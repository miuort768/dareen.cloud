import { create } from 'zustand';

interface TasbeehState {
    isOpen: boolean;
    count: number;
    position: { x: number; y: number };
    toggle: () => void;
    open: () => void;
    close: () => void;
    increment: () => void;
    reset: () => void;
    setPosition: (pos: { x: number; y: number }) => void;
}

const savedPos = localStorage.getItem('tasbeeh_position');
const defaultPos = savedPos ? JSON.parse(savedPos) : { x: 20, y: 100 };

export const useTasbeehStore = create<TasbeehState>((set, get) => ({
    isOpen: false,
    count: 0,
    position: defaultPos,

    toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),

    increment: () => set((s) => ({ count: s.count + 1 })),

    reset: () => set({ count: 0 }),

    setPosition: (pos) => {
        localStorage.setItem('tasbeeh_position', JSON.stringify(pos));
        set({ position: pos });
    },
}));
