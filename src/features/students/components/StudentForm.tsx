import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Save, Shield, Key, Info, GraduationCap, Phone, User as UserIcon, X, Tag, DollarSign, FileText } from 'lucide-react';
import type { Student } from '../types';
import { cn } from '../../../lib/utils';
import { CURRENCY_OPTIONS } from '../../../config/constants';
import { CURRICULUM_OPTIONS, normalizeCurriculum } from '../utils/curriculumUtils';

interface StudentFormProps {
    onSubmit: (data: Omit<Student, 'id' | 'enrollments'>) => void;
    initialData?: Student | null;
    onCancel?: () => void;
}

const GRADE_OPTIONS = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر'];

export const StudentForm = ({ onSubmit, initialData, onCancel }: StudentFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        parentPhone: '',
        studentPhone: '',
        curriculum: '',
        notes: '',
        sessionPrice: '',
        currency: 'EGP',
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
                curriculum: normalizeCurriculum(initialData.curriculum || ''),
                notes: initialData.notes || '',
                sessionPrice: String(initialData.sessionPrice || 0),
                currency: initialData.currency || 'EGP',
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
        <div className="bg-card border border-border shadow-elevation-2 overflow-hidden animate-in slide-in-from-top-4 duration-500" dir="rtl">
            {/* Header Section */}
            <div className="bg-primary px-4 md:px-6 py-6 md:py-8 flex items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/15 text-on-primary flex items-center justify-center shadow-sm">
                        {initialData ? <Edit size={24} /> : <UserPlus size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-on-primary tracking-tight">{initialData ? 'تعديل بيانات الطالب' : 'إدراج طالب جديد'}</h3>
                        <p className="text-micro text-white/80 font-normal mt-1">
                            {initialData ? 'أرشفة وتحديث السجل' : 'فتح سجل أكاديمي جديد'}
                        </p>
                    </div>
                </div>
                {onCancel && (
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="w-10 h-10 flex items-center justify-center text-white/70 hover:bg-white/15 transition-all"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6 md:space-y-10">
                {/* Basic Info Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-border">
                        <div className="w-8 h-8 flex items-center justify-center bg-info-soft ring-1 ring-info-soft rounded-xl">
                            <Info size={16} className="text-primary" />
                        </div>
                        <h4 className="text-xs font-bold text-main uppercase tracking-tight">بيانات التعريف الأساسية</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                <div className="p-6 bg-surface border border-border rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 flex items-center justify-center bg-success-soft">
                            <Shield size={16} className="text-success" />
                        </div>
                        <h4 className="text-xs font-bold text-main uppercase tracking-tight">إدارة الوصول للمنصة</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="student-username" className="text-micro font-normal text-muted uppercase ms-1">اسم المستخدم</label>
                            <div className="relative">
                                <UserIcon className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                                <input
                                    id="student-username"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full pe-4 ps-10 py-2 bg-surface border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs font-normal font-mono text-main rounded-xl transition-colors"
                                    placeholder="اسم مستخدم فريد"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="student-password" className="text-micro font-normal text-muted uppercase ms-1">كلمة المرور</label>
                            <div className="relative">
                                <Key className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                                <input
                                    id="student-password"
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pe-4 ps-10 py-2 bg-surface border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs font-normal font-mono tracking-widest text-main rounded-xl transition-colors"
                                    placeholder={initialData ? "••••••••" : "كلمة مرور قوية"}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText size={14} className="text-muted" />
                        <label htmlFor="student-notes" className="text-micro font-normal text-muted uppercase">ملاحظات أكاديمية</label>
                    </div>
                            <textarea
                                id="student-notes"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-6 py-4 bg-surface border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-main text-xs font-normal min-h-[120px] transition-all rounded-xl"
                                placeholder="أضف أي تفاصيل أو ملاحظات حول مستوى الطالب..."
                            />
                </div>

                <div className="flex items-center justify-end pt-6 border-t border-border">
                    <button
                        type="submit"
                        className="px-10 py-3 bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover flex items-center gap-2 shadow-sm active:scale-95 transition-all rounded-xl"
                    >
                        <Save size={16} />
                        {initialData ? 'تحديث السجل' : 'إتمام الإضافة'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const SelectField = ({ label, icon: Icon, placeholder, value, onChange, options }: { label: string; icon: React.ComponentType<{ size?: number }>; placeholder?: string; value: string; onChange: (val: string) => void; required?: boolean; options: string[] | { value: string; label: string }[] }) => {
    const selectId = `student-select-${label.replace(/\s+/g, '-')}`;
    const normalized = options.map(o => (typeof o === 'string' ? { value: o, label: o } : o));
    const allOptions = value && !normalized.some(o => o.value === value) ? [{ value, label: value }, ...normalized] : normalized;
    return (
        <div className="space-y-2">
            <label htmlFor={selectId} className="text-micro font-normal text-muted uppercase ms-1">{label}</label>
            <div className="relative group">
                {Icon && <Icon className="absolute start-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors z-10" size={14} />}
                <select
                    id={selectId}
                    required
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className={cn(
                        "w-full px-4 py-2 bg-surface border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-main text-xs font-normal appearance-none rounded-xl transition-colors",
                        Icon && "ps-10",
                        !value && "text-muted"
                    )}
                >
                    <option value="" disabled>{placeholder || 'اختر...'}</option>
                    {allOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

const FormInput = ({ label, icon: Icon, placeholder, value, onChange, required, type = "text", dir = "rtl" }: { label: string; icon: React.ComponentType<{ size?: number }>; placeholder?: string; value: string; onChange: (val: string) => void; required?: boolean; type?: string; dir?: string }) => {
    const inputId = `student-form-${label.replace(/\s+/g, '-')}`;
    return (
        <div className="space-y-2">
            <label htmlFor={inputId} className="text-micro font-normal text-muted uppercase ms-1">{label}</label>
            <div className="relative group">
                {Icon && <Icon className="absolute start-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={14} />}
                <input
                    id={inputId}
                    required={required}
                    type={type}
                    dir={dir}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className={cn(
                        "w-full px-4 py-2 bg-surface border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-main text-xs font-normal transition-all rounded-xl",
                        Icon && "ps-10",
                        dir === 'ltr' && "font-mono"
                    )}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
};

