import { motion } from 'framer-motion';
import { ShieldCheck, Lightbulb, Heart, Star, Users, Award, ArrowLeft } from 'lucide-react';

const features = [
  {
    title: 'نتائج مضمونة',
    desc: 'متابعة دقيقة مع تقارير أسبوعية لتحسين مستوى الطالب.',
    variant: 'success' as const,
  },
  {
    title: 'طرق تعليم مبتكرة',
    desc: 'دروس خصوصية تفاعلية للمناهج الخليجية تنمي مهارات الفهم والتفكير الإبداعي.',
    variant: 'primary' as const,
  },
  {
    title: 'بيئة آمنة ومحفزة',
    desc: 'فصول افتراضية آمنة لدروس التقوية أونلاين مع نخبة معلمي الرياضيات والعلوم واللغة العربية.',
    variant: 'accent' as const,
    ribbon: true,
  },
];

const variantClasses: Record<string, { icon: string; bg: string }> = {
  success: { icon: 'text-success', bg: 'bg-success-soft' },
  primary: { icon: 'text-primary', bg: 'bg-primary-soft' },
  accent: { icon: 'text-accent', bg: 'bg-accent-soft' },
};

const featureIcons = [ShieldCheck, Lightbulb, Heart];

export const WhyChooseUs = () => {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-card pt-4 md:pt-10 pb-0">
      {/* Neon glow decorations */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/5 dark:bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 dark:bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-2xl md:text-5xl font-heading font-black mb-3 md:mb-4 flex items-center justify-center gap-2">
            <span>لماذا{' '}</span>
            <span className="px-4 py-1.5 rounded-full bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary-hover)] text-on-primary text-xl md:text-4xl inline-block">
              تختارنا؟
            </span>
          </h2>
          <p className="text-muted text-sm md:text-base lg:text-xs max-w-4xl mx-auto leading-relaxed font-medium">
            <span className="hidden md:inline">أفضل منصة تعليم عن بعد في السعودية، الكويت، الإمارات، قطر وعمان والبحرين.<br />دروس خصوصية، قدرات وتحصيلي، تحفيظ قرآن، وتأسيس للمناهج الخليجية مع نخبة المعلمين.</span>
            <span className="md:hidden">أفضل منصة تعليم عن بعد في السعودية، الكويت، الإمارات، قطر وعمان والبحرين. دروس خصوصية، قدرات وتحصيلي، تحفيظ قرآن، وتأسيس للمناهج الخليجية مع نخبة المعلمين.</span>
          </p>
        </div>

        {/* ─── Mobile Layout ─── */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="md:hidden space-y-4">
          {features.map((f, i) => {
            const Icon = featureIcons[i];
            const vc = variantClasses[f.variant];
            return (
              <motion.div key={f.title} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="relative flex items-center gap-4 p-4 bg-white/80 dark:bg-primary/80 backdrop-blur-sm rounded-2xl border border-border shadow-sm">
                {f.ribbon && (
                  <div className="absolute -top-2 -left-2 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary-hover)] text-on-primary text-[7px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Star size={8} className="fill-warning text-warning" />
                    الأكثر تميزاً
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl ${vc.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={vc.icon} size={22} />
                </div>
                <div>
                  <h3 className={`text-sm font-black ${vc.icon}`}>{f.title}</h3>
                  <p className="text-[10px] text-muted font-medium leading-relaxed mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}

          {/* Showcase card (mobile) */}
          <div className="mt-6 p-5 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary-hover)] rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/10 rounded-full mb-3">
                <Star size={12} className="text-warning" />
                <span className="text-[9px] font-bold text-on-primary opacity-80">التميز التعليمي</span>
              </div>
              <h3 className="text-lg font-black text-on-primary font-heading mb-2">بيئة تعليمية متطورة</h3>
              <p className="text-[9px] text-on-primary opacity-70 leading-relaxed mb-4 max-w-xs mx-auto font-medium">
                نخبة من المعلمين المتخصصين في تدريس المناهج الكويتية والخليجية لضمان تفوق طفلك في الرياضيات والعلوم واللغات.
              </p>
              <a
                href="https://wa.me/96500000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-white/15 dark:bg-white/15 backdrop-blur-sm text-on-primary text-[11px] font-bold px-5 py-2.5 rounded-xl shadow-lg hover:bg-white/25 transition-all active:scale-[0.98]"
              >
                ابدأ رحلة التميز الآن
                <ArrowLeft size={14} />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                <Star size={16} className="text-warning mx-auto mb-1" />
                <div className="text-lg font-black text-on-primary">10+</div>
                <div className="text-[9px] text-on-primary opacity-50 font-bold">سنوات خبرة</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                <Users size={16} className="text-info mx-auto mb-1" />
                <div className="text-lg font-black text-on-primary">70+</div>
                <div className="text-[9px] text-on-primary opacity-50 font-bold">معلم خبير</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Desktop Layout ─── */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="hidden md:grid grid-cols-3 gap-4 max-w-6xl mx-auto pb-4 md:pb-6">
          {features.map((f, i) => {
            const Icon = featureIcons[i];
            const vc = variantClasses[f.variant];
            return (
              <motion.div key={f.title} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5 }} className="relative p-6 bg-card rounded-2xl shadow-sm border border-border flex items-start gap-4 group hover:shadow-md transition-all">
                {f.ribbon && (
                  <div className="absolute -top-2 -left-2 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary-hover)] text-on-primary text-[7px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Star size={8} className="fill-warning text-warning" />
                    الأكثر تميزاً
                  </div>
                )}
                <div className={`w-14 h-14 rounded-2xl ${vc.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={vc.icon} size={24} />
                </div>
                <div>
                  <h3 className={`text-base font-black ${vc.icon} mb-1`}>{f.title}</h3>
                  <p className="text-xs text-muted leading-relaxed font-medium">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}

          <div className="md:col-span-3 p-6 md:p-8 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary-hover)] rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-on-primary opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-on-primary opacity-5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-1 text-center lg:text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 border border-white/20 rounded-full mb-3 mx-auto lg:mx-0">
                  <Award size={16} className="text-warning" />
                  <span className="text-xs font-bold text-on-primary opacity-90">التميز التعليمي</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-2 font-heading text-on-primary">بيئة تعليمية متطورة</h3>
                <p className="text-on-primary opacity-80 text-xs md:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">نخبة من المعلمين المبدعين لتدريس المناهج الكويتية والخليجية. تعليم عن بعد، تحفيظ قرآن، وتأسيس في الرياضيات والعلوم واللغة العربية والإنجليزية.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full lg:w-auto shrink-0">
                <div className="p-6 bg-white/10 border border-white/10 rounded-2xl text-center group-hover:bg-white/15 transition-all duration-300">
                  <Users className="w-8 h-8 text-info mx-auto mb-3" />
                  <div className="text-3xl font-black text-on-primary">+70</div>
                  <div className="text-xs text-on-primary opacity-60 font-bold">معلم خبير</div>
                </div>
                <div className="p-6 bg-white/10 border border-white/10 rounded-2xl text-center group-hover:bg-white/15 transition-all duration-300">
                  <Star className="w-8 h-8 text-warning mx-auto mb-3" />
                  <div className="text-3xl font-black text-on-primary">+10</div>
                  <div className="text-xs text-on-primary opacity-60 font-bold">سنوات خبرة</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
