import { useState } from 'react';
import { HelpCircle, ChevronDown, Star, Heart } from 'lucide-react';

export const FAQSection = () => {
    const [openIdx, setOpenIdx] = useState<number | null>(null);
    return (
        <section className="py-4 md:py-6 bg-surface dark:bg-background relative overflow-hidden transition-colors duration-500" id="faq">
            <div className="absolute top-0 end-0 w-64 h-64 bg-accent/5 dark:bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 start-0 w-48 h-48 bg-primary/5 dark:bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] dark:opacity-[0.02]">
                <svg className="w-full h-full" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="islamic-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                            <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-primary" />
                            <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-primary" />
                            <circle cx="60" cy="60" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
                            <polygon points="60,8 72,40 108,40 78,60 88,96 60,76 32,96 42,60 12,40 48,40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
                            <polygon points="60,18 68,45 95,45 73,60 80,88 60,72 40,88 47,60 25,45 52,45" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-primary" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
                </svg>
            </div>
            <div className="absolute top-10 end-10 w-32 h-32 opacity-[0.03] dark:opacity-[0.015] pointer-events-none">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 0 L122 78 L200 78 L138 128 L160 200 L100 150 L40 200 L62 128 L0 78 L78 78 Z" fill="currentColor" className="text-primary" />
                </svg>
            </div>
            <div className="absolute bottom-10 start-10 w-40 h-40 opacity-[0.025] dark:opacity-[0.01] pointer-events-none">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 15 C130 15 155 40 155 70 C155 100 130 125 100 125 C70 125 45 100 45 70 C45 40 70 15 100 15 Z" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
                    <path d="M100 35 C120 35 135 50 135 70 C135 90 120 105 100 105 C80 105 65 90 65 70 C65 50 80 35 100 35 Z" stroke="currentColor" strokeWidth="1" className="text-primary" />
                    <path d="M100 50 L110 65 L128 65 L115 78 L120 96 L100 85 L80 96 L85 78 L72 65 L90 65 Z" fill="currentColor" className="text-primary" />
                </svg>
            </div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-4 md:mb-8">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/50 dark:bg-primary/30 backdrop-blur-sm border border-border rounded-full mb-2 mx-auto shadow-sm">
                        <HelpCircle size={12} className="text-primary" />
                        <span className="text-micro font-black text-muted dark:text-main/70">لديك استفسار؟</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-main mb-3 font-heading">
                        الأسئلة <span className="text-primary">الشائعة</span>
                    </h2>
                    <div className="h-1 w-16 bg-warning mx-auto rounded-full"></div>
                </div>
                <div className="max-w-2xl mx-auto space-y-3">
                    {[
                        {
                            q: "كيف يتم الدراسة في المعهد ؟",
                            a: "الدراسة تتم عن بعد عبر فصول افتراضية تفاعلية مباشرة (لايف) بين المعلم والطالب، باستخدام أحدث التقنيات لضمان جودة الصوت والصورة."
                        },
                        {
                            q: "هل المناهج معتمدة ؟",
                            a: "نعم، نلتزم بتدريس المناهج الحكومية المعتمدة في الكويت ودول الخليج، بالإضافة إلى مناهجنا الخاصة في التأسيس واللغات."
                        },
                        {
                            q: "كيف يمكنني متابعة مستوى ابني ؟",
                            a: "نقوم بإرسال تقارير دورية ومفصلة لولي الأمر عبر الواتساب، تشمل مستوى الطالب، الحضور والغياب، وملاحظات المعلم."
                        },
                        {
                            q: "هل توجد حصص تجريبية ؟",
                            a: "نعم، نقدم حصة تجريبية مجانية لتقييم مستوى الطالب والتعرف على طريقة التدريس قبل الاشتراك الفعلي."
                        },
                        {
                            q: "ما هي المواد التي تقدّمون فيها دروساً خصوصية؟",
                            a: "نقدم دروساً خصوصية في جميع المواد الأساسية: الرياضيات، العلوم، الفيزياء، الكيمياء، الأحياء، اللغة العربية، اللغة الإنجليزية، والتربية الإسلامية. جميع الدروس تقدم أونلاين وفق المناهج السعودية والكويتية والإماراتية والقطرية والعمانية والبحرينية."
                        },
                        {
                            q: "هل تناسبكم جميع المراحل الدراسية؟",
                            a: "نعم، برامجنا مصممة لجميع المراحل: الابتدائي (تأسيس في القراءة والكتابة والحساب)، المتوسط (تقوية في جميع المواد)، والثانوي (مراجعات واختبارات قدرات وتحصيلي). لدينا معلمون متخصصون لكل مرحلة دراسية."
                        },
                        {
                            q: "ما هي الدول التي تغطيها خدماتكم التعليمية؟",
                            a: "نخدم طلابنا في المملكة العربية السعودية، الكويت، الإمارات، قطر، سلطنة عمان، ومملكة البحرين. كما نقدم خدماتنا للطلاب في الأردن ومصر. جميع معلمينا على دراية كاملة بالمناهج الدراسية في كل دولة."
                        }
                    ].map((item, idx) => {
                        const icons = [<HelpCircle size={80} />, <Star size={80} />, <Heart size={80} />, <HelpCircle size={80} />];
                        const isOpen = openIdx === idx;
                        return (
                            <div key={idx} className="relative bg-surface dark:bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary transition-all duration-500 hover:shadow-md hover:shadow-primary/5 dark:hover:shadow-primary/20">
                                <div className="absolute -bottom-4 -end-4 text-muted opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.06] group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                                    {icons[idx % icons.length]}
                                </div>
                                <div className="absolute top-0 start-0 w-24 h-24 bg-primary/5 dark:bg-primary/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity pointer-events-none"></div>
                                <div className="relative z-10">
                                    <button type="button" onClick={() => setOpenIdx(isOpen ? null : idx)} className="flex items-center justify-between w-full p-4 cursor-pointer text-start" aria-expanded={isOpen}>
                                        <h3 className="text-xs md:text-sm font-black text-main group-hover:text-primary transition-colors">
                                            {item.q}
                                        </h3>
                                        <span className={`w-6 h-6 rounded-full bg-primary-soft border border-border flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={14} className="text-primary" />
                                        </span>
                                    </button>
                                    {isOpen && (
                                        <div className="px-4 pb-4 pt-0">
                                            <div className="h-px w-full bg-gradient-to-r from-primary/10 via-surface dark:via-primary to-transparent mb-3"></div>
                                            <p className="text-micro md:text-xs text-main leading-relaxed font-medium">
                                                {item.a}
                                            </p>
                                        </div>
                                    )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
            </div>
        </section>
    );
};
