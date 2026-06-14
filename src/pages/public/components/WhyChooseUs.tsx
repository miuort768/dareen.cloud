import { ShieldCheck, Lightbulb, Heart, Star, Users, Award, ArrowLeft } from 'lucide-react';

const features = [
  {
    title: 'نتائج مضمونة',
    desc: 'متابعة دقيقة مع تقارير أسبوعية لتحسين مستوى الطالب.',
    color: 'text-emerald-500',
    colorDark: 'dark:text-emerald-400',
    bg: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-900/30',
    border: 'border-emerald-100',
    borderDark: 'dark:border-emerald-900/50',
    glow: 'shadow-emerald-500/10',
  },
  {
    title: 'طرق تعليم مبتكرة',
    desc: 'دروس خصوصية تفاعلية للمناهج الخليجية تنمي مهارات الفهم والتفكير الإبداعي.',
    color: 'text-indigo-500',
    colorDark: 'dark:text-indigo-400',
    bg: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-900/30',
    border: 'border-indigo-100',
    borderDark: 'dark:border-indigo-900/50',
    glow: 'shadow-indigo-500/10',
  },
  {
    title: 'بيئة آمنة ومحفزة',
    desc: 'فصول افتراضية آمنة لدروس التقوية أونلاين مع نخبة معلمي الرياضيات والعلوم واللغة العربية.',
    color: 'text-violet-500',
    colorDark: 'dark:text-violet-400',
    bg: 'bg-violet-50',
    bgDark: 'dark:bg-violet-900/30',
    border: 'border-violet-100',
    borderDark: 'dark:border-violet-900/50',
    glow: 'shadow-violet-500/10',
    ribbon: true,
  },
];

const featureIcons = [ShieldCheck, Lightbulb, Heart];

