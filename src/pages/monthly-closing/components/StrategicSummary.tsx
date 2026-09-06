import React from 'react'
import { TrendingUp, Receipt, CheckCircle2 } from 'lucide-react'
import { SectionCard } from './ClosingUI'
import { ProgressBar } from '../../../shared/components/ui'

interface StrategicSummaryProps {
  netProjectedProfit: number
  totalProjectedIncome: number
  totalActualCollections: number
  totalTeacherPayout: number
  reportCurrency?: string
}

export const StrategicSummary: React.FC<StrategicSummaryProps> = ({
  netProjectedProfit,
  totalProjectedIncome,
  totalActualCollections,
  totalTeacherPayout,
  reportCurrency = 'EGP',
}) => {
  return (
    <SectionCard className="relative overflow-hidden bg-background p-4 text-main shadow-2xl sm:p-6 lg:p-12">
      <div className="pointer-events-none absolute start-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/3 rotate-12 bg-info-soft blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-0 end-0 h-[300px] w-[300px] -translate-x-1/4 translate-y-1/3 -rotate-12 bg-info-soft blur-2xl"></div>
      <div className="pointer-events-none absolute end-10 top-20 h-1 w-40 rotate-45 bg-gradient-to-r from-transparent via-transparent to-transparent"></div>

      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-12 lg:col-span-7">
          <div>
            <h2 className="mb-4 text-2xl font-bold uppercase tracking-tighter md:text-4xl">
              الملخص المالي الاستراتيجي
            </h2>
            <div className="h-1.5 w-20 bg-primary"></div>
            <p className="mt-6 max-w-lg text-xs font-bold uppercase leading-relaxed tracking-widest text-muted opacity-80">
              تقرير تحليلي شامل يوضح التوازن الجوهري بين التدفقات النقدية المحصلة والالتزامات
              التعليمية المنفذة خلال الدورة المالية الحالية.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
            <div className="group transition-all">
              <p className="mb-3 text-micro font-semibold uppercase tracking-label text-success">
                صافي الربح المتوقع
              </p>
              <div className="flex items-baseline gap-2">
                <p className="origin-right text-3xl font-bold italic tracking-tighter transition-transform group-hover:scale-105 md:text-6xl">
                  {netProjectedProfit.toLocaleString()}
                </p>
                <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                  {reportCurrency}
                </span>
              </div>
              <ProgressBar
                value={
                  totalProjectedIncome > 0 ? (netProjectedProfit / totalProjectedIncome) * 100 : 0
                }
                variant="success"
                size="sm"
                trackClassName="bg-primary-active"
              />
            </div>

            <div className="group transition-all">
              <p className="mb-3 text-micro font-semibold uppercase tracking-label text-primary">
                إجمالي عوائد المنظومة
              </p>
              <div className="flex items-baseline gap-2">
                <p className="origin-right text-3xl font-bold italic tracking-tighter transition-transform group-hover:scale-105 md:text-6xl">
                  {totalProjectedIncome.toLocaleString()}
                </p>
                <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                  {reportCurrency}
                </span>
              </div>
              <div className="mt-4 h-1 w-full bg-primary-active"></div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 border-t border-white/5 pt-8 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-primary-active">
                <TrendingUp size={16} className="text-success" />
              </div>
              <div>
                <p className="text-micro font-semibold uppercase tracking-widest text-muted">
                  معدل التحصيل
                </p>
                <p className="text-sm font-semibold">
                  {totalProjectedIncome > 0
                    ? ((totalActualCollections / totalProjectedIncome) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-primary-active">
                <Receipt size={16} className="text-error" />
              </div>
              <div>
                <p className="text-micro font-semibold uppercase tracking-widest text-muted">
                  التزامات الرواتب
                </p>
                <p className="text-sm font-semibold">
                  {totalTeacherPayout.toLocaleString()} {reportCurrency}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-10">
            <div className="absolute start-0 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 bg-primary"></div>
            <div className="absolute bottom-0 end-0 h-2 w-2 translate-x-1/2 translate-y-1/2 bg-primary"></div>

            <div>
              <h3 className="mb-10 flex items-center gap-3 text-xs font-semibold uppercase tracking-label text-primary">
                <span className="h-px w-6 bg-primary"></span>
                ملاحظات التدقيق المالي
              </h3>
              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card text-xs font-semibold italic text-main">
                    01
                  </div>
                  <p className="text-xs font-bold italic leading-relaxed text-muted">
                    تمت مراجعة وتدقيق كافة الجلسات التعليمية المنفذة ومطابقتها يدوياً وآلياً مع
                    سجلات الدفع والتحصيل النقدي الفعلي لضمان أعلى درجات الدقة.
                  </p>
                </div>
                <div className="flex gap-6">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-semibold italic text-on-primary">
                    02
                  </div>
                  <p className="text-xs font-bold italic leading-relaxed text-muted">
                    إجمالي السيولة النقدية المتوفرة حالياً تغطي التزامات رواتب المعلمات بنسبة{' '}
                    {(totalTeacherPayout > 0
                      ? (totalActualCollections / totalTeacherPayout) * 100
                      : 0
                    ).toFixed(0)}
                    % مما يعزز الاستقرار المالي للمؤسسة.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 rounded-xl border-s-2 border-primary bg-white/[0.03] p-6">
              <p className="mb-2 text-micro font-semibold uppercase italic tracking-widest text-muted">
                حالة التقرير
              </p>
              <p className="flex items-center gap-2 text-xs font-semibold text-success">
                <CheckCircle2 size={14} /> معتمد وجاهز للتقفيل النهائي
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
