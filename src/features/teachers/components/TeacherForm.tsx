import { useState, useEffect } from 'react';
import { Plus, Edit3, Save, Key, Info, User, Phone, Tag, DollarSign, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Teacher } from '../types';

interface TeacherFormProps {
    onSubmit: (data: Omit<Teacher, 'id'>) => void;
    initialData?: Teacher | null;
    onCancel: () => void;
    editId?: string | null;
}

export const TeacherForm = ({ onSubmit, initialData, onCancel, editId }: TeacherFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        phone1: '',
        phone2: '',
        subject: '',
        price: '',
        currency: 'EGP',
        username: '',
        password: ''
    });
    const [enableLogin, setEnableLogin] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                phone1: initialData.phone1,
                phone2: initialData.phone2 || '',
                subject: initialData.subject,
                price: String(initialData.price),
                username: initialData.username || '',
                password: initialData.password || '',
                currency: initialData.currency || 'EGP'
            });
            setEnableLogin(!!initialData.username);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            price: Number(formData.price),
            currency: formData.currency || 'EGP',
            username: enableLogin ? formData.username : '',
            password: enableLogin ? formData.password : ''
        });
    };

    const generatePassword = () => {
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
        let pass = '';
        for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
        setFormData(prev => ({ ...prev, password: pass }));
    };

    const generateUsername = () => {
        if (!formData.name) return;
        const firstName = formData.name.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        setFormData(prev => ({
            ...prev,
            username: `${firstName || 'teacher'}_${Math.floor(Math.random() * 1000)}`
        }));
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden" dir="rtl">
            <div className="bg-gradient-to-br from-[#6C4BFF] to-[#8B5CF6] p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-sm">
                        {editId ? <Edit3 size={18} className="text-white" /> : <Plus size={18} className="text-white" />}
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white uppercase tracking-tighter">{editId ? 'تعديل بيانات المعلمة' : 'إضافة معلمة جديدة'}</h3>
                        <p className="text-[8px] font-medium text-white/70 uppercase tracking-widest mt-0.5">{editId ? 'تحديث المعلومات' : 'إدخال بيانات المعلمة'}</p>
                    </div>
                </div>
                <button type="button" onClick={onCancel} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                    <X size={18} />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-slate-800">
                        <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                            <Info size={12} className="text-blue-500" />
                        </div>
                        <h4 className="text-[10px] font-medium text-slate-800 dark:text-white uppercase tracking-widest">بيانات التعريف الأساسية</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormInput label="الاسم الكامل" icon={User} value={formData.name} onChange={(val: string) => setFormData({ ...formData, name: val })} required placeholder="سارة محمد" />
                        <FormInput label="رقم الهاتف (1)" icon={Phone} type="tel" value={formData.phone1} onChange={(val: string) => setFormData({ ...formData, phone1: val })} required placeholder="05XXXXXXXX" dir="ltr" />
                        <FormInput label="رقم الهاتف (2)" icon={Phone} type="tel" value={formData.phone2} onChange={(val: string) => setFormData({ ...formData, phone2: val })} placeholder="اختياري" dir="ltr" />
                        <FormInput label="التخصص" icon={Tag} value={formData.subject} onChange={(val: string) => setFormData({ ...formData, subject: val })} required placeholder="لغة عربية" />
                        <FormInput label="السعر الافتراضي للحصة" icon={DollarSign} type="number" value={formData.price} onChange={(val: string) => setFormData({ ...formData, price: val })} placeholder="0.00" />
                    </div>
                </div>

                {/* Currency Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-slate-800">
                        <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                            <DollarSign size={12} className="text-emerald-500" />
                        </div>
                        <h4 className="text-[10px] font-medium text-slate-800 dark:text-white uppercase tracking-widest">عملة السعر</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mr-1">العملة</label>
                            <div className="relative group">
                                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={12} />
                                <select
                                    value={formData.currency}
                                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 dark:text-white text-[11px] font-medium transition-all pr-10 appearance-none"
                                >
                                    <option value="KWD">د.ك (KWD)</option>
                                    <option value="SAR">﷼ (SAR)</option>
                                    <option value="AED">د.إ (AED)</option>
                                    <option value="QAR">﷼ (QAR)</option>
                                    <option value="OMR">﷼ (OMR)</option>
                                    <option value="BHD">د.ب (BHD)</option>
                                    <option value="EGP">ج.م (EGP)</option>
                                    <option value="USD">$ (USD)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Platform Access Section */}
                <div className="p-5 bg-gray-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-800/50 rounded-xl">
                    <label 
                        onClick={() => setEnableLogin(!enableLogin)}
                        className="flex items-center gap-3 cursor-pointer group mb-6"
                    >
                        <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-all",
                            enableLogin ? "bg-[#6C4BFF] border-[#6C4BFF]" : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                        )}>
                            {enableLogin && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                        </div>
                        <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 uppercase tracking-widest">تفعيل حساب المعلمة على المنصة</span>
                    </label>

                    {enableLogin && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">اسم المستخدم</label>
                                    <button type="button" onClick={generateUsername} className="text-[8px] text-[#6C4BFF] font-medium hover:underline uppercase tracking-tighter">توليد تلقائي</button>
                                </div>
                                <div className="relative">
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                    <input
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 text-[11px] font-medium font-mono dark:text-white transition-all"
                                        placeholder="اسم المستخدم"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">كلمة المرور</label>
                                    <button type="button" onClick={generatePassword} className="text-[8px] text-[#6C4BFF] font-medium hover:underline uppercase tracking-tighter">توليد تلقائي</button>
                                </div>
                                <div className="relative">
                                    <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                    <input
                                        type="text"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 text-[11px] font-medium font-mono tracking-widest dark:text-white transition-all"
                                        placeholder="كلمة المرور"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6] text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-purple-500/25 rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                    >
                        <Save size={14} />
                        {initialData ? 'تحديث البيانات' : 'إتمام الإضافة'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const FormInput = ({ label, icon: Icon, placeholder, value, onChange, required, type = "text", dir = "rtl" }: { label: string; icon: React.ComponentType<{ size?: number }>; placeholder?: string; value: string; onChange: (val: string) => void; required?: boolean; type?: string; dir?: string }) => (
    <div className="space-y-1.5">
        <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mr-1">{label}</label>
        <div className="relative group">
            {Icon && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6C4BFF] transition-colors" size={12} />}
            <input
                required={required}
                type={type}
                dir={dir}
                value={value}
                onChange={e => onChange(e.target.value)}
                className={cn(
                    "w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 dark:text-white text-[11px] font-medium transition-all",
                    Icon && "pr-10",
                    dir === 'ltr' && "font-mono"
                )}
                placeholder={placeholder}
            />
        </div>
    </div>
);
