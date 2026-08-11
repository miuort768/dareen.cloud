import { motion } from 'framer-motion';
import { ShieldCheck, Lightbulb, Heart, Star, Users, Award, ArrowLeft, Zap } from 'lucide-react';

const features = [
  {
    title: 'بيئة تعليمية متطورة',
    desc: 'نخبة من المعلمين المبدعين لتدريس المناهج الكويتية والخليجية.',
    variant: 'success' as const,
  },
  {
    title: 'خبرة واسعة ومؤهلة',
    desc: 'سنوات عديدة من الخبرة في التعليم عن بعد والدروس الخصوصية.',
    variant: 'primary' as const,
  },
  {
    title: 'نتائج مبهرة وملموسة',
    desc: 'نفخر بتحقيقات طلابنا التي تتجاوز التوقعات مع نسب نجاح استثنائية.',
    variant: 'accent' as const,
    ribbon: true,
  },
];

const variantClasses: Record<string, { icon: string; bg: string; card: string }> = {
  success: { icon: 'text-on-success dark:text-primary', bg: 'bg-white/10 dark:bg-primary/10', card: 'bg-success dark:bg-card dark:border dark:border-primary/20' },
  primary: { icon: 'text-on-primary dark:text-primary', bg: 'bg-white/10 dark:bg-primary/10', card: 'bg-primary dark:bg-card dark:border dark:border-primary/20' },
  accent: { icon: 'text-on-accent dark:text-primary', bg: 'bg-white/10 dark:bg-primary/10', card: 'bg-accent dark:bg-card dark:border dark:border-primary/30' },
};

const featureIcons = [ShieldCheck, Lightbulb, Heart];

interface WhyChooseUsProps {
    whatsappNumber?: string;
}

