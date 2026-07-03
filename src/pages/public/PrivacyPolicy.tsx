import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Shield, Lock, Eye, Database, UserCheck, FileText, Headphones, Sparkles } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { SEO } from '../../components/SEO';

export const PrivacyPolicy = () => {
    const { adminPhone } = useSettingsStore();
    return (
        <div className="min-h-full bg-white dark:bg-background font-sans text-main dark:text-main">
            <SEO
                title="سياسة الخصوصية والأمان | دارين السابعة"
                description="سياسة الخصوصية لمنصة دارين السابعة للتعليم عن بعد. نضمن حماية بيانات الطلاب وأولياء الأمور والمعلمين وفق أعلى معايير الأمان والخصوصية."
                url="https://dareen.cloud/privacy-policy"
                image="/dareen_logo_new.jpg"
                breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'سياسة الخصوصية', item: '/privacy-policy' }]}
            />
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'WebPage',
                    name: 'سياسة الخصوصية والأمان - دارين السابعة',
                    description: 'سياسة الخصوصية لمنصة دارين السابعة للتعليم عن بعد',
                    publisher: { '@type': 'EducationalOrganization', name: 'دارين السابعة', url: 'https://dareen.cloud' },
                    about: { '@type': 'Thing', name: 'سياسة الخصوصية وحماية البيانات' }
                })}
            </script>
            <MobileHeader />

            {/* Hero Section */}
            <section className="relative pt-4 pb-4 md:pt-36 md:pb-24 overflow-hidden bg-primary md:bg-white dark:md:bg-background rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-primary/50 dark:border-primary/50 md:border-0 mb-4 md:mb-0 mx-4 md:mx-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-info/5 dark:bg-info/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 hidden md:block"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 dark:bg-gold/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 hidden md:block"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 md:bg-primary-soft/60 backdrop-blur-sm border border-white/20 md:border-primary rounded-full mb-3">
                        <Sparkles size={12} className="text-on-primary md:text-primary" />
                        <span className="text-[9px] md:text-[10px] font-black text-on-primary md:text-primary">سياسة الخصوصية</span>
                    </div>

                    <h1 className="text-[18px] md:text-5xl font-black text-on-primary md:text-main mb-1 md:mb-3 leading-tight font-heading">
                        حماية <span className="text-warning inline-block py-1">بياناتك</span> أولويتنا
                    </h1>

                    <p className="text-[9px] md:text-lg text-on-primary/80 md:text-muted max-w-2xl mx-auto leading-relaxed font-medium">
                        نلتزم في دارين السابعة بحماية خصوصيتك وأمان معلوماتك الشخصية
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-4 md:pb-8 bg-white dark:bg-background">
                <div className="container mx-auto px-4 max-w-4xl">

                    {/* Introduction */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-info-light dark:bg-info/30 rounded-none flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6 text-info dark:text-info" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-main dark:text-on-primary mb-2">مقدمة</h2>
                                <p className="text-sm md:text-base text-muted dark:text-muted leading-relaxed">
                                    تصف سياسة الخصوصية هذه كيفية جمع دارين السابعة للتعليم والتدريب ("نحن" أو "المعهد") واستخدامنا وحمايتنا ومشاركتنا للمعلومات الشخصية التي نجمعها من خلال منصتنا التعليمية. باستخدامك لخدماتنا، فإنك توافق على الممارسات الموضحة في هذه السياسة.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Data Collection */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-success-light dark:bg-success/30 rounded-none flex items-center justify-center shrink-0">
                                <Database className="w-6 h-6 text-success" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-main mb-3">المعلومات التي نجمعها</h2>
                                <div className="space-y-2 text-muted dark:text-muted text-[9px] md:text-sm">
                                    <div>
                                        <h3 className="font-bold text-main dark:text-on-primary mb-2">1. المعلومات الشخصية:</h3>
                                        <ul className="list-disc list-inside space-y-1 mr-4">
                                            <li>الاسم الكامل</li>
                                            <li>عنوان البريد الإلكتروني</li>
                                            <li>رقم الهاتف</li>
                                            <li>المرحلة الدراسية</li>
                                            <li>معلومات ولي الأمر (للطلاب القُصّر)</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-main mb-2">2. معلومات الاستخدام:</h3>
                                        <ul className="list-disc list-inside space-y-1 mr-4">
                                            <li>سجلات الحضور والغياب</li>
                                            <li>نتائج الاختبارات والتقييمات</li>
                                            <li>تفاعلات المنصة والدورات المسجلة</li>
                                            <li>بيانات الأداء الأكاديمي</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-main mb-2">3. المعلومات التقنية:</h3>
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
                            <div className="w-12 h-12 bg-primary-soft dark:bg-primary/10 rounded-none flex items-center justify-center shrink-0">
                                <Eye className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-main dark:text-on-primary mb-3">كيف نستخدم معلوماتك</h2>
                                <div className="space-y-2 text-muted dark:text-muted text-[9px] md:text-sm">
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
                            <div className="w-12 h-12 bg-error-light dark:bg-error/30 rounded-none flex items-center justify-center shrink-0">
                                <Lock className="w-6 h-6 text-error" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-main dark:text-on-primary mb-3">حماية البيانات</h2>
                                <div className="space-y-2 text-muted dark:text-muted text-[9px] md:text-sm">
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
                            <div className="w-12 h-12 bg-warning-light dark:bg-warning/30 rounded-none flex items-center justify-center shrink-0">
                                <UserCheck className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-main dark:text-on-primary mb-3">مشاركة المعلومات</h2>
                                <div className="space-y-2 text-muted dark:text-muted text-[9px] md:text-sm">
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
                        <div className="bg-background dark:bg-card/50 border border-border dark:border-border p-8 rounded-none">
                            <h2 className="text-2xl font-black text-main dark:text-on-primary mb-4">حقوقك</h2>
                            <div className="space-y-2 text-muted dark:text-muted text-[9px] md:text-sm">
                                <p>لديك الحق في:</p>
                                <ul className="list-disc list-inside space-y-1 mr-4">
                                    <li>الوصول إلى معلوماتك الشخصية ومراجعتها</li>
                                    <li>طلب تصحيح أو تحديث معلوماتك</li>
                                    <li>طلب حذف حسابك وبياناتك</li>
                                    <li>الاعتراض على معالجة بياناتك في ظروف معينة</li>
                                    <li>سحب موافقتك في أي وقت</li>
                                </ul>
                                <p className="mt-4 font-bold text-[10px] md:text-base dark:text-dim">للاستفسارات أو طلبات الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني أو الهاتف.</p>
                            </div>
                        </div>
                    </div>

                    {/* Updates */}
                    <div className="mb-4">
                        <h2 className="text-2xl font-black text-main dark:text-on-primary mb-4">التحديثات على هذه السياسة</h2>
                        <p className="text-muted dark:text-muted text-[10px] md:text-base leading-relaxed">
                            قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإخطارك بأي تغييرات جوهرية عن طريق نشر السياسة الجديدة على هذه الصفحة وتحديث تاريخ "آخر تحديث" أدناه.
                        </p>
                        <p className="text-sm text-muted dark:text-muted mt-4 font-bold">
                            آخر تحديث: 21 يناير 2026
                        </p>
                    </div>

                    {/* Support Button Section */}
                    <div className="flex flex-col items-center justify-center py-4 px-6 bg-primary border border-primary/20 mb-4 relative overflow-hidden group rounded-2xl shadow-xl shadow-primary/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>

                        <div className="relative z-10 text-center">
                            <h2 className="text-2xl font-black text-on-primary mb-2">هل لديك استفسارات فنية؟</h2>
                            <p className="text-on-primary/80 mb-8 max-w-md mx-auto">فريق الدعم الفني متواجد لمساعدتك في أي وقت عبر الواتساب</p>

                            <a
                                href={`https://wa.me/${adminPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-4 bg-white text-primary hover:bg-white/90 px-6 py-3 w-full sm:w-auto rounded-xl font-bold transition-all group relative overflow-hidden shadow-lg border border-white/20"
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
