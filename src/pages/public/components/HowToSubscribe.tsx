import { useState, useEffect } from 'react'
import {
  Zap,
  Users,
  Star,
  Sparkles,
  ArrowLeft,
  Wifi,
  Battery,
  Signal,
  Heart,
  Gift,
  CreditCard,
  Clock,
  Hash,
} from 'lucide-react'

interface HowToSubscribeProps {
  whatsappNumber: string
}

export const HowToSubscribe = ({ whatsappNumber }: HowToSubscribeProps) => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Cairo',
    })

  const steps = [
    {
      num: '01',
      icon: Users,
      title: 'اختر المنهج',
      desc: 'حدد منهجك والمادة',
      boxBg: 'bg-gradient-to-br from-primary to-primary-hover dark:from-primary dark:to-warning',
    },
    {
      num: '02',
      icon: Star,
      title: 'حصة مجانية',
      desc: 'حصة تجريبية مجانية لك',
      boxBg: 'bg-success dark:bg-primary',
    },
    {
      num: '03',
      icon: Sparkles,
      title: 'اشترك الآن',
      desc: 'تواصل لحجز مقعدك',
      boxBg: 'bg-gradient-to-br from-primary to-primary-hover dark:from-primary dark:to-warning',
    },
  ]

  return (
    <section className="relative overflow-hidden rounded-3xl bg-surface shadow-inner dark:bg-background">
      <div className="pointer-events-none absolute -start-20 top-20 h-60 w-60 rounded-full bg-accent-soft blur-[100px] dark:bg-primary/[0.08]" />
      <div className="pointer-events-none absolute -end-20 bottom-40 h-72 w-72 rounded-full bg-primary/10 blur-[120px] dark:bg-primary/[0.05]" />

      <div className="relative z-10 px-4 py-6">
        <div className="mb-6 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-primary dark:text-primary">
              {formatTime(time)}
            </span>
            <span className="text-micro font-bold text-muted dark:text-muted">
              بتوقيت أم الدنيا
            </span>
            <Heart className="h-4 w-4 fill-error text-error" />
          </div>
          <div className="flex items-center gap-1.5">
            <Signal size={14} className="text-muted dark:text-muted" />
            <Wifi size={14} className="text-muted dark:text-muted" />
            <Battery size={16} className="text-muted dark:text-muted" />
          </div>
        </div>

        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-primary to-primary-hover px-4 py-1.5 shadow-sm dark:from-primary dark:to-warning">
          <Zap
            size={10}
            className="fill-warning text-warning dark:fill-on-primary dark:text-on-primary"
          />
          <span className="text-micro font-black text-on-primary dark:text-on-primary">
            حصتك المجانية بانتظارك
          </span>
        </div>

        <h2 className="mb-1 text-xl font-black leading-tight text-main dark:text-main">
          كيف تشترك في{' '}
          <span className="bg-gradient-to-l from-primary to-primary-hover bg-clip-text text-transparent dark:from-primary dark:to-warning">
            المعهد؟
          </span>
        </h2>
        <p className="mb-5 text-xs font-medium leading-relaxed text-muted dark:text-muted">
          اختر الطريقة التي تناسبك وابدأ رحلتك التعليمية معنا
        </p>

        <div className="mb-6 grid grid-cols-3 gap-2.5">
          {steps.map((s, i) => (
            <div
              key={`step-${i}`}
              className="relative flex flex-col items-center rounded-2xl border border-border bg-card p-3.5 text-center shadow-sm dark:border-primary/30 dark:bg-card"
            >
              <div className="absolute -start-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-md dark:bg-primary">
                <span className="text-micro font-black text-on-primary dark:text-on-primary">
                  {s.num}
                </span>
              </div>
              <div
                className={`h-10 w-10 rounded-xl ${s.boxBg} mb-2.5 flex items-center justify-center shadow-md`}
              >
                <s.icon size={18} className="text-on-primary dark:text-on-primary" />
              </div>
              <h3 className="mb-0.5 text-xs font-black text-main dark:text-main">{s.title}</h3>
              <p className="text-micro font-medium leading-tight text-main dark:text-muted">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-6 space-y-3 px-1 md:hidden">
          {[
            { icon: 'CreditCard', title: 'الدفع وتحصيل الاشتراك', desc: 'بوسائل دفع محلية مناسبة' },
            { icon: 'Clock', title: 'مواعيد مرنة', desc: 'في الوقت المناسب لك' },
            { icon: 'Hash', title: 'عدد الحصص', desc: 'بالقدر المناسب لك' },
          ].map((item, i) => (
            <div key={`perk-${i}`} className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover shadow-sm dark:from-primary dark:to-warning">
                {item.icon === 'CreditCard' && (
                  <CreditCard size={12} className="text-on-primary dark:text-on-primary" />
                )}
                {item.icon === 'Clock' && (
                  <Clock size={12} className="text-on-primary dark:text-on-primary" />
                )}
                {item.icon === 'Hash' && (
                  <Hash size={12} className="text-on-primary dark:text-on-primary" />
                )}
              </div>
              <div>
                <span className="text-xs font-black text-main dark:text-main">{item.title}</span>
                <p className="text-micro text-muted dark:text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة تجريبية مجانية')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-primary to-primary-hover px-6 py-4 shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-110 dark:from-primary dark:to-warning dark:shadow-primary/20"
        >
          <Gift size={16} className="text-on-primary opacity-90 dark:text-on-primary" />
          <span className="text-sm font-black text-on-primary dark:text-on-primary">
            احجز حصتك المجانية الآن
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all group-hover:bg-white/30 dark:bg-black/20 dark:group-hover:bg-black/30">
            <ArrowLeft size={16} className="text-on-primary dark:text-on-primary" />
          </div>
        </a>
      </div>
    </section>
  )
}
