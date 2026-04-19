import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Standard window scroll (for absolute pages like Home, Login)
        window.scrollTo(0, 0);

        // Targeted scroll for the Main container (used in Dashboard Layout)
        const main = document.querySelector('main');
        if (main) {
            main.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
    }, [pathname]);

    return null;
};

export default ScrollToTop;
