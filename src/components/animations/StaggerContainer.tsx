import { motion, Variants, HTMLMotionProps } from 'framer-motion';
import { ReactNode, Children } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  staggerDelay?: number;
  direction?: Direction;
  distance?: number;
  once?: boolean;
}

const getHidden = (direction: Direction, distance: number) => {
  switch (direction) {
    case 'up': return { opacity: 0, y: distance };
    case 'down': return { opacity: 0, y: -distance };
    case 'left': return { opacity: 0, x: distance };
    case 'right': return { opacity: 0, x: -distance };
    case 'scale': return { opacity: 0, scale: 0.85 };
    case 'none': return { opacity: 0 };
  }
};

export const StaggerContainer = ({
  children,
  staggerDelay = 0.08,
  direction = 'up',
  distance = 40,
  once = true,
  className,
  ...rest
}: StaggerContainerProps) => {
  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: staggerDelay } }
  };

  const itemVariants: Variants = {
    hidden: getHidden(direction, distance),
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      className={className}
      {...rest}
    >
      {Children.map(children, (child, i) => (
        <motion.div key={i} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
