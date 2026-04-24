import React, { useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

export const MouseGlow: React.FC = () => {
    const mouseX = useSpring(0, { stiffness: 150, damping: 20 });
    const mouseY = useSpring(0, { stiffness: 150, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <>
            <motion.div
                className="pointer-events-none fixed top-0 left-0 z-[100] w-8 h-8 rounded-full border-2 border-indigo-500/50 mix-blend-difference"
                style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            />
            <motion.div
                className="pointer-events-none fixed top-0 left-0 z-[100] w-2 h-2 rounded-full bg-indigo-500 mix-blend-difference"
                style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            />
        </>
    );
};
