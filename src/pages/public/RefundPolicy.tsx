import { safeJsonLd } from '../../shared/utils/jsonLd'
import { MobileHeader } from '../../components/public/MobileHeader'
import { PublicFooter } from '../../components/public/PublicFooter'
import {
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Clock,
  CalendarX,
  Headphones,
  Sparkles,
  Heart,
} from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { SEO } from '../../components/SEO'

export const RefundPolicy = () => {
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

  const whatsappNumber = getNumber('تواصل مع قسم الحسابات')

  return (
    <div className="min-h-full bg-background font-sans text-main">
      <SEO
        title="سياسة الاسترداد والاسترجاع"
        description="سياسة استرداد الرسوم وإلغاء الاشتراكات في دارين السابعة. تعرف على شروط الاسترجاع، إلغاء الحصص، وآلية استرداد المبالغ المدفوعة."
        url="https://dareen.cloud/refund-policy"
        breadcrumbs={[
          { name: 'الرئيسية', item: '/' },
          { name: 'سياسة الاسترداد', item: '/refund-policy' },
        ]}
      />
      <script type="application/ld+json">
        {safeJsonLd({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'سياسة الاسترداد والاسترجاع - دارين السابعة',
          description: 'سياسة استرداد الرسوم وإلغاء الاشتراكات في دارين السابعة',
          publisher: {
            '@type': 'EducationalOrganization',
            name: 'دارين السابعة',
            url: 'https://dareen.cloud',
          },
        })}
      </script>
      <MobileHeader />

      {/* Hero Section */}
      <section className="relative mx-4 mb-4 overflow-hidden rounded-card border border-primary/50 bg-primary pb-4 pt-4 shadow-elevation-1 dark:border-primary/50 md:mx-0 md:mb-0 md:rounded-none md:border-0 md:bg-card md:pb-24 md:pt-36 md:shadow-none dark:md:bg-background">
        <div className="absolute start-0 top-0 hidden h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-info-soft blur-[100px] dark:bg-info-soft md:block"></div>
        <div className="absolute bottom-0 end-0 hidden h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-warning-soft blur-[80px] dark:bg-warning-soft md:block"></div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-4 py-1.5 backdrop-blur-sm md:border-primary md:bg-primary-soft">
            <Sparkles size={12} className="text-on-primary md:text-primary" />
            <span className="text-micro font-black text-on-primary md:text-micro md:text-primary">
              السياسات المالية
            </span>
          </div>

          <h1 className="mb-1 font-heading text-lg font-black leading-tight text-on-primary md:mb-3 md:text-5xl md:text-main">
            سياسة{' '}
            <span className="inline-block py-1 text-warning md:bg-gradient-to-r md:from-info md:to-primary md:bg-clip-text md:text-transparent dark:md:from-info dark:md:to-primary">
              الاسترجاع
            </span>{' '}
            والإلغاء
          </h1>

          <p className="mx-auto max-w-2xl text-micro font-medium leading-relaxed text-white/80 md:hidden md:text-lg md:text-muted">
            نحن نقدر ثقتكم بنا <Heart size={14} className="inline fill-error text-error" />
            <br />
            ونحرص على توضيح كافة حقوقكم المالية وضوابط الاشتراك
          </p>
          <p className="mx-auto hidden max-w-2xl text-micro font-medium leading-relaxed text-white/80 md:block md:text-lg md:text-muted">
            نحن نقدر ثقتكم بنا، ونحرص على توضيح كافة حقوقكم المالية وضوابط الاشتراك
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-background py-4 md:pb-8">
        <div className="container mx-auto max-w-4xl px-4">
          {/* General Principles */}
          <div className="mb-12">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-info-light dark:bg-info-soft">
                <ShieldCheck className="h-6 w-6 text-info" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-black text-main md:text-2xl">مبادئ عامة</h2>
                <p className="text-sm leading-relaxed text-muted md:text-base">
                  في دارين السابعة، نسعى لتقديم خدمة تعليمية متميزة. تهدف هذه السياسة إلى ضمان
                  الشفافية والعدالة لكل من الطالب والمعهد فيما يخص الرسوم المدفوعة وإجراءات الإلغاء.
                </p>
              </div>
            </div>
          </div>

          {/* Refund Eligibility */}
          <div className="mb-12">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-success-light dark:bg-success-soft">
                <CreditCard className="h-6 w-6 text-success" />
              </div>
              <div>
                <h2 className="mb-3 text-2xl font-black text-main">حالات طلب الاسترداد</h2>
                <div className="space-y-4 text-muted">
                  <div className="border-s-4 border-success bg-success-light p-4 dark:bg-success-soft">
                    <h3 className="mb-1 font-bold text-main">قبل بدء الدورة:</h3>
                    <p>
                      يمكن استرداد كامل المبلغ المدفوع (بعد خصم رسوم التحويل البنكي إن وجدت) إذا تم
                      تقديم طلب الاسترداد قبل 48 ساعة على الأقل من موعد أول حصة.
                    </p>
                  </div>
                  <div className="border-s-4 border-warning bg-warning-light p-4 dark:bg-warning-soft">
                    <h3 className="mb-1 font-bold text-main">بعد الحصة الأولى (التجريبية):</h3>
                    <p>
                      إذا كانت الدورة تتيح حصة تجريبية ولم يرغب الطالب في الاستمرار، يمكنه طلب
                      استرداد باقي المبلغ المدفوع في غضون 24 ساعة من انتهاء الحصة الأولى.
                    </p>
                  </div>
                  <div className="border-s-4 border-border bg-background p-4 dark:bg-card">
                    <h3 className="mb-1 font-bold text-main">خلال الدورة:</h3>
                    <p>
                      لا يتم استرداد الرسوم بمجرد تجاوز الحصة الثانية إلا في حالات الظروف القهرية
                      التي يقدرها المعهد، مع خصم قيمة الحصص التي تم تقديمها بالفعل.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Rules */}
          <div className="mb-12">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-error-light dark:bg-error-soft">
                <CalendarX className="h-6 w-6 text-error" />
              </div>
              <div>
                <h2 className="mb-3 text-2xl font-black text-main">سياسة إلغاء الحصص</h2>
                <div className="space-y-4 text-muted">
                  <ul className="ms-4 list-inside list-disc space-y-3">
                    <li>
                      <span className="font-bold">إلغاء الطالب:</span> يجب إخطار المعهد بالإلغاء قبل
                      24 ساعة من موعد الحصة. في حال الإلغاء المفاجئ، يتم احتساب الحصة كأنها تم
                      تقديمها.
                    </li>
                    <li>
                      <span className="font-bold">إلغاء المعهد:</span> في حال اعتذار المعلم، يلتزم
                      المعهد بتعويض الحصة في موعد آخر يناسب الطالب أو تمديد صلاحية الباقة.
                    </li>
                    <li>
                      <span className="font-bold">فوات الحصة:</span> غياب الطالب عن موعد الحصة
                      المتفق عليه دون إخطار مسبق يُسقط حقه في التعويض أو الاسترداد لتلك الحصة.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Time */}
          <div className="mb-12">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-primary-soft dark:bg-card">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="mb-3 text-2xl font-black text-main">إجراءات الاسترداد المالي</h2>
                <div className="space-y-2 leading-relaxed text-muted">
                  <p>
                    تستغرق عملية معالجة طلب الاسترداد من{' '}
                    <span className="font-bold">5 إلى 10 أيام عمل</span> بعد الموافقة على الطلب. يتم
                    إعادة المبلغ إلى نفس وسيلة الدفع التي تم استخدامها في عملية الشراء الأصلية.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Issues */}
          <div className="mb-4 md:mb-6">
            <div className="relative overflow-hidden border border-border bg-primary-soft p-6 dark:border-primary/30 dark:bg-primary/20 md:p-8">
              <AlertCircle className="absolute -bottom-6 -end-6 h-48 w-48 text-primary/10 dark:text-primary/20" />
              <div className="relative z-10 mb-4 flex items-center gap-3 border-b border-border pb-3 dark:border-primary/30">
                <div className="flex h-8 w-8 items-center justify-center bg-warning-soft">
                  <AlertCircle className="h-4 w-4 text-warning" />
                </div>
                <h2 className="text-lg font-black text-main md:text-xl">المشاكل التقنية</h2>
              </div>
              <p className="relative z-10 text-sm font-medium leading-relaxed text-muted dark:text-main md:text-base">
                في حال عدم إمكانية تقديم الحصة بسبب مشاكل تقنية من طرف المعهد، يتم تعويض الطالب بحصة
                بديلة. أما إذا كان الخلل من طرف الطالب (انقطاع الإنترنت أو تعطل الجهاز)، فالمعهد غير
                مسؤول عن تعويض الحصة، ومع ذلك نحاول دائماً المساعدة في حال كان هناك وقت متاح.
              </p>
            </div>
          </div>

          {/* Last Update */}
          <div className="mb-4 border-t border-border pt-6 text-center md:mb-6">
            <p className="text-sm font-bold uppercase tracking-widest text-muted">
              آخر تحديث للسياسة: فبراير 2026
            </p>
          </div>

          {/* Support Button Section */}
          <div className="group relative mb-4 flex flex-col items-center justify-center overflow-hidden rounded-card border border-primary bg-primary px-6 py-6 shadow-elevation-4 shadow-primary/20 dark:border-border dark:bg-background">
            <div className="absolute start-0 top-0 -ms-16 -mt-16 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 end-0 -mb-16 -me-16 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>

            <div className="relative z-10 text-center">
              <h2 className="mb-2 text-2xl font-black text-on-primary dark:text-primary">
                تحتاج مساعدة بخصوص طلبك؟
              </h2>
              <p className="mx-auto mb-8 max-w-md whitespace-nowrap text-micro text-on-primary dark:text-primary md:whitespace-normal md:text-base">
                فريق الحسابات متاح للرد على استفساراتكم المالية فوراً
              </p>

              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex w-full items-center justify-center gap-4 overflow-hidden rounded-card border border-white/20 bg-info px-10 py-4 font-bold text-on-info shadow-elevation-3 transition-all hover:bg-white/15 sm:w-auto"
              >
                <Headphones className="relative z-10 h-5 w-5" />
                <span className="relative z-10 text-base md:text-lg">تواصل مع قسم الحسابات</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
