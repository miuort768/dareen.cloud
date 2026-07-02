import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Briefcase, FileCheck, Clock, Shield, Award, UserCheck, AlertCircle, Headphones } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { SEO } from '../../components/SEO';

export const TermsOfWork = () => {
    const { adminPhone } = useSettingsStore();
    return (
        <div className="min-h-full bg-card dark:bg-background font-sans text-main dark:text-main">
            <SEO
                title="قوانين العمل | دارين السابعة"
                description="قوانين وسياسات العمل في دارين السابعة - تعرف على حقوقك وواجباتك كمعلم أو موظف في منصتنا التعليمية."
                url="https://dareen.cloud/terms-of-work"
                breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'قوانين العمل', item: '/terms-of-work' }]}
            />
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'WebPage',
                    name: 'قوانين العمل - دارين السابعة',
                    description: 'قوانين وسياسات العمل في دارين السابعة للمعلمين والموظفين',
                    publisher: { '@type': 'EducationalOrganization', name: 'دارين السابعة', url: 'https://dareen.cloud' }
                })}
            </script>
            <MobileHeader />

            {/* Hero Section */}
            <section className="relative pt-4 pb-4 md:pt-36 md:pb-10 overflow-hidden bg-gradient-to-br from--[var(--bg-primary)] via--[var(--bg-primary)] to-white dark:from--[var(--bg-primary)] dark:via--[var(--bg-primary)]/30 dark:to-[var(--bg-primary-active)] md:bg-card dark:md:bg-primary-active rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-primary/50 dark:border-primary/50 md:border-0 mb-4 md:mb-0 mx-4 md:mx-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 hidden md:block"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 hidden md:block"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-2 bg-white/80 md:bg-white dark:bg-primary-active/80 dark:md:bg-primary-active text-primary md:text-main dark:md:text-dim border border-primary/50 dark:border-primary/50 md:border-border dark:md:border-border rounded-full md:rounded-none shadow-sm mb-3 md:mb-4">
                        <Briefcase size={12} className="text-primary" />
                        <span className="text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">قوانين العمل</span>
                    </div>

                    <h1 className="text-[18px] md:text-5xl font-black text-primary md:text-main dark:text-on-primary mb-1 md:mb-3 leading-tight font-heading">
                        قوانين <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--bg-primary)] to--[var(--bg-primary)] inline-block py-1">العمل</span> في دارين السابعة
                    </h1>

                    <p className="text-[9px] md:text-lg text-muted md:text-muted dark:text-muted max-w-2xl mx-auto leading-relaxed font-medium">
                        لائحة العمل | السياسات والإجراءات المنظمة لعمل الكادر التعليمي .
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-4 md:pb-8 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">

                    {/* Introduction */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-primary-soft rounded-none flex items-center justify-center shrink-0">
                                <FileCheck className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-main mb-2">مقدمة</h2>
                                <p className="text-sm md:text-base text-muted leading-relaxed">
                                    تهدف هذه القوانين إلى تنظيم علاقة العمل بين دارين السابعة وجميع المعلمين والموظفين العاملين في المنصة. الالتزام بهذه القوانين يضمن بيئة عمل مهنية ومنتظمة تحقق أهدافنا التعليمية المشتركة.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Teacher Qualifications */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-success-light rounded-none flex items-center justify-center shrink-0">
                                <Award className="w-6 h-6 text-success" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-main mb-3">مؤهلات المعلمين</h2>
                                <div className="space-y-1 text-muted text-[9px] md:text-sm">
                                    <ul className="list-disc list-inside space-y-1 mr-4">
                                        <li>حصول المعلم على مؤهل جامعي في التخصص المطلوب</li>
                                        <li>خبرة لا تقل عن سنتين في التدريس أون لاين أو حضوري</li>
                                        <li>اجتياز المقابلة الشخصية والتقييم العملي</li>
                                        <li>تقديم وثائق ومستندات رسمية تثبت المؤهلات والخبرات</li>
                                        <li>اجتياز دورة تدريبية في استخدام منصة دارين السابعة</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Code of Conduct */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-primary-soft rounded-none flex items-center justify-center shrink-0">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-main mb-3">قواعد السلوك المهني</h2>
                                <div className="space-y-1 text-muted text-[9px] md:text-sm">
                                    <p>يلتزم جميع المعلمين والموظفين بـ:</p>
                                    <ul className="list-disc list-inside space-y-1 mr-4">
                                        <li>الالتزام بمواعيد الحصص وعدم التأخير أكثر من 5 دقائق</li>
                                        <li>ارتداء الزي المناسب والمحترم أثناء الحصص</li>
                                        <li>لغة محترمة ومناسبة في التعامل مع الطلاب وأولياء الأمور</li>
                                        <li>الحفاظ على سرية معلومات الطلاب وعدم مشاركتها او تسريبها</li>
                                        <li>عدم إقامة حصص خصوصية خارج المنصة مع طلابنا</li>
                                        <li>الإبلاغ الفوري عن أي مشكلات تقنية أو سلوكية تطرأ أثناء الحصة</li>
                                        <li>الالتزام بمنهج دارين السابعة وخططها الدراسية</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance & Punctuality */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-warning-light rounded-none flex items-center justify-center shrink-0">
                                <Clock className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-main mb-3">الحضور والمواعيد</h2>
                                <div className="space-y-1 text-muted text-[9px] md:text-sm">
                                    <ul className="list-disc list-inside space-y-1 mr-4">
                                        <li>الدخول قبل موعد الحصة بـ 5 دقائق لضمان جاهزية التقنية</li>
                                        <li>خصم 25% عند التأخير لأكثر من 10 دقائق دون عذر.</li>
                                        <li>إبلاغ الإدارة قبل 24 ساعة لإلغاء الحصة.</li>
                                        <li>الإلغاء المفاجئ يؤدي إلى خصم قيمة الحصة كاملة</li>
                                        <li>3 إلغاءات شهرية بعذر مقبول، ثم يُخصم من الراتب.</li>
                                        <li>الإجازات الرسمية تُحتسب حسب تقويم دارين السابعة</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Terms */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-info-light rounded-none flex items-center justify-center shrink-0">
                                <Award className="w-6 h-6 text-info" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-main mb-3">نظام المكافآت والخصومات</h2>
                                <div className="space-y-1 text-muted text-[9px] md:text-sm">
                                    <div>
                                        <h3 className="font-bold text-main mb-2">المكافآت:</h3>
                                        <ul className="list-disc list-inside space-y-1 mr-4">
                                            <li>مكافأة التميز تُمنح بنهاية كل فصل دراسي.</li>
                                            <li>مكافأة الالتزام للمعلمين دون أي غياب شهريًا.</li>
                                            <li>مكافأة زيادة عدد الطلاب: عند وصول عدد الطلاب المسجلين لديه إلى 15 طالباً</li>
                                        </ul>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="font-bold text-main mb-2">الخصومات:</h3>
                                        <ul className="list-disc list-inside space-y-1 mr-4">
                                            <li>التأخير بدون عذر: خصم 25% من قيمة الحصة</li>
                                            <li>الغياب بدون إشعار: خصم قيمة الحصة كاملة</li>
                                            <li>شكوى واردة من ولي الأمر (بعد التحقق): إنذار أول ثم خصم</li>
                                            <li>عدم الالتزام بزي العمل الرسمي: إنذار</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Termination */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-error-light rounded-none flex items-center justify-center shrink-0">
                                <AlertCircle className="w-6 h-6 text-error" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-main mb-3">إنهاء التعاقد</h2>
                                <div className="space-y-1 text-muted text-[9px] md:text-sm">
                                    <p>يحق لدارين السابعة إنهاء التعاقد مع المعلم أو الموظف في الحالات التالية:</p>
                                    <ul className="list-disc list-inside space-y-1 mr-4">
                                        <li>الإخلال الجسيم بقواعد السلوك المهني</li>
                                        <li>أكثر من 5 غيابات شهريًا دون عذر مقبول.</li>
                                        <li>تلقي 3 شكاوى مؤكدة من أولياء الأمور خلال شهر واحد</li>
                                        <li>استخدام المنصة لأغراض غير قانونية أو غير أخلاقية</li>
                                        <li>محاولة جذب طلاب المنصة للتدريس خارجها</li>
                                    </ul>
                                    <p className="font-bold mt-4">مدة الإشعار بإنهاء التعاقد: أسبوعان من تاريخ الإبلاغ.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional Development */}
                    <div className="mb-4">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-info-light rounded-none flex items-center justify-center shrink-0">
                                <UserCheck className="w-6 h-6 text-info" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-main mb-3">التطوير المهني</h2>
                                <div className="space-y-1 text-muted text-[9px] md:text-sm">
                                    <ul className="list-disc list-inside space-y-1 mr-4">
                                        <li>حضور ورش التطوير المهني إلزامي.</li>
                                        <li>تقييم أداء المعلم شهرياً من قبل المشرف الأكاديمي</li>
                                        <li>تقديم تقرير تقدم الطلاب بشكل أسبوعي للإدارة</li>
                                        <li>المشاركة في الاجتماعات الدورية للمعلمين</li>
                                        <li>فرصة الترقية بناءً على الأداء والتقييم السنوي</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Commitment */}
                    <div className="bg-background border border-border p-8 rounded-none mb-4">
                        <h2 className="text-xl md:text-2xl font-black text-main mb-4">التعهد والالتزام</h2>
                        <div className="space-y-1 text-muted text-[9px] md:text-sm">
                            <p>بتوقيعك على هذه القوانين، فإنك تتعهد بـ:</p>
                            <ul className="list-disc list-inside space-y-1 mr-4">
                                <li>الالتزام بجميع القوانين والسياسات المذكورة أعلاه</li>
                                <li>تقديم أفضل ما لديك من جهد وخبرة لخدمة طلاب المنصة</li>
                                <li>التمثيل المشرف لدارين السابعة في جميع تعاملاتك</li>
                                <li>المساهمة في خلق بيئة تعليمية إيجابية ومحفزة</li>
                            </ul>
                            <p className="font-bold mt-4">
                                دارين السابعة ترحب بكم وتتمنى لكم التوفيق في مسيرتكم المهنية معنا.
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-muted mt-4 font-bold">
                        آخر تحديث: 26 مايو 2026
                    </p>

                    {/* Support Button Section */}
                    <div className="flex flex-col items-center justify-center py-4 px-6 bg-gradient-to-br from-[var(--bg-background)] to-white border border-border mb-3 relative overflow-hidden group rounded-2xl mt-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

                        <div className="relative z-10 text-center">
                            <h2 className="text-xl md:text-2xl font-black text-main mb-2">هل لديك استفسارات؟</h2>
                            <p className="text-muted mb-4 max-w-md mx-auto">فريق الموارد البشرية متواجد للإجابة على جميع استفساراتك</p>

                            <a
                                href={`https://wa.me/${adminPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-4 bg-primary text-on-primary px-6 py-3 w-full sm:w-auto rounded-xl font-bold transition-all"
                            >
                                <Headphones className="w-5 h-5" />
                                <span className="text-base md:text-lg">تواصل مع إدارة المعهد</span>
                            </a>
                        </div>
                    </div>

                </div>
            </section>

            <PublicFooter />
        </div>
    );
};
