import { useEffect, useState } from 'react'
import { Wallet, Smartphone, Landmark, CreditCard, Loader2, BadgeCheck } from 'lucide-react'
import { api } from '../../../lib/api'
import { cn } from '../../../lib/utils'

const METHODS: Record<string, { label: string; icon: typeof Wallet }> = {
  wallet: { label: 'محفظة إلكترونية', icon: Wallet },
  instapay: { label: 'InstaPay', icon: Smartphone },
  bank_transfer: { label: 'تحويل بنكي', icon: Landmark },
}

const WALLET_LABELS: Record<string, string> = {
  vodafone: 'فودافون كاش',
  etisalat: 'اتصالات كاش',
  orange: 'أورنج كاش',
}

interface PaymentSetting {
  method?: string
  walletProvider?: string
  walletPhone?: string
  instapayId?: string
  accountHolder?: string
  instapayPhone?: string
  iban?: string
  bankName?: string
}

/**
 * بطاقة طريقة استلام المستحقات — تظهر للمشرف داخل تفاصيل المعلمة
 * (بيانات مطابقة لما أضافته المعلمة في صفحة حسابها).
 */
export const TeacherPaymentInfo = ({ teacherId }: { teacherId: string }) => {
  const [setting, setSetting] = useState<PaymentSetting | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await api.get<PaymentSetting>(`/teachers/${teacherId}/payment-settings`)
        if (!cancelled) setSetting(data && Object.keys(data).length ? data : null)
      } catch {
        // غير حرج — تُترك البطاقة مخفية عند الفشل
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [teacherId])

  if (loading) {
    return (
      <div
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-xs font-bold text-muted"
        aria-busy="true"
      >
        <Loader2 size={13} className="animate-spin" />
        جاري تحميل طريقة الدفع...
      </div>
    )
  }

  if (!setting?.method) return null

  const meta = METHODS[setting.method]
  if (!meta) return null
  const Icon = meta.icon

  const rows: { label: string; value?: string; mono?: boolean }[] =
    setting.method === 'wallet'
      ? [
          {
            label: 'شركة المحفظة',
            value: WALLET_LABELS[setting.walletProvider || ''] || setting.walletProvider,
          },
          { label: 'رقم المحفظة', value: setting.walletPhone, mono: true },
        ]
      : setting.method === 'instapay'
        ? [
            { label: 'معرّف InstaPay', value: setting.instapayId, mono: true },
            { label: 'اسم صاحب الحساب', value: setting.accountHolder },
            { label: 'الرقم المرتبط', value: setting.instapayPhone, mono: true },
          ]
        : [
            { label: 'اسم البنك', value: setting.bankName },
            { label: 'اسم صاحب الحساب', value: setting.accountHolder },
            { label: 'رقم الآيبان IBAN', value: setting.iban, mono: true },
          ]

  return (
    <section
      className="overflow-hidden rounded-xl border border-border bg-surface"
      aria-label="طريقة استلام المستحقات"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
            <Icon size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-main">{meta.label}</p>
            <span className="mt-0.5 flex w-fit items-center gap-1 rounded-md bg-success-soft px-1.5 py-0.5 text-micro font-bold text-success-strong">
              <BadgeCheck size={10} />
              طريقة الاستلام الرئيسية
            </span>
          </div>
        </div>
        <CreditCard size={16} className="shrink-0 text-muted" />
      </div>

      <div className="divide-y divide-divider px-4">
        {rows
          .filter((r) => r.value)
          .map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-3 py-2.5">
              <span className="shrink-0 text-[11px] font-bold text-muted">{r.label}</span>
              <span
                className={cn(
                  'min-w-0 truncate text-end text-xs font-bold text-main',
                  r.mono && 'font-mono tabular-nums',
                )}
              >
                {r.value}
              </span>
            </div>
          ))}
      </div>
    </section>
  )
}
