import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { RefreshCcw, ShieldCheck, AlertCircle, CreditCard, Clock, CalendarX, Headphones } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { SEO } from '../../components/SEO';

export const RefundPolicy = () => {
    const { adminPhone } = useSettingsStore();
    const whatsappNumber = adminPhone.replace(/\D/g, '');

    return (
        <div className="min-h-full bg-white dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-100">
            <SEO
                title="سياسة الاسترداد والاسترجاع | دارين السابعة"
                description="سياسة استرداد الرسوم وإلغاء الاشتراكات في دارين السابعة. تعرف على شروط الاسترجاع، إلغاء الحصص، وآلية استرداد المبالغ المدفوعة."
                url="https://dareen.cloud/refund-policy"
            />
            <PublicNavbar />

            {/* Hero Section */}
            <section className="relative pt-24 pb-6 md:pt-36 md:pb-24 overflow-hidden bg-[#FDFCF8]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 border border-gray-100 rounded-none shadow-sm mb-4">
                        <RefreshCcw size={14} className="text-blue-600" />
                        <span className="text-xs font-black tracking-[0.2em] uppercase">السياسات المالية</span>
                    </div>

                    <h1 className="text-xl md:text-5xl font-black text-gray-900 mb-3 leading-tight font-heading">
                        سياسة <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-900 inline-block py-1">الاسترجاع</span> والإلغاء
                    </h1>

                    <p className="text-sm md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium mb-12 md:mb-16">
                        نحن نقدر ثقتكم بنا، ونحرص على توضيح كافة حقوقكم المالية وضوابط الاشتراك
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-8 md:py-10 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">

                    {/* General Principles */}
                    <div className="mb-12">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-none flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">مبادئ عامة</h2>
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                    في دارين السابعة، نسعى لتقديم خدمة تعليمية متميزة. تهدف هذه السياسة إلى ضمان الشفافية والعدالة لكل من الطالب والمعهد فيما يخص الرسوم المدفوعة وإجراءات الإلغاء.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Refund Eligibility */}
                    <div className="mb-12">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-50 rounded-none flex items-center justify-center shrink-0">
                                <CreditCard className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-3">حالات طلب الاسترداد</h2>
                                <div className="space-y-4 text-gray-600">
                                    <div className="p-4 bg-emerald-50/50 border-r-4 border-emerald-500">
                                        <h3 className="font-bold text-gray-800 mb-1">قبل بدء الدورة:</h3>
                                        <p>يمكن استرداد كامل المبلغ المدفوع (بعد خصم رسوم التحويل البنكي إن وجدت) إذا تم تقديم طلب الاسترداد قبل 48 ساعة على الأقل من موعد أول حصة.</p>
                                    </div>
                                    <div className="p-4 bg-amber-50/50 border-r-4 border-amber-500">
                                        <h3 className="font-bold text-gray-800 mb-1">بعد الحصة الأولى (التجريبية):</h3>
                                        <p>إذا كانت الدورة تتيح حصة تجريبية ولم يرغب الطالب في الاستمرار، يمكنه طلب استرداد باقي المبلغ المدفوع في غضون 24 ساعة من انتهاء الحصة الأولى.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 border-r-4 border-gray-400">
                                        <h3 className="font-bold text-gray-800 mb-1">خلال الدورة:</h3>
                                        <p>لا يتم استرداد الرسوم بمجرد تجاوز الحصة الثانية إلا في حالات الظروف القهرية التي يقدرها المعهد، مع خصم قيمة الحصص التي تم تقديمها بالفعل.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Rules */}
                    <div className="mb-12">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-50 rounded-none flex items-center justify-center shrink-0">
                                <CalendarX className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-3">سياسة إلغاء الحصص</h2>
                                <div className="space-y-4 text-gray-600">
                                    <ul className="list-disc list-inside space-y-3 mr-4">
                                        <li><span className="font-bold">إلغاء الطالب:</span> يجب إخطار المعهد بالإلغاء قبل 24 ساعة من موعد الحصة. في حال الإلغاء المفاجئ، يتم احتساب الحصة كأنها تم تقديمها.</li>
                                        <li><span className="font-bold">إلغاء المعهد:</span> في حال اعتذار المعلم، يلتزم المعهد بتعويض الحصة في موعد آخر يناسب الطالب أو تمديد صلاحية الباقة.</li>
                                        <li><span className="font-bold">فوات الحصة:</span> غياب الطالب عن موعد الحصة المتفق عليه دون إخطار مسبق يُسقط حقه في التعويض أو الاسترداد لتلك الحصة.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Processing Time */}
                    <div className="mb-12">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-indigo-50 rounded-none flex items-center justify-center shrink-0">
                                <Clock className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-3">إجراءات الاسترداد المالي</h2>
                                <div className="space-y-2 text-gray-600 leading-relaxed">
                                    <p>تستغرق عملية معالجة طلب الاسترداد من <span className="font-bold">5 إلى 10 أيام عمل</span> بعد الموافقة على الطلب. يتم إعادة المبلغ إلى نفس وسيلة الدفع التي تم استخدامها في عملية الشراء الأصلية.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technical Issues */}
                    <div className="mb-4 md:mb-6">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 md:p-8 border border-slate-700/50 relative overflow-hidden">
                            <AlertCircle className="absolute -bottom-6 -left-6 text-white/5 w-48 h-48" />
                            <div className="flex items-center gap-3 mb-4 relative z-10 border-b border-slate-700/50 pb-3">
                                <div className="w-8 h-8 bg-amber-500/20 flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4 text-amber-400" />
                                </div>
                                <h2 className="text-lg md:text-xl font-black text-white">المشاكل التقنية</h2>
                            </div>
                            <p className="text-white/80 text-sm md:text-base leading-relaxed relative z-10 font-medium">
                                في حال عدم إمكانية تقديم الحصة بسبب مشاكل تقنية من طرف المعهد، يتم تعويض الطالب بحصة بديلة. أما إذا كان الخلل من طرف الطالب (انقطاع الإنترنت أو تعطل الجهاز)، فالمعهد غير مسؤول عن تعويض الحصة، ومع ذلك نحاول دائماً المساعدة في حال كان هناك وقت متاح.
                            </p>
                        </div>
                    </div>

                    {/* Last Update */}
                    <div className="mb-4 md:mb-6 text-center border-t border-gray-100 pt-6">
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                            آخر تحديث للسياسة: فبراير 2026
                        </p>
                    </div>

                    {/* Support Button Section */}
                    <div className="flex flex-col items-center justify-center py-6 px-6 bg-gradient-to-br from-rose-600 to-rose-500 border border-rose-500 mb-4 relative overflow-hidden group rounded-2xl shadow-xl shadow-rose-500/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>

                        <div className="relative z-10 text-center">
                            <h2 className="text-2xl font-black text-white mb-2">تحتاج مساعدة بخصوص طلبك؟</h2>
                            <p className="text-rose-100 mb-8 max-w-md mx-auto">فريق الحسابات متاح للرد على استفساراتكم المالية فوراً</p>

                            <a
                                href={`https://wa.me/${whatsappNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-4 bg-blue-600 text-white px-10 py-4 w-full sm:w-auto rounded-xl font-bold hover:bg-blue-700 transition-all group relative overflow-hidden shadow-lg border border-white/20"
                            >
                                <Headphones className="w-5 h-5 relative z-10" />
                                <span className="text-base md:text-lg relative z-10">تواصل مع قسم الحسابات</span>
                            </a>
                        </div>
                    </div>

                </div>
            </section>

            <PublicFooter />
        </div>
    );
};
