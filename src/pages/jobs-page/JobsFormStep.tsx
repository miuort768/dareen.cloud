import { AnimatePresence, motion } from 'framer-motion'
import {
  User,
  Phone,
  MessageCircle,
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  Globe,
  BookOpen,
  BookMarked,
} from 'lucide-react'
import { JobsInputField } from './JobsInputField'

interface JobsFormStepProps {
  step: number
  form: Record<string, string>
  subjects: string[]
  inputRefs: React.MutableRefObject<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void
  onSubjectChange: (subject: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

export const JobsFormStep = ({
  step,
  form,
  subjects,
  inputRefs,
  onChange,
  onSubjectChange,
  onKeyDown,
}: JobsFormStepProps) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={step}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="space-y-5 md:space-y-6"
    >
      {step === 1 && (
        <>
          <div className="mb-4">
            <h3 className="flex items-center gap-2 font-heading text-base font-bold text-main md:text-lg">
              <User size={16} className="text-primary" /> المعلومات الشخصية
            </h3>
            <p className="mt-0.5 text-xs text-muted">البيانات الأساسية للتواصل معك</p>
          </div>
          <JobsInputField
            ref={(el) => (inputRefs.current['name'] = el)}
            icon={User}
            label="الاسم"
            name="name"
            value={form.name ?? ''}
            onChange={onChange}
            placeholder="الاسم الكامل"
            required
            autoComplete="name"
          />
          <JobsInputField
            ref={(el) => (inputRefs.current['phone'] = el)}
            icon={Phone}
            label="رقم الهاتف"
            name="phone"
            value={form.phone ?? ''}
            onChange={onChange}
            placeholder="مثال: 96512345678"
            type="tel"
            required
            inputMode="numeric"
            autoComplete="tel"
          />
          <JobsInputField
            ref={(el) => (inputRefs.current['whatsapp'] = el)}
            icon={MessageCircle}
            label="رقم واتساب"
            name="whatsapp"
            value={form.whatsapp ?? ''}
            onChange={onChange}
            placeholder="نفس الرقم أو رقم آخر"
            type="tel"
            inputMode="numeric"
          />
        </>
      )}
      {step === 2 && (
        <>
          <div className="mb-4">
            <h3 className="flex items-center gap-2 font-heading text-base font-bold text-main md:text-lg">
              <GraduationCap size={16} className="text-primary" /> المؤهلات والوظيفة
            </h3>
            <p className="mt-0.5 text-xs text-muted">مؤهلاتك العلمية والوظيفة المطلوبة</p>
          </div>
          <JobsInputField
            ref={(el) => (inputRefs.current['position'] = el)}
            icon={Briefcase}
            label="الوظيفة المطلوبة"
            name="position"
            value={form.position ?? ''}
            onChange={onChange}
            placeholder="معلمة رياضيات - معلمة لغة عربية ..."
            required
            autoComplete="organization-title"
          />
          <JobsInputField
            ref={(el) => (inputRefs.current['qualification'] = el)}
            icon={GraduationCap}
            label="المؤهل العلمي"
            name="qualification"
            value={form.qualification ?? ''}
            onChange={onChange}
            placeholder="بكالوريوس - ماجستير ..."
            required
          />
          <JobsInputField
            ref={(el) => (inputRefs.current['grade'] = el)}
            icon={Award}
            label="التقدير"
            name="grade"
            value={form.grade ?? ''}
            onChange={onChange}
            placeholder="ممتاز - جيد جداً ..."
          />
        </>
      )}
      {step === 3 && (
        <>
          <div className="mb-4">
            <h3 className="flex items-center gap-2 font-heading text-base font-bold text-main md:text-lg">
              <BookMarked size={16} className="text-primary" /> المادة التي تدرسها
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              اختياري المادة أو المواد التي تقومين بتدريسها
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {subjects.map((s) => (
              <label
                key={s}
                onClick={() => onSubjectChange(s)}
                className={`flex min-h-[60px] cursor-pointer items-center gap-3 rounded-card border p-4 transition-all md:min-h-[68px] md:p-5 ${form.subject === s ? 'border-2 border-primary bg-primary-soft' : 'border-border bg-card hover:border-border'}`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${form.subject === s ? 'border-primary' : 'border-border'}`}
                >
                  {form.subject === s && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </div>
                <span
                  className={`text-sm font-bold leading-tight ${form.subject === s ? 'text-primary' : 'text-muted'}`}
                >
                  {s}
                </span>
              </label>
            ))}
          </div>
        </>
      )}
      {step === 4 && (
        <>
          <div className="mb-4">
            <h3 className="flex items-center gap-2 font-heading text-base font-bold text-main md:text-lg">
              <Award size={16} className="text-primary" /> الخبرات
            </h3>
            <p className="mt-0.5 text-xs text-muted">خبراتك السابقة والمناهج التي درستيها</p>
          </div>
          <JobsInputField
            ref={(el) => (inputRefs.current['graduationYear'] = el)}
            icon={Calendar}
            label="سنة التخرج"
            name="graduationYear"
            value={form.graduationYear ?? ''}
            onChange={onChange}
            placeholder="مثال: 2020"
            type="number"
          />
          <JobsInputField
            ref={(el) => (inputRefs.current['onlineYears'] = el)}
            icon={Globe}
            label="سنوات الخبرة في التدريس أون لاين"
            name="onlineYears"
            value={form.onlineYears ?? ''}
            onChange={onChange}
            placeholder="عدد السنوات"
          />
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-muted">
              <BookOpen size={12} className="shrink-0 text-primary" /> المناهج التي قمت بتدريسها
            </label>
            <textarea
              ref={(el) => (inputRefs.current['curriculums'] = el)}
              name="curriculums"
              value={form.curriculums}
              onChange={onChange}
              onKeyDown={onKeyDown}
              className="min-h-[90px] w-full touch-manipulation resize-none rounded-xl border border-border bg-card p-4 text-sm text-main transition-all placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus md:min-h-[120px] md:text-base"
              placeholder="منهج كويتي - سعودي - قطري - عماني ..."
            />
          </div>
        </>
      )}
    </motion.div>
  </AnimatePresence>
)
