import { useDialogFocus } from '../../shared/hooks/useDialogFocus'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import {
  Wallet,
  Smartphone,
  Landmark,
  CreditCard,
  PencilLine,
  Trash2,
  Plus,
  Loader2,
  BadgeCheck,
} from 'lucide-react'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'
import { triggerHaptic } from '../../lib/haptics'
import { confirm } from '../../lib/confirmDialog'
import { useShowNotification } from '../../context/AppContext'
import { SectionCard, InfoRow } from './shared'

/* الأنواع الموجودة فعليًا في النظام — لا يوجد غيرها */
const METHODS = [
  { id: 'wallet', label: 'محفظة إلكترونية', icon: Wallet },
  { id: 'instapay', label: 'InstaPay', icon: Smartphone },
  { id: 'bank_transfer', label: 'تحويل بنكي', icon: Landmark },
] as const

type MethodId = (typeof METHODS)[number]['id']

const WALLETS = ['vodafone', 'etisalat', 'orange'] as const
const WALLET_LABELS: Record<string, string> = {
  vodafone: 'فودافون كاش',
  etisalat: 'اتصالات كاش',
  orange: 'أورنج كاش',
}

interface PaymentSetting {
  id?: string
  method?: MethodId
  walletProvider?: string
  walletPhone?: string
  instapayId?: string
  accountHolder?: string
  instapayPhone?: string
  iban?: string
  bankName?: string
}

interface EmptyForm {
  method: MethodId | ''
  walletProvider: string
  walletPhone: string
  instapayId: string
  accountHolder: string
  instapayPhone: string
  iban: string
  bankName: string
}

const EMPTY_FORM: EmptyForm = {
  method: '',
  walletProvider: '',
  walletPhone: '',
  instapayId: '',
  accountHolder: '',
  instapayPhone: '',
  iban: '',
  bankName: '',
}

