import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  VCodeBracket,
  VTargetArrow,
  VHeart,
  VChatBubble,
  VTelegram,
  VAward,
  VStar,
  VSparkles,
  VRocket,
  VBolt,
} from '../components/vectors'
import { useSettingsStore } from '../store/settingsStore'
import { MobileHeader } from '../components/public/MobileHeader'
import { PublicFooter } from '../components/public/PublicFooter'

export const AAbdullah = () => {
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  const telegramHandle = useSettingsStore((s) => s.telegramHandle)

  useEffect(() => {
    document.title = 'مستر احمد عبدالله'
    const handler = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const tgHandle = typeof telegramHandle === 'string' ? telegramHandle : ''

  const values = [
    { icon: VAward, title: 'الجودة', desc: 'نقدم الأفضل دايماً', bgClass: 'bg-primary' },
    { icon: VSparkles, title: 'المتعة', desc: 'التعليم مو ممل', bgClass: 'bg-success' },
    { icon: VStar, title: 'الفائدة', desc: 'كل دقيقة تفرق', bgClass: 'bg-accent' },
    { icon: VCodeBracket, title: 'الابتكار', desc: 'إبداعنا ما له حدود', bgClass: 'bg-info' },
    { icon: VHeart, title: 'خدمة عملائنا', desc: 'هم أساس كل شي', bgClass: 'bg-success' },
    { icon: VTargetArrow, title: 'التميز', desc: 'نسعى للأفضل دايماً', bgClass: 'bg-primary' },
  ]

  const cardClass =
    'bg-card rounded-3xl p-6 md:p-8 shadow-elevation-1 border border-border space-y-4'
  const sectionDelay = (i: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.1 },
  })

  return (
    <div className="min-h-screen bg-surface dark:bg-background" dir="rtl">
      <style>{`@media print { body { display: none !important; } }`}</style>
      <MobileHeader />

      <div className="mx-auto max-w-4xl space-y-6 px-2.5 pb-4 pt-4 sm:px-4 md:pt-36">
        {/* ═══════════════ HERO ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 md:flex-row md:items-center"
        >
          <div className="flex flex-row items-center justify-center gap-2.5 md:justify-start md:gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-elevation-4 shadow-primary/40 md:h-16 md:w-16">
              <VCodeBracket size={22} className="text-on-primary" />
            </div>
            <div className="text-start">
              <h1 className="text-xl font-bold leading-tight text-primary md:text-3xl">
                مستر احمد عبدالله
              </h1>
              <p className="mt-px text-micro font-bold leading-tight text-success md:text-base">
                مؤسس منصة دارين السابعة
              </p>
            </div>
          </div>
          <div className="flex justify-center gap-3 md:ms-auto md:justify-end">
            <a
              href={`https://wa.me/${adminPhone?.replace(/\D/g, '') || '965000000000'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-success px-5 py-2.5 text-sm font-bold text-on-success shadow-elevation-3 outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus active:scale-95 md:gap-3 md:px-8 md:py-3.5 md:text-lg"
            >
              <VChatBubble size={16} />
              واتساب
            </a>
            <a
              href={tgHandle.startsWith('http') ? tgHandle : `https://t.me/${tgHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-elevation-3 outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus active:scale-95 md:gap-3 md:px-8 md:py-3.5 md:text-lg"
            >
              <VTelegram size={16} />
              تيليجرام
            </a>
          </div>
        </motion.div>

        {/* ═══════════════ نبدة تعريفية ═══════════════ */}
        <motion.div
          {...sectionDelay(1)}
          className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-elevation-1 md:p-8"
        >
          <div className="pointer-events-none absolute -end-12 -top-12 h-32 w-32 rounded-full bg-primary-soft blur-2xl" />
          <div className="relative">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-elevation-3 shadow-primary/30">
                <VRocket size={20} className="text-on-primary" />
              </div>
              <h2 className="text-lg font-bold text-main">نبدة تعريفية</h2>
              <VBolt size={16} className="text-accent" />
            </div>
            <p className="text-sm leading-relaxed text-muted">
              خريج كلية التربية — جامعة الأزهر. مدرس عشق البرمجة، ومؤمن إن التكنولوجيا هي المفتاح
              لتطوير التعليم العربي وتخليه أكثر متعة وفايدة.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold text-primary">
                <VAward size={12} /> مؤسس منصة دارين السابعة
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-[11px] font-bold text-success">
                <VCodeBracket size={12} /> مدرس برمجة
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-bold text-accent">
                <VStar size={12} /> خريج جامعة الأزهر
              </span>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════ الرؤية ═══════════════ */}
        <motion.div
          {...sectionDelay(2)}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-active p-6 text-main shadow-elevation-4 md:p-8"
        >
          <div className="absolute left-[-30px] top-[-30px] h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute bottom-[-20px] right-[30%] h-24 w-24 rounded-full bg-white/10" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <VTargetArrow size={20} className="text-on-primary" />
              </div>
              <h2 className="text-lg font-semibold text-on-primary">الرؤية</h2>
            </div>
            <p className="text-sm leading-relaxed text-on-primary">
              "دارين السابعة مو مجرد منصة، هي أداة تساعد الطلاب وأولياء الأمور. هدفنا إنا نصير أكبر
              منصة تعليمية عربية نقدم محتوى مفيد وممتع، وتساعد في بناء جيل واعي ومتعلم."
            </p>
          </div>
        </motion.div>

        {/* ═══════════════ القيم ═══════════════ */}
        <motion.div {...sectionDelay(3)} className="space-y-4">
          <h2 className="text-xl font-bold text-primary">القيم</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <div
                  key={`item-${i}`}
                  className="space-y-2 rounded-2xl border border-divider bg-card p-4 text-center shadow-elevation-1"
                >
                  <div
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${v.bgClass}`}
                  >
                    <Icon size={18} className="text-on-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-main">{v.title}</h3>
                  <p className="text-xs text-muted">{v.desc}</p>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* ═══════════════ رسالة إلى أولياء الأمور والمعلمين ═══════════════ */}
        <motion.div
          {...sectionDelay(4)}
          className="space-y-4 rounded-none border-s-4 border-accent bg-card p-6 shadow-elevation-1 md:p-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
              <VHeart size={20} className="text-accent" />
            </div>
            <h2 className="text-lg font-semibold text-primary">
              رسالة إلى أولياء الأمور والمعلمين
            </h2>
          </div>
          <div className="space-y-3 ps-4">
            <p className="text-sm leading-relaxed text-muted">"الإتقان أساس النجاح والتطوير.</p>
            <p className="text-sm leading-relaxed text-muted">
              الإنسان لازم يبدي بأفضل ما عنده، مع التوكل على الله أول وأخير، ويلتزم بالأخلاق في كل
              خطوة.
            </p>
            <p className="text-sm leading-relaxed text-muted">
              لأن النجاح الحقيقي مو بس في النتيجة، لكن في الطريق والأخلاق اللي نمشي فيها."
            </p>
          </div>
        </motion.div>

        {/* ═══════════════ ما هي منصة دارين السابعة ═══════════════ */}
        <motion.div {...sectionDelay(4.5)} className={cardClass}>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-primary">ما هي منصة دارين السابعة؟</h2>
            <VRocket size={18} className="inline text-success" />
          </div>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-muted">
              دارين السابعة هي منصة تعليمية أونلاين متخصصة في التعليم الإلكتروني والتعليم عن بعد،
              تقدم للطلاب في الكويت والسعودية والإمارات وقطر والبحرين وعُمان تجربة تعليمية متكاملة
              تساعدهم على فهم المناهج الدراسية وتحسين مستواهم الأكاديمي.
            </p>
            <p className="text-sm leading-relaxed text-muted">
              توفر منصة دارين السابعة التعليمية دروس أونلاين، شرح المناهج، مراجعات دراسية، اختبارات
              إلكترونية، مذكرات وملخصات دراسية، بالإضافة إلى حل الكتب والواجبات، لتساعد الطلاب وولي
              الأمر على الوصول إلى محتوى تعليمي منظم وسهل في أي وقت ومن أي مكان.
            </p>
            <p className="text-sm leading-relaxed text-muted">
              سواء كنت تبحث عن منصة تعليمية في الكويت، منصة تعليمية في السعودية، منصة تعليمية في
              الإمارات، منصة تعليمية في قطر، منصة تعليمية في البحرين أو منصة تعليمية في عُمان، توفر
              دارين السابعة محتوى تعليميًا مصممًا لمساعدة الطلاب على الدراسة والمراجعة والاستعداد
              للاختبارات.
            </p>
            <p className="text-sm leading-relaxed text-muted">
              مع دارين السابعة يصبح التعلم أونلاين أكثر سهولة وتنظيمًا، من خلال محتوى تعليمي متنوع
              يناسب المراحل الدراسية المختلفة، ويساعد الطلاب على المذاكرة، فهم الدروس، مراجعة
              المواد، وحل الكتب والاختبارات.
            </p>
            <p className="text-sm font-bold text-primary">
              دارين السابعة – منصة تعليمية أونلاين للطلاب في الخليج.
            </p>
          </div>
        </motion.div>

        {/* ═══════════════ رسالتي لكم ═══════════════ */}
        <motion.div
          {...sectionDelay(5)}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-active p-6 text-main shadow-elevation-4 md:p-8"
        >
          <div className="absolute right-[-40px] top-[-40px] h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute bottom-[-30px] left-[20%] h-36 w-36 rounded-full bg-white/10" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-xs font-bold tracking-wide text-on-primary backdrop-blur-sm">
              <VHeart size={14} className="fill-current text-on-primary" />
              <span>رسالتي لكم</span>
              <VHeart size={14} className="fill-current text-on-primary" />
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-on-primary">
              <p>كن إيجابيًا، واجعل الاجتهاد طريقك إلى النجاح.</p>
              <p>
                الحياة لا تمنح الفرص لمن ينتظر، بل لمن يسعى ويجتهد. قد تواجه صعوبات وعقبات، لكن
                تذكّر أن كل تحدٍ هو خطوة نحو القوة والخبرة. حافظ على تفكيرك الإيجابي، فالإيجابية
                تمنحك الأمل، والأمل يمنحك الدافع للاستمرار.
              </p>
              <p>
                اجتهد في عملك، وأخلص فيما تقوم به، ولا تقارن بدايتك بنهاية الآخرين. فالنجاح الحقيقي
                هو أن تصبح اليوم أفضل مما كنت عليه بالأمس. ثق بقدراتك، وواصل التعلم، ولا تجعل الفشل
                يوقفك، بل اجعله درسًا يقودك إلى النجاح.
              </p>
              <p>
                ابدأ يومك بابتسامة، واعمل بإصرار، وتحلَّ بالصبر، فكل جهد تبذله اليوم سيكون ثمرةً
                تفتخر بها غدًا.
              </p>
              <p className="font-black text-on-primary">
                تذكّر دائمًا: الإيجابية تصنع العقلية، والاجتهاد يصنع الإنجاز، والاستمرار يصنع
                النجاح.
              </p>
            </div>
            <div className="h-0.5 w-16 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </div>

      {/* Hidden SEO Keywords — visible to search engines only */}
      <div className="sr-only" aria-hidden="true">
        <p>
          احمد عبدالله سيد - احمد عبدالله فرحات - استاذ احمد عبدالله سيد - احمد عبدالله موسس دارين
          السابعة - الازهري احمد عبدالله سيد - مستر احمد عبدالله سيد - الباش مدرس احمد عبدالله سيد -
          احمد عبدالله سيد محمد فرحات - دارين السابعة - منصة دارين السابعة
        </p>
      </div>

      <PublicFooter />
    </div>
  )
}

export default AAbdullah
