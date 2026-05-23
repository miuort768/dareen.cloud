import { HelpCircle, ChevronDown, Star, Heart } from 'lucide-react';

export const FAQSection = () => {
    return (
        <section className="py-4 md:py-6 bg-[rgb(var(--bg-surface))] relative overflow-hidden transition-colors duration-500" id="faq">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 15% 50%, #6366F1 0%, transparent 40%), radial-gradient(circle at 85% 50%, #8B5CF6 0%, transparent 40%)',
                    filter: 'blur(80px)'
                }}>
            </div>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.1]"
                style={{
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/simple-dashed.png")',
                    backgroundSize: '200px 200px'
                }}>
            </div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-full mb-2 mx-auto shadow-sm">
                        <HelpCircle size={12} className="text-indigo-600" />
                        <span className="text-[9px] font-black  text-gray-400">لديك استفسار؟</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-black mb-3 font-heading">
                        الأسئلة <span className="text-indigo-600">الشائعة</span>
                    </h2>
                    <div className="h-1 w-16 bg-amber-500 mx-auto rounded-full"></div>
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
                        }
                    ].map((item, idx) => {
                        const icons = [<HelpCircle size={80} />, <Star size={80} />, <Heart size={80} />, <img src="/dareen_logo_new.jpg" alt="" className="w-20 h-20 object-contain opacity-20" />];
                        return (
                            <div key={idx} className="relative bg-white border border-gray-100 rounded-xl overflow-hidden group hover:border-indigo-100 transition-all duration-500 hover:shadow-md hover:shadow-indigo-500/5">
                                <div className="absolute -bottom-4 -left-4 text-gray-400 opacity-[0.03] group-hover:opacity-[0.06] group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                                    {icons[idx % icons.length]}
                                </div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity pointer-events-none"></div>
                                <details className="group relative z-10">
                                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                                        <h3 className="text-xs md:text-sm font-black text-black group-hover:text-indigo-600 transition-colors">
                                            {item.q}
                                        </h3>
                                        <span className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center transform group-open:rotate-180 group-open:bg-indigo-600 group-open:text-white transition-all duration-300">
                                            <ChevronDown size={14} className="text-gray-400 group-open:text-white" />
                                        </span>
                                    </summary>
                                    <div className="px-4 pb-4 pt-0">
                                        <div className="h-px w-full bg-gradient-to-r from-indigo-500/10 via-gray-100 to-transparent mb-3"></div>
                                        <p className="text-[10px] md:text-xs text-black leading-relaxed font-medium">
                                            {item.a}
                                        </p>
                                    </div>
                                </details>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
