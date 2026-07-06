import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Save, Shield, Key, Info, GraduationCap, Phone, User as UserIcon, X, Tag, DollarSign, FileText } from 'lucide-react';
import type { Student } from '../types';
import { cn } from '../../../lib/utils';

interface StudentFormProps {
    onSubmit: (data: Omit<Student, 'id' | 'enrollments'>) => void;
    initialData?: Student | null;
    onCancel?: () => void;
}

const GRADE_OPTIONS = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر'];
const CURRICULUM_OPTIONS = ['المنهج السعودي', 'المنهج المصري', 'المنهج السوري', 'المنهج الكويتي', 'المنهج الإماراتي', 'المنهج الفلسطيني', 'منهج دبلوما', 'منهج أمريكي', 'منهج بريطاني', 'أخرى'];
const CURRENCY_OPTIONS = ['KWD', 'SAR', 'AED', 'QAR', 'OMR', 'BHD', 'EGP', 'USD'];

export const StudentForm = ({ onSubmit, initialData, onCancel }: StudentFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        parentPhone: '',
        studentPhone: '',
        curriculum: '',
        notes: '',
        sessionPrice: '',
        currency: 'KWD',
        username: '',
        password: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                grade: initialData.grade,
                parentPhone: initialData.parentPhone,
                studentPhone: initialData.studentPhone || '',
                curriculum: initialData.curriculum || '',
                notes: initialData.notes || '',
                sessionPrice: String(initialData.sessionPrice || 0),
                currency: initialData.currency || 'KWD',
                username: initialData.username || '',
                password: '' 
            });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            sessionPrice: Number(formData.sessionPrice) || 0
        });
    };

    return (
        <div className="bg-card border border-border shadow-sm overflow-hidden animate-in slide-in-from-top-4 duration-500" dir="rtl">
            {/* Header Section */}
            <div className="bg-primary px-6 py-8 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-on-primary flex items-center justify-center shadow-sm">
                        {initialData ? <Edit size={24} /> : <UserPlus size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-on-primary tracking-tight">{initialData ? 'تعديل بيانات الطالب' : 'إدراج طالب جديد'}</h3>
                        <p className="text-micro text-dim font-normal uppercase tracking-widest mt-1">
                            {initialData ? 'أرشفة وتحديث السجل' : 'فتح سجل أكاديمي جديد'}
                        </p>
                    </div>
                </div>
                {onCancel && (
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="w-10 h-10 flex items-center justify-center text-dim hover:bg-white/10 transition-all"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-10">
                {/* Basic Info Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-border">
                        <div className="w-8 h-8 flex items-center justify-center bg-info-soft dark:bg-info-soft">
                            <Info size={16} className="text-primary" />
                        </div>
                        <h4 className="text-xs font-bold text-main uppercase tracking-tight">بيانات التعريف الأساسية</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormInput label="الاسم الكامل" icon={UserIcon} value={formData.name} onChange={(val: string) => setFormData({ ...formData, name: val })} required placeholder="مثال: محمد أحمد" />
                        <SelectField label="المرحلة الدراسية" icon={GraduationCap} value={formData.grade} onChange={(val: string) => setFormData({ ...formData, grade: val })} required options={GRADE_OPTIONS} placeholder="اختر المرحلة" />
                        <SelectField label="المنهج الدراسي" icon={Tag} value={formData.curriculum} onChange={(val: string) => setFormData({ ...formData, curriculum: val })} options={CURRICULUM_OPTIONS} placeholder="اختر المنهج" />
                        <FormInput label="هاتف ولي الأمر" icon={Phone} type="tel" value={formData.parentPhone} onChange={(val: string) => setFormData({ ...formData, parentPhone: val })} required placeholder="05XXXXXXXX" dir="ltr" />
                        <FormInput label="هاتف الطالب" icon={Phone} type="tel" value={formData.studentPhone} onChange={(val: string) => setFormData({ ...formData, studentPhone: val })} placeholder="05XXXXXXXX" dir="ltr" />
                        <FormInput label="سعر الحصة الافتراضي" icon={DollarSign} type="number" value={formData.sessionPrice} onChange={(val: string) => setFormData({ ...formData, sessionPrice: val })} required placeholder="0.00" />
                        <SelectField label="عملة الحصة" icon={DollarSign} value={formData.currency} onChange={(val: string) => setFormData({ ...formData, currency: val })} options={CURRENCY_OPTIONS} placeholder="اختر العملة" />
                    </div>
                </div>

                {/* Platform Access Section */}
                <div className="p-6 bg-surface dark:bg-hover border border-transparent">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 flex items-center justify-center bg-success-soft dark:bg-success-soft">
                            <Shield size={16} className="text-success" />
                        </div>
                        <h4 className="text-xs font-bold text-main uppercase tracking-tight">إدارة الوصول للمنصة</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-micro font-normal text-dim uppercase ms-1">اسم المستخدم</label>
                            <div className="relative">
                                <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-dim" size={14} />
                                <input
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full pl-4 pr-10 py-2 bg-card border border-border focus:outline-none focus:border-primary text-xs font-normal font-mono dark:text-main"
                                    placeholder="اسم مستخدم فريد"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-micro font-normal text-dim uppercase ms-1">كلمة المرور</label>
                            <div className="relative">
                                <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-dim" size={14} />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-4 pr-10 py-2 bg-card border border-border focus:outline-none focus:border-primary text-xs font-normal font-mono tracking-widest dark:text-main"
                                    placeholder={initialData ? "••••••••" : "كلمة مرور قوية"}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText size={14} className="text-dim" />
                        <label className="text-micro font-normal text-dim uppercase">ملاحظات أكاديمية</label>
                    </div>
                    <textarea
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-6 py-4 bg-surface dark:bg-hover border border-border focus:outline-none focus:border-primary dark:text-main text-xs font-normal min-h-[120px] transition-all"
                        placeholder="أضف أي تفاصيل أو ملاحظات حول مستوى الطالب..."
                    />
                </div>

                <div className="flex items-center justify-end pt-6 border-t border-border">
                    <button
                        type="submit"
                        className="px-10 py-3 bg-primary text-on-primary text-xs font-bold uppercase tracking-widest hover:bg-primary-hover flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                    >
                        <Save size={16} />
                        {initialData ? 'تحديث السجل' : 'إتمام الإضافة'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const SelectField = ({ label, icon: Icon, placeholder, value, onChange, required, options }: { label: string; icon: React.ComponentType<{ size?: number }>; placeholder?: string; value: string; onChange: (val: string) => void; required?: boolean; options: string[] }) => (
    <div className="space-y-2">
        <label className="text-micro font-normal text-dim uppercase ms-1">{label}</label>
        <div className="relative group">
            {Icon && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-primary transition-colors z-10" size={14} />}
            <select
                required={required}
                value={value}
                onChange={e => onChange(e.target.value)}
                className={cn(
                    "w-full px-4 py-2 bg-surface dark:bg-hover border border-border focus:outline-none focus:border-primary dark:text-main text-xs font-normal appearance-none",
                    Icon && "pr-10",
                    !value && "text-dim"
                )}
            >
                <option value="" disabled>{placeholder || 'اختر...'}</option>
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    </div>
);

const FormInput = ({ label, icon: Icon, placeholder, value, onChange, required, type = "text", dir = "rtl" }: { label: string; icon: React.ComponentType<{ size?: number }>; placeholder?: string; value: string; onChange: (val: string) => void; required?: boolean; type?: string; dir?: string }) => (
    <div className="space-y-2">
        <label className="text-micro font-normal text-dim uppercase ms-1">{label}</label>
        <div className="relative group">
            {Icon && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-primary transition-colors" size={14} />}
            <input
                required={required}
                type={type}
                dir={dir}
                value={value}
                onChange={e => onChange(e.target.value)}
                className={cn(
                    "w-full px-4 py-2 bg-surface dark:bg-hover border border-border focus:outline-none focus:border-primary dark:text-main text-xs font-normal transition-all",
                    Icon && "pr-10",
                    dir === 'ltr' && "font-mono"
                )}
                placeholder={placeholder}
            />
        </div>
    </div>
);

