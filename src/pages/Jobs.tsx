import { safeJsonLd } from '../shared/utils/jsonLd'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FileText, ChevronRight, ChevronLeft, Send, CheckCircle2, Briefcase } from 'lucide-react'
import { api } from '../lib/api'
import { MobileHeader } from '../components/public/MobileHeader'
import { PublicFooter } from '../components/public/PublicFooter'
import { SEO } from '../components/SEO'
import { JobsHeroBanner, JobsSuccessView, JobsFormStep, JobsErrorModal } from './jobs-page'
import { SUBJECTS } from '../data/subjects'

const steps = [
  { id: 1, title: 'المعلومات الشخصية', icon: Briefcase },
  { id: 2, title: 'المؤهلات والوظيفة', icon: Briefcase },
  { id: 3, title: 'المادة', icon: Briefcase },
  { id: 4, title: 'الخبرات', icon: Briefcase },
]

const stepFields: Record<number, (keyof typeof formInitial)[]> = {
  1: ['name', 'phone', 'whatsapp'],
  2: ['position', 'qualification', 'grade'],
  3: ['subject'],
  4: ['graduationYear', 'onlineYears', 'curriculums'],
}

const optionalFields = new Set([
  'whatsapp',
  'grade',
  'graduationYear',
  'onlineYears',
  'curriculums',
  'subject',
])

const formInitial = {
  name: '',
  phone: '',
  whatsapp: '',
  position: '',
  qualification: '',
  grade: '',
  subject: '',
  graduationYear: '',
  onlineYears: '',
  curriculums: '',
}

export const Jobs = () => {
  const [form, setForm] = useState(formInitial)
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({})
  const totalSteps = steps.length

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    if (
      (name === 'phone' ||
        name === 'whatsapp' ||
        name === 'graduationYear' ||
        name === 'onlineYears') &&
      value !== '' &&
      !/^[\d+]+$/.test(value)
    )
      return
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const canProceed = useCallback(() => {
    const fields = stepFields[step] || []
    return fields.every((f) => optionalFields.has(f) || form[f]?.trim().length > 0)
  }, [step, form])

  const nextStep = useCallback(() => {
    if (step < totalSteps && canProceed()) setStep((s) => s + 1)
  }, [step, totalSteps, canProceed])

  const prevStep = useCallback(() => {
    if (step > 1) setStep((s) => s - 1)
  }, [step])

  useEffect(() => {
    const id = setTimeout(() => {
      const firstField = stepFields[step]?.[0]
      if (firstField && firstField !== 'subject') inputRefs.current[firstField]?.focus()
    }, 300)
    return () => clearTimeout(id)
  }, [step])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (step < totalSteps) nextStep()
      else handleSubmit(e)
    }
  }

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.position || !form.qualification) return
    setLoading(true)
    try {
      await api.post('/jobs', form)
      setSubmitted(true)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'حدث خطأ أثناء الإرسال. حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return <JobsSuccessView />

  return (
    <div className="flex min-h-screen flex-col bg-background" dir="rtl">
      <SEO
        title="التوظيف"
        description="فرصة للانضمام إلى فريق دارين السابعة للتعليم والتدريب. نبحث عن معلمات متميزات للتدريس أون لاين في جميع المواد. قدمي طلبك الآن."
        url="https://dareen.cloud/jobs"
        image="/dareen_logo_new.jpg"
        breadcrumbs={[
          { name: 'الرئيسية', item: '/' },
          { name: 'التوظيف', item: '/jobs' },
        ]}
      />
      <script type="application/ld+json">
        {safeJsonLd({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'التوظيف في دارين السابعة',
          description: 'فرص عمل وانضمام إلى فريق دارين السابعة للتعليم والتدريب',
          publisher: {
            '@type': 'EducationalOrganization',
            name: 'دارين السابعة',
            url: 'https://dareen.cloud',
          },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://dareen.cloud/' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'التوظيف',
                item: 'https://dareen.cloud/jobs',
              },
            ],
          },
        })}
      </script>
      <MobileHeader hideThemeToggle />
      <JobsHeroBanner />

      <main className="relative z-20 -mt-4 flex-grow md:-mt-6">
        <div className="container mx-auto max-w-3xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-card border border-border bg-card shadow-soft"
          >
            <div className="border-b border-border p-4 md:p-10">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-heading text-sm font-black text-main md:text-lg">
                  <FileText className="h-4 w-4 text-primary md:h-5 md:w-5" />
                  تقديم طلب التوظيف
                </h2>
                <div className="flex items-center gap-1.5 md:hidden">
                  {steps.map((s) => (
                    <div
                      key={s.id}
                      className={`h-2 w-2 rounded-full transition-all duration-slow ${step === s.id ? 'w-5 bg-primary' : step > s.id ? 'bg-success' : 'border border-border bg-card'}`}
                    />
                  ))}
                </div>
                <span className="hidden rounded-card border border-border bg-card px-3 py-1 text-xs font-bold text-muted md:inline-block">
                  الخطوة {step} من {totalSteps}
                </span>
              </div>
              <p className="text-xs font-bold text-primary md:hidden">
                {steps.find((s) => s.id === step)?.title}
              </p>
              <div className="hidden grid-cols-4 gap-2 md:grid md:gap-4">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex flex-col items-center gap-1.5 md:gap-2">
                    <div className="flex w-full items-center gap-1.5 md:gap-2">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${step === s.id ? 'bg-primary text-on-primary' : step > s.id ? 'bg-success text-on-success' : 'border border-border bg-card text-muted'}`}
                      >
                        {step > s.id ? <CheckCircle2 size={16} /> : s.id}
                      </div>
                      {i < steps.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 transition-colors duration-500 ${step > s.id ? 'bg-success' : 'bg-border'}`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-center text-xs font-bold transition-colors ${step === s.id ? 'text-primary' : 'text-muted'}`}
                    >
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (step < totalSteps) nextStep()
              }}
              onKeyDown={handleKeyDown}
            >
              <div className="p-4 md:p-10">
                <JobsFormStep
                  step={step}
                  form={form}
                  subjects={SUBJECTS as unknown as string[]}
                  inputRefs={inputRefs}
                  onChange={handleChange}
                  onSubjectChange={(s) => setForm((prev) => ({ ...prev, subject: s }))}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="border-t border-border p-4 md:p-10">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={step === 1}
                    aria-label="الخطوة السابقة"
                    className="flex items-center gap-2 rounded-card border border-border bg-card px-5 py-3 text-xs font-bold text-muted outline-none transition-all hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-20 md:px-6 md:py-4"
                  >
                    <ChevronRight size={14} /> السابق
                  </button>
                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceed()}
                      aria-label="الخطوة التالية"
                      className="flex flex-1 items-center justify-center gap-2 rounded-card bg-primary px-8 py-3 text-xs font-bold text-on-primary shadow-soft outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-30 md:flex-none md:px-10 md:py-4"
                    >
                      التالي <ChevronLeft size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={
                        loading ||
                        !form.name ||
                        !form.phone ||
                        !form.position ||
                        !form.qualification
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-card bg-success px-8 py-3 text-xs font-bold text-on-success shadow-soft outline-none transition-all hover:bg-success-hover focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-30 md:flex-none md:px-10 md:py-4"
                    >
                      {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-on-primary" />
                      ) : (
                        <Send size={14} />
                      )}
                      تقديم الطلب
                    </button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      <div className="mt-8 md:mt-12">
        <PublicFooter />
      </div>
      <JobsErrorModal errorMsg={errorMsg} onClose={() => setErrorMsg('')} />
    </div>
  )
}
