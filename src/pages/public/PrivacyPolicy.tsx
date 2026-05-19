import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Shield, Lock, Eye, Database, UserCheck, FileText, Headphones } from 'lucide-react';
import { useSettings } from '../../store/settingsStore';
import { SEO } from '../../components/SEO';

export const PrivacyPolicy = () => {
    const { adminPhone } = useSettingsStore();
    return (
        <div className="min-h-full bg-white dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-100">
            <SEO
                title="سياسة الخصوصية"
                description="سياسة الخصوصية الخاصة بدارين السابعة - تعرف على كيفية حماية بياناتك الشخصية وضمان خصوصيتك عند استخدام منصتنا التعليمية."
            />
            <PublicNavbar />

            {/* Hero Section */}
            <section className="relative pt-24 pb-6 md:pt-36 md:pb-24 overflow-hidden bg-white dark:bg-slate-950">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 border border-gray-100 rounded-none shadow-sm mb-4">
                        <Shield size={14} className="text-blue-600" />
                        <span className="text-xs font-black tracking-[0.2em] uppercase">سياسة الخصوصية</span>
                    </div>

                    <h1 className="text-2xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 leading-tight font-heading">
                        حماية <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 inline-block py-1">بياناتك</span> أولويتنا
                    </h1>

                    <p className="text-sm md:text-lg text-gray-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                        نلتزم في دارين السابعة بحماية خصوصيتك وأمان معلوماتك الشخصية
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-8 md:py-20 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4 max-w-4xl">

                    {/* Introduction */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-none flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">مقدمة</h2>
                                <p className="text-sm md:text-base text-gray-600 dark:text-slate-400 leading-relaxed">
                                    تصف سياسة الخصوصية هذه كيفية جمع دارين السابعة للتعليم والتدريب ("نحن" أو "المعهد") واستخدامنا وحمايتنا ومشاركتنا للمعلومات الشخصية التي نجمعها من خلال منصتنا التعليمية. باستخدامك لخدماتنا، فإنك توافق على الممارسات الموضحة في هذه السياسة.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Data Collection */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-50 rounded-none flex items-center justify-center shrink-0">
                                <Database className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-3">المعلومات التي نجمعها</h2>
                                <div className="space-y-2 text-gray-600">
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-2">1. المعلومات الشخصية:</h3>
                                        <ul className="list-disc list-inside space-y-1 mr-4">
                                            <li>الاسم الكامل</li>
                                            <li>عنوان البريد الإلكتروني</li>
                                            <li>رقم الهاتف</li>
                                            <li>المرحلة الدراسية</li>
                                            <li>معلومات ولي الأمر (للطلاب القُصّر)</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-2">2. معلومات الاستخدام:</h3>
                                        <ul className="list-disc list-inside space-y-1 mr-4">
                                            <li>سجلات الحضور والغياب</li>
                                            <li>نتائج الاختبارات والتقييمات</li>
                                            <li>تفاعلات المنصة والدورات المسجلة</li>
                                            <li>بيانات الأداء الأكاديمي</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-2">3. المعلومات التقنية:</h3>
                                        <ul className="list-disc list-inside space-y-1 mr-4">
                                            <li>عنوان IP</li>
                                            <li>نوع المتصفح والجهاز</li>
                                            <li>ملفات تعريف الارتباط (Cookies)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Usage */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-indigo-50 rounded-none flex items-center justify-center shrink-0">
                                <Eye className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-3">كيف نستخدم معلوماتك</h2>
                                <div className="space-y-2 text-gray-600">
                                    <p>نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
                                    <ul className="list-disc list-inside space-y-1 mr-4">
                                        <li>تقديم وتحسين خدماتنا التعليمية</li>
                                        <li>إدارة حسابات الطلاب والمعلمين</li>
                                        <li>التواصل معك بشأن الدورات والجداول والإشعارات المهمة</li>
                                        <li>معالجة المدفوعات والفواتير</li>
                                        <li>تحليل وتحسين تجربة المستخدم</li>
                                        <li>الامتثال للمتطلبات القانونية والتنظيمية</li>
                                        <li>حماية أمن المنصة ومنع الاحتيال</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Protection */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-50 rounded-none flex items-center justify-center shrink-0">
                                <Lock className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-3">حماية البيانات</h2>
                                <div className="space-y-2 text-gray-600">
                                    <p>نتخذ إجراءات أمنية صارمة لحماية معلوماتك الشخصية، بما في ذلك:</p>
                                    <ul className="list-disc list-inside space-y-1 mr-4">
                                        <li>تشفير البيانات أثناء النقل والتخزين</li>
                                        <li>جدران حماية وأنظمة كشف التسلل</li>
                                        <li>الوصول المحدود للموظفين المصرح لهم فقط</li>
                                        <li>مراجعات أمنية منتظمة</li>
                                        <li>نسخ احتياطية آمنة للبيانات</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Sharing */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-amber-50 rounded-none flex items-center justify-center shrink-0">
                                <UserCheck className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-3">مشاركة المعلومات</h2>
                                <div className="space-y-2 text-gray-600">
                                    <p>لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط في الحالات التالية:</p>
                                    <ul className="list-disc list-inside space-y-1 mr-4">
                                        <li>مع المعلمين المعنيين لتقديم الخدمات التعليمية</li>
                                        <li>مع أولياء الأمور (للطلاب القُصّر)</li>
                                        <li>مع مزودي الخدمات الذين يساعدوننا في تشغيل المنصة (بموجب اتفاقيات سرية)</li>
                                        <li>عند الضرورة القانونية أو بأمر من المحكمة</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Rights */}
                    <div className="mb-4">
                        <div className="bg-gray-50 border border-gray-100 p-8 rounded-none">
                            <h2 className="text-2xl font-black text-gray-900 mb-4">حقوقك</h2>
                            <div className="space-y-2 text-gray-600">
                                <p>لديك الحق في:</p>
                                <ul className="list-disc list-inside space-y-1 mr-4">
                                    <li>الوصول إلى معلوماتك الشخصية ومراجعتها</li>
                                    <li>طلب تصحيح أو تحديث معلوماتك</li>
                                    <li>طلب حذف حسابك وبياناتك</li>
                                    <li>الاعتراض على معالجة بياناتك في ظروف معينة</li>
                                    <li>سحب موافقتك في أي وقت</li>
                                </ul>
                                <p className="mt-4 font-bold">للاستفسارات أو طلبات الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني أو الهاتف.</p>
                            </div>
                        </div>
                    </div>

                    {/* Updates */}
                    <div className="mb-4">
                        <h2 className="text-2xl font-black text-gray-900 mb-4">التحديثات على هذه السياسة</h2>
                        <p className="text-gray-600 leading-relaxed">
                            قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإخطارك بأي تغييرات جوهرية عن طريق نشر السياسة الجديدة على هذه الصفحة وتحديث تاريخ "آخر تحديث" أدناه.
                        </p>
                        <p className="text-sm text-gray-400 mt-4 font-bold">
                            آخر تحديث: 21 يناير 2026
                        </p>
                    </div>

                    {/* Support Button Section */}
                    <div className="flex flex-col items-center justify-center py-6 px-6 bg-gradient-to-br from-rose-600 to-rose-500 border border-rose-500 mb-8 relative overflow-hidden group rounded-2xl shadow-xl shadow-rose-500/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>

                        <div className="relative z-10 text-center">
                            <h2 className="text-2xl font-black text-white mb-2">هل لديك استفسارات فنية؟</h2>
                            <p className="text-rose-100 mb-8 max-w-md mx-auto">فريق الدعم الفني متواجد لمساعدتك في أي وقت عبر الواتساب</p>

                            <a
                                href={`https://wa.me/2${adminPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-4 bg-[#f46464] text-white px-6 py-3 w-full sm:w-auto rounded-xl font-bold hover:bg-[#e35555] transition-all group relative overflow-hidden shadow-lg border border-white/20"
                            >
                                <Headphones className="w-5 h-5 relative z-10" />
                                <span className="text-base md:text-lg relative z-10">تواصل مع الدعم الفني</span>
                            </a>
                        </div>
                    </div>

                </div>
            </section>

            <PublicFooter />
        </div>
    );
};
