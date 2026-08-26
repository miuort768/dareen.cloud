import { PublicNavbar } from '../../components/public/PublicNavbar'
import { PublicFooter } from '../../components/public/PublicFooter'
import {
  Scale,
  FileCheck,
  AlertCircle,
  UserX,
  CreditCard,
  BookOpen,
  Headphones,
} from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { useAcademyName } from '../../context/AppContext'
import { SEO } from '../../components/SEO'

export const TermsOfService = () => {
  const academyName = useAcademyName()
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  return (
    <div className="min-h-full bg-card font-sans text-main dark:bg-background">
      <SEO
        title="شروط الاستخدام والأحكام"
        description={`شروط وأحكام استخدام منصة ${academyName} للتعليم عن بعد. تعرف على حقوقك والتزاماتك كطالب، ولي أمر، أو معلم عند استخدام خدماتنا.`}
        url="https://dareen.cloud/terms-of-service"
        image="/dareen_logo_new.jpg"
        breadcrumbs={[
          { name: 'الرئيسية', item: '/' },
          { name: 'شروط الاستخدام', item: '/terms-of-service' },
        ]}
      />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `شروط الاستخدام والأحكام - ${academyName}`,
          description: `شروط وأحكام استخدام منصة ${academyName} للتعليم عن بعد`,
          publisher: {
            '@type': 'EducationalOrganization',
            name: academyName,
            url: 'https://dareen.cloud',
          },
        })}
      </script>
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-card pb-6 pt-24 md:pb-24 md:pt-36">
        <div className="absolute start-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-success-soft blur-[100px]"></div>
        <div className="absolute bottom-0 end-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-warning-soft blur-[80px]"></div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-card border border-border bg-card px-4 py-2 text-main shadow-sm">
            <Scale size={14} className="text-success" />
            <span className="text-xs font-semibold uppercase tracking-label">الشروط والأحكام</span>
          </div>

          <h1 className="mb-3 font-heading text-xl font-bold leading-tight text-main md:text-5xl">
            شروط{' '}
            <span className="inline-block bg-gradient-to-r from-success to-success bg-clip-text py-1 text-transparent">
              الاستخدام
            </span>{' '}
            والأحكام
          </h1>

          <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-muted md:text-lg">
            يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام خدماتنا
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-card py-8 md:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Acceptance */}
          <div className="mb-4">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-success-light">
                <FileCheck className="h-6 w-6 text-success" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-bold text-main md:text-2xl">قبول الشروط</h2>
                <p className="text-sm leading-relaxed text-muted md:text-base">
                  بالوصول إلى منصة دارين السابعة للتعليم والتدريب واستخدامها، فإنك توافق على
                  الالتزام بهذه الشروط والأحكام وجميع القوانين واللوائح المعمول بها. إذا كنت لا
                  توافق على أي من هذه الشروط، يُمنع عليك استخدام هذه المنصة أو الوصول إليها.
                </p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="mb-4">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-info-light">
                <BookOpen className="h-6 w-6 text-info" />
              </div>
              <div>
                <h2 className="mb-3 text-2xl font-bold text-main">الخدمات المقدمة</h2>
                <div className="space-y-2 text-muted">
                  <p>يوفر دارين السابعة خدمات تعليمية عبر الإنترنت تشمل:</p>
                  <ul className="ms-4 list-inside list-disc space-y-1">
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
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-primary-soft">
                <UserX className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="mb-3 text-2xl font-bold text-main">التسجيل والحساب</h2>
                <div className="space-y-2 text-muted">
                  <div>
                    <h3 className="mb-2 font-bold text-main">1. إنشاء الحساب:</h3>
                    <ul className="ms-4 list-inside list-disc space-y-1">
                      <li>يجب تقديم معلومات دقيقة وكاملة عند التسجيل</li>
                      <li>يجب أن يكون عمر المستخدم 13 عامًا على الأقل، أو بموافقة ولي الأمر</li>
                      <li>أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك</li>
                      <li>أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-main">2. إنهاء الحساب:</h3>
                    <p>نحتفظ بالحق في تعليق أو إنهاء حسابك إذا:</p>
                    <ul className="ms-4 list-inside list-disc space-y-1">
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
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-warning-light">
                <CreditCard className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h2 className="mb-3 text-2xl font-bold text-main">الرسوم والدفع</h2>
                <div className="space-y-2 text-muted">
                  <div>
                    <h3 className="mb-2 font-bold text-main">1. الأسعار:</h3>
                    <ul className="ms-4 list-inside list-disc space-y-1">
                      <li>جميع الأسعار معروضة بالريال السعودي (SAR) ما لم يُذكر خلاف ذلك</li>
                      <li>نحتفظ بالحق في تغيير الأسعار في أي وقت</li>
                      <li>التغييرات في الأسعار لن تؤثر على الدورات المدفوعة مسبقًا</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-main">2. طرق الدفع:</h3>
                    <ul className="ms-4 list-inside list-disc space-y-1">
                      <li>نقبل الدفع عبر البطاقات الائتمانية والتحويل البنكي</li>
                      <li>يجب سداد الرسوم قبل بدء الدورة أو الحصة</li>
                      <li>الفواتير غير المدفوعة قد تؤدي إلى تعليق الخدمة</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-main">3. سياسة الاسترداد:</h3>
                    <ul className="ms-4 list-inside list-disc space-y-1">
                      <li>يمكن طلب استرداد كامل خلال 7 أيام من التسجيل إذا لم تبدأ الدورة</li>
                      <li>بعد بدء الدورة، لا يمكن استرداد الرسوم إلا في حالات استثنائية</li>
                      <li>
                        الحصص الملغاة من قبل الطالب بدون إشعار مسبق (24 ساعة) غير قابلة للاسترداد
                      </li>
                      <li>في حالة إلغاء المعهد للحصة، سيتم إعادة جدولتها أو استرداد الرسوم</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Conduct */}
          <div className="mb-4">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-error-light">
                <AlertCircle className="h-6 w-6 text-error" />
              </div>
              <div>
                <h2 className="mb-3 text-2xl font-bold text-main">قواعد السلوك</h2>
                <div className="space-y-2 text-muted">
                  <p>عند استخدام منصتنا، توافق على:</p>
                  <ul className="ms-4 list-inside list-disc space-y-1">
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
            <div className="rounded-card border border-border bg-background p-4 sm:p-8">
              <h2 className="mb-4 text-2xl font-bold text-main">الملكية الفكرية</h2>
              <div className="space-y-2 text-muted">
                <p>
                  جميع المحتويات والمواد التعليمية المتاحة على المنصة، بما في ذلك النصوص والصور
                  ومقاطع الفيديو والشعارات، هي ملك لدارين السابعة أو مرخصة لنا.
                </p>
                <p className="mt-4 font-bold">يُحظر عليك:</p>
                <ul className="ms-4 list-inside list-disc space-y-1">
                  <li>نسخ أو توزيع أو تعديل أي محتوى دون إذن كتابي</li>
                  <li>استخدام المحتوى لأغراض تجارية</li>
                  <li>إزالة أي علامات تجارية أو حقوق نشر</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Liability */}
          <div className="mb-4">
            <h2 className="mb-4 text-2xl font-bold text-main">إخلاء المسؤولية</h2>
            <div className="space-y-2 text-muted">
              <p>يتم توفير الخدمات "كما هي" دون أي ضمانات من أي نوع. نحن لا نضمن:</p>
              <ul className="ms-4 list-inside list-disc space-y-1">
                <li>أن الخدمات ستكون متاحة دائمًا أو خالية من الأخطاء</li>
                <li>دقة أو اكتمال المحتوى التعليمي</li>
                <li>نتائج أكاديمية محددة</li>
              </ul>
              <p className="mt-4 font-bold">
                لن نكون مسؤولين عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام أو عدم القدرة على
                استخدام خدماتنا.
              </p>
            </div>
          </div>

          {/* Changes */}
          <div className="mb-4">
            <h2 className="mb-4 text-2xl font-bold text-main">التعديلات على الشروط</h2>
            <p className="leading-relaxed text-muted">
              نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة
              مع تحديث تاريخ "آخر تحديث". استمرارك في استخدام المنصة بعد نشر التغييرات يعني قبولك
              لهذه التغييرات.
            </p>
            <p className="mt-4 text-sm font-bold text-muted">آخر تحديث: 21 يناير 2026</p>
          </div>

          {/* Governing Law */}
          <div className="mb-4">
            <h2 className="mb-4 text-2xl font-bold text-main">القانون الحاكم</h2>
            <p className="leading-relaxed text-muted">
              تخضع هذه الشروط والأحكام وتُفسر وفقًا لقوانين دولة الكويت. أي نزاعات تنشأ عن هذه
              الشروط ستخضع للاختصاص القضائي الحصري لمحاكم الكويت.
            </p>
          </div>

          {/* Support Button Section */}
          <div className="group relative mb-8 flex flex-col items-center justify-center overflow-hidden rounded-card border border-border bg-gradient-to-br from-background to-white px-6 py-6 dark:to-card">
            <div className="absolute start-0 top-0 -ms-16 -mt-16 h-32 w-32 rounded-full bg-success-soft blur-3xl"></div>
            <div className="absolute bottom-0 end-0 -mb-16 -me-16 h-32 w-32 rounded-full bg-warning-soft blur-3xl"></div>

            <div className="relative z-10 text-center">
              <h2 className="mb-2 text-2xl font-bold text-main">هل لديك استفسارات فنية؟</h2>
              <p className="mx-auto mb-8 max-w-md text-muted">
                فريق الدعم الفني متواجد لمساعدتك في أي وقت عبر الواتساب
              </p>

              <a
                href={`https://wa.me/${adminPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex w-full items-center justify-center gap-4 overflow-hidden rounded-card bg-card px-6 py-3 font-bold text-main transition-all hover:bg-success hover:text-on-success sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-success to-success opacity-0 transition-opacity group-hover:opacity-100"></div>
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
