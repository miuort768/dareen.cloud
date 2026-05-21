import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageLoader = () => {
    const location = useLocation();

    useEffect(() => {
        const timer = setTimeout(() => {
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [location.pathname]);
};
