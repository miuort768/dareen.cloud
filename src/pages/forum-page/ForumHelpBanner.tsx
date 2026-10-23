import { useDialogFocus } from '../../shared/hooks/useDialogFocus'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useCurrentUser } from '../../context/AppContext'
import { Scale, ShieldCheck, Heart, Sparkles, GraduationCap, X, Check, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type RoleTone = 'primary' | 'success' | 'error' | 'info'

const TONE: Record<
  RoleTone,
  {
    solid: string
    hover: string
    soft: string
    text: string
    borderStart: string
  }
> = {
  primary: {
    solid: 'bg-primary text-on-primary',
    hover: 'hover:bg-primary-hover',
    soft: 'bg-primary-soft',
    text: 'text-primary',
    borderStart: 'border-s-primary',
  },
  success: {
    solid: 'bg-success text-on-success',
    hover: 'hover:bg-success-hover',
    soft: 'bg-success-soft',
    text: 'text-success-strong',
    borderStart: 'border-s-success',
  },
  error: {
    solid: 'bg-error text-on-error',
    hover: 'hover:bg-error-hover',
    soft: 'bg-error-soft',
    text: 'text-error-strong',
    borderStart: 'border-s-error',
  },
  info: {
    solid: 'bg-info text-on-info',
    hover: 'hover:bg-info-hover',
    soft: 'bg-info-soft',
    text: 'text-info-strong',
    borderStart: 'border-s-info',
  },
}

export const ForumHelpBanner = () => {
  const currentUser = useCurrentUser()
  const role = currentUser?.role || 'student'
  const [showModal, setShowModal] = useState(false)

  const { containerRef, handleKeyDown } = useDialogFocus(showModal, () => setShowModal(false))

  const getRoleRules = (): {
    roleTitle: string
    tone: RoleTone
    icon: typeof Heart
    rules: string[]
  } => {
    switch (role) {
      case 'parent':
        return {
          roleTitle: 'شريك النجاح (ولي الأمر)',
          tone: 'primary',
          icon: Heart,
          rules: [
            'متابعة الاستفسارات الخاصة بالتحصيل الأكاديمي للأبناء بأسلوب راقٍ ومباشر.',
            'التواصل الفعال والمحترم مع الكادر التعليمي في البيئة التعليمية.',
            'طرح الاقتراحات البناءة والحلول التي تساهم في تطوير بيئة التعلم.',
            'الالتزام بالخصوصية وعدم نشر أي بيانات شخصية تخص الطلاب أو المعلمات.',
          ],
        }
      case 'teacher':
        return {
          roleTitle: 'المعلمة',
          tone: 'success',
          icon: ShieldCheck,
          rules: [
            'توجيه ونصح الطلاب برفق وإيجابية وتحفيزهم على التفاعل والمشاركة.',
            'مشاركة الوسائل والأفكار التعليمية المبتكرة والنافعة.',
            'الرد على استفسارات الطلاب وأولياء الأمور باحترافية وأسلوب تربوي.',
            'الحفاظ على بيئة مناقشة آمنة وإيجابية تشجع على الإبداع.',
          ],
        }
      case 'admin':
        return {
          roleTitle: 'مدير النظام',
          tone: 'error',
          icon: Sparkles,
          rules: [
            'الإشراف العام على جودة المحتوى والمناقشات في المنتدى.',
            'مراجعة البلاغات والتأكد من ملاءمة المشاركات للسياسات العامة.',
            'تعديل وإدارة المحتوى والتعليقات لضمان انضباط المنتدى.',
            'تقديم الدعم الكامل لجميع أطراف العملية التعليمية.',
          ],
        }
      default:
        return {
          roleTitle: 'الطالب / الطالبة',
          tone: 'info',
          icon: GraduationCap,
          rules: [
            'الالتزام بالأدب والاحترام في التعامل مع المعلمات والزملاء.',
            'طرح الأسئلة والاستفسارات الأكاديمية والتعليمية المفيدة.',
            'عدم مشاركة المعلومات الشخصية أو الحسابات الخارجية.',
            'المشاركة الإيجابية والمناقشة البناءة في الموضوعات المطروحة.',
          ],
        }
    }
  }

  const currentRules = getRoleRules()
  const tone = TONE[currentRules.tone]
  const Icon = currentRules.icon

  return (
    <>
      <div className="mx-auto mb-6 mt-6 max-w-[700px] px-4">
        <div
          className={`relative overflow-hidden rounded-3xl border border-white/10 p-4 shadow-elevation-2 sm:p-5 ${tone.solid}`}
        >
          <div
            className="pointer-events-none absolute -end-10 -top-12 h-32 w-32 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-16 -start-10 h-40 w-40 rounded-full bg-white/5"
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex w-full items-start gap-3.5 text-start sm:w-auto sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                <Scale size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-black">قواعد وإرشادات المنتدى</h4>
                  <span className="rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-micro font-bold backdrop-blur-sm">
                    خاص بـ {currentRules.roleTitle}
                  </span>
                </div>
                <p className="text-[11px] font-medium leading-tight opacity-80 sm:text-xs">
                  قواعد مخصصة لدورك في المنصة لضمان بيئة آمنة ومثمرة
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-full shrink-0 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-center text-xs font-black shadow-elevation-1 outline-none backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60 active:scale-95 sm:w-auto sm:px-5"
            >
              عرض القواعد والتعليمات
            </button>
          </div>
        </div>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {showModal && (
              <div
                className="fixed inset-0 z-[300] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowModal(false)
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 24 }}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="forum-rules-title"
                  aria-describedby="forum-rules-description"
                  ref={containerRef}
                  onKeyDown={handleKeyDown}
                  className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-b-none rounded-t-3xl border border-border bg-surface shadow-elevation-3 sm:rounded-3xl"
                  dir="rtl"
                >
                  <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden" />

                  <div className={`relative shrink-0 overflow-hidden p-4 sm:p-5 ${tone.solid}`}>
                    <div
                      className="pointer-events-none absolute -end-8 -top-10 h-28 w-28 rounded-full border border-white/15"
                      aria-hidden="true"
                    />
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                          <Icon size={21} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black tracking-wide opacity-70">
                            دليل المشاركة
                          </p>
                          <h3 id="forum-rules-title" className="text-base font-black sm:text-lg">
                            إرشادات وقواعد {currentRules.roleTitle}
                          </h3>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowModal(false)}
                        data-autofocus
                        aria-label="إغلاق النافذة"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 outline-none transition-colors duration-fast hover:border-error hover:bg-error hover:text-on-error focus-visible:ring-2 focus-visible:ring-white/60"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
                    <p
                      id="forum-rules-description"
                      className="text-xs font-bold leading-relaxed text-muted"
                    >
                      عزيزي/عزيزتي {currentRules.roleTitle}، نرجو الالتزام بالقواعد التالية لضمان
                      تجربة تعليمية راقية ومثمرة:
                    </p>

                    <div className="flex items-start gap-2.5 rounded-2xl border border-warning-soft bg-warning-soft p-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warning text-on-warning">
                        <Info size={14} />
                      </div>
                      <p className="text-[11px] font-bold leading-relaxed text-warning-strong">
                        ملاحظة: البلاغات تُراجع من إدارة الأكاديمية، وقد يُحذف المحتوى المخالف بعد
                        المراجعة.
                      </p>
                    </div>

                    <ul className="space-y-2">
                      {currentRules.rules.map((rule, index) => (
                        <li
                          key={index}
                          className={`flex items-start gap-3 rounded-2xl border border-s-4 border-border bg-background p-3 ${tone.borderStart}`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[11px] font-black ${tone.solid}`}
                          >
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold leading-relaxed text-main sm:text-sm">
                            {rule}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="shrink-0 border-t border-border bg-surface p-4 sm:p-5">
                    <button
                      onClick={() => setShowModal(false)}
                      className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-xs font-black shadow-elevation-1 outline-none transition-all hover:-translate-y-0.5 hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-95 sm:text-sm ${tone.solid} ${tone.hover}`}
                    >
                      <Check size={16} />
                      فهمت وأوافق على الإرشادات
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
