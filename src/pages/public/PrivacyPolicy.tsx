import { safeJsonLd } from '../../shared/utils/jsonLd'
import { MobileHeader } from '../../components/public/MobileHeader'
import { PublicFooter } from '../../components/public/PublicFooter'
import { Lock, Eye, Database, UserCheck, FileText, Headphones, Sparkles } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { SEO } from '../../components/SEO'

export const PrivacyPolicy = () => {
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  const whatsappNumbers = useSettingsStore((s) => s.whatsappNumbers)

  const getNumber = (label: string): string => {
    try {
      const entries: { label: string; phone: string }[] = JSON.parse(whatsappNumbers)
      const found = entries.find((e) => e.label === label)
      return found ? found.phone.replace(/\D/g, '') : adminPhone.replace(/\D/g, '')
    } catch (e) {
      console.warn(e)
      return adminPhone.replace(/\D/g, '')
    }
  }
  return (
    <div className="min-h-full bg-background font-sans text-main">
      <SEO
        title="سياسة الخصوصية والأمان"
        description="سياسة الخصوصية لمنصة دارين السابعة للتعليم عن بعد. نضمن حماية بيانات الطلاب وأولياء الأمور والمعلمين وفق أعلى معايير الأمان والخصوصية."
        url="https://dareen.cloud/privacy-policy"
        image="/dareen_logo_new.jpg"
        breadcrumbs={[
          { name: 'الرئيسية', item: '/' },
          { name: 'سياسة الخصوصية', item: '/privacy-policy' },
        ]}
      />
      <script type="application/ld+json">
        {safeJsonLd({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'سياسة الخصوصية والأمان - دارين السابعة',
          description: 'سياسة الخصوصية لمنصة دارين السابعة للتعليم عن بعد',
          publisher: {
            '@type': 'EducationalOrganization',
            name: 'دارين السابعة',
            url: 'https://dareen.cloud',
          },
          about: { '@type': 'Thing', name: 'سياسة الخصوصية وحماية البيانات' },
        })}
      </script>
      <MobileHeader />

      {/* Hero Section */}
      <section className="relative mx-4 mb-4 overflow-hidden rounded-card border border-primary/50 bg-primary pb-4 pt-4 shadow-elevation-1 dark:border-primary/50 md:mx-0 md:mb-0 md:rounded-none md:border-0 md:bg-card md:pb-24 md:pt-36 md:shadow-none">
        <div className="absolute start-0 top-0 hidden h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-info-soft blur-[100px] dark:bg-info-soft md:block"></div>
        <div className="absolute bottom-0 end-0 hidden h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-warning-soft blur-[80px] dark:bg-warning-soft md:block"></div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-4 py-1.5 backdrop-blur-sm md:border-primary md:bg-primary-soft">
            <Sparkles size={12} className="text-on-primary md:text-primary" />
            <span className="text-micro font-black text-on-primary md:text-micro md:text-primary">
              سياسة الخصوصية
            </span>
          </div>

          <h1 className="mb-1 font-heading text-lg font-black leading-tight text-on-primary md:mb-3 md:text-5xl md:text-main">
            حماية <span className="inline-block py-1 text-warning">بياناتك</span> أولويتنا
          </h1>

          <p className="mx-auto max-w-2xl text-micro font-medium leading-relaxed text-white/80 md:text-lg md:text-muted">
            نلتزم في دارين السابعة بحماية خصوصيتك وأمان معلوماتك الشخصية
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-background py-4 md:pb-8">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Introduction */}
          <div className="mb-4">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-info-light dark:bg-info-soft">
                <FileText className="h-6 w-6 text-info" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-black text-main md:text-2xl">مقدمة</h2>
                <p className="text-sm leading-relaxed text-muted md:text-base">
                  تصف سياسة الخصوصية هذه كيفية جمع دارين السابعة للتعليم والتدريب ("نحن" أو
                  "المعهد") واستخدامنا وحمايتنا ومشاركتنا للمعلومات الشخصية التي نجمعها من خلال
                  منصتنا التعليمية. باستخدامك لخدماتنا، فإنك توافق على الممارسات الموضحة في هذه
                  السياسة.
                </p>
              </div>
            </div>
          </div>

          {/* Data Collection */}
          <div className="mb-4">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-success-light dark:bg-success-soft">
                <Database className="h-6 w-6 text-success" />
              </div>
              <div>
                <h2 className="mb-3 text-2xl font-black text-main">المعلومات التي نجمعها</h2>
                <div className="space-y-2 text-micro text-muted md:text-sm">
                  <div>
                    <h3 className="mb-2 font-bold text-main">1. المعلومات الشخصية:</h3>
                    <ul className="ms-4 list-inside list-disc space-y-1">
                      <li>الاسم الكامل</li>
                      <li>عنوان البريد الإلكتروني</li>
                      <li>رقم الهاتف</li>
                      <li>المرحلة الدراسية</li>
                      <li>معلومات ولي الأمر (للطلاب القُصّر)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-main">2. معلومات الاستخدام:</h3>
                    <ul className="ms-4 list-inside list-disc space-y-1">
                      <li>سجلات الحضور والغياب</li>
                      <li>نتائج الاختبارات والتقييمات</li>
                      <li>تفاعلات المنصة والدورات المسجلة</li>
                      <li>بيانات الأداء الأكاديمي</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-main">3. المعلومات التقنية:</h3>
                    <ul className="ms-4 list-inside list-disc space-y-1">
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
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-primary-soft dark:bg-primary/10">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="mb-3 text-2xl font-black text-main">كيف نستخدم معلوماتك</h2>
                <div className="space-y-2 text-micro text-muted md:text-sm">
                  <p>نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
                  <ul className="ms-4 list-inside list-disc space-y-1">
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
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-error-light dark:bg-error-soft">
                <Lock className="h-6 w-6 text-error" />
              </div>
              <div>
                <h2 className="mb-3 text-2xl font-black text-main">حماية البيانات</h2>
                <div className="space-y-2 text-micro text-muted md:text-sm">
                  <p>نتخذ إجراءات أمنية صارمة لحماية معلوماتك الشخصية، بما في ذلك:</p>
                  <ul className="ms-4 list-inside list-disc space-y-1">
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
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-warning-light dark:bg-warning-soft">
                <UserCheck className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h2 className="mb-3 text-2xl font-black text-main">مشاركة المعلومات</h2>
                <div className="space-y-2 text-micro text-muted md:text-sm">
                  <p>
                    لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط في الحالات
                    التالية:
                  </p>
                  <ul className="ms-4 list-inside list-disc space-y-1">
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
            <div className="rounded-card border border-border bg-background p-8 dark:bg-card">
              <h2 className="mb-4 text-2xl font-black text-main">حقوقك</h2>
              <div className="space-y-2 text-micro text-muted md:text-sm">
                <p>لديك الحق في:</p>
                <ul className="ms-4 list-inside list-disc space-y-1">
                  <li>الوصول إلى معلوماتك الشخصية ومراجعتها</li>
                  <li>طلب تصحيح أو تحديث معلوماتك</li>
                  <li>طلب حذف حسابك وبياناتك</li>
                  <li>الاعتراض على معالجة بياناتك في ظروف معينة</li>
                  <li>سحب موافقتك في أي وقت</li>
                </ul>
                <p className="mt-4 text-micro font-bold dark:text-main md:text-base">
                  للاستفسارات أو طلبات الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني أو الهاتف.
                </p>
              </div>
            </div>
          </div>

          {/* Updates */}
          <div className="mb-4">
            <h2 className="mb-4 text-2xl font-black text-main">التحديثات على هذه السياسة</h2>
            <p className="text-micro leading-relaxed text-muted md:text-base">
              قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإخطارك بأي تغييرات جوهرية عن
              طريق نشر السياسة الجديدة على هذه الصفحة وتحديث تاريخ "آخر تحديث" أدناه.
            </p>
            <p className="mt-4 text-sm font-bold text-muted">آخر تحديث: 21 يناير 2026</p>
          </div>

          {/* Support Button Section */}
          <div className="group relative mb-4 flex flex-col items-center justify-center overflow-hidden rounded-card border border-primary/20 bg-primary px-6 py-4 shadow-elevation-4 shadow-primary/20 dark:border-border dark:bg-background">
            <div className="absolute start-0 top-0 -ms-16 -mt-16 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 end-0 -mb-16 -me-16 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>

            <div className="relative z-10 text-center">
              <h2 className="mb-2 text-2xl font-black text-on-primary dark:text-primary">
                هل لديك استفسارات فنية؟
              </h2>
              <p className="mx-auto mb-8 max-w-md whitespace-nowrap text-xs text-white/80 md:text-sm">
                فريق الدعم الفني متواجد لمساعدتك في أي وقت عبر الواتساب
              </p>

              <a
                href={`https://wa.me/${getNumber('تواصل مع الدعم الفني')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex w-full items-center justify-center gap-4 overflow-hidden rounded-card border border-border bg-card px-6 py-3 font-bold text-primary shadow-elevation-3 transition-all hover:bg-card dark:border-border dark:text-main sm:w-auto"
              >
                <Headphones className="relative z-10 h-5 w-5" />
                <span className="relative z-10 text-base md:text-lg">تواصل مع الدعم الفني</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