export const WhyChooseUs = ({ whatsappNumber = '201015098836' }: WhyChooseUsProps) => {
  return (
    <section className="relative overflow-hidden bg-surface dark:bg-card pt-4 md:pt-10 pb-0 transition-colors duration-500">
      {/* Gold glow decorations */}
      <div className="absolute -top-40 -start-40 w-80 h-80 bg-accent/5 dark:bg-primary/[0.04] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -end-40 w-80 h-80 bg-primary/5 dark:bg-primary/[0.04] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 end-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 dark:bg-primary/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-2xl md:text-5xl font-heading font-black mb-3 md:mb-4 flex items-center justify-center gap-2 text-main dark:text-main">
            <Zap className="w-5 h-5 text-warning dark:text-primary fill-warning dark:fill-primary md:hidden" />
            <span>لماذا{' '}</span>
            <span className="px-4 py-1.5 rounded-full bg-gradient-to-l from-primary to-primary-hover dark:from-primary dark:to-primary text-on-primary dark:text-card font-extrabold text-xl md:text-4xl inline-block">
              تختارنا؟
            </span>
          </h2>
          <p className="text-muted dark:text-main/50 text-sm md:text-base lg:text-xs max-w-4xl mx-auto leading-relaxed font-medium">
            <span className="hidden md:inline">في دارين السابعة، لا نكتفي بالتعليم فقط — نصنع تجربة متكاملة تجمع بين الجودة وال support والتقدير.<br />نعمل بشغف ل نحول الفراغ إلى مسار مهني ناجح يلبي طموحاتك ويتخطى توقعاتك.</span>
            <span className="md:hidden">في دارين السابعة، لا نكتفي بالتعليم فقط — نصنع تجربة متكاملة تجمع بين الجودة وال support والتقدير. نعمل بشغف ل نحول الفراغ إلى مسار مهني ناجح.</span>
          </p>
        </div>

        {/* Mobile Layout */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="md:hidden space-y-4">
          {features.map((f, i) => {
            const Icon = featureIcons[i];
            const vc = variantClasses[f.variant];
            return (
              <motion.div key={f.title} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className={`relative flex items-center gap-4 p-4 ${vc.card} backdrop-blur-sm rounded-2xl shadow-sm`}>
                {f.ribbon && (
                  <div className="absolute -top-2 -end-2 bg-gradient-to-br from-primary to-primary-hover dark:from-primary dark:to-primary text-on-primary dark:text-card text-micro font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Star size={8} className="fill-warning dark:fill-card text-warning dark:text-card" />
                    الأكثر طلباً
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl ${vc.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={vc.icon} size={22} />
                </div>
                <div>
                  <h3 className={`text-sm font-black ${vc.icon}`}>{f.title}</h3>
                  <p className={`text-micro ${vc.icon} dark:text-main/40 opacity-90 font-medium leading-relaxed mt-0.5`}>{f.desc}</p>
                </div>
              </motion.div>
            );
          })}

          {/* Showcase card (mobile) */}
          <div className="mt-6 p-5 bg-gradient-to-br from-primary to-primary-hover dark:from-card dark:via-surface dark:to-card dark:border dark:border-primary/20 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNENEFGMzciIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 dark:bg-primary/10 border border-white/10 dark:border-primary/20 rounded-full mb-3">
                <Star size={12} className="text-warning dark:text-primary" />
                <span className="text-micro font-bold text-on-primary dark:text-primary opacity-90">البصمة المميزة</span>
              </div>
              <h3 className="text-lg font-black text-on-primary dark:text-main font-heading mb-2">بنينا معاً مجدداً</h3>
              <p className="text-micro text-on-primary dark:text-main/40 opacity-90 leading-relaxed mb-4 max-w-xs mx-auto font-medium">
                كل يوم نتعلم ونكبر معاً لتقدم لكم أفضل خدمة تعليمية ممكنة. رؤيتكم هي محرّك نجاحنا ومحفّز تطورنا.
              </p>
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('مرحباً، أرغب في الاستفسار عن خدماتكم التعليمية')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-white/15 dark:bg-gradient-to-r dark:from-primary dark:to-primary text-on-primary dark:text-card font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg hover:bg-white/25 transition-all active:scale-[0.98]"
              >
                تواصل معنا الآن
                <ArrowLeft size={14} />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-primary/10 rounded-xl text-center">
                <Star size={16} className="text-warning dark:text-primary mx-auto mb-1" />
                <div className="text-lg font-black text-on-primary dark:text-main">10+</div>
                <div className="text-micro text-on-primary dark:text-main/40 font-bold">سنوات خبرة</div>
              </div>
              <div className="p-3 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-primary/10 rounded-xl text-center">
                <Users size={16} className="text-info dark:text-primary mx-auto mb-1" />
                <div className="text-lg font-black text-on-primary dark:text-main">70+</div>
                <div className="text-micro text-on-primary dark:text-main/40 font-bold">معلم خبير</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Desktop Layout */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="hidden md:grid grid-cols-3 gap-4 max-w-6xl mx-auto pb-4 md:pb-6">
          {features.map((f, i) => {
            const Icon = featureIcons[i];
            const vc = variantClasses[f.variant];
            return (
              <motion.div key={f.title} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5 }} className={`relative p-6 ${vc.card} rounded-2xl shadow-sm flex items-start gap-4 group hover:shadow-md dark:hover:shadow-primary/5 transition-all`}>
                {f.ribbon && (
                  <div className="absolute -top-2 -end-2 bg-gradient-to-br from-primary to-primary-hover dark:from-primary dark:to-primary text-on-primary dark:text-card text-micro font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Star size={8} className="fill-warning dark:fill-card text-warning dark:text-card" />
                    الأكثر طلباً
                  </div>
                )}
                <div className={`w-14 h-14 rounded-2xl ${vc.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={vc.icon} size={24} />
                </div>
                <div>
                  <h3 className={`text-base font-black ${vc.icon} mb-1`}>{f.title}</h3>
                  <p className={`text-xs ${vc.icon} dark:text-main/40 leading-relaxed font-medium`}>{f.desc}</p>
                </div>
              </motion.div>
            );
          })}

          {/* Showcase card (desktop) */}
          <div className="md:col-span-3 p-6 md:p-8 bg-gradient-to-br from-primary to-primary-hover dark:from-card dark:via-surface dark:to-card dark:border dark:border-primary/20 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 start-0 w-64 h-64 bg-on-primary dark:bg-primary opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 end-0 w-64 h-64 bg-on-primary dark:bg-primary opacity-5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-1 text-center lg:text-start">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 dark:bg-primary/10 border border-white/20 dark:border-primary/20 rounded-full mb-3 mx-auto lg:mx-0">
                  <Award size={16} className="text-warning dark:text-primary" />
                  <span className="text-xs font-bold text-on-primary dark:text-primary">البصمة المميزة</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-2 font-heading text-on-primary dark:text-main">بنينا معاً مجدداً</h3>
                <p className="text-on-primary dark:text-main/40 text-xs md:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">كل يوم نتعلم ونكبر معاً لتقدم لكم أفضل خدمة تعليمية ممكنة. رؤيتكم هي محرّك نجاحنا ومحفّز تطورنا.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full lg:w-auto shrink-0">
                <div className="p-6 bg-white/10 dark:bg-white/5 border border-white/10 dark:border-primary/10 rounded-2xl text-center group-hover:bg-white/15 dark:group-hover:bg-primary/[0.06] transition-all duration-300">
                  <Users className="w-8 h-8 text-info dark:text-primary mx-auto mb-3" />
                  <div className="text-3xl font-black text-on-primary dark:text-main">+70</div>
                  <div className="text-xs text-on-primary dark:text-main/40 font-bold">معلم خبير</div>
                </div>
                <div className="p-6 bg-white/10 dark:bg-white/5 border border-white/10 dark:border-primary/10 rounded-2xl text-center group-hover:bg-white/15 dark:group-hover:bg-primary/[0.06] transition-all duration-300">
                  <Star className="w-8 h-8 text-warning dark:text-primary mx-auto mb-3" />
                  <div className="text-3xl font-black text-on-primary dark:text-main">+10</div>
                  <div className="text-xs text-on-primary dark:text-main/40 font-bold">سنوات خبرة</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
