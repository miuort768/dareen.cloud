import { safeJsonLd } from '../../shared/utils/jsonLd'
import { MobileHeader } from '../../components/public/MobileHeader'
import { PublicFooter } from '../../components/public/PublicFooter'
import {
  Briefcase,
  FileCheck,
  Clock,
  Shield,
  Award,
  UserCheck,
  AlertCircle,
  Headphones,
} from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { useAcademyName } from '../../context/AppContext'
import { SEO } from '../../components/SEO'

export const TermsOfWork = () => {
  const academyName = useAcademyName()
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
        title="قوانين العمل"
        description={`قوانين وسياسات العمل في ${academyName} - تعرف على حقوقك وواجباتك كمعلم أو موظف في منصتنا التعليمية.`}
        url="https://dareen.cloud/terms-of-work"
        breadcrumbs={[
          { name: 'الرئيسية', item: '/' },
          { name: 'قوانين العمل', item: '/terms-of-work' },
        ]}
      />
      <script type="application/ld+json">
        {safeJsonLd({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `قوانين العمل - ${academyName}`,
          description: `قوانين وسياسات العمل في ${academyName} للمعلمين والموظفين`,
          publisher: {
            '@type': 'EducationalOrganization',
            name: academyName,
            url: 'https://dareen.cloud',
          },
        })}
      </script>
      <MobileHeader />

      {/* Hero Section */}
      <section className="relative mx-4 mb-4 overflow-hidden rounded-card border border-primary/50 bg-card pb-4 pt-4 shadow-sm dark:border-primary/50 dark:bg-background md:mx-0 md:mb-0 md:rounded-none md:border-0 md:pb-10 md:pt-36 md:shadow-none">
        <div className="absolute start-0 top-0 hidden h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-[100px] md:block"></div>
        <div className="absolute bottom-0 end-0 hidden h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/5 blur-[80px] md:block"></div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary-soft px-3 py-1 text-primary shadow-sm dark:border-primary/50 dark:bg-primary/20 dark:text-main md:mb-4 md:rounded-none md:px-4 md:py-2">
            <Briefcase size={12} className="text-primary" />
            <span className="text-xs font-semibold tracking-label md:text-xs">قوانين العمل</span>
          </div>

          <h1 className="mb-1 font-heading text-base font-bold leading-tight text-primary dark:text-main md:mb-3 md:text-4xl md:text-main">
            قوانين{' '}
            <span className="inline-block bg-gradient-to-r from-primary to-primary bg-clip-text py-1 text-transparent">
              العمل
            </span>{' '}
            في {academyName}
          </h1>

          <p className="mx-auto max-w-2xl whitespace-nowrap text-micro font-medium leading-relaxed text-warning md:whitespace-normal md:text-lg">
            لائحة العمل | السياسات والإجراءات المنظمة لعمل الكادر التعليمي .
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-card py-4 dark:bg-card md:pb-8">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Introduction */}
          <div className="mb-4">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-primary-soft dark:bg-primary/20">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-bold text-main md:text-2xl">مقدمة</h2>
                <p className="text-sm leading-relaxed text-muted md:text-base">
                  تهدف هذه القوانين إلى تنظيم علاقة العمل بين {academyName} وجميع المعلمين والموظفين
                  العاملين في المنصة. الالتزام بهذه القوانين يضمن بيئة عمل مهنية ومنتظمة تحقق
                  أهدافنا التعليمية المشتركة.
                </p>
              </div>
            </div>
          </div>

          {/* Teacher Qualifications */}
          <div className="mb-4">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-success-light dark:bg-success-soft">
                <Award className="h-6 w-6 text-success" />
              </div>
              <div>
                <h2 className="mb-3 text-xl font-bold text-main md:text-2xl">مؤهلات المعلمين</h2>
                <div className="space-y-1 text-xs text-muted md:text-sm">
                  <ul className="ms-4 list-inside list-disc space-y-1">
                    <li>حصول المعلم على مؤهل جامعي في التخصص المطلوب</li>
                    <li>خبرة لا تقل عن سنتين في التدريس أون لاين أو حضوري</li>
                    <li>اجتياز المقابلة الشخصية والتقييم العملي</li>
                    <li>تقديم وثائق ومستندات رسمية تثبت المؤهلات والخبرات</li>
                    <li>اجتياز دورة تدريبية في استخدام منصة {academyName}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Code of Conduct */}
          <div className="mb-4">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-primary-soft dark:bg-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="mb-3 text-xl font-bold text-main md:text-2xl">
                  قواعد السلوك المهني
                </h2>
                <div className="space-y-1 text-xs text-muted md:text-sm">
                  <p>يلتزم جميع المعلمين والموظفين بـ:</p>
                  <ul className="ms-4 list-inside list-disc space-y-1">
                    <li>الالتزام بمواعيد الحصص وعدم التأخير أكثر من 5 دقائق</li>
                    <li>ارتداء الزي المناسب والمحترم أثناء الحصص</li>
                    <li>لغة محترمة ومناسبة في التعامل مع الطلاب وأولياء الأمور</li>
                    <li>الحفاظ على سرية معلومات الطلاب وعدم مشاركتها او تسريبها</li>
                    <li>عدم إقامة حصص خصوصية خارج المنصة مع طلابنا</li>
                    <li>الإبلاغ الفوري عن أي مشكلات تقنية أو سلوكية تطرأ أثناء الحصة</li>
                    <li>الالتزام بمنهج {academyName} وخططها الدراسية</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance & Punctuality */}
          <div className="mb-4">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-warning-light dark:bg-warning-soft">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h2 className="mb-3 text-xl font-bold text-main md:text-2xl">الحضور والمواعيد</h2>
                <div className="space-y-1 text-xs text-muted md:text-sm">
                  <ul className="ms-4 list-inside list-disc space-y-1">
                    <li>الدخول قبل موعد الحصة بـ 5 دقائق لضمان جاهزية التقنية</li>
                    <li>خصم 25% عند التأخير لأكثر من 10 دقائق دون عذر.</li>
                    <li>إبلاغ الإدارة قبل 24 ساعة لإلغاء الحصة.</li>
                    <li>الإلغاء المفاجئ يؤدي إلى خصم قيمة الحصة كاملة</li>
                    <li>3 إلغاءات شهرية بعذر مقبول، ثم يُخصم من الراتب.</li>
                    <li>الإجازات الرسمية تُحتسب حسب تقويم {academyName}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="mb-4">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-info-light dark:bg-info-soft">
                <Award className="h-6 w-6 text-info" />
              </div>
              <div>
                <h2 className="mb-3 text-xl font-bold text-main md:text-2xl">
                  نظام المكافآت والخصومات
                </h2>
                <div className="space-y-1 text-xs text-muted md:text-sm">
                  <div>
                    <h3 className="mb-2 font-bold text-main">المكافآت:</h3>
                    <ul className="ms-4 list-inside list-disc space-y-1">
                      <li>مكافأة التميز تُمنح بنهاية كل فصل دراسي.</li>
                      <li>مكافأة الالتزام للمعلمين دون أي غياب شهريًا.</li>
                      <li>
                        مكافأة زيادة عدد الطلاب: عند وصول عدد الطلاب المسجلين لديه إلى 15 طالباً
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <h3 className="mb-2 font-bold text-main">الخصومات:</h3>
                    <ul className="ms-4 list-inside list-disc space-y-1">
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
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-error-light dark:bg-error-soft">
                <AlertCircle className="h-6 w-6 text-error" />
              </div>
              <div>
                <h2 className="mb-3 text-xl font-bold text-main md:text-2xl">إنهاء التعاقد</h2>
                <div className="space-y-1 text-xs text-muted md:text-sm">
                  <p>يحق لـ{academyName} إنهاء التعاقد مع المعلم أو الموظف في الحالات التالية:</p>
                  <ul className="ms-4 list-inside list-disc space-y-1">
                    <li>الإخلال الجسيم بقواعد السلوك المهني</li>
                    <li>أكثر من 5 غيابات شهريًا دون عذر مقبول.</li>
                    <li>تلقي 3 شكاوى مؤكدة من أولياء الأمور خلال شهر واحد</li>
                    <li>استخدام المنصة لأغراض غير قانونية أو غير أخلاقية</li>
                    <li>محاولة جذب طلاب المنصة للتدريس خارجها</li>
                  </ul>
                  <p className="mt-4 font-bold">
                    مدة الإشعار بإنهاء التعاقد: أسبوعان من تاريخ الإبلاغ.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Development */}
          <div className="mb-4">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-info-light dark:bg-info-soft">
                <UserCheck className="h-6 w-6 text-info" />
              </div>
              <div>
                <h2 className="mb-3 text-xl font-bold text-main md:text-2xl">التطوير المهني</h2>
                <div className="space-y-1 text-xs text-muted md:text-sm">
                  <ul className="ms-4 list-inside list-disc space-y-1">
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
          <div className="mb-4 rounded-none border border-border bg-background p-8">
            <h2 className="mb-4 text-xl font-bold text-main md:text-2xl">التعهد والالتزام</h2>
            <div className="space-y-1 text-xs text-muted md:text-sm">
              <p>بتوقيعك على هذه القوانين، فإنك تتعهد بـ:</p>
              <ul className="ms-4 list-inside list-disc space-y-1">
                <li>الالتزام بجميع القوانين والسياسات المذكورة أعلاه</li>
                <li>تقديم أفضل ما لديك من جهد وخبرة لخدمة طلاب المنصة</li>
                <li>التمثيل المشرف لـ{academyName} في جميع تعاملاتك</li>
                <li>المساهمة في خلق بيئة تعليمية إيجابية ومحفزة</li>
              </ul>
              <p className="mt-4 font-bold">
                {academyName} ترحب بكم وتتمنى لكم التوفيق في مسيرتكم المهنية معنا.
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm font-bold text-muted">آخر تحديث: 26 مايو 2026</p>

          {/* Support Button Section */}
          <div className="group relative mb-3 mt-8 flex flex-col items-center justify-center overflow-hidden rounded-card border border-border bg-gradient-to-br from-background to-white px-6 py-4 dark:to-card">
            <div className="absolute start-0 top-0 -ms-16 -mt-16 h-32 w-32 rounded-full bg-primary/5 blur-3xl"></div>
            <div className="absolute bottom-0 end-0 -mb-16 -me-16 h-32 w-32 rounded-full bg-primary/5 blur-3xl"></div>

            <div className="relative z-10 text-center">
              <h2 className="mb-2 text-xl font-bold text-main md:text-2xl">هل لديك استفسارات؟</h2>
              <p className="mx-auto mb-4 max-w-md whitespace-nowrap text-xs text-muted md:text-sm">
                فريق الموارد البشرية متواجد للإجابة على جميع استفساراتك
              </p>

              <a
                href={`https://wa.me/${getNumber('تواصل مع إدارة المعهد')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-4 rounded-card bg-primary px-6 py-3 font-bold text-on-primary transition-all sm:w-auto"
              >
                <Headphones className="h-5 w-5" />
                <span className="text-base md:text-lg">تواصل مع إدارة المعهد</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