export const WhyChooseUs = () => {
  return (
    <section className="relative overflow-hidden bg-[#F8F8FC] dark:bg-slate-950 pt-4 md:pt-10 pb-0">
      {/* Background decorative blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-300/20 dark:bg-violet-500/5 rounded-full blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/10 dark:bg-purple-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-2xl md:text-5xl font-heading font-black mb-3 md:mb-4 flex items-center justify-center gap-2">
            <span>لماذا{' '}</span>
            <span className="px-4 py-1.5 rounded-full bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB] text-white text-xl md:text-4xl inline-block">
              تختارنا؟
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base lg:text-xs max-w-4xl mx-auto leading-relaxed font-medium">
            <span className="hidden md:inline">أفضل منصة تعليم عن بعد في السعودية، الكويت، الإمارات، قطر وعمان والبحرين.<br />دروس خصوصية، قدرات وتحصيلي، تحفيظ قرآن، وتأسيس للمناهج الخليجية مع نخبة المعلمين.</span>
            <span className="md:hidden">أفضل منصة تعليم عن بعد في السعودية، الكويت، الإمارات، قطر وعمان والبحرين. دروس خصوصية، قدرات وتحصيلي، تحفيظ قرآن، وتأسيس للمناهج الخليجية مع نخبة المعلمين.</span>
          </p>
        </div>

        {/* ─── Mobile Layout ─── */}
        <div className="md:hidden space-y-4">
          {features.map((f, i) => {
            const Icon = featureIcons[i];
            return (
              <div key={f.title} className={`relative flex items-center gap-4 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border ${f.border} ${f.borderDark} shadow-sm ${f.glow}`}>
                {f.ribbon && (
                  <div className="absolute -top-2 -left-2 bg-gradient-to-br from-[#6C4BFF] to-[#4A2DDB] text-white text-[7px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Star size={8} className="fill-yellow-300 text-yellow-300" />
                    الأكثر تميزاً
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl ${f.bg} ${f.bgDark} flex items-center justify-center shrink-0`}>
                  <Icon className={`${f.color} ${f.colorDark}`} size={22} />
                </div>
                <div>
                  <h3 className={`text-sm font-black ${f.color} ${f.colorDark}`}>{f.title}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-0.5">{f.desc}</p>
                </div>
              </div>
            );
          })}

          {/* Showcase card (mobile) */}
          <div className="mt-6 p-5 bg-gradient-to-br from-[#0B1020] via-[#111827] to-[#1a1040] rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/10 rounded-full mb-3">
                <Star size={12} className="text-amber-400" />
                <span className="text-[9px] font-bold text-white/80">التميز التعليمي</span>
              </div>
              <h3 className="text-lg font-black text-white font-heading mb-2">بيئة تعليمية متطورة</h3>
              <p className="text-[9px] text-white/70 leading-relaxed mb-4 max-w-xs mx-auto font-medium">
                نخبة من المعلمين المتخصصين في تدريس المناهج الكويتية والخليجية لضمان تفوق طفلك في الرياضيات والعلوم واللغات.
              </p>
              <a
                href="https://wa.me/96500000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB] text-white text-[11px] font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-[#6C4BFF]/30 hover:shadow-[#6C4BFF]/40 transition-all active:scale-[0.98]"
              >
                ابدأ رحلة التميز الآن
                <ArrowLeft size={14} />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                <Star size={16} className="text-amber-400 mx-auto mb-1" />
                <div className="text-lg font-black text-white">10+</div>
                <div className="text-[9px] text-white/50 font-bold">سنوات خبرة</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                <Users size={16} className="text-indigo-400 mx-auto mb-1" />
                <div className="text-lg font-black text-white">70+</div>
                <div className="text-[9px] text-white/50 font-bold">معلم خبير</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Desktop Layout ─── */}
        <div className="hidden md:grid grid-cols-3 gap-4 max-w-6xl mx-auto pb-4 md:pb-6">
          {features.map((f, i) => {
            const Icon = featureIcons[i];
            return (
              <div key={f.title} className={`relative p-6 bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm border ${f.border} ${f.borderDark} flex items-start gap-4 group hover:shadow-md transition-all`}>
                {f.ribbon && (
                  <div className="absolute -top-2 -left-2 bg-gradient-to-br from-[#6C4BFF] to-[#4A2DDB] text-white text-[7px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Star size={8} className="fill-yellow-300 text-yellow-300" />
                    الأكثر تميزاً
                  </div>
                )}
                <div className={`w-14 h-14 rounded-2xl ${f.bg} ${f.bgDark} flex items-center justify-center shrink-0`}>
                  <Icon className={`${f.color} ${f.colorDark}`} size={24} />
                </div>
                <div>
                  <h3 className={`text-base font-black ${f.color} ${f.colorDark} mb-1`}>{f.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            );
          })}

          <div className="md:col-span-3 p-6 md:p-8 bg-gradient-to-br from-violet-600 to-indigo-950 rounded-2xl shadow-lg text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-1 text-center lg:text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 border border-white/20 rounded-full mb-3 mx-auto lg:mx-0">
                  <Award size={16} className="text-amber-300" />
                  <span className="text-xs font-bold text-white/90">التميز التعليمي</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-2 font-heading text-white">بيئة تعليمية متطورة</h3>
                <p className="text-white/80 text-xs md:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">نخبة من المعلمين المبدعين لتدريس المناهج الكويتية والخليجية. تعليم عن بعد، تحفيظ قرآن، وتأسيس في الرياضيات والعلوم واللغة العربية والإنجليزية.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full lg:w-auto shrink-0">
                <div className="p-6 bg-white/10 border border-white/10 rounded-2xl text-center group-hover:bg-white/15 transition-all duration-300">
                  <Users className="w-8 h-8 text-indigo-300 mx-auto mb-3" />
                  <div className="text-3xl font-black text-white">+70</div>
                  <div className="text-xs text-white/60 font-bold">معلم خبير</div>
                </div>
                <div className="p-6 bg-white/10 border border-white/10 rounded-2xl text-center group-hover:bg-white/15 transition-all duration-300">
                  <Star className="w-8 h-8 text-purple-300 mx-auto mb-3" />
                  <div className="text-3xl font-black text-white">+10</div>
                  <div className="text-xs text-white/60 font-bold">سنوات خبرة</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};