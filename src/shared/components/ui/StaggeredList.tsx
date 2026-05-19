import React from 'react';
import { motion } from 'framer-motion';

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;    // seconds between each item
  initialDelay?: number;    // seconds before first item animates
  className?: string;
}

/**
 * StaggeredList – wraps children so they fade-in one-by-one with a soft slide
 */
export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 0.08,
  initialDelay = 0,
  className,
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: initialDelay + i * staggerDelay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

interface StaggeredGridProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

/**
 * StaggeredGrid – same effect but for grid layouts
 */
export const StaggeredGrid: React.FC<StaggeredGridProps> = ({
  children,
  staggerDelay = 0.07,
  className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
}) => (
  <div className={className}>
    {React.Children.map(children, (child, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.97, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.35,
          delay: i * staggerDelay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {child}
      </motion.div>
    ))}
  </div>
);
