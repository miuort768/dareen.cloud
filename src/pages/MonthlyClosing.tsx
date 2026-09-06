import { useState, useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Users,
  Receipt,
  Wallet,
  CalendarCheck,
  FileText,
  TrendingDown,
  Activity as ActivityIcon,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSemesterName, useAcademyName } from '../context/AppContext'
import { attendanceService } from '../features/attendance/services/attendanceService'
import { teacherService } from '../features/teachers/services/teacherService'
import { cn } from '../lib/utils'
import { api, safeGet } from '../lib/api'
import { INVOICE_STATUS, normalizeInvoiceStatus } from '../types/invoice'
import { CURRENCY_SYMBOL } from '@/config/constants'
import { PageLoader } from '../components/ui/PageLoader'
import { Skeleton } from '../shared/components/ui'

import { KpiCard } from './monthly-closing/components/ClosingUI'
import { SalarySlipModal } from './monthly-closing/components/SalarySlipModal'
import { PayrollTable } from './monthly-closing/components/PayrollTable'
import { CollectionsTable } from './monthly-closing/components/CollectionsTable'
import { RenewalsCards } from './monthly-closing/components/RenewalsCards'
import { TeacherPerformance } from './monthly-closing/components/TeacherPerformance'
import { CompensationTable } from './monthly-closing/components/CompensationTable'
import { StrategicSummary } from './monthly-closing/components/StrategicSummary'

const SubjectAnalysis = lazy(() => import('./monthly-closing/components/SubjectAnalysis'))

type TabType =
  'payroll' | 'collections' | 'renewals' | 'summary' | 'analysis' | 'teachers' | 'compensation'

const TABS = [
  { id: 'payroll', label: 'الرواتب', icon: Receipt },
  { id: 'collections', label: 'التحصيلات', icon: Wallet },
  { id: 'renewals', label: 'التجديدات', icon: AlertCircle },
  { id: 'analysis', label: 'تحليل المواد', icon: BarChart3 },
  { id: 'teachers', label: 'أداء المعلمات', icon: Users },
  { id: 'compensation', label: 'التعويضات', icon: RefreshCw },
  { id: 'summary', label: 'الملخص', icon: TrendingUp },
] as const

