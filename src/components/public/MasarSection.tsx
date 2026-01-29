import { ArrowLeft, BookOpen, GraduationCap, Laptop, Library, LineChart } from 'lucide-react';

export const MasarSection = () => {
    // Brand Colors based on the uploaded logo:
    // Navy Blue (Primary)
    // Teal/Green (Secondary) 

    return (
        <section className="py-12 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-black text-[#1e3a8a] mb-2 font-heading">
                        بوابتك نحو <span className="text-[#0d9488]">التميز والتطوير</span>
                    </h2>
                    <div className="h-1 w-20 bg-[#c5a47e] mx-auto rounded-full"></div>
                </div>

                {/* Grid Content - Horizontal Cards */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Item 1 - Navy Theme */}
                    <div className="group flex bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#1e3a8a]/30 cursor-pointer h-32">
                        {/* Side Square Icon/Image Area */}
                        <div className="w-32 bg-[#1e3a8a] flex items-center justify-center shrink-0 group-hover:bg-[#172554] transition-colors relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                            <GraduationCap className="w-12 h-12 text-white relative z-10" strokeWidth={1.5} />
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-5 flex flex-col justify-center">
                            <h3 className="text-lg font-bold text-[#1e3a8a] mb-1">التطوير المهني</h3>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                                برامج متخصصة لرفع كفاءة المعلمين والطلاب وتنمية المهارات.
                            </p>
                            <div className="flex items-center text-[#c5a47e] text-xs font-bold mt-auto group-hover:gap-2 transition-all">
                                <span>عرض المسارات</span>
                                <ArrowLeft className="w-3 h-3 mr-1" />
                            </div>
                        </div>
                    </div>

                    {/* Item 2 - Teal Theme */}
                    <div className="group flex bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#0d9488]/30 cursor-pointer h-32">
                        <div className="w-32 bg-[#0d9488] flex items-center justify-center shrink-0 group-hover:bg-[#0f766e] transition-colors relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                            <Library className="w-12 h-12 text-white relative z-10" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 p-5 flex flex-col justify-center">
                            <h3 className="text-lg font-bold text-[#0d9488] mb-1">المكتبة الرقمية</h3>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                                مصادر تعليمية شاملة وكتب إلكترونية تدعم المنهج الدراسي.
                            </p>
                            <div className="flex items-center text-[#c5a47e] text-xs font-bold mt-auto group-hover:gap-2 transition-all">
                                <span>تصفح المكتبة</span>
                                <ArrowLeft className="w-3 h-3 mr-1" />
                            </div>
                        </div>
                    </div>

                    {/* Item 3 - Navy Theme */}
                    <div className="group flex bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#1e3a8a]/30 cursor-pointer h-32">
                        <div className="w-32 bg-[#1e3a8a] flex items-center justify-center shrink-0 group-hover:bg-[#172554] transition-colors relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                            <LineChart className="w-12 h-12 text-white relative z-10" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 p-5 flex flex-col justify-center">
                            <h3 className="text-lg font-bold text-[#1e3a8a] mb-1">قياس الأداء</h3>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                                تقارير دقيقة لمتابعة مستوى التحصيل الدراسي والتقدم.
                            </p>
                            <div className="flex items-center text-[#c5a47e] text-xs font-bold mt-auto group-hover:gap-2 transition-all">
                                <span>عرض التقارير</span>
                                <ArrowLeft className="w-3 h-3 mr-1" />
                            </div>
                        </div>
                    </div>

                    {/* Item 4 - Teal Theme */}
                    <div className="group flex bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#0d9488]/30 cursor-pointer h-32">
                        <div className="w-32 bg-[#0d9488] flex items-center justify-center shrink-0 group-hover:bg-[#0f766e] transition-colors relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                            <Laptop className="w-12 h-12 text-white relative z-10" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 p-5 flex flex-col justify-center">
                            <h3 className="text-lg font-bold text-[#0d9488] mb-1">الخدمات الإلكترونية</h3>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                                بوابة شاملة للخدمات الطلابية والإدارية عن بعد.
                            </p>
                            <div className="flex items-center text-[#c5a47e] text-xs font-bold mt-auto group-hover:gap-2 transition-all">
                                <span>الدخول للخدمات</span>
                                <ArrowLeft className="w-3 h-3 mr-1" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Banner/CTA - Matching Brand */}
                <div className="max-w-4xl mx-auto mt-10">
                    <div className="relative overflow-hidden rounded-2xl bg-[#1e3a8a] px-6 py-8 shadow-lg">
                        <div className="absolute right-0 top-0 h-full w-1/3 bg-[#0d9488] skew-x-12 translate-x-12 opacity-80"></div>
                        <div className="absolute left-0 bottom-0 h-32 w-32 bg-[#c5a47e] rounded-full blur-3xl opacity-20"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-right">
                                <h3 className="text-xl font-bold text-white mb-2">
                                    هل تحتاج للمزيد من المصادر؟
                                </h3>
                                <p className="text-blue-100 text-sm">
                                    تصفح المكتبة الشاملة لجميع المراحل الدراسية الآن.
                                </p>
                            </div>
                            <button className="shrink-0 rounded-lg bg-white px-6 py-3 text-sm font-bold text-[#1e3a8a] shadow hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                <span>تصفح الدليل</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
