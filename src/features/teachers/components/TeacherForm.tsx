import { useState, useEffect } from 'react';
import { Plus, Edit3, Save, Key, Info, User, Phone, Tag, DollarSign, X, Award } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CURRENCY_OPTIONS } from '../../../config/constants';
import type { Teacher } from '../types';

const SUBJECT_OPTIONS = [
    'اللغة العربية',
    'اللغة الانجليزية',
    'اللغة الفرنسية',
    'اللغة الاسبانية',
    'الرياضيات',
    'العلوم وفروعها',
    'القران الكريم',
    'المواد الشرعية',
    'الاجتماعيات',
    'اخري',
];

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
        password: '',
        points: ''
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
                currency: initialData.currency || 'SAR',
                points: String(initialData.points ?? 0)
            });
            setEnableLogin(!!initialData.username);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            price: Number(formData.price),
            currency: formData.currency || 'SAR',
            username: enableLogin ? formData.username : '',
            password: enableLogin ? formData.password : '',
            points: Number(formData.points)
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
        <div className="bg-card border border-border shadow-elevation-2 rounded-2xl overflow-hidden" dir="rtl">
            <div className="bg-primary px-5 md:px-7 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/15">
                        {editId ? <Edit3 size={18} className="text-on-primary" /> : <Plus size={18} className="text-on-primary" />}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-on-primary">{editId ? 'تعديل بيانات المعلمة' : 'إضافة معلمة جديدة'}</h3>
                        <p className="text-xs text-on-primary/70 mt-0.5">{editId ? 'تحديث المعلومات' : 'إدخال بيانات المعلمة'}</p>
                    </div>
                </div>
                <button type="button" onClick={onCancel} className="w-8 h-8 flex items-center justify-center bg-white/15 hover:bg-white/25 text-on-primary rounded-xl transition-all" aria-label="إغلاق">
                    <X size={18} />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-border">
                        <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-info-soft">
                            <Info size={12} className="text-info" />
                        </div>
                        <h4 className="text-xs text-muted">بيانات التعريف الأساسية</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormInput label="الاسم الكامل" icon={User} value={formData.name} onChange={(val: string) => setFormData({ ...formData, name: val })} required placeholder="سارة محمد" />
                        <FormInput label="رقم الهاتف (1)" icon={Phone} type="tel" value={formData.phone1} onChange={(val: string) => setFormData({ ...formData, phone1: val })} required placeholder="05XXXXXXXX" dir="ltr" />
                        <FormInput label="رقم الهاتف (2)" icon={Phone} type="tel" value={formData.phone2} onChange={(val: string) => setFormData({ ...formData, phone2: val })} placeholder="اختياري" dir="ltr" />
                        <div className="space-y-1.5">
                            <label htmlFor="teacher-form-subject" className="text-xs text-muted ms-1">التخصص</label>
                            <div className="relative">
                                <Tag className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={12} />
                                <select
                                    id="teacher-form-subject"
                                    required
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-surface border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-main text-xs transition-all ps-10 appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>اختر التخصص...</option>
                                    {formData.subject && !SUBJECT_OPTIONS.includes(formData.subject) && (
                                        <option value={formData.subject}>{formData.subject}</option>
                                    )}
                                    {SUBJECT_OPTIONS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <FormInput label="السعر الافتراضي للحصة" icon={DollarSign} type="number" value={formData.price} onChange={(val: string) => setFormData({ ...formData, price: val })} placeholder="0.00" />
                        <FormInput label="النقاط" icon={Award} type="number" value={formData.points} onChange={(val: string) => setFormData({ ...formData, points: val })} placeholder="0" />
                    </div>
                </div>

                {/* Currency Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-border">
                        <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-success-soft">
                            <DollarSign size={12} className="text-success" />
                        </div>
                        <h4 className="text-xs text-muted">عملة السعر</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label htmlFor="teacher-currency" className="text-xs text-muted ms-1">العملة</label>
                            <div className="relative">
                                <DollarSign className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={12} />
                                <select
                                    id="teacher-currency"
                                    value={formData.currency}
                                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-main text-xs transition-all ps-10 appearance-none"
                                >
                                    {CURRENCY_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Platform Access Section */}
                <div className="p-5 bg-surface border border-border rounded-2xl">
                    <label 
                        onClick={() => setEnableLogin(!enableLogin)}
                        className="flex items-center gap-3 cursor-pointer mb-6"
                    >
                        <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-all",
                            enableLogin ? "bg-primary border-primary" : "bg-surface border-border"
                        )}>
                            {enableLogin && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                        </div>
                        <span className="text-xs text-muted">تفعيل حساب المعلمة على المنصة</span>
                    </label>

                    {enableLogin && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label htmlFor="teacher-username" className="text-xs text-muted">اسم المستخدم</label>
                                    <button type="button" onClick={generateUsername} className="text-xs text-primary hover:underline">توليد تلقائي</button>
                                </div>
                                <div className="relative">
                                    <User className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={12} />
                                    <input
                                        id="teacher-username"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full pe-4 ps-10 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs font-mono text-main transition-all"
                                        placeholder="اسم المستخدم"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label htmlFor="teacher-password" className="text-xs text-muted">كلمة المرور</label>
                                    <button type="button" onClick={generatePassword} className="text-xs text-primary hover:underline">توليد تلقائي</button>
                                </div>
                                <div className="relative">
                                    <Key className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={12} />
                                    <input
                                        id="teacher-password"
                                        type="text"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pe-4 ps-10 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs font-mono tracking-widest text-main transition-all"
                                        placeholder="كلمة المرور"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-border">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover rounded-xl flex items-center gap-2 active:scale-95 transition-all"
                    >
                        <Save size={14} />
                        {initialData ? 'تحديث البيانات' : 'إتمام الإضافة'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const FormInput = ({ label, icon: Icon, placeholder, value, onChange, required, type = "text", dir = "rtl" }: { label: string; icon: React.ComponentType<{ size?: number }>; placeholder?: string; value: string; onChange: (val: string) => void; required?: boolean; type?: string; dir?: string }) => {
    const inputId = `teacher-form-${label.replace(/\s+/g, '-')}`;
    return (
        <div className="space-y-1.5">
            <label htmlFor={inputId} className="text-xs text-muted ms-1">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={12} />}
                <input
                    id={inputId}
                    required={required}
                    type={type}
                    dir={dir}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className={cn(
                        "w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-main text-xs transition-all",
                        Icon && "ps-10",
                        dir === 'ltr' && "font-mono"
                    )}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
};
