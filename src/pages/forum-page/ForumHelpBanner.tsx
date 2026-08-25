import { useState, useEffect } from 'react'
import { useCurrentUser } from '../../context/AppContext'
import { Scale, ShieldCheck, Heart, Sparkles, GraduationCap, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export const ForumHelpBanner = () => {
  const currentUser = useCurrentUser()
  const role = currentUser?.role || 'student'
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!showModal) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [showModal])

  const getRoleRules = () => {
    switch (role) {
      case 'parent':
        return {
          roleTitle: 'شريك النجاح (ولي الأمر)',
          badgeClass: 'bg-primary/10 text-primary border-primary/30',
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
          badgeClass: 'bg-success-soft text-success border-success-soft',
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
          badgeClass: 'bg-error-soft text-error border-error-soft',
          icon: Sparkles,
          rules: [
            'الإشراف العام على جودة المحتوى والمناقشات في المنتدى.',
            'مراجعة البلاغات والتأكد من ملاءمة المشاركات للسياسات العامية.',
            'تعديل وإدارة المحتوى والتعليقات لضمان انضباط المنتدى.',
            'تقديم الدعم الكامل لجميع أطراف العملية التعليمية.',
          ],
        }
      default: // student
        return {
          roleTitle: 'الطالب / الطالبة',
          badgeClass: 'bg-info-soft text-info border-info-soft',
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
  const Icon = currentRules.icon

  return (
    <div className="mx-auto mb-6 mt-6 max-w-[700px] px-4">
      <div className="flex flex-col items-center justify-between gap-4 rounded-card border border-border bg-card p-4 sm:flex-row sm:p-5">
        <div className="flex w-full items-start gap-3.5 text-start sm:w-auto sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-primary-soft text-primary sm:h-11 sm:w-11">
            <Scale size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h4 className="text-xs font-bold text-main sm:text-sm">قواعد وإرشادات المنتدى</h4>
              <span
                className={`rounded-card border px-2 py-0.5 text-micro font-bold ${currentRules.badgeClass}`}
              >
                خاص بـ {currentRules.roleTitle}
              </span>
            </div>
            <p className="truncate text-micro font-medium leading-tight text-muted sm:text-xs">
              قواعد مخصصة لدورك في المنصة لضمان بيئة آمنة ومثمرة
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full shrink-0 rounded-card bg-primary px-4 py-2.5 text-center text-xs font-bold text-on-primary transition-colors duration-fast hover:bg-primary-hover active:scale-95 sm:w-auto sm:px-5"
        >
          عرض القواعد والتعليمات
        </button>
      </div>

      {/* Rules Modal */}
      <AnimatePresence>
        {showModal && (
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="forum-rules-title"
              className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-card border border-border bg-card shadow-elevation-3"
              dir="rtl"
            >
              <div className="flex shrink-0 items-center justify-between bg-primary p-4 text-on-primary sm:p-5">
                <div className="flex items-center gap-2.5">
                  <Icon size={20} />
                  <h3 id="forum-rules-title" className="text-xs font-bold sm:text-sm">
                    إرشادات وقواعد {currentRules.roleTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  autoFocus
                  aria-label="إغلاق النافذة"
                  className="flex h-7 w-7 items-center justify-center rounded-card bg-white/10 transition-colors duration-fast hover:bg-error"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                <p className="text-xs font-bold leading-relaxed text-muted">
                  عزيزي/عزيزتي {currentRules.roleTitle}، نرجو الالتزام بالقواعد التالية لضمان تجربة
                  تعليمية راقية ومثمرة:
                </p>
                <ul className="space-y-2.5">
                  {currentRules.rules.map((rule, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 rounded-card border border-border bg-surface p-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-card bg-primary-soft text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold leading-relaxed text-main">
                        {rule}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-4 w-full rounded-card bg-primary py-3 text-xs font-bold text-on-primary transition-colors duration-fast hover:bg-primary-hover active:scale-95"
                >
                  فهمت وأوافق على الإرشادات
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
