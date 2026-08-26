import { motion } from 'framer-motion'
import { Image } from '../../shared/components/ui'

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-surface dark:bg-background">
      <div className="absolute right-[-10%] top-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-primary/10 blur-[120px] dark:bg-primary/20" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-primary/10 blur-[120px] dark:bg-primary/20" />

      {/* Center - Logo */}
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/30 opacity-20 dark:bg-primary/40" />
          <div className="absolute inset-[-15px] animate-[spin_8s_linear_infinite] rounded-full border-2 border-primary/5 dark:border-primary/10" />
          <div className="absolute inset-[-30px] animate-[spin_12s_linear_reverse_infinite] rounded-full border border-primary/5 dark:border-primary/10" />

          <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border border-border bg-white p-3 shadow-[var(--shadow-glow)] md:h-52 md:w-52">
            <Image
              src="/bbook.webp"
              alt="بوابة دارين السابعة التعليمية"
              className="h-full w-full"
              imgClassName="object-contain"
              loading="eager"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
          </div>
        </motion.div>
      </div>

      {/* Bottom - Brand text + Loading */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-6 pb-16 text-center md:pb-20"
      >
        <div className="space-y-1">
          <h2 className="font-heading text-3xl font-medium tracking-tighter text-main md:text-4xl">
            دارين السابعة <span className="text-primary">للتعليم والتدريب</span>
          </h2>
          <p className="text-micro font-medium uppercase tracking-label text-muted md:text-xs">
            Darin of Education & Training
          </p>
        </div>

        <div className="relative mx-auto h-1 w-56 overflow-hidden border border-border bg-surface dark:border-divider">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-primary to-transparent"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', delay: 0.2 }}
            className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="animate-pulse text-micro font-medium uppercase tracking-label text-primary">
            جاري تهيئة النظام
          </span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`dot-${i}`}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                className="h-1 w-1 rounded-full bg-primary"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