export const PaymentMethodsSection = () => {
  const showNotification = useShowNotification()
  const [setting, setSetting] = useState<PaymentSetting | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExisting, setEditingExisting] = useState(false)
  const [form, setForm] = useState<EmptyForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await api.get<PaymentSetting>('/teachers/me/payment-settings')
        if (!cancelled) setSetting(data && Object.keys(data).length ? data : null)
      } catch (err) {
        console.error('Failed loading payment settings', err)
        if (!cancelled) setFetchError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  /* ---- فتح الإضافة/التعديل ---- */
  const openAdd = useCallback(() => {
    triggerHaptic('light')
    setEditingExisting(false)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback(() => {
    if (!setting?.method) return
    triggerHaptic('light')
    setEditingExisting(true)
    setForm({
      method: setting.method,
      walletProvider: setting.walletProvider || '',
      walletPhone: setting.walletPhone || '',
      instapayId: setting.instapayId || '',
      accountHolder: setting.accountHolder || '',
      instapayPhone: setting.instapayPhone || '',
      iban: setting.iban || '',
      bankName: setting.bankName || '',
    })
    setModalOpen(true)
  }, [setting])

  const closeModal = () => {
    if (submitting) return
    setModalOpen(false)
  }

  /* ---- تحقق مطابق لقواعد السيرفر الحالية ---- */
  const validate = (): string | null => {
    if (!form.method) return 'اختر نوع طريقة الدفع'
    if (form.method === 'wallet') {
      if (!WALLETS.includes(form.walletProvider as (typeof WALLETS)[number]))
        return 'اختر شركة المحفظة'
      if (!/^[0-9]{11}$/.test(form.walletPhone)) return 'رقم المحفظة يجب أن يكون 11 رقمًا'
    }
    if (form.method === 'instapay') {
      if (!form.instapayId.trim()) return 'أدخل معرّف InstaPay'
      if (!form.accountHolder.trim()) return 'أدخل اسم صاحب الحساب'
      if (!/^[0-9]{11}$/.test(form.instapayPhone)) return 'الرقم المرتبط يجب أن يكون 11 رقمًا'
    }
    if (form.method === 'bank_transfer') {
      if (!form.accountHolder.trim()) return 'أدخل اسم صاحب الحساب'
      if (!form.iban.trim()) return 'أدخل رقم الآيبان IBAN'
      if (!form.bankName.trim()) return 'أدخل اسم البنك'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const error = validate()
    if (error) {
      showNotification(error, 'warning')
      return
    }
    setSubmitting(true)
    try {
      await api.put('/teachers/me/payment-settings', form)
      const fresh = await api.get<PaymentSetting>('/teachers/me/payment-settings')
      setSetting(fresh && Object.keys(fresh).length ? fresh : null)
      setModalOpen(false)
      triggerHaptic('medium')
      showNotification(
        editingExisting ? 'تم تحديث طريقة الدفع بنجاح' : 'تمت إضافة طريقة الدفع بنجاح',
        'success',
      )
    } catch (err) {
      console.error('Failed saving payment settings', err)
      showNotification('تعذر حفظ طريقة الدفع، حاول مجددًا', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!setting || deleting) return
    if (
      !(await confirm({
        title: 'حذف طريقة الدفع؟',
        description: 'هل أنت متأكد من رغبتك في حذف طريقة الدفع هذه؟',
        confirmText: 'حذف طريقة الدفع',
        cancelText: 'إلغاء',
      }))
    )
      return
    setDeleting(true)
    try {
      await api.delete('/teachers/me/payment-settings')
      setSetting(null)
      showNotification('تم حذف طريقة الدفع', 'success')
    } catch (err) {
      console.error('Failed deleting payment settings', err)
      showNotification('تعذر حذف طريقة الدفع', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const methodMeta = METHODS.find((m) => m.id === setting?.method)

  return (
    <SectionCard
      title="طرق الدفع"
      icon={CreditCard}
      description="إدارة طرق استلام مستحقاتك المالية."
      delay={0.2}
      action={
        !loading && !setting && !fetchError ? (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-micro font-bold text-on-primary shadow-elevation-1 transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <Plus size={13} /> إضافة طريقة دفع
          </button>
        ) : undefined
      }
    >
      {/* التحميل */}
      {loading && (
        <div className="space-y-2" aria-busy="true">
          <div className="h-16 animate-pulse rounded-xl bg-surface" />
          <div className="h-10 w-1/2 animate-pulse rounded-lg bg-surface" />
        </div>
      )}

      {/* خطأ الجلب */}
      {!loading && fetchError && (
        <div className="bg-error-soft/50 rounded-xl border border-dashed border-error-soft py-8 text-center">
          <p className="text-xs font-bold text-main">تعذر تحميل طرق الدفع</p>
          <button
            onClick={() => window.location.reload()}
            className="mx-auto mt-3 block rounded-lg bg-primary px-4 py-2 text-micro font-bold text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* لا توجد طرق دفع */}
      {!loading && !fetchError && !setting && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft">
            <CreditCard size={20} className="text-primary" />
          </div>
          <p className="text-xs font-bold text-muted">لا توجد طرق دفع</p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">
            أضف طريقة دفع حتى تتمكن من استلام مستحقاتك.
          </p>
          <button
            onClick={openAdd}
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary shadow-elevation-1 transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <Plus size={14} /> إضافة طريقة دفع
          </button>
        </div>
      )}

      {/* توجد طريقة دفع */}
      {!loading && !fetchError && setting && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* بطاقة الاستلام — لمسة بصرية شبيهة ببطاقة الدفع */}
          <div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-4 shadow-elevation-2"
            dir="rtl"
          >
            <div className="pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true">
              <svg width="100%" height="100%">
                <defs>
                  <pattern
                    id="pm-card-dots"
                    x="0"
                    y="0"
                    width="22"
                    height="22"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="2" cy="2" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#pm-card-dots)" />
              </svg>
            </div>
            <div className="relative flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-on-primary/70 text-micro font-bold uppercase tracking-widest">
                  طريقة استلام المستحقات
                </p>
                <p className="mt-1 truncate text-sm font-black text-on-primary">
                  {methodMeta?.label}
                  {setting.method === 'wallet' && setting.walletProvider && (
                    <span className="text-on-primary/80 font-bold">
                      {' '}
                      — {WALLET_LABELS[setting.walletProvider] || setting.walletProvider}
                    </span>
                  )}
                </p>
                <p className="text-on-primary/90 mt-1 font-mono text-xs font-bold tabular-nums">
                  {setting.method === 'wallet'
                    ? setting.walletPhone
                    : setting.method === 'instapay'
                      ? setting.instapayId
                      : setting.iban}
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
                {methodMeta && <methodMeta.icon size={20} className="text-on-primary" />}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                  {methodMeta && <methodMeta.icon size={15} className="text-primary" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-main">{methodMeta?.label}</p>
                  <span className="mt-0.5 flex w-fit items-center gap-1 rounded-md bg-success-soft px-1.5 py-0.5 text-micro font-bold text-success-strong">
                    <BadgeCheck size={10} />
                    طريقة الاستلام الرئيسية
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={openEdit}
                  aria-label="تعديل طريقة الدفع"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <PencilLine size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  aria-label="حذف طريقة الدفع"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted transition-colors hover:border-error hover:bg-error-soft hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>

            <div className="px-4 py-1">
              {setting.method === 'wallet' && (
                <>
                  <InfoRow
                    label="شركة المحفظة"
                    value={WALLET_LABELS[setting.walletProvider || ''] || setting.walletProvider}
                  />
                  <InfoRow label="رقم المحفظة" value={setting.walletPhone} mono />
                </>
              )}
              {setting.method === 'instapay' && (
                <>
                  <InfoRow label="معرّف InstaPay" value={setting.instapayId} mono />
                  <InfoRow label="اسم صاحب الحساب" value={setting.accountHolder} />
                  <InfoRow label="الرقم المرتبط" value={setting.instapayPhone} mono />
                </>
              )}
              {setting.method === 'bank_transfer' && (
                <>
                  <InfoRow label="اسم البنك" value={setting.bankName} />
                  <InfoRow label="اسم صاحب الحساب" value={setting.accountHolder} />
                  <InfoRow label="رقم الآيبان IBAN" value={setting.iban} mono />
                </>
              )}
            </div>

            <div className="border-t border-border px-4 py-2.5">
              <button
                onClick={openEdit}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary-soft py-2 text-micro font-bold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <PencilLine size={12} /> تعديل البيانات
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* نافذة الإضافة/التعديل */}
      {modalOpen && (
        <PaymentMethodForm
          form={form}
          setForm={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          isEdit={editingExisting}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </SectionCard>
  )
}

/* ---------- نموذج الإضافة/التعديل — Sheet على الهاتف ---------- */

interface PaymentMethodFormProps {
  form: EmptyForm
  setForm: (patch: Partial<EmptyForm>) => void
  isEdit: boolean
  submitting: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

const PaymentMethodForm = ({
  form,
  setForm,
  isEdit,
  submitting,
  onClose,
  onSubmit,
}: PaymentMethodFormProps) => {
  const { containerRef, handleKeyDown } = useDialogFocus(true, onClose)
  return (
    /* Portal: يُرسم فوق body مباشرة خارج سياق التكديس الرئيسي —
     بدونه تظهر النافذة خلف شريط التنقل السفلي على الهاتف */
    createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'تعديل طريقة الدفع' : 'إضافة طريقة دفع'}
        ref={containerRef}
        onKeyDown={handleKeyDown}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-elevation-3 sm:rounded-2xl"
          dir="rtl"
        >
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="h-1.5 w-10 rounded-full bg-border" />
          </div>

          <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
            <div>
              <h3 className="text-sm font-bold text-main">
                {isEdit ? 'تعديل طريقة الدفع' : 'إضافة طريقة دفع'}
              </h3>
              <p className="mt-0.5 text-micro text-muted">اختر النوع ثم أكمل البيانات</p>
            </div>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-muted transition-colors hover:bg-hover hover:text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              ✕<span className="sr-only">إغلاق</span>
            </button>
          </div>

          <form
            onSubmit={onSubmit}
            className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-5 pb-4"
          >
            {/* اختيار النوع */}
            <div>
              <label className="mb-2 block text-xs font-bold text-muted">نوع طريقة الدفع</label>
              <div className="grid grid-cols-3 gap-2">
                {METHODS.map((m) => {
                  const active = form.method === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setForm({ method: m.id })}
                      aria-pressed={active}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                        active
                          ? 'border-primary bg-primary-soft text-primary shadow-elevation-1'
                          : 'border-border bg-surface text-muted hover:border-primary/40 hover:text-main',
                      )}
                    >
                      <m.icon size={17} strokeWidth={active ? 2.3 : 1.8} />
                      <span className="text-center text-micro font-bold leading-tight">
                        {m.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* حقول المحفظة */}
            {form.method === 'wallet' && (
              <>
                <div>
                  <label htmlFor="pm-provider" className="mb-2 block text-xs font-bold text-muted">
                    شركة المحفظة
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {WALLETS.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setForm({ walletProvider: w })}
                        aria-pressed={form.walletProvider === w}
                        className={cn(
                          'rounded-lg border py-2 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                          form.walletProvider === w
                            ? 'border-primary bg-primary-soft text-primary'
                            : 'border-border bg-surface text-muted hover:text-main',
                        )}
                      >
                        {WALLET_LABELS[w]}
                      </button>
                    ))}
                  </div>
                </div>
                <Field
                  id="pm-wallet-phone"
                  label="رقم المحفظة"
                  value={form.walletPhone}
                  onChange={(v) => setForm({ walletPhone: v.replace(/\D/g, '').slice(0, 11) })}
                  placeholder="01XXXXXXXXX"
                  inputMode="numeric"
                />
              </>
            )}

            {/* حقول InstaPay */}
            {form.method === 'instapay' && (
              <>
                <Field
                  id="pm-instapay-id"
                  label="معرّف InstaPay"
                  value={form.instapayId}
                  onChange={(v) => setForm({ instapayId: v })}
                  placeholder="example@instapay"
                />
                <Field
                  id="pm-holder"
                  label="اسم صاحب الحساب"
                  value={form.accountHolder}
                  onChange={(v) => setForm({ accountHolder: v })}
                  placeholder="الاسم كما في البنك"
                />
                <Field
                  id="pm-instapay-phone"
                  label="الرقم المرتبط"
                  value={form.instapayPhone}
                  onChange={(v) => setForm({ instapayPhone: v.replace(/\D/g, '').slice(0, 11) })}
                  placeholder="01XXXXXXXXX"
                  inputMode="numeric"
                />
              </>
            )}

            {/* حقول البنك */}
            {form.method === 'bank_transfer' && (
              <>
                <Field
                  id="pm-bank"
                  label="اسم البنك"
                  value={form.bankName}
                  onChange={(v) => setForm({ bankName: v })}
                  placeholder="مثال: البنك الأهلي"
                />
                <Field
                  id="pm-bank-holder"
                  label="اسم صاحب الحساب"
                  value={form.accountHolder}
                  onChange={(v) => setForm({ accountHolder: v })}
                  placeholder="الاسم كما في البنك"
                />
                <Field
                  id="pm-iban"
                  label="رقم الآيبان IBAN"
                  value={form.iban}
                  onChange={(v) => setForm({ iban: v })}
                  placeholder="EG00 0000 0000 0000 0000 0000"
                  mono
                />
              </>
            )}
          </form>

          {/* أزرار ثابتة */}
          <div className="grid grid-cols-2 gap-2.5 border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-border bg-surface py-3 text-xs font-bold text-main transition-all hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              onClick={(e) => onSubmit(e)}
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-on-primary shadow-elevation-1 transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              {submitting ? 'جاري الحفظ...' : isEdit ? 'حفظ التغييرات' : 'إضافة طريقة الدفع'}
            </button>
          </div>
        </motion.div>
      </motion.div>,
      document.body,
    )
  )
}

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  inputMode?: 'numeric' | 'text'
  mono?: boolean
}

const Field = ({ id, label, value, onChange, placeholder, inputMode, mono }: FieldProps) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-xs font-bold text-muted">
      {label}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      inputMode={inputMode}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      className={cn(
        'w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-main outline-none transition-all placeholder:font-medium placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus',
        mono && 'font-mono tabular-nums',
      )}
    />
  </div>
)
