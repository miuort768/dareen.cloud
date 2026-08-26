import { useState, useEffect } from 'react'
import { Coins, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { CURRENCY_SYMBOL } from '../../../config/constants'
import {
  SectionCard,
  SectionTitle,
  InputField,
  PrimaryBtn,
  ALLOWED_CURRENCIES,
  ALLOWED_CURRENCY_CODES,
} from './SettingsUI'
import { settingsService } from '../services/settingsService'
import { useSettingsStore } from '../../../store/settingsStore'
import type { Currency, ExchangeRate } from '../services/settingsService'
import { cn } from '../../../lib/utils'

export const CurrenciesSection = ({
  localCurrency,
  setLocalCurrency,
  showNotify,
}: {
  localCurrency: string
  setLocalCurrency: (v: string) => void
  showNotify: (msg: string) => void
}) => {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(true)
  const [newRate, setNewRate] = useState({
    fromCurrency: '',
    toCurrency: '',
    buyRate: '',
    sellRate: '',
    notes: '',
  })
  const [activeTab, setActiveTab] = useState<'currencies' | 'rates'>('currencies')
  const setSetting = useSettingsStore((s) => s.setSetting)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [cur, rts] = await Promise.all([
        settingsService.getCurrencies(),
        settingsService.getExchangeRates(),
      ])
      setCurrencies(cur)
      setRates(rts)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const visibleCurrencies = currencies.filter((c) => ALLOWED_CURRENCY_CODES.includes(c.code))

  const addRate = async () => {
    if (!newRate.fromCurrency || !newRate.toCurrency || !newRate.buyRate) return
    try {
      await settingsService.createExchangeRate({
        fromCurrency: newRate.fromCurrency.toUpperCase(),
        toCurrency: newRate.toCurrency.toUpperCase(),
        buyRate: parseFloat(newRate.buyRate),
        sellRate: parseFloat(newRate.sellRate || newRate.buyRate),
        notes: newRate.notes,
      })
      setNewRate({ fromCurrency: '', toCurrency: '', buyRate: '', sellRate: '', notes: '' })
      showNotify('تم إضافة سعر الصرف')
      fetchData()
    } catch (e: unknown) {
      showNotify(e instanceof Error ? e.message : 'خطأ')
    }
  }

  const removeRate = async (id: number) => {
    try {
      await settingsService.deleteExchangeRate(id)
      showNotify('تم حذف سعر الصرف')
      fetchData()
    } catch (e: unknown) {
      showNotify(e instanceof Error ? e.message : 'خطأ')
    }
  }

  const setAsDefault = async (code: string) => {
    try {
      await setSetting('currencySymbol', code)
      setLocalCurrency(code)
      showNotify(`تم تعيين ${code} كعملة افتراضية`)
    } catch (e: unknown) {
      showNotify(e instanceof Error ? e.message : 'خطأ في الحفظ')
    }
  }

  if (loading)
    return (
      <SectionCard>
        <p className="text-sm text-muted">جاري التحميل...</p>
      </SectionCard>
    )

  return (
    <SectionCard>
      <SectionTitle
        icon={Coins}
        label="العملات وأسعار الصرف"
        sub="إدارة العملات المدعومة وأسعار الصرف"
      />

      <div className="mb-5 flex w-fit gap-1 rounded-xl border border-divider bg-background p-1">
        <button
          onClick={() => setActiveTab('currencies')}
          className={cn(
            'rounded-lg px-4 py-2 text-xs font-bold transition-all',
            activeTab === 'currencies'
              ? 'bg-card text-main shadow-sm'
              : 'text-muted hover:text-main',
          )}
        >
          العملات
        </button>
        <button
          onClick={() => setActiveTab('rates')}
          className={cn(
            'rounded-lg px-4 py-2 text-xs font-bold transition-all',
            activeTab === 'rates' ? 'bg-card text-main shadow-sm' : 'text-muted hover:text-main',
          )}
        >
          أسعار الصرف
        </button>
      </div>

      {activeTab === 'currencies' && (
        <>
          <div className="mb-5 rounded-xl border border-primary/20 bg-primary-soft p-4 text-[11px] font-bold text-primary">
            العملات المدعومة في المنصة ثابتة (جنيه مصري، دولار، دينار كويتي، بحريني، أردني، ريال
            سعودي، قطري، عماني، درهم إماراتي).
          </div>

          <div className="overflow-x-auto rounded-xl border border-divider">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-divider bg-background">
                  <th className="px-4 py-3 text-start font-bold text-muted">الرمز</th>
                  <th className="px-4 py-3 text-start font-bold text-muted">الاسم</th>
                  <th className="px-4 py-3 text-start font-bold text-muted">العلامة</th>
                  <th className="px-4 py-3 text-start font-bold text-muted">الحالة</th>
                  <th className="px-4 py-3 text-end font-bold text-muted">الافتراضية</th>
                </tr>
              </thead>
              <tbody>
                {visibleCurrencies.map((c) => (
                  <tr
                    key={c.code}
                    className="border-b border-divider transition-colors hover:bg-background"
                  >
                    <td className="px-4 py-3 font-bold text-main">{c.code}</td>
                    <td className="px-4 py-3 text-muted">{c.name}</td>
                    <td className="px-4 py-3 text-muted">{c.symbol}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold',
                          c.isActive ? 'bg-success-soft text-success' : 'bg-hover text-muted',
                        )}
                      >
                        {c.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      {localCurrency === c.code ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
                          <CheckCircle2 size={12} /> الافتراضية
                        </span>
                      ) : (
                        <button
                          onClick={() => setAsDefault(c.code)}
                          className="rounded-lg bg-info-soft px-3 py-1.5 text-[11px] font-bold text-info transition-all hover:brightness-95"
                          title="تعيين كافتراضي"
                        >
                          تعيين افتراضي
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {visibleCurrencies.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-muted">
                      لا توجد عملات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-xl border border-primary/10 bg-primary-soft p-4">
            <p className="text-xs font-bold text-primary">
              العملة الافتراضية:{' '}
              {ALLOWED_CURRENCIES.find((c) => c.code === localCurrency)?.name ||
                localCurrency ||
                CURRENCY_SYMBOL}
            </p>
          </div>
        </>
      )}

      {activeTab === 'rates' && (
        <>
          <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-divider bg-background p-4 md:grid-cols-6">
            <InputField
              value={newRate.fromCurrency}
              onChange={(e) => setNewRate((p) => ({ ...p, fromCurrency: e.target.value }))}
              placeholder="من (USD)"
            />
            <InputField
              value={newRate.toCurrency}
              onChange={(e) => setNewRate((p) => ({ ...p, toCurrency: e.target.value }))}
              placeholder="إلى (KWD)"
            />
            <InputField
              value={newRate.buyRate}
              onChange={(e) => setNewRate((p) => ({ ...p, buyRate: e.target.value }))}
              placeholder="سعر الشراء"
              type="number"
              step="0.001"
            />
            <InputField
              value={newRate.sellRate}
              onChange={(e) => setNewRate((p) => ({ ...p, sellRate: e.target.value }))}
              placeholder="سعر البيع"
              type="number"
              step="0.001"
            />
            <InputField
              value={newRate.notes}
              onChange={(e) => setNewRate((p) => ({ ...p, notes: e.target.value }))}
              placeholder="ملاحظة"
            />
            <PrimaryBtn onClick={addRate}>
              <Plus size={14} /> إضافة
            </PrimaryBtn>
          </div>

          <div className="max-h-80 overflow-x-auto overflow-y-auto rounded-xl border border-divider">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-divider bg-background">
                  <th className="px-4 py-3 text-start font-bold text-muted">من</th>
                  <th className="px-4 py-3 text-start font-bold text-muted">إلى</th>
                  <th className="px-4 py-3 text-start font-bold text-muted">الشراء</th>
                  <th className="px-4 py-3 text-start font-bold text-muted">البيع</th>
                  <th className="px-4 py-3 text-start font-bold text-muted">التاريخ</th>
                  <th className="px-4 py-3 text-end font-bold text-muted"></th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-divider transition-colors hover:bg-background"
                  >
                    <td className="px-4 py-3 font-bold text-main">{r.fromCurrency}</td>
                    <td className="px-4 py-3 font-bold text-main">{r.toCurrency}</td>
                    <td className="px-4 py-3 text-muted">{r.buyRate}</td>
                    <td className="px-4 py-3 text-muted">{r.sellRate}</td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(r.effectiveDate).toLocaleDateString('ar')}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button
                        aria-label="حذف سعر الصرف"
                        onClick={() => removeRate(r.id)}
                        className="rounded-lg p-2 text-error transition-all hover:bg-error-soft"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {rates.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted">
                      لا توجد أسعار صرف
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </SectionCard>
  )
}
