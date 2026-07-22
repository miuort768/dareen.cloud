import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';

export const JobsSuccessView = () => (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
        <MobileHeader hideThemeToggle />
        <main className="flex-grow flex items-start md:items-center justify-center px-4 md:pt-0 pt-8 pb-20">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg w-full bg-card border border-success/30 shadow-soft rounded-card p-8 md:p-10 text-center">
                <div className="space-y-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-16 h-16 bg-success-soft rounded-card flex items-center justify-center mx-auto">
                        <CheckCircle2 size={32} className="text-success" />
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl font-bold font-heading text-main mb-3">تم استلام طلبك!</h2>
                    <p className="text-base md:text-lg text-muted">سنقوم بمراجعة طلبك والتواصل معك في أقرب فرصة. بارك الله فيك.</p>
                </div>
            </motion.div>
        </main>
        <PublicFooter />
    </div>
);
