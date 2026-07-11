import { useState, useEffect } from 'react';
import { Coins, Plus, Trash2, RefreshCw } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, InputField, PrimaryBtn, SecondaryBtn, DangerBtn } from './SettingsUI';
import { settingsService } from '../services/settingsService';
import type { Currency, ExchangeRate } from '../services/settingsService';

export const CurrenciesSection = ({
    localCurrency, setLocalCurrency,
    showNotify,
}: {
    localCurrency: string; setLocalCurrency: (v: string) => void;
    showNotify: (msg: string) => void;
}) => {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [rates, setRates] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCode, setNewCode] = useState('');
    const [newName, setNewName] = useState('');
    const [newSymbol, setNewSymbol] = useState('');
    const [newRate, setNewRate] = useState({ fromCurrency: '', toCurrency: '', buyRate: '', sellRate: '', notes: '' });
    const [activeTab, setActiveTab] = useState<'currencies' | 'rates'>('currencies');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cur, rts] = await Promise.all([
                settingsService.getCurrencies(),
                settingsService.getExchangeRates(),
            ]);
            setCurrencies(cur);
            setRates(rts);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const addCurrency = async () => {
        if (!newCode || !newName) return;
        try {
            await settingsService.createCurrency({ code: newCode.toUpperCase(), name: newName, symbol: newSymbol });
            setNewCode(''); setNewName(''); setNewSymbol('');
            showNotify('تم إضافة العملة');
            fetchData();
        } catch (e: any) { alert(e?.message || 'خطأ'); }
    };

    const removeCurrency = async (code: string) => {
        try {
            await settingsService.deleteCurrency(code);
            showNotify('تم حذف العملة');
            fetchData();
        } catch (e: any) { alert(e?.message || 'خطأ'); }
    };

    const addRate = async () => {
        if (!newRate.fromCurrency || !newRate.toCurrency || !newRate.buyRate) return;
        try {
            await settingsService.createExchangeRate({
                fromCurrency: newRate.fromCurrency.toUpperCase(),
                toCurrency: newRate.toCurrency.toUpperCase(),
                buyRate: parseFloat(newRate.buyRate),
                sellRate: parseFloat(newRate.sellRate || newRate.buyRate),
                notes: newRate.notes,
            });
            setNewRate({ fromCurrency: '', toCurrency: '', buyRate: '', sellRate: '', notes: '' });
            showNotify('تم إضافة سعر الصرف');
            fetchData();
        } catch (e: any) { alert(e?.message || 'خطأ'); }
    };

    const removeRate = async (id: number) => {
        try {
            await settingsService.deleteExchangeRate(id);
            showNotify('تم حذف سعر الصرف');
            fetchData();
        } catch (e: any) { alert(e?.message || 'خطأ'); }
    };

    const setAsDefault = (code: string) => {
        setLocalCurrency(code);
        showNotify(`تم تعيين ${code} كعملة افتراضية`);
    };

    if (loading) return <SectionCard><p className="text-sm text-dim">جاري التحميل...</p></SectionCard>;

    return (
        <SectionCard>
            <SectionTitle icon={Coins} label="العملات وأسعار الصرف" sub="إدارة العملات المدعومة وأسعار الصرف" />

            <div className="flex gap-1 mb-5 bg-surface p-1 rounded-xl w-fit">
                <button onClick={() => setActiveTab('currencies')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'currencies' ? 'bg-card shadow-sm text-main' : 'text-muted hover:text-main'}`}>العملات</button>
                <button onClick={() => setActiveTab('rates')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'rates' ? 'bg-card shadow-sm text-main' : 'text-muted hover:text-main'}`}>أسعار الصرف</button>
            </div>

            {activeTab === 'currencies' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5 p-4 bg-surface rounded-xl">
                        <InputField value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="رمز العملة (USD)" />
                        <InputField value={newName} onChange={e => setNewName(e.target.value)} placeholder="الاسم (دولار)" />
                        <InputField value={newSymbol} onChange={e => setNewSymbol(e.target.value)} placeholder="الرمز ($)" />
                        <PrimaryBtn onClick={addCurrency}><Plus size={14} /> إضافة</PrimaryBtn>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-start py-2 px-3 text-muted font-bold">الرمز</th>
                                    <th className="text-start py-2 px-3 text-muted font-bold">الاسم</th>
                                    <th className="text-start py-2 px-3 text-muted font-bold">الرمز</th>
                                    <th className="text-start py-2 px-3 text-muted font-bold">الحالة</th>
                                    <th className="text-end py-2 px-3 text-muted font-bold"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {currencies.map(c => (
                                    <tr key={c.code} className="border-b border-border hover:bg-surface">
                                        <td className="py-2.5 px-3 font-bold text-main">{c.code}</td>
                                        <td className="py-2.5 px-3 text-muted">{c.name}</td>
                                        <td className="py-2.5 px-3 text-muted">{c.symbol}</td>
                                        <td className="py-2.5 px-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-micro font-bold ${c.isActive ? 'bg-success-soft text-success' : 'bg-hover text-dim'}`}>
                                                {c.isActive ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-end">
                                            <div className="flex items-center gap-1 justify-end">
                                                {localCurrency !== c.code && (
                                                    <button onClick={() => setAsDefault(c.code)} className="p-1.5 rounded-lg hover:bg-info-soft text-info transition-all" title="تعيين كافتراضي">
                                                        <RefreshCw size={13} />
                                                    </button>
                                                )}
                                                <button onClick={() => removeCurrency(c.code)} className="p-1.5 rounded-lg hover:bg-error-soft text-error transition-all" title="حذف">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {currencies.length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-6 text-dim">لا توجد عملات مضافة</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 p-3 bg-primary-soft rounded-xl">
                        <p className="text-xs font-bold text-primary">العملة الافتراضية: <span className="text-primary">{localCurrency || 'ج.م'}</span></p>
                    </div>
                </>
            )}

            {activeTab === 'rates' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-5 p-4 bg-surface rounded-xl">
                        <InputField value={newRate.fromCurrency} onChange={e => setNewRate(p => ({ ...p, fromCurrency: e.target.value }))} placeholder="من (USD)" />
                        <InputField value={newRate.toCurrency} onChange={e => setNewRate(p => ({ ...p, toCurrency: e.target.value }))} placeholder="إلى (KWD)" />
                        <InputField value={newRate.buyRate} onChange={e => setNewRate(p => ({ ...p, buyRate: e.target.value }))} placeholder="سعر الشراء" type="number" step="0.001" />
                        <InputField value={newRate.sellRate} onChange={e => setNewRate(p => ({ ...p, sellRate: e.target.value }))} placeholder="سعر البيع" type="number" step="0.001" />
                        <InputField value={newRate.notes} onChange={e => setNewRate(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظة" />
                        <PrimaryBtn onClick={addRate}><Plus size={14} /> إضافة</PrimaryBtn>
                    </div>

                    <div className="overflow-x-auto max-h-80 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-start py-2 px-3 text-muted font-bold">من</th>
                                    <th className="text-start py-2 px-3 text-muted font-bold">إلى</th>
                                    <th className="text-start py-2 px-3 text-muted font-bold">الشراء</th>
                                    <th className="text-start py-2 px-3 text-muted font-bold">البيع</th>
                                    <th className="text-start py-2 px-3 text-muted font-bold">التاريخ</th>
                                    <th className="text-end py-2 px-3 text-muted font-bold"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rates.map(r => (
                                    <tr key={r.id} className="border-b border-border hover:bg-surface">
                                        <td className="py-2 px-3 font-bold text-main">{r.fromCurrency}</td>
                                        <td className="py-2 px-3 font-bold text-main">{r.toCurrency}</td>
                                        <td className="py-2 px-3 text-muted">{r.buyRate}</td>
                                        <td className="py-2 px-3 text-muted">{r.sellRate}</td>
                                        <td className="py-2 px-3 text-dim">{new Date(r.effectiveDate).toLocaleDateString('ar')}</td>
                                        <td className="py-2 px-3 text-end">
                                            <button onClick={() => removeRate(r.id)} className="p-1.5 rounded-lg hover:bg-error-soft text-error transition-all"><Trash2 size={13} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {rates.length === 0 && (
                                    <tr><td colSpan={6} className="text-center py-6 text-dim">لا توجد أسعار صرف</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </SectionCard>
    );
};
