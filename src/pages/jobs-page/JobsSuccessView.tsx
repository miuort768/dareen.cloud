import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { MobileHeader } from '../../components/public/MobileHeader'
import { PublicFooter } from '../../components/public/PublicFooter'

export const JobsSuccessView = () => (
  <div className="flex min-h-screen flex-col bg-background" dir="rtl">
    <MobileHeader hideThemeToggle />
    <main className="flex flex-grow items-start justify-center px-4 pb-20 pt-8 md:items-center md:pt-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg rounded-card border border-success-soft bg-card p-8 text-center shadow-soft md:p-10"
      >
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-card bg-success-soft"
          >
            <CheckCircle2 size={32} className="text-success" />
          </motion.div>
          <h2 className="mb-3 font-heading text-2xl font-bold text-main md:text-3xl">
            تم استلام طلبك!
          </h2>
          <p className="text-base text-muted md:text-lg">
            سنقوم بمراجعة طلبك والتواصل معك في أقرب فرصة. بارك الله فيك.
          </p>
        </div>
      </motion.div>
    </main>
    <PublicFooter />
  </div>
)
