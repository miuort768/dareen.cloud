import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({ 
    showSpinner: false, 
    trickleSpeed: 200, 
    minimum: 0.08,
    template: '<div class="bar" role="bar" style="background: #e11d48; height: 3px; box-shadow: 0 0 15px rgba(225, 29, 72, 0.4);"><div class="peg" style="box-shadow: 0 0 10px #e11d48, 0 0 5px #e11d48;"></div></div>'
});

export const usePageLoader = () => {
    const location = useLocation();

    useEffect(() => {
        // Start progress on location change
        NProgress.start();

        // Finish progress after a short delay to ensure content is rendered
        const timer = setTimeout(() => {
            NProgress.done();
        }, 300);

        return () => {
            clearTimeout(timer);
            NProgress.done();
        };
    }, [location.pathname]);
};
