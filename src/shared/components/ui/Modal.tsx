import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { triggerHaptic } from '../../../lib/haptics';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      previousFocus.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        const first = containerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        first?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
      previousFocus.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      triggerHaptic('light');
      onClose();
      return;
    }
    if (e.key === 'Tab' && containerRef.current) {
      const focusable = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [onClose]);

  const handleClose = () => {
    triggerHaptic('light');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={containerRef}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          dir="rtl"
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label={title || 'نافذة منبثقة'}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-background/40 dark:bg-background/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={cn(
              'relative w-full max-w-lg bg-card backdrop-blur-xl border border-border rounded-card shadow-card z-10 overflow-hidden',
              className
            )}
          >
            <div className="flex items-center justify-between mb-5 px-6 pt-6">
              {title && (
                <h3 className="text-base font-black text-main">{title}</h3>
              )}
              <button
                onClick={handleClose}
                className="text-muted hover:text-main transition-colors p-1.5 rounded-card hover:bg-hover ms-auto focus:outline-none focus:ring-2 focus:ring-focus"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-end px-6 pb-6 max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
