import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface JobsErrorModalProps {
    errorMsg: string;
    onClose: () => void;
}

export const JobsErrorModal = ({ errorMsg, onClose }: JobsErrorModalProps) => (
    <AnimatePresence>
        {errorMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                onClick={onClose}>
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-card border border-error/50 shadow-soft rounded-card p-6 max-w-sm w-full text-center relative"
                    onClick={e => e.stopPropagation()}>
                    <button type="button" onClick={onClose} aria-label="إغلاق"
                        className="absolute top-3 end-3 w-8 h-8 flex items-center justify-center text-muted hover:text-error transition-colors rounded-card">
                        <X size={16} />
                    </button>
                    <div className="w-16 h-16 bg-error/10 rounded-card flex items-center justify-center mx-auto mb-5">
                        <AlertTriangle size={32} className="text-error" />
                    </div>
                    <h3 className="text-lg font-bold font-heading text-main mb-2">عذراً</h3>
                    <p className="text-sm text-muted leading-relaxed">{errorMsg}</p>
                    <button type="button" onClick={onClose}
                        className="mt-6 w-full py-3 bg-error hover:bg-error-hover text-on-error font-bold text-xs rounded-card transition-all">
                        حسناً
                    </button>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);
