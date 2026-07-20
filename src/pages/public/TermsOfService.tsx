import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Scale, FileCheck, AlertCircle, UserX, CreditCard, BookOpen, Headphones } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { SEO } from '../../components/SEO';

export const TermsOfService = () => {
    const adminPhone = useSettingsStore(s => s.adminPhone);
    return (
        <div className="min-h-full bg-card dark:bg-background font-sans text-main dark:text-main">
            <SEO
                title="شروط الاستخدام والأحكام | دارين السابعة"
                description="شروط وأحكام استخدام منصة دارين السابعة للتعليم عن بعد. تعرف على حقوقك والتزاماتك كطالب، ولي أمر، أو معلم عند استخدام خدماتنا."
                url="https://dareen.cloud/terms-of-service"
                image="/dareen_logo_new.jpg"
                breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'شروط الاستخدام', item: '/terms-of-service' }]}
            />
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'WebPage',
                    name: 'شروط الاستخدام والأحكام - دارين السابعة',
                    description: 'شروط وأحكام استخدام منصة دارين السابعة للتعليم عن بعد',
                    publisher: { '@type': 'EducationalOrganization', name: 'دارين السابعة', url: 'https://dareen.cloud' }
                })}
            </script>
            <PublicNavbar />

            {/* Hero Section */}
            <section className="relative pt-24 pb-6 md:pt-36 md:pb-24 overflow-hidden bg-card">
                <div className="absolute top-0 start-0 w-96 h-96 bg-success/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 end-0 w-64 h-64 bg-warning/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-card text-main border border-border rounded-none shadow-sm mb-4">
                        <Scale size={14} className="text-success" />
                        <span className="text-xs font-black tracking-label uppercase">الشروط والأحكام</span>
                    </div>

                    <h1 className="text-xl md:text-5xl font-black text-main mb-3 leading-tight font-heading">
                        شروط <span className="text-transparent bg-clip-text bg-gradient-to-r from-success to-success inline-block py-1">الاستخدام</span> والأحكام
                    </h1>

                    <p className="text-sm md:text-lg text-muted max-w-2xl mx-auto leading-relaxed font-medium">
                        يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام خدماتنا
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-8 md:py-20 bg-card">
                <div className="container mx-auto px-4 max-w-4xl">

                    {/* Acceptance */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-success-light rounded-none flex items-center justify-center shrink-0">
                                <FileCheck className="w-6 h-6 text-success" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-main mb-2">قبول الشروط</h2>
                                <p className="text-sm md:text-base text-muted leading-relaxed">
                                    بالوصول إلى منصة دارين السابعة للتعليم والتدريب واستخدامها، فإنك توافق على الالتزام بهذه الشروط والأحكام وجميع القوانين واللوائح المعمول بها. إذا كنت لا توافق على أي من هذه الشروط، يُمنع عليك استخدام هذه المنصة أو الوصول إليها.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-info-light rounded-none flex items-center justify-center shrink-0">
                                <BookOpen className="w-6 h-6 text-info" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-main mb-3">الخدمات المقدمة</h2>
                                <div className="space-y-2 text-muted">
                                    <p>يوفر دارين السابعة خدمات تعليمية عبر الإنترنت تشمل:</p>
                                    <ul className="list-disc list-inside space-y-1 ms-4">
                                        <li>دروس خصوصية مباشرة عبر الإنترنت</li>
                                        <li>دورات تعليمية في مختلف المواد والمناهج</li>
                                        <li>تحفيظ القرآن الكريم</li>
                                        <li>دورات اللغات والمهارات</li>
                                        <li>متابعة أكاديمية وتقييمات دورية</li>
                                    </ul>
                                    <p className="font-bold">
                                        نحتفظ بالحق في تعديل أو إيقاف أي خدمة في أي وقت دون إشعار مسبق.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registration */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-primary-soft rounded-none flex items-center justify-center shrink-0">
                                <UserX className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-main mb-3">التسجيل والحساب</h2>
                                <div className="space-y-2 text-muted">
                                    <div>
                                        <h3 className="font-bold text-main mb-2">1. إنشاء الحساب:</h3>
                                        <ul className="list-disc list-inside space-y-1 ms-4">
                                            <li>يجب تقديم معلومات دقيقة وكاملة عند التسجيل</li>
                                            <li>يجب أن يكون عمر المستخدم 13 عامًا على الأقل، أو بموافقة ولي الأمر</li>
                                            <li>أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك</li>
                                            <li>أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-main mb-2">2. إنهاء الحساب:</h3>
                                        <p>نحتفظ بالحق في تعليق أو إنهاء حسابك إذا:</p>
                                        <ul className="list-disc list-inside space-y-1 ms-4">
                                            <li>انتهكت أي من هذه الشروط والأحكام</li>
                                            <li>قدمت معلومات كاذبة أو مضللة</li>
                                            <li>انخرطت في سلوك احتيالي أو غير قانوني</li>
                                            <li>أسأت استخدام المنصة أو أضررت بتجربة المستخدمين الآخرين</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-warning-light rounded-none flex items-center justify-center shrink-0">
                                <CreditCard className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-main mb-3">الرسوم والدفع</h2>
                                <div className="space-y-2 text-muted">
                                    <div>
                                        <h3 className="font-bold text-main mb-2">1. الأسعار:</h3>
                                        <ul className="list-disc list-inside space-y-1 ms-4">
                                            <li>جميع الأسعار معروضة بالدينار الكويتي (KWD) ما لم يُذكر خلاف ذلك</li>
                                            <li>نحتفظ بالحق في تغيير الأسعار في أي وقت</li>
                                            <li>التغييرات في الأسعار لن تؤثر على الدورات المدفوعة مسبقًا</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-main mb-2">2. طرق الدفع:</h3>
                                        <ul className="list-disc list-inside space-y-1 ms-4">
                                            <li>نقبل الدفع عبر البطاقات الائتمانية والتحويل البنكي</li>
                                            <li>يجب سداد الرسوم قبل بدء الدورة أو الحصة</li>
                                            <li>الفواتير غير المدفوعة قد تؤدي إلى تعليق الخدمة</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-main mb-2">3. سياسة الاسترداد:</h3>
                                        <ul className="list-disc list-inside space-y-1 ms-4">
                                            <li>يمكن طلب استرداد كامل خلال 7 أيام من التسجيل إذا لم تبدأ الدورة</li>
                                            <li>بعد بدء الدورة، لا يمكن استرداد الرسوم إلا في حالات استثنائية</li>
                                            <li>الحصص الملغاة من قبل الطالب بدون إشعار مسبق (24 ساعة) غير قابلة للاسترداد</li>
                                            <li>في حالة إلغاء المعهد للحصة، سيتم إعادة جدولتها أو استرداد الرسوم</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Conduct */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-error-light rounded-none flex items-center justify-center shrink-0">
                                <AlertCircle className="w-6 h-6 text-error" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-main mb-3">قواعد السلوك</h2>
                                <div className="space-y-2 text-muted">
                                    <p>عند استخدام منصتنا، توافق على:</p>
                                    <ul className="list-disc list-inside space-y-1 ms-4">
                                        <li>احترام المعلمين والطلاب الآخرين</li>
                                        <li>عدم مشاركة محتوى غير لائق أو مسيء</li>
                                        <li>عدم التحرش أو التنمر على أي شخص</li>
                                        <li>عدم انتحال شخصية الآخرين</li>
                                        <li>عدم نشر معلومات خاطئة أو مضللة</li>
                                        <li>عدم محاولة اختراق أو تعطيل المنصة</li>
                                        <li>عدم استخدام المنصة لأغراض تجارية بدون إذن</li>
                                        <li>احترام حقوق الملكية الفكرية</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Intellectual Property */}
                    <div className="mb-4">
                        <div className="bg-background border border-border p-4 sm:p-8 rounded-none">
                            <h2 className="text-2xl font-black text-main mb-4">الملكية الفكرية</h2>
                            <div className="space-y-2 text-muted">
                                <p>جميع المحتويات والمواد التعليمية المتاحة على المنصة، بما في ذلك النصوص والصور ومقاطع الفيديو والشعارات، هي ملك لدارين السابعة أو مرخصة لنا.</p>
                                <p className="font-bold mt-4">يُحظر عليك:</p>
                                <ul className="list-disc list-inside space-y-1 ms-4">
                                    <li>نسخ أو توزيع أو تعديل أي محتوى دون إذن كتابي</li>
                                    <li>استخدام المحتوى لأغراض تجارية</li>
                                    <li>إزالة أي علامات تجارية أو حقوق نشر</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Liability */}
                    <div className="mb-4">
                        <h2 className="text-2xl font-black text-main mb-4">إخلاء المسؤولية</h2>
                        <div className="space-y-2 text-muted">
                            <p>يتم توفير الخدمات "كما هي" دون أي ضمانات من أي نوع. نحن لا نضمن:</p>
                            <ul className="list-disc list-inside space-y-1 ms-4">
                                <li>أن الخدمات ستكون متاحة دائمًا أو خالية من الأخطاء</li>
                                <li>دقة أو اكتمال المحتوى التعليمي</li>
                                <li>نتائج أكاديمية محددة</li>
                            </ul>
                            <p className="font-bold mt-4">
                                لن نكون مسؤولين عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام أو عدم القدرة على استخدام خدماتنا.
                            </p>
                        </div>
                    </div>

                    {/* Changes */}
                    <div className="mb-4">
                        <h2 className="text-2xl font-black text-main mb-4">التعديلات على الشروط</h2>
                        <p className="text-muted leading-relaxed">
                            نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة مع تحديث تاريخ "آخر تحديث". استمرارك في استخدام المنصة بعد نشر التغييرات يعني قبولك لهذه التغييرات.
                        </p>
                        <p className="text-sm text-muted mt-4 font-bold">
                            آخر تحديث: 21 يناير 2026
                        </p>
                    </div>

                    {/* Governing Law */}
                    <div className="mb-4">
                        <h2 className="text-2xl font-black text-main mb-4">القانون الحاكم</h2>
                        <p className="text-muted leading-relaxed">
                            تخضع هذه الشروط والأحكام وتُفسر وفقًا لقوانين دولة الكويت. أي نزاعات تنشأ عن هذه الشروط ستخضع للاختصاص القضائي الحصري لمحاكم الكويت.
                        </p>
                    </div>

                    {/* Support Button Section */}
                    <div className="flex flex-col items-center justify-center py-6 px-6 bg-gradient-to-br from-background to-white dark:to-card border border-border mb-8 relative overflow-hidden group rounded-card">
                        <div className="absolute top-0 start-0 w-32 h-32 bg-success/5 rounded-full -ms-16 -mt-16 blur-3xl"></div>
                        <div className="absolute bottom-0 end-0 w-32 h-32 bg-warning/5 rounded-full -me-16 -mb-16 blur-3xl"></div>

                        <div className="relative z-10 text-center">
                            <h2 className="text-2xl font-black text-main mb-2">هل لديك استفسارات فنية؟</h2>
                            <p className="text-muted mb-8 max-w-md mx-auto">فريق الدعم الفني متواجد لمساعدتك في أي وقت عبر الواتساب</p>

                            <a
                                href={`https://wa.me/${adminPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-4 bg-card text-main px-6 py-3 w-full sm:w-auto rounded-card font-bold hover:bg-success hover:text-on-success transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-success to-success opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
