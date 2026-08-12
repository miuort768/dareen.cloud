import { Link } from 'react-router-dom';
import { Download, FileText, ArrowLeft, MessageCircle, Shield, BadgeCheck, Headphones } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export const MasarSection = () => {
    const adminPhone = useSettingsStore(s => s.adminPhone);
    const whatsappNumbers = useSettingsStore(s => s.whatsappNumbers);
    const contactUsNumber = (() => {
        try {
            const entries = JSON.parse(whatsappNumbers);
            const found = entries.find((e: { label: string; phone: string }) => e.label === 'تواصل معانا');
            return found ? found.phone.replace(/\D/g, '') : adminPhone.replace(/\D/g, '');
        } catch (e) {
            console.warn(e);
            return adminPhone.replace(/\D/g, '');
        }
    })();

    return (
        <>
            {/* ─── Desktop version ─── */}
            <section className="hidden md:block py-4 bg-surface dark:bg-black relative overflow-hidden transition-colors duration-500">
                <div className="absolute top-0 end-0 w-64 h-64 bg-accent/5 dark:bg-primary/[0.08] rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 start-0 w-48 h-48 bg-primary/5 dark:bg-primary/[0.05] rounded-full blur-[80px] pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto bg-gradient-to-br from-primary via-primary-hover to-primary dark:from-surface dark:via-card dark:to-surface shadow-2xl overflow-hidden border border-white/5 dark:border-primary/30 relative rounded-2xl">
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="absolute start-0 top-0 w-80 h-80 bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute end-0 bottom-0 w-80 h-80 bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
                        </div>
                        <div className="flex flex-col lg:flex-row items-stretch min-h-[400px]">
                            <div className="w-full lg:w-[40%] relative shrink-0 overflow-hidden bg-white/[0.08] dark:bg-primary/[0.05] backdrop-blur-md flex items-center justify-center p-8 lg:p-4 border-b lg:border-b-0 lg:border-e border-white/10 dark:border-primary/20 group">
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 dark:via-primary/10 to-transparent animate-shine-slow pointer-events-none z-30"></div>
                                <div className="relative w-full h-full flex items-center justify-center z-10">
                                    <div className="absolute w-64 h-64 bg-primary/20 dark:bg-primary/10 blur-[80px] rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                    <picture>
                                        <source srcSet="/dareen_books_portal_v3.webp" type="image/webp" />
                                        <source srcSet="/dareen_books_portal_v3.avif" type="image/avif" />
                                        <img src="/dareen_books_portal_v3.png" alt="بوابة الكتب والملخصات - دارين" width="680" height="680" loading="lazy" decoding="async" className="w-full max-w-[280px] lg:max-w-[340px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
                                    </picture>
                                </div>
                            </div>
                            <div className="w-full lg:w-[60%] p-6 md:p-12 lg:p-14 text-on-primary relative z-20 text-center lg:text-start flex flex-col justify-center">
                                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 dark:bg-primary/20 border border-white/20 dark:border-primary/40 rounded-full backdrop-blur-md">
                                        <Download className="w-3.5 h-3.5 text-warning dark:text-primary animate-pulse" />
                                        <span className="text-xs font-black text-on-primary dark:text-primary uppercase tracking-widest">بوابة الكتب والملخصات</span>
                                    </div>
                                </div>
                                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-3 font-heading leading-tight">
                                    <span className="text-on-primary dark:text-main">مركز</span>
                                    <span className="text-on-primary dark:text-on-primary bg-primary dark:bg-primary px-3 py-1 md:px-5 md:py-1 inline-block transform -rotate-1 shadow-lg text-shadow-none whitespace-nowrap">دارين</span>
                                    <span className="text-on-primary dark:text-main">للمذكرات التعليمية</span>
                                </h2>
                                <p className="text-on-primary dark:text-warning/60 text-micro sm:text-xs md:text-sm lg:text-base leading-relaxed mb-4 max-w-2xl mx-auto lg:mx-0 font-medium">
                                    حصرياً في مركز دارين، نوفر لك أقوى المذكرات التعليمية والملخصات الشاملة لجميع المراحل الدراسية، معدة بعناية من قبل نخبة من المعلمين لضمان تفوقك الدراسي.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-5">
                                    <span className="px-3 py-1 bg-white/10 dark:bg-primary/15 border border-white/20 dark:border-primary/30 rounded-full text-micro font-bold text-on-primary dark:text-primary">الكويت</span>
                                    <span className="px-3 py-1 bg-white/10 dark:bg-primary/15 border border-white/20 dark:border-primary/30 rounded-full text-micro font-bold text-on-primary dark:text-primary">السعودية</span>
                                    <span className="px-3 py-1 bg-white/10 dark:bg-primary/15 border border-white/20 dark:border-primary/30 rounded-full text-micro font-bold text-on-primary dark:text-primary">الإمارات</span>
                                    <span className="px-3 py-1 bg-white/10 dark:bg-primary/15 border border-white/20 dark:border-primary/30 rounded-full text-micro font-bold text-on-primary dark:text-primary">قطر</span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Link to="/books" className="px-10 py-4 bg-primary dark:bg-primary hover:bg-primary-hover dark:hover:bg-warning text-on-primary dark:text-on-primary rounded-xl font-black text-lg shadow-2xl shadow-primary/20 dark:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group">
                                        <FileText className="w-6 h-6 transition-transform group-hover:scale-110" />
                                        <span>تحميل مذكرة</span>
                                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    </Link>
                                    <a href={`https://wa.me/${contactUsNumber}`} target="_blank" rel="noopener noreferrer" className="px-10 py-4 bg-white/5 dark:bg-primary/10 hover:bg-white/10 dark:hover:bg-primary/20 border border-white/20 dark:border-primary/30 text-on-primary dark:text-primary rounded-xl font-black text-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-3 hover:border-white/40 dark:hover:border-primary/50">
                                        <MessageCircle className="w-6 h-6" />
                                        <span>تواصل معنا</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Mobile version ─── */}
            <section className="block md:hidden relative overflow-hidden bg-surface dark:bg-black pt-3 pb-4 transition-colors duration-500">
                <div className="absolute top-20 -start-20 w-60 h-60 bg-accent/10 dark:bg-primary/[0.08] rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-40 -end-20 w-72 h-72 bg-primary/10 dark:bg-primary/[0.05] rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 px-4">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg mb-4">
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 dark:from-black/80 via-transparent to-transparent z-10"></div>
                        <picture>
                            <source srcSet="/dareen_books_portal_v3.webp" type="image/webp" />
                            <source srcSet="/dareen_books_portal_v3.avif" type="image/avif" />
                            <img src="/dareen_books_portal_v3.png" alt="بوابة الكتب والملخصات" width="400" height="300" loading="lazy" className="w-full h-auto object-cover" />
                        </picture>
                    </div>

                    <div className="bg-surface dark:bg-card rounded-2xl shadow-sm border border-border/80 dark:border-primary/30 p-5 mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-main dark:text-main text-lg font-black">بوابة الكتب والملخصات</h2>
                            <p className="text-muted dark:text-muted text-xs font-medium mt-0.5">جميع المذكرات في مكان واحد</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-primary-soft dark:bg-primary/20 flex items-center justify-center">
                            <Download size={20} className="text-primary dark:text-primary" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary via-primary-hover to-primary dark:from-primary dark:via-warning dark:to-primary rounded-3xl p-6 shadow-lg shadow-primary/20 dark:shadow-primary/20 mb-5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                                <span className="text-on-primary dark:text-on-primary font-black text-sm">مركز دارين السابعة</span>
                                <div className="absolute -bottom-1 start-0 w-full h-0.5 bg-white/80 dark:bg-black/30 rounded-full shadow-sm"></div>
                            </div>
                            <span className="bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-black/30 text-on-primary dark:text-on-primary text-micro font-bold px-3 py-1 rounded-[4px]">للمذكرات التعليمية</span>
                        </div>

                        <p className="text-on-primary dark:text-warning/60 text-micro leading-relaxed mb-6 font-medium">
                            حصريًا في مركز دارين، نوفر لك أقوى المذكرات التعليمية والملخصات الشاملة لجميع المراحل الدراسية، معدة بعناية من قبل نخبة من المعلمين لضمان تفوقك الدراسي.
                        </p>

                        <div className="flex flex-col gap-3">
                            <Link
                                to="/books"
                                className="w-full py-4 bg-gradient-to-r from-white/20 to-white/30 dark:from-black/20 dark:to-black/30 text-on-primary dark:text-on-primary font-black text-base shadow-lg shadow-primary/30 dark:shadow-black/20 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 rounded-2xl group"
                            >
                                <FileText size={20} />
                                <span>تحميل مذكرة</span>
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href={`https://wa.me/${contactUsNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3.5 bg-white/5 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-black/20 text-on-primary dark:text-on-primary font-bold text-sm hover:bg-white/10 dark:hover:bg-black/20 transition-all flex items-center justify-center gap-3 rounded-2xl"
                            >
                                <MessageCircle size={18} />
                                <span>تواصل معنا</span>
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center bg-surface dark:bg-card rounded-2xl shadow-sm border border-border/80 dark:border-primary/20 p-4">
                            <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-primary-soft dark:bg-primary/15 flex items-center justify-center">
                                <Shield size={20} className="text-primary dark:text-primary" />
                            </div>
                            <span className="text-main dark:text-main text-xs font-bold leading-tight block">جودة مضمونة</span>
                        </div>
                        <div className="text-center bg-surface dark:bg-card rounded-2xl shadow-sm border border-border/80 dark:border-primary/20 p-4">
                            <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-success-light dark:bg-primary/15 flex items-center justify-center">
                                <BadgeCheck size={20} className="text-success dark:text-primary" />
                            </div>
                            <span className="text-main dark:text-main text-xs font-bold leading-tight block">محتوى موثوق</span>
                        </div>
                        <div className="text-center bg-surface dark:bg-card rounded-2xl shadow-sm border border-border/80 dark:border-primary/20 p-4">
                            <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-warning-light dark:bg-primary/15 flex items-center justify-center">
                                <Headphones size={20} className="text-warning dark:text-primary" />
                            </div>
                            <span className="text-main dark:text-main text-xs font-bold leading-tight block">دعم مستمر طوال اليوم</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};