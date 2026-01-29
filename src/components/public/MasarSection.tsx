import { ArrowLeft, BookOpen, GraduationCap, Laptop, Library, LineChart, ShieldCheck } from 'lucide-react';

export const MasarSection = () => {
    return (
        <section className="py-12 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-3 mx-auto">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">بوابة المستقبل</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 font-heading">
                        منصة <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">مسار</span>
                    </h2>
                    <p className="text-lg md:text-xl font-bold text-gray-600">
                        بوابتك نحو التميز والتطوير
                    </p>
                    <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-transparent mx-auto rounded-full mt-6"></div>
                </div>

                {/* Grid Content */}
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Item 1 */}
                    <div className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 overflow-hidden cursor-pointer">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                            <GraduationCap className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">التطوير المهني</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">
                            مسارات تدريبية متكاملة لرفع كفاءة الأداء التعليمي والمهني.
                        </p>
                        <div className="flex items-center text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <span>اكتشف المزيد</span>
                            <ArrowLeft className="w-4 h-4 mr-1" />
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 overflow-hidden cursor-pointer">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors duration-300">
                            <Library className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">المكتبة الرقمية</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">
                            مصادر تعليمية وثقافية متنوعة تثري المعرفة وتدعم البحث.
                        </p>
                        <div className="flex items-center text-emerald-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <span>تصفح المكتبة</span>
                            <ArrowLeft className="w-4 h-4 mr-1" />
                        </div>
                    </div>

                    {/* Item 3 */}
                    <div className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 overflow-hidden cursor-pointer">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-600 transition-colors duration-300">
                            <LineChart className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">قياس الأداء</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">
                            أدوات تقييم دقيقة ولمتابعة التقدم وتحقيق الأهداف المرجوة.
                        </p>
                        <div className="flex items-center text-amber-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <span>عرض المؤشرات</span>
                            <ArrowLeft className="w-4 h-4 mr-1" />
                        </div>
                    </div>

                    {/* Item 4 */}
                    <div className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 overflow-hidden cursor-pointer">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors duration-300">
                            <Laptop className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">الخدمات الإلكترونية</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">
                            منظومة خدمات رقمية متكاملة تسهل الإجراءات وتوفر الوقت.
                        </p>
                        <div className="flex items-center text-purple-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <span>الدخول للخدمات</span>
                            <ArrowLeft className="w-4 h-4 mr-1" />
                        </div>
                    </div>
                </div>

                {/* Banner/CTA */}
                <div className="max-w-4xl mx-auto mt-12">
                    <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-6 py-10 shadow-2xl sm:px-10 sm:py-12 md:px-12 lg:px-20">
                        <div className="absolute -left-16 -top-16 block h-[180px] w-[180px] rounded-full bg-blue-600/20 blur-3xl"></div>
                        <div className="absolute -bottom-16 -right-16 block h-[180px] w-[180px] rounded-full bg-gold/20 blur-3xl"></div>

                        <div className="relative z-10 text-center">
                            <h3 className="text-2xl font-bold text-white mb-3">
                                هل تبحث عن المزيد من المصادر التعليمية؟
                            </h3>
                            <p className="mx-auto mt-2 text-gray-300">
                                استكشف قاعدة بياناتنا الشاملة التي تحتوي على آلاف الدروس والمحاضرات المسجلة.
                            </p>
                            <div className="mt-8 flex justify-center gap-4">
                                <button className="rounded-full bg-white px-8 py-3 text-base font-bold text-gray-900 shadow-sm hover:bg-gray-100 transition-colors flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    <span>تصفح الدليل الشامل</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
