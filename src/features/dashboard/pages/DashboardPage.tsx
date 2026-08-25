import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../../store/authStore'
import { useDashboardData } from '../hooks/useDashboardData'
import { ExecutiveDashboard } from '../components/executive/ExecutiveDashboardLayout'
import { MobileDashboardView } from '../components/MobileDashboardView'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useAcademicYear } from '../../../context/useApp'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

export const Dashboard = () => {
  useEffect(() => {
    document.title = 'لوحة التحكم | دارين السابعة للتعليم والتدريب'
  }, [])
  const currentUser = useAuthStore((s) => s.currentUser)
  const academicYear = useAcademicYear()

  const {
    stats,
    todaySessions,
    monthlyData,
    lowBalanceStudents,
    tasks,
    loading,
    rawStudents,
    rawSessions,
    rawStudentInvoices,
    fetchDashboardData,
  } = useDashboardData(currentUser)

  if (
    !currentUser ||
    (!currentUser.permissions?.includes('*') && !currentUser.permissions?.includes('dashboard'))
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-soft">
            <AlertCircle size={28} className="text-error" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-main">لا تملك صلاحية الوصول</h2>
          <p className="mb-4 text-sm text-muted">
            ليس لديك صلاحية لعرض لوحة التحكم. يرجى التواصل مع مدير النظام.
          </p>
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            العودة
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-full pb-24"
          dir="rtl"
        >
          <div className="relative z-10 mx-auto hidden max-w-page space-y-6 px-6 md:block">
            <Skeleton className="h-[180px] rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={`skel-kpi-${i}`} className="overflow-hidden">
                  <CardContent className="p-5">
                    <Skeleton className="mb-3 h-10 w-10 rounded-xl" />
                    <Skeleton className="mb-1 h-8 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-[280px] rounded-2xl" />
              <Skeleton className="h-[280px] rounded-2xl" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-[240px] rounded-2xl" />
              <Skeleton className="h-[240px] rounded-2xl" />
            </div>
          </div>

          <div className="block space-y-4 px-4 pt-3 sm:px-4 md:hidden">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="h-[54px] w-[54px] rounded-full" />
            </div>
            <div className="flex gap-2.5 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={`skel-mob-${i}`}
                  className="h-[88px] w-[108px] shrink-0 rounded-2xl"
                />
              ))}
            </div>
            <Skeleton className="h-[120px] rounded-2xl" />
            <Skeleton className="h-[180px] rounded-2xl" />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="min-h-full bg-background pb-24"
          dir="rtl"
        >
          {/* Desktop */}
          <div className="relative z-10 mx-auto hidden max-w-page px-6 md:block">
            <ExecutiveDashboard academicYear={academicYear} />
          </div>

          {/* Mobile */}
          <div className="block md:hidden">
            <MobileDashboardView
              currentUser={currentUser}
              stats={stats}
              todaySessions={todaySessions}
              monthlyData={monthlyData}
              lowBalanceStudents={lowBalanceStudents}
              tasks={tasks}
              rawStudents={rawStudents}
              rawSessions={rawSessions}
              rawStudentInvoices={rawStudentInvoices}
              onRefresh={fetchDashboardData}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Dashboard
