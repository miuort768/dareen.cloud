import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Smartphone, Building2, CreditCard, Phone, User, Hash, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useShowNotification } from '../../context/AppContext';

interface PaymentSetting {
    id?: string;
    method: 'wallet' | 'instapay' | 'bank_transfer';
    walletProvider?: string;
    walletPhone?: string;
    instapayId?: string;
    accountHolder?: string;
    instapayPhone?: string;
    iban?: string;
    bankName?: string;
}

const METHODS = [
    { id: 'wallet' as const, label: 'محفظة إلكترونية', icon: Wallet, color: 'text-success' },
    { id: 'instapay' as const, label: 'انستا باي', icon: Smartphone, color: 'text-info' },
    { id: 'bank_transfer' as const, label: 'تحويل بنكي', icon: Building2, color: 'text-warning' },
];

const WALLETS = [
    { id: 'vodafone', label: 'فودافون كاش', color: 'bg-error/10 text-error border-error/20' },
    { id: 'etisalat', label: 'اتصالات كاش', color: 'bg-success/10 text-success border-success/20' },
    { id: 'orange', label: 'أورنج كاش', color: 'bg-warning/10 text-warning border-warning/20' },
];

const inputClass = "w-full px-4 py-3 text-sm font-medium bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-focus placeholder:text-muted/50";
const labelClass = "block text-xs font-bold text-muted mb-2";

