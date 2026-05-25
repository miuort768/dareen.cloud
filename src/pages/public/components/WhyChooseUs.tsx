import { ShieldCheck, Lightbulb, Heart, Star, Users, GraduationCap, BookOpen, ArrowLeft, MessageCircle, Send, Moon } from 'lucide-react';

const features = [
  {
    title: 'نتائج مضمونة',
    desc: 'متابعة دقيقة لضمان تحقيق أفضل النتائج التعليمية.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    glow: 'shadow-emerald-500/10',
  },
  {
    title: 'طرق تعليم مبتكرة',
    desc: 'طرق تعليم تفاعلية حديثة تنمي مهارات الفهم والتفكير الإبداعي لدى طفلك.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    glow: 'shadow-indigo-500/10',
  },
  {
    title: 'بيئة آمنة ومحفزة',
    desc: 'بيئة تعليمية افتراضية آمنة تشجع الطلاب على التفاعل والمشاركة بحرية.',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    glow: 'shadow-violet-500/10',
    ribbon: true,
  },
];

const featureIcons = [ShieldCheck, Lightbulb, Heart];

const appFeatures = [
  { label: 'طرق تعليم مبتكرة', color: 'bg-indigo-500' },
  { label: 'بيئة آمنة ومحفزة', color: 'bg-violet-500' },
  { label: 'نتائج مضمونة', color: 'bg-emerald-500' },
];

