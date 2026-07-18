import { motion, type Variant } from 'framer-motion';
import { ReactNode } from 'react';

type AnimationType = 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scaleIn';

interface AnimateOnScrollProps {
    children: ReactNode;
    animation?: AnimationType;
    delay?: number;
    duration?: number;
    className?: string;
    once?: boolean;
}

const variants: Record<AnimationType, { hidden: Variant; visible: Variant }> = {
    fadeUp: {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 }
    },
    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    },
    slideLeft: {
        hidden: { opacity: 0, x: 60 },
        visible: { opacity: 1, x: 0 }
    },
    slideRight: {
        hidden: { opacity: 0, x: -60 },
        visible: { opacity: 1, x: 0 }
    },
    scaleIn: {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 }
    }
};

export const AnimateOnScroll = ({
    children,
    animation = 'fadeUp',
    delay = 0,
    duration = 0.6,
    className,
    once = true
}: AnimateOnScrollProps) => {
    const anim = variants[animation];

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once, margin: '-60px' }}
            variants={anim}
            transition={{ duration, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
