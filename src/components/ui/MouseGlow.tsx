import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export const MouseGlow: React.FC = () => {
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Spring physics for smoothness
    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);

            // Check if hovering over a button or link
            const target = e.target as HTMLElement;
            const isClickable = target.closest('button, a, [role="button"]');
            setIsHovered(!!isClickable);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] hidden lg:block overflow-hidden">
            {/* 1. Large Soft Background Aura (The "Torch" effect) */}
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px]"
                style={{
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            />

            {/* 2. Outer Interactive Ring */}
            <motion.div 
                className="fixed top-0 end-0 w-8 h-8 rounded-full border border-primary/30 dark:border-primary/40"
                style={{
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    scale: isHovered ? 1.8 : 1,
                    backgroundColor: isHovered ? 'rgba(79,70,229,0.10)' : 'rgba(79,70,229,0.00)',
                    borderWidth: isHovered ? '2px' : '1px',
                }}
            />

            {/* 3. Inner Crisp Dot */}
            <motion.div 
                className="fixed top-0 end-0 w-1.5 h-1.5 rounded-full bg-primary dark:bg-primary shadow-[0_0_15px_rgba(79,70,229,0.80)]"
                style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    scale: isHovered ? 0.5 : 1,
                    opacity: isHovered ? 0.5 : 1,
                }}
            />
        </div>
    );
};