export const MonthlyClosing = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `الإقفال الشهري | ${academyName}`
  }, [academyName])
  const semesterName = useSemesterName()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('payroll')
  const [fabOpen, setFabOpen] = useState(false)
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date()
    // Local formatting — toISOString() shifted month start/end by a day on
    // UTC+2/+3 (payroll windows started on the 2nd or missed the last day).
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  })
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(),
    ).padStart(2, '0')}`
  })
  const [selectedTeacherForSlip, setSelectedTeacherForSlip] = useState<{
    name: string
    subject: string
    sessionsCount: number
    totalAmount: number
    sessionsList?: { date: string; studentName: string; teacherPrice?: number }[]
    price?: number
  } | null>(null)
  const [teacherAdjustments, setTeacherAdjustments] = useState<Record<string, number>>({})

  const handleTeacherAdjustment = (teacherId: string, amount: number) => {
    setTeacherAdjustments((prev) => ({ ...prev, [teacherId]: amount }))
  }

  const handleFabAction = (action: string) => {
    setFabOpen(false)
    switch (action) {
      case 'refresh':
        handleRefresh()
        break
      case 'summary':
        setActiveTab('summary')
        break
      case 'analysis':
        setActiveTab('analysis')
        break
    }
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['sessions-closing'] })
    queryClient.invalidateQueries({ queryKey: ['teachers-closing'] })
    queryClient.invalidateQueries({ queryKey: ['students-closing'] })
    queryClient.invalidateQueries({ queryKey: ['student-invoices-closing'] })
  }

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions-closing'],
    queryFn: attendanceService.getSessions,
  })
  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers-closing'],
    queryFn: teacherService.getAll,
  })
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students-closing'],
    queryFn: attendanceService.getStudents,
  })
  const { data: studentInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['student-invoices-closing'],
    queryFn: async () => {
      const resp = await api.get<
        {
          id: string
          studentName: string
          amount: number
          currency?: string
          date: string
          status: string
        }[]
      >('/studentInvoices')
      return Array.isArray(resp)
        ? resp
        : (
            resp as {
              data?: {
                id: string
                studentName: string
                amount: number
                currency?: string
                date: string
                status: string
              }[]
            }
          ).data || []
    },
  })

  const isLoading = sessionsLoading || teachersLoading || studentsLoading || invoicesLoading
  const filteredSessions = sessions?.filter((s) => s.date >= startDate && s.date <= endDate) || []

  const payrollData =
    teachers
      ?.map((teacher) => {
        const teacherSessions = filteredSessions.filter(
          (s) => s.teacherName?.trim() === teacher.name?.trim() && s.status === 'completed',
        )
        const baseAmount = teacherSessions.reduce(
          (acc, curr) => acc + (Number(curr.teacherPrice) || Number(teacher.price) || 0),
          0,
        )
        const adjustment = teacherAdjustments[teacher.id] || 0
        return {
          ...teacher,
          sessionsCount: teacherSessions.length,
          baseAmount,
          adjustment,
          totalAmount: baseAmount + adjustment,
          sessionsList: teacherSessions,
        }
      })
      .sort((a, b) => b.totalAmount - a.totalAmount) || []

  const subjectsList = Array.from(new Set(filteredSessions.map((s) => s.subject))).filter(Boolean)
  const subjectAnalysis = subjectsList
    .map((subj) => {
      const subjectSessions = filteredSessions.filter(
        (s) => s.subject === subj && s.status === 'completed',
      )
      const income = subjectSessions.reduce((acc, curr) => {
        let price = Number(curr.price) || 0
        if (price === 0) {
          const student = students?.find(
            (s) =>
              s.id === curr.studentId ||
              s.name?.trim().toLowerCase() === curr.studentName?.trim().toLowerCase(),
          )
          price = Number(student?.sessionPrice) || 0
        }
        // Convert to teacher currency basis (EGP) for comparison — if studentCurrency is different, note it
        return acc + price
      }, 0)
      const payout = subjectSessions.reduce((acc, curr) => {
        let tPrice = Number(curr.teacherPrice) || 0
        if (tPrice === 0) {
          const teacher = teachers?.find(
            (t) =>
              t.id === curr.teacherId ||
              t.name?.trim().toLowerCase() === curr.teacherName?.trim().toLowerCase(),
          )
          tPrice = Number(teacher?.price) || 0
        }
        return acc + tPrice
      }, 0)
      // Check if any sessions have mixed currencies (student currency != EGP)
      const hasMixedCurrency = subjectSessions.some((s) => {
        const currency = safeGet<string>(s, 'studentCurrency')
        return Boolean(currency) && currency !== 'EGP'
      })
      return {
        name: subj,
        income,
        payout,
        profit: income - payout,
        sessionsCount: subjectSessions.length,
        hasMixedCurrency,
      }
    })
    .sort((a, b) => b.profit - a.profit)

  const teacherPerformance =
    teachers
      ?.map((teacher) => {
        const teacherMonthSessions = filteredSessions.filter(
          (s) => s.teacherName?.trim() === teacher.name?.trim(),
        )
        const completed = teacherMonthSessions.filter((s) => s.status === 'completed').length
        const total = teacherMonthSessions.length
        const documented = teacherMonthSessions.filter(
          (s) => s.status === 'completed' && (s.topics || s.homework),
        ).length
        return {
          name: teacher.name,
          total,
          completed,
          documented,
          attendanceRate: total > 0 ? (completed / total) * 100 : 0,
          documentationRate: completed > 0 ? (documented / completed) * 100 : 0,
        }
      })
      .sort((a, b) => b.attendanceRate - a.attendanceRate) || []

  const renewalsData =
    students
      ?.flatMap((student) =>
        (student.enrollments || []).map((enroll) => {
          const remaining = enroll.sessionsTotal - enroll.sessionsUsed
          const isLow = remaining <= 2
          let waLink = ''
          if (student.parentPhone) {
            const msg = `تنبيه تجديد الباقة: يتبقى للطالب ${student.name} في مادة ${enroll.subject} ${remaining} جلسات فقط. يرجى التواصل للتجديد.`
            waLink = `https://wa.me/${student.parentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
          }
          return {
            studentName: student.name,
            phone: student.parentPhone || '',
            subject: enroll.subject,
            remaining,
            total: enroll.sessionsTotal,
            isLow,
            waLink,
          }
        }),
      )
      .filter((item) => item.isLow)
      .sort((a, b) => a.remaining - b.remaining) || []

  const validSessions = filteredSessions.filter((s) => s.status !== 'cancelled')
  // Currency policy (same as dashboard): totals are summed in EGP only —
  // non-EGP money is counted separately and surfaced as a warning, never mixed.
  const isEgp = (c?: string | null) => !c || c === 'EGP'
  let mixedCurrencyCount = 0

  let totalProjectedIncome = 0
  validSessions.forEach((curr) => {
    let price = Number(curr.price) || 0
    if (price === 0) {
      const student = students?.find(
        (s) =>
          s.id === curr.studentId ||
          s.name?.trim().toLowerCase() === curr.studentName?.trim().toLowerCase(),
      )
      price = Number(student?.sessionPrice) || 0
    }
    if (isEgp(safeGet<string>(curr, 'studentCurrency'))) totalProjectedIncome += price
    else mixedCurrencyCount += 1
  })

  let totalActualCollections = 0
  ;(studentInvoices || []).forEach(
    (inv: { date: string; status: string; amount: number; currency?: string }) => {
      if (inv.date < startDate || inv.date > endDate) return
      if (normalizeInvoiceStatus(inv.status) !== INVOICE_STATUS.PAID) return
      if (isEgp(inv.currency)) totalActualCollections += Number(inv.amount) || 0
      else mixedCurrencyCount += 1
    },
  )

  let totalTeacherPayout = 0
  payrollData.forEach((curr) => {
    if (isEgp(curr.currency)) totalTeacherPayout += Number(curr.totalAmount) || 0
    else mixedCurrencyCount += 1
  })

  let totalProjectedPayout = 0
  validSessions.forEach((curr) => {
    let tPrice = Number(curr.teacherPrice) || 0
    let currency: string | null = null
    if (tPrice === 0) {
      const teacher = teachers?.find(
        (t) =>
          t.id === curr.teacherId ||
          t.name?.trim().toLowerCase() === curr.teacherName?.trim().toLowerCase(),
      )
      tPrice = Number(teacher?.price) || 0
      currency = teacher?.currency ?? null
    }
    if (isEgp(currency)) totalProjectedPayout += tPrice
    else mixedCurrencyCount += 1
  })

  const netProjectedProfit = totalProjectedIncome - totalProjectedPayout
  const netActualCashFlow = totalActualCollections - totalTeacherPayout

  if (isLoading) return <PageLoader />

  return (
    <div
      className="from-primary-soft/40 relative min-h-full overflow-x-hidden bg-gradient-to-b via-background to-background"
      dir="rtl"
    >
      <div className="mx-auto max-w-page px-2">
        {/* Hero — internally divided: identity | stats | toolbar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative mb-4 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-elevation-1 md:p-6"
        >
          <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="bg-success/10 pointer-events-none absolute -bottom-20 -start-16 h-48 w-48 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-elevation-3 shadow-primary/30">
                <CalendarCheck size={22} className="text-on-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black leading-tight text-main">الإقفال الشهري</h1>
                  <span className="rounded-lg bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                    {semesterName}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">تقرير مالي وإداري شامل عن الشهر</p>
              </div>
            </div>

            <div className="hidden h-12 w-px bg-border lg:block" />

            <div className="grid flex-1 grid-cols-2 gap-2">
              <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-center">
                <p className="text-lg font-black tabular-nums leading-none text-primary">
                  {netProjectedProfit.toLocaleString()}
                  <span className="ms-1 text-[10px] font-bold text-muted">{CURRENCY_SYMBOL}</span>
                </p>
                <p className="mt-1 text-[10px] font-bold text-muted">صافي الربح</p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-center">
                <p className="text-lg font-black tabular-nums leading-none text-info">
                  {filteredSessions.length}
                </p>
                <p className="mt-1 text-[10px] font-bold text-muted">الجلسات</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3.5">
            <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 md:w-auto">
              <input
                aria-label="تاريخ البداية"
                type="date"
                className="min-w-0 flex-1 border-none bg-transparent text-xs font-bold text-main outline-none dark:[color-scheme:dark] md:w-[120px] md:flex-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-dim">–</span>
              <input
                aria-label="تاريخ النهاية"
                type="date"
                className="min-w-0 flex-1 border-none bg-transparent text-xs font-bold text-main outline-none dark:[color-scheme:dark] md:w-[120px] md:flex-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button
              onClick={handleRefresh}
              className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-main outline-none transition-all hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95 md:min-h-0 md:flex-none"
            >
              <RefreshCw size={13} /> تحديث
            </button>
            {mixedCurrencyCount > 0 && (
              <span
                className="flex items-center gap-1.5 rounded-xl bg-warning-soft px-3 py-2 text-[11px] font-bold text-warning"
                title="بنود بعملات غير الجنيه لا تُضم للأجماليات — تُحول من صفحة الفواتير"
              >
                <AlertCircle size={13} />
                {mixedCurrencyCount} بند بعملة غير محوّلة (غير محتسب)
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              title="صافي الربح المتوقع"
              value={`${netProjectedProfit.toLocaleString()} ${CURRENCY_SYMBOL}`}
              icon={TrendingUp}
              accent="primary"
              subValue={`الإيرادات: ${totalProjectedIncome.toLocaleString()}`}
            />
            <KpiCard
              title="التحصيلات الفعلية"
              value={`${totalActualCollections.toLocaleString()} ${CURRENCY_SYMBOL}`}
              icon={Wallet}
              accent="success"
              subValue={`صافي التدفق: ${netActualCashFlow.toLocaleString()} ${CURRENCY_SYMBOL}`}
            />
            <KpiCard
              title="رواتب المعلمات"
              value={`${totalTeacherPayout.toLocaleString()} ${CURRENCY_SYMBOL}`}
              icon={TrendingDown}
              accent="error"
              subValue={`${payrollData.length} معلمة مسجلة`}
            />
            <KpiCard
              title="إجمالي الجلسات"
              value={filteredSessions.length}
              icon={ActivityIcon}
              accent="warning"
              subValue="كل الجلسات المكتملة"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="no-scrollbar mb-4 flex gap-1 overflow-x-auto rounded-2xl border border-divider bg-card p-1 shadow-elevation-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  'relative flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all md:min-h-[38px]',
                  activeTab === tab.id ? 'text-on-primary' : 'text-muted hover:text-main',
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="closing-tab-pill"
                    className="absolute inset-0 rounded-xl bg-primary shadow-elevation-1"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <tab.icon size={14} />
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'payroll' && (
            <PayrollTable
              payrollData={payrollData}
              teacherAdjustments={teacherAdjustments}
              handleTeacherAdjustment={handleTeacherAdjustment}
              setSelectedTeacherForSlip={setSelectedTeacherForSlip}
              startDate={startDate}
              endDate={endDate}
            />
          )}
          {activeTab === 'collections' && (
            <CollectionsTable
              studentInvoices={studentInvoices || []}
              startDate={startDate}
              endDate={endDate}
            />
          )}
          {activeTab === 'renewals' && <RenewalsCards renewalsData={renewalsData} />}
          {activeTab === 'analysis' && (
            <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
              <SubjectAnalysis subjectAnalysis={subjectAnalysis} reportCurrency={CURRENCY_SYMBOL} />
            </Suspense>
          )}
          {activeTab === 'teachers' && (
            <TeacherPerformance teacherPerformance={teacherPerformance} />
          )}
          {activeTab === 'compensation' && (
            <CompensationTable filteredSessions={filteredSessions} />
          )}
          {activeTab === 'summary' && (
            <StrategicSummary
              netProjectedProfit={netProjectedProfit}
              totalProjectedIncome={totalProjectedIncome}
              totalActualCollections={totalActualCollections}
              totalTeacherPayout={totalTeacherPayout}
              reportCurrency={CURRENCY_SYMBOL}
            />
          )}
        </motion.div>

        {selectedTeacherForSlip && (
          <SalarySlipModal
            teacher={selectedTeacherForSlip}
            month={`${startDate} / ${endDate}`}
            onClose={() => setSelectedTeacherForSlip(null)}
          />
        )}
      </div>

      <div className="fixed bottom-[calc(96px+env(safe-area-inset-bottom,0px))] end-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:end-6">
        <AnimatePresence>
          {fabOpen &&
            [
              { icon: RefreshCw, label: 'تحديث البيانات', action: 'refresh' as const },
              { icon: FileText, label: 'تقرير شامل', action: 'summary' as const },
              { icon: TrendingUp, label: 'تحليل الأداء', action: 'analysis' as const },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.3, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, y: 20 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center gap-2"
              >
                <span className="whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold shadow-elevation-1">
                  {item.label}
                </span>
                <button
                  onClick={() => handleFabAction(item.action)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-elevation-3 transition-all hover:bg-primary-hover hover:shadow-elevation-4"
                >
                  <item.icon size={18} />
                </button>
              </motion.div>
            ))}
        </AnimatePresence>
        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full text-on-primary shadow-elevation-4 transition-all',
            fabOpen ? 'rotate-45 bg-error' : 'bg-primary',
          )}
        >
          <CalendarCheck size={22} />
        </motion.button>
      </div>
    </div>
  )
}

export default MonthlyClosing
