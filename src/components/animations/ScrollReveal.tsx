import { motion, Variants } from 'framer-motion';
import { ReactNode, HTMLAttributes } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';

interface ScrollRevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
}

const getHidden = (direction: Direction, distance: number) => {
  switch (direction) {
    case 'up': return { opacity: 0, y: distance };
    case 'down': return { opacity: 0, y: -distance };
    case 'left': return { opacity: 0, x: distance };
    case 'right': return { opacity: 0, x: -distance };
    case 'scale': return { opacity: 0, scale: 0.9 };
    case 'none': return { opacity: 0 };
  }
};

export const ScrollReveal = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 50,
  once = true,
  className,
  ...rest
}: ScrollRevealProps) => {
  const variants: Variants = {
    hidden: getHidden(direction, distance),
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: { duration, delay, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
