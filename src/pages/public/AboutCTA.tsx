import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Users, Target } from 'lucide-react';
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll';
import { useIsAuthenticated } from '../../context/useApp';

export const AboutCTA = () => {
    const isAuthenticated = useIsAuthenticated();
    return (
    <section className="py-6 md:py-8 relative overflow-hidden bg-gradient-to-br from-primary-active via-primary to-primary-active">
        <div className="absolute top-0 start-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--bg-warning) 8%, transparent) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 end-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--bg-warning) 6%, transparent) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--bg-primary) 4%, transparent) 0%, transparent 70%)' }} />

        <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
                <AnimateOnScroll animation="fadeUp">
                    <div className="relative group overflow-hidden rounded-3xl shadow-2xl">
                        <div className="absolute -inset-[2px] opacity-50 group-hover:opacity-80 transition-opacity duration-1000 rounded-3xl pointer-events-none" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--bg-warning) 40%, transparent), color-mix(in srgb, var(--bg-warning) 10%, transparent), color-mix(in srgb, var(--bg-primary) 30%, transparent), color-mix(in srgb, var(--bg-warning) 40%, transparent))' }} />
                        
                        <div className="relative rounded-3xl p-8 md:p-14 overflow-hidden bg-gradient-to-br from-primary-active to-primary-hover">
                            <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0L60 30L30 60L0 30Z\' fill=\'none\' stroke=\'%23f59e0b\' stroke-width=\'0.5\'/%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />

                            <div className="relative z-20 flex flex-col lg:flex-row items-stretch gap-10 lg:gap-16">
                                <div className="w-full lg:w-[58%] text-center lg:text-start flex flex-col justify-center">
                                    <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-6 lg:mb-8 mx-auto lg:mx-0" style={{ background: 'color-mix(in srgb, var(--bg-warning) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--bg-warning) 25%, transparent)' }}>
                                        <Sparkles size={14} className="text-accent" />
                                        <span className="text-xs font-black text-accent tracking-wider">انضم إلى عائلتنا</span>
                                    </div>

                                    <h2 className="text-xl md:text-3xl lg:text-4xl font-black mb-4 leading-tight text-on-primary">
                                        هل أنت مستعد لتكون <br />
                                        <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--bg-warning), var(--text-warning), var(--text-warning-dark))' }}>جزءاً من حكايتنا؟</span>
                                    </h2>

                                    <p className="text-sm md:text-base max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed font-medium text-on-primary/70">
                                        انضم إلى آلاف الطلاب الذين بدؤوا رحلتهم نحو التميز الحقيقي مع دارين السابعة. مستقبلك المشرق يبدأ بقرار واحد تتخذه الآن.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                        <Link to="/courses" onClick={() => window.scrollTo(0, 0)}
                                            className="group relative px-10 py-4 font-black text-base rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-1 flex items-center justify-center gap-3 bg-gradient-to-br from-warning to-[var(--text-warning)] text-on-primary shadow-xl">
                                            <span className="relative z-10">ابدأ رحلتك الآن</span>
                                            <ArrowLeft size={18} className="relative z-10 group-hover:-translate-x-1.5 transition-transform" />
                                        </Link>
                                        <Link to={isAuthenticated ? "/dashboard" : "/login"} onClick={() => window.scrollTo(0, 0)}
                                            className="px-10 py-4 font-black text-base rounded-xl transition-all duration-500 flex items-center justify-center group border border-white/10 backdrop-blur-sm hover:-translate-y-1 text-on-primary/85 bg-white/5">
                                            <span>{isAuthenticated ? 'لوحة التحكم' : 'تسجيل الدخول'}</span>
                                        </Link>
                                    </div>
                                </div>

                                <div className="w-full lg:w-[42%] relative flex items-center">
                                    <div className="grid grid-cols-2 gap-3 w-full">
                                        <div className="relative p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center transform hover:-translate-y-1.5 transition-all duration-500 group/card overflow-hidden min-h-[180px] backdrop-blur-sm bg-white/5 border border-white/10">
                                            <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--bg-warning) 6%, transparent), transparent 70%)' }} />
                                            <div className="relative z-10">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover/card:scale-110 transition-transform duration-500" style={{ background: 'color-mix(in srgb, var(--bg-warning) 15%, transparent)' }}>
                                                    <Users size={22} className="text-accent" />
                                                </div>
                                                <span className="text-3xl md:text-4xl font-black text-on-primary mb-1 block tracking-tight">5k+</span>
                                                <span className="text-micro text-on-primary/90 font-black">طالب فعال</span>
                                            </div>
                                        </div>

                                        <div className="relative p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-500 group/card overflow-hidden min-h-[180px] backdrop-blur-sm hover:-translate-y-1.5 bg-white/5 border border-white/10">
                                            <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--bg-primary) 6%, transparent), transparent 70%)' }} />
                                            <div className="relative z-10">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover/card:scale-110 transition-transform duration-500" style={{ background: 'color-mix(in srgb, var(--bg-warning) 20%, transparent)' }}>
                                                    <Target size={22} className="text-warning" />
                                                </div>
                                                <span className="text-3xl md:text-4xl font-black text-on-primary mb-1 block tracking-tight">97.3%</span>
                                                <span className="text-micro text-on-primary/90 font-black">نسبة نجاح</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimateOnScroll>
            </div>
        </div>
    </section>
    );
};
