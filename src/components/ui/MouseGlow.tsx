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
                className="fixed top-0 left-0 w-10 h-10 rounded-full border-2 border-indigo-600 shadow-[0_0_15px_rgba(92,89,242,0.3)]"
                animate={{
                    x: mousePos.x - 20,
                    y: mousePos.y - 20,
                }}
                transition={{
                    type: "spring",
                    stiffness: 250,
                    damping: 25,
                    mass: 0.5
                }}
            />
            {/* Inner Dot */}
            <motion.div 
                className="fixed top-0 left-0 w-2 h-2 rounded-full bg-indigo-600 shadow-lg shadow-indigo-500/50"
                animate={{
                    x: mousePos.x - 4,
                    y: mousePos.y - 4,
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 0.5
                }}
            />
        </div>
    );
};
