import { Users, Search } from 'lucide-react'
import { motion } from 'framer-motion'

interface ParentsStudentHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export const ParentsStudentHeader = ({
  searchQuery,
  onSearchChange,
}: ParentsStudentHeaderProps) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    aria-label="قائمة الأبناء"
    className="relative overflow-hidden rounded-card bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-5 shadow-elevation-2 md:p-6"
  >
    <div
      className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute -bottom-20 -start-16 h-48 w-48 rounded-full bg-black/10 blur-3xl"
      aria-hidden="true"
    />

    <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-elevation-3 backdrop-blur-sm">
          <Users size={22} className="text-on-primary" />
        </div>
        <div>
          <h1 className="text-xl font-black leading-tight text-on-primary md:text-2xl">
            قائمة الأبناء
          </h1>
          <p className="mt-0.5 text-xs font-bold text-white/90">إدارة ومتابعة التفاصيل الدراسية</p>
        </div>
      </div>

      <div className="relative w-full md:ms-auto md:max-w-sm">
        <Search
          size={16}
          className="absolute start-3 top-1/2 -translate-y-1/2 text-white/70"
          aria-hidden="true"
        />
        <input
          type="text"
          aria-label="بحث عن ابن"
          placeholder="بحث عن ابن..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-white/20 bg-white/15 pe-3 ps-10 text-xs font-bold text-on-primary shadow-elevation-1 outline-none transition-colors duration-fast placeholder:font-medium placeholder:text-white/70 focus:border-white/60 focus:bg-white/20 focus:ring-2 focus:ring-white/25 md:h-10"
        />
      </div>
    </div>
  </motion.section>
)
