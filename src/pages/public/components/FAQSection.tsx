import { useState } from 'react'
import { HelpCircle, ChevronDown, Star, Heart } from 'lucide-react'

export const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  return (
    <section
      className="relative overflow-hidden bg-surface py-4 transition-colors duration-500 dark:bg-background md:py-6"
      id="faq"
    >
      <div className="pointer-events-none absolute end-0 top-0 h-64 w-64 rounded-full bg-primary/5 blur-[100px] dark:bg-primary/[0.08]" />
      <div className="pointer-events-none absolute bottom-0 start-0 h-48 w-48 rounded-full bg-success-soft blur-[80px] dark:bg-primary/[0.05]" />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] dark:opacity-[0.02]">
        <svg
          className="h-full w-full"
          viewBox="0 0 600 600"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="islamic-pattern"
              x="0"
              y="0"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="60"
                cy="60"
                r="55"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                className="text-primary dark:text-primary"
              />
              <circle
                cx="60"
                cy="60"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.6"
                className="text-primary dark:text-primary"
              />
              <circle
                cx="60"
                cy="60"
                r="25"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-primary dark:text-primary"
              />
              <polygon
                points="60,8 72,40 108,40 78,60 88,96 60,76 32,96 42,60 12,40 48,40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-primary dark:text-primary"
              />
              <polygon
                points="60,18 68,45 95,45 73,60 80,88 60,72 40,88 47,60 25,45 52,45"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.3"
                className="text-primary dark:text-primary"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
        </svg>
      </div>
      <div className="pointer-events-none absolute end-10 top-10 h-32 w-32 opacity-[0.03] dark:opacity-[0.015]">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M100 0 L122 78 L200 78 L138 128 L160 200 L100 150 L40 200 L62 128 L0 78 L78 78 Z"
            fill="currentColor"
            className="text-primary dark:text-primary"
          />
        </svg>
      </div>
      <div className="pointer-events-none absolute bottom-10 start-10 h-40 w-40 opacity-[0.025] dark:opacity-[0.01]">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M100 15 C130 15 155 40 155 70 C155 100 130 125 100 125 C70 125 45 100 45 70 C45 40 70 15 100 15 Z"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary dark:text-primary"
          />
          <path
            d="M100 35 C120 35 135 50 135 70 C135 90 120 105 100 105 C80 105 65 90 65 70 C65 50 80 35 100 35 Z"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary dark:text-primary"
          />
          <path
            d="M100 50 L110 65 L128 65 L115 78 L120 96 L100 85 L80 96 L85 78 L72 65 L90 65 Z"
            fill="currentColor"
            className="text-primary dark:text-primary"
          />
        </svg>
      </div>
      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-4 text-center md:mb-8">
          <div className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-white/50 px-2.5 py-1 shadow-elevation-1 backdrop-blur-sm dark:border-primary/40 dark:bg-primary/20">
            <HelpCircle size={12} className="text-primary dark:text-primary" />
            <span className="dark:text-soft text-micro font-black text-muted">لديك استفسار؟</span>
          </div>
          <h2 className="mb-3 font-heading text-2xl font-black text-main dark:text-main md:text-3xl">
            الأسئلة <span className="text-primary dark:text-primary">الشائعة</span>
          </h2>
          <div className="mx-auto h-1 w-16 rounded-full bg-warning dark:bg-primary"></div>
        </div>
        <div className="mx-auto max-w-2xl space-y-3">
          {[
            {
              q: 'كيف يتم الدراسة في المعهد؟',
              a: 'الدراسة تتم عن بعد عبر فصول افتراضية تفاعلية مباشرة (لايف) بين المعلم والطالب، باستخدام أحدث التقنيات لضمان جودة الصوت والصورة.',
            },
            {
              q: 'هل المناهج معتمدة؟',
              a: 'نعم، نلتزم بتدريس المناهج الحكومية المعتمدة في الكويت ودول الخليج، بالإضافة إلى مناهجنا الخاصة في التأسيس واللغات.',
            },
            {
              q: 'كيف يمكنني متابعة مستوى ابني؟',
              a: 'نقوم بإرسال تقارير دورية ومفصلة لولي الأمر عبر الواتساب، تشمل مستوى الطالب، الحضور والغياب، وملاحظات المعلم.',
            },
            {
              q: 'هل توجد حصص تجريبية؟',
              a: 'نعم، نقدم حصة تجريبية مجانية لتقييم مستوى الطالب والتعرف على طريقة التدريس قبل الاشتراك الفعلي.',
            },
            {
              q: 'ما هي المواد التي تقدّمون فيها دروساً خصوصية؟',
              a: 'نقدم دروساً خصوصية في جميع المواد الأساسية: الرياضيات، العلوم، الفيزياء، الكيمياء، الأحياء، اللغة العربية، اللغة الإنجليزية، والتربية الإسلامية. جميع الدروس تقدم أونلاين وفق المناهج السعودية والكويتية والإماراتية والقطرية والعمانية والبحرينية.',
            },
            {
              q: 'هل تناسبكم جميع المراحل الدراسية؟',
              a: 'نعم، برامجنا مصممة لجميع المراحل: الابتدائي (تأسيس في القراءة والكتابة والحساب)، المتوسط (تقوية في جميع المواد)، والثانوي (مراجعات واختبارات قدرات وتحصيلي). لدينا معلمون متخصصون لكل مرحلة دراسية.',
            },
            {
              q: 'ما هي الدول التي تغطيها خدماتكم التعليمية؟',
              a: 'نخدم طلابنا في المملكة العربية السعودية، الكويت، الإمارات، قطر، سلطنة عمان، ومملكة البحرين. كما نقدم خدماتنا للطلاب في الأردن ومصر. جميع معلمينا على دراية كاملة بالمناهج الدراسية في كل دولة.',
            },
          ].map((item, idx) => {
            const icons = [
              <HelpCircle size={80} />,
              <Star size={80} />,
              <Heart size={80} />,
              <HelpCircle size={80} />,
            ]
            const isOpen = openIdx === idx
            return (
              <div
                key={idx}
                className="dark: group relative overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-500 hover:border-primary hover:shadow-elevation-2 hover:shadow-primary/5 dark:border-primary/30 dark:bg-card dark:hover:border-accent"
              >
                <div className="pointer-events-none absolute -bottom-4 -end-4 text-muted opacity-[0.03] transition-all duration-700 group-hover:rotate-12 group-hover:opacity-[0.06] dark:text-primary dark:opacity-[0.05]">
                  {icons[idx % icons.length]}
                </div>
                <div className="pointer-events-none absolute start-0 top-0 h-24 w-24 bg-primary/5 opacity-0 blur-2xl transition-opacity group-hover:opacity-100 dark:bg-primary/10"></div>
                <div className="relative z-10">
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="flex w-full cursor-pointer items-center justify-between p-4 text-start"
                    aria-expanded={isOpen}
                  >
                    <h3 className="text-xs font-black text-main transition-colors group-hover:text-primary dark:text-main dark:group-hover:text-accent md:text-sm">
                      {item.q}
                    </h3>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border border-border bg-primary-soft transition-all duration-300 dark:border-primary/40 dark:bg-primary/20 ${isOpen ? 'rotate-180' : ''}`}
                    >
                      <ChevronDown size={14} className="text-primary dark:text-primary" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="mb-3 h-px w-full bg-gradient-to-r from-primary/10 via-surface to-transparent dark:via-primary/20"></div>
                      <p className="text-micro font-medium leading-relaxed text-main dark:text-muted md:text-xs">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
