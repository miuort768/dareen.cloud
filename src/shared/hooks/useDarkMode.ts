import { useEffect, useState } from 'react';

export function useDarkMode() {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('theme') || 'light';
        } catch (e) {
            console.warn(e);
            return 'light';
        }
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        try {
            localStorage.setItem('theme', theme);
        } catch (e) { console.warn(e); }
    }, [theme]);

    return [theme, setTheme] as const;
}