export const WhyChooseUs = () => {
  return (
    <section className="relative overflow-hidden bg-[#F7F7FA] dark:bg-slate-950 py-12 md:py-20">
      {/* Background decorative blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-300/20 dark:bg-violet-500/5 rounded-full blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/10 dark:bg-purple-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-14">
          <h2 className="text-2xl md:text-5xl font-heading font-black mb-3 md:mb-4">
            لماذا{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">
              تختارنا؟
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            نقدم تجربة تعليمية متكاملة تجمع بين أحدث التقنيات وأفضل الكوادر التعليمية لضمان مستقبل مشرق لأبنائكم.
          </p>
        </div>

        {/* ─── Mobile Layout ─── */}
        <div className="md:hidden space-y-4">
          {features.map((f, i) => {
            const Icon = featureIcons[i];
            return (
              <div key={f.title} className={`relative flex items-center gap-4 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border ${f.border} shadow-sm ${f.glow}`}>
                {f.ribbon && (
                  <div className="absolute -top-2 -left-2 bg-gradient-to-br from-[#6C4BFF] to-[#4A2DDB] text-white text-[7px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Star size={8} className="fill-yellow-300 text-yellow-300" />
                    الأكثر تميزاً
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={f.color} size={22} />
                </div>
                <div>
                  <h3 className={`text-sm font-black ${f.color}`}>{f.title}</h3>
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
              <p className="text-[11px] text-white/70 leading-relaxed mb-4 max-w-xs mx-auto font-medium">
                نخبة من المعلمين المبدعين لضمان تفوق طفلك أكاديمياً وتربوياً بأحدث الوسائل التعليمية.
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
        <div className="hidden md:flex gap-8 items-start">
          {/* Left: Content */}
          <div className="flex-1 space-y-6">
            {features.map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <div key={f.title} className={`relative flex items-center gap-5 p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-3xl border ${f.border} shadow-lg ${f.glow} hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 group`}>
                  {f.ribbon && (
                    <div className="absolute -top-3 -left-3 bg-gradient-to-br from-[#6C4BFF] to-[#4A2DDB] text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xl z-10">
                      <Star size={10} className="fill-yellow-300 text-yellow-300" />
                      الأكثر تميزاً
                    </div>
                  )}
                  <div className={`w-14 h-14 rounded-2xl ${f.bg} dark:bg-opacity-20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={f.color} size={26} />
                  </div>
                  <div>
                    <h3 className={`text-base font-black ${f.color}`}>{f.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">{f.desc}</p>
                  </div>
                </div>
              );
            })}

            {/* Showcase */}
            <div className="p-6 md:p-8 bg-gradient-to-br from-[#0B1020] via-[#111827] to-[#1a1040] rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl" />
              <div className="relative z-10 flex items-center gap-8">
                {/* 3D illustration area */}
                <div className="hidden lg:flex items-center justify-center w-40 h-40 shrink-0 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6C4BFF]/20 to-[#4A2DDB]/20 rounded-3xl blur-2xl" />
                  <div className="relative flex flex-col items-center">
                    <BookOpen size={48} className="text-[#6C4BFF]" />
                    <GraduationCap size={32} className="text-amber-400 -mt-3" />
                    <Star size={16} className="text-yellow-300 absolute -top-2 -right-2 fill-yellow-300" />
                  </div>
                </div>
                {/* Text */}
                <div className="flex-1 text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/10 rounded-full mb-3">
                    <Star size={12} className="text-amber-400" />
                    <span className="text-[10px] font-bold text-white/80">التميز التعليمي</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white font-heading mb-2">بيئة تعليمية متطورة</h3>
                  <p className="text-xs md:text-sm text-white/70 leading-relaxed mb-4 max-w-lg font-medium">
                    نخبة من المعلمين المبدعين لضمان تفوق طفلك أكاديمياً وتربوياً بأحدث الوسائل التعليمية.
                  </p>
                  <div className="flex items-center gap-4">
                    <a
                      href="https://wa.me/96500000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB] text-white text-[12px] font-bold px-6 py-3 rounded-xl shadow-lg shadow-[#6C4BFF]/30 hover:shadow-[#6C4BFF]/40 transition-all active:scale-[0.98]"
                    >
                      ابدأ رحلة التميز الآن
                      <ArrowLeft size={16} />
                    </a>
                    <div className="flex gap-3">
                      <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-center min-w-[90px]">
                        <Star size={18} className="text-amber-400 mx-auto mb-1" />
                        <div className="text-xl font-black text-white">10+</div>
                        <div className="text-[9px] text-white/50 font-bold">سنوات خبرة</div>
                      </div>
                      <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-center min-w-[90px]">
                        <Users size={18} className="text-indigo-400 mx-auto mb-1" />
                        <div className="text-xl font-black text-white">70+</div>
                        <div className="text-[9px] text-white/50 font-bold">معلم خبير</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <div className="w-[320px] shrink-0 sticky top-8">
            <div className="relative">
              {/* Floating action buttons */}
              <div className="absolute -left-14 top-20 flex flex-col gap-3 z-20">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 cursor-pointer hover:scale-110 transition-transform">
                  <MessageCircle size={16} className="text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-110 transition-transform">
                  <Send size={16} className="text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 cursor-pointer hover:scale-110 transition-transform">
                  <Moon size={16} className="text-white" />
                </div>
              </div>

              {/* Phone frame */}
              <div className="relative mx-auto w-[280px] bg-white rounded-[40px] shadow-2xl border-[3px] border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Screen */}
                <div className="bg-gradient-to-b from-[#6C4BFF] via-[#5B3FE0] to-[#4A2DDB] p-5">
                  {/* Top bar */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <div className="w-3 h-0.5 bg-white rounded-full" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>

                  {/* Greeting */}
                  <div className="text-right mb-5">
                    <p className="text-white text-lg font-black">مرحباً بك 👋</p>
                    <p className="text-white/70 text-xs font-medium">اكتشف تجربة تعليمية جديدة</p>
                  </div>

                  {/* Mini feature cards */}
                  <div className="space-y-2.5">
                    {appFeatures.map((f) => (
                      <div key={f.label} className="flex items-center gap-3 bg-white/95 rounded-2xl p-3 shadow-sm">
                        <div className={`w-8 h-8 rounded-xl ${f.color} flex items-center justify-center shrink-0`}>
                          <Star size={12} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-800">{f.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Spacer for bottom nav preview */}
                  <div className="mt-6" />
                </div>

                {/* Bottom navigation */}
                <div className="bg-white dark:bg-slate-900 px-4 py-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
                  {[
                    { icon: Users, label: 'حسابي', active: false },
                    { icon: BookOpen, label: 'المواد', active: false },
                    { icon: GraduationCap, label: 'دوراتي', active: true },
                    { icon: Star, label: 'الرئيسية', active: false },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-0.5">
                      <item.icon size={16} className={item.active ? 'text-[#6C4BFF]' : 'text-slate-400'} />
                      <span className={`text-[7px] font-bold ${item.active ? 'text-[#6C4BFF]' : 'text-slate-400'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};