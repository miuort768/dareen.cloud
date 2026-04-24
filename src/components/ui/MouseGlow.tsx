import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const MouseGlow: React.FC = () => {
    const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {/* Outer Ring */}
            <motion.div 
                className="fixed top-0 left-0 w-6 h-6 rounded-full border-2 border-indigo-600/50 shadow-[0_0_10px_rgba(92,89,242,0.2)]"
                animate={{
                    x: mousePos.x - 12,
                    y: mousePos.y - 12,
                }}
                transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 30,
                    mass: 0.8
                }}
            />
            {/* Inner Dot */}
            <motion.div 
                className="fixed top-0 left-0 w-3 h-3 rounded-full bg-indigo-600 shadow-lg shadow-indigo-500/40"
                animate={{
                    x: mousePos.x - 6,
                    y: mousePos.y - 6,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    mass: 0.4
                }}
            />
        </div>
    );
};