export const PaymentSettingsSection = () => {
    const showNotification = useShowNotification();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [setting, setSetting] = useState<PaymentSetting>({ method: 'wallet' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchSetting = async () => {
            try {
                const data = await api.get<PaymentSetting | null>('/teachers/me/payment-settings');
                if (data) {
                    setSetting(data);
                }
            } catch {
                // no payment settings yet
            } finally {
                setLoading(false);
            }
        };
        fetchSetting();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const saved = await api.put<PaymentSetting>('/teachers/me/payment-settings', setting);
            setSetting(saved);
            setIsEditing(false);
            showNotification('تم حفظ إعدادات الدفع بنجاح', 'success');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء الحفظ';
            showNotification(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete('/teachers/me/payment-settings');
            setSetting({ method: 'wallet' });
            setIsEditing(false);
            showNotification('تم حذف إعدادات الدفع', 'success');
        } catch {
            showNotification('حدث خطأ أثناء الحذف', 'error');
        }
    };

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={16} className="text-primary" />
                    <h3 className="text-base font-bold text-main">إعدادات الدفع</h3>
                </div>
                <div className="space-y-3">
                    <div className="h-10 bg-surface rounded-xl animate-pulse" />
                    <div className="h-10 bg-surface rounded-xl animate-pulse" />
                    <div className="h-10 bg-surface rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    const hasSetting = setting.id && !isEditing;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-main flex items-center gap-2">
                    <CreditCard size={16} className="text-primary" />
                    إعدادات الدفع
                </h3>
                {hasSetting && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs font-bold text-primary hover:text-primary-hover transition-colors px-3 py-1.5 rounded-lg bg-primary/10"
                        >
                            تعديل
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-xs font-bold text-error hover:text-error/80 transition-colors px-3 py-1.5 rounded-lg bg-error/10"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                )}
            </div>

            {hasSetting ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border/50">
                        <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                            {METHODS.find(m => m.id === setting.method)?.icon &&
                                (() => { const Icon = METHODS.find(m => m.id === setting.method)!.icon; return <Icon size={13} className={METHODS.find(m => m.id === setting.method)!.color} />; })()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-muted font-medium">طريقة الدفع</p>
                            <p className="text-xs font-bold text-main">{METHODS.find(m => m.id === setting.method)?.label}</p>
                        </div>
                        <CheckCircle2 size={14} className="text-success shrink-0" />
                    </div>

                    {setting.method === 'wallet' && (
                        <>
                            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border/50">
                                <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                                    <Wallet size={13} className="text-success" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted font-medium">المحفظة</p>
                                    <p className="text-xs font-bold text-main">{WALLETS.find(w => w.id === setting.walletProvider)?.label}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border/50">
                                <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                                    <Phone size={13} className="text-info" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted font-medium">رقم الهاتف</p>
                                    <p className="text-xs font-bold text-main" dir="ltr">{setting.walletPhone}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {setting.method === 'instapay' && (
                        <>
                            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border/50">
                                <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                                    <Hash size={13} className="text-info" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted font-medium">معرف الانستا باي</p>
                                    <p className="text-xs font-bold text-main" dir="ltr">{setting.instapayId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border/50">
                                <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                                    <User size={13} className="text-warning" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted font-medium">صاحب الحساب</p>
                                    <p className="text-xs font-bold text-main">{setting.accountHolder}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border/50">
                                <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                                    <Phone size={13} className="text-success" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted font-medium">رقم الهاتف المربوط</p>
                                    <p className="text-xs font-bold text-main" dir="ltr">{setting.instapayPhone}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {setting.method === 'bank_transfer' && (
                        <>
                            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border/50">
                                <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                                    <User size={13} className="text-warning" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted font-medium">صاحب الحساب</p>
                                    <p className="text-xs font-bold text-main">{setting.accountHolder}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border/50">
                                <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                                    <Building2 size={13} className="text-info" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted font-medium">الايبان</p>
                                    <p className="text-xs font-bold text-main" dir="ltr">{setting.iban}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border/50">
                                <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                                    <Building2 size={13} className="text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted font-medium">البنك</p>
                                    <p className="text-xs font-bold text-main">{setting.bankName}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>طريقة الدفع</label>
                        <div className="grid grid-cols-3 gap-2">
                            {METHODS.map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setSetting(prev => ({ ...prev, method: m.id }))}
                                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                                        setting.method === m.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border bg-surface hover:border-border/80'
                                    }`}
                                >
                                    <m.icon size={18} className={setting.method === m.id ? 'text-primary' : m.color} />
                                    <span className={`text-[10px] font-bold ${setting.method === m.id ? 'text-primary' : 'text-muted'}`}>
                                        {m.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {setting.method === 'wallet' && (
                        <>
                            <div>
                                <label className={labelClass}>المحفظة الإلكترونية</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {WALLETS.map((w) => (
                                        <button
                                            key={w.id}
                                            type="button"
                                            onClick={() => setSetting(prev => ({ ...prev, walletProvider: w.id }))}
                                            className={`p-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                                                setting.walletProvider === w.id
                                                    ? `border-current ${w.color}`
                                                    : 'border-border bg-surface text-muted hover:border-border/80'
                                            }`}
                                        >
                                            {w.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="wallet-phone" className={labelClass}>رقم الهاتف (11 خانة)</label>
                                <input
                                    id="wallet-phone"
                                    type="tel"
                                    maxLength={11}
                                    value={setting.walletPhone || ''}
                                    onChange={(e) => setSetting(prev => ({ ...prev, walletPhone: e.target.value }))}
                                    placeholder="01XXXXXXXXX"
                                    className={inputClass}
                                    dir="ltr"
                                />
                            </div>
                        </>
                    )}

                    {setting.method === 'instapay' && (
                        <>
                            <div>
                                <label htmlFor="instapay-id" className={labelClass}>معرف الانستا باي</label>
                                <input
                                    id="instapay-id"
                                    type="text"
                                    value={setting.instapayId || ''}
                                    onChange={(e) => setSetting(prev => ({ ...prev, instapayId: e.target.value }))}
                                    placeholder="أدخل معرف الانستا باي"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="instapay-holder" className={labelClass}>اسم صاحب الحساب</label>
                                <input
                                    id="instapay-holder"
                                    type="text"
                                    value={setting.accountHolder || ''}
                                    onChange={(e) => setSetting(prev => ({ ...prev, accountHolder: e.target.value }))}
                                    placeholder="الاسم كما في الحساب"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="instapay-phone" className={labelClass}>رقم الهاتف المربوط بالحساب (11 خانة)</label>
                                <input
                                    id="instapay-phone"
                                    type="tel"
                                    maxLength={11}
                                    value={setting.instapayPhone || ''}
                                    onChange={(e) => setSetting(prev => ({ ...prev, instapayPhone: e.target.value }))}
                                    placeholder="01XXXXXXXXX"
                                    className={inputClass}
                                    dir="ltr"
                                />
                            </div>
                        </>
                    )}

                    {setting.method === 'bank_transfer' && (
                        <>
                            <div>
                                <label htmlFor="bank-holder" className={labelClass}>اسم صاحب الحساب</label>
                                <input
                                    id="bank-holder"
                                    type="text"
                                    value={setting.accountHolder || ''}
                                    onChange={(e) => setSetting(prev => ({ ...prev, accountHolder: e.target.value }))}
                                    placeholder="الاسم كما في البنك"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="bank-iban" className={labelClass}>رقم الايبان</label>
                                <input
                                    id="bank-iban"
                                    type="text"
                                    value={setting.iban || ''}
                                    onChange={(e) => setSetting(prev => ({ ...prev, iban: e.target.value }))}
                                    placeholder="SA00 0000 0000 0000 0000 0000"
                                    className={inputClass}
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label htmlFor="bank-name" className={labelClass}>اسم البنك</label>
                                <input
                                    id="bank-name"
                                    type="text"
                                    value={setting.bankName || ''}
                                    onChange={(e) => setSetting(prev => ({ ...prev, bankName: e.target.value }))}
                                    placeholder="مثال: الراجحي، الأهلي، الإنماء"
                                    className={inputClass}
                                />
                            </div>
                        </>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-on-primary bg-primary rounded-xl hover:bg-primary-hover active:bg-primary-active transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            حفظ
                        </button>
                        {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-3 text-sm font-bold text-muted bg-surface rounded-xl hover:bg-border/50 transition-colors"
                            >
                                إلغاء
                            </button>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};
