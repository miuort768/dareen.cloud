import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Save, Shield, Key, Info, GraduationCap, Phone, User as UserIcon } from 'lucide-react';
import type { Student } from '../types';
import { cn } from '../../../lib/utils';

interface StudentFormProps {
    onSubmit: (data: Omit<Student, 'id' | 'enrollments'>) => void;
    initialData?: Student | null;
    onCancel?: () => void;
}

export const StudentForm = ({ onSubmit, initialData, onCancel }: StudentFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        parentPhone: '',
        studentPhone: '',
        curriculum: '',
        notes: '',
        sessionPrice: '',
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
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] mb-12 overflow-hidden" dir="rtl">
            {/* Form Header */}
            <div className="bg-slate-900 dark:bg-black px-8 py-10 border-b-4 border-indigo-600 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white text-slate-900 flex items-center justify-center shadow-2xl skew-x-2">
                        {initialData ? <Edit size={28} /> : <UserPlus size={28} />}
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">{initialData ? 'ترقية البيانات الأكاديمية' : 'إدراج طالب في المنظومة'}</h3>
                        <p className="text-[10px] text-indigo-400 mt-2 font-black uppercase tracking-[3px] leading-none italic opacity-80">بروتوكول الإدارة المركزية • {initialData ? 'UPDATE_ENTRY' : 'NEW_ENTRY_INIT'}</p>
                    </div>
                </div>
                {onCancel && (
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="text-[10px] font-black text-white hover:bg-rose-600 px-6 py-3 border border-white/20 transition-all uppercase tracking-widest italic active:scale-95"
                    >
                        إلغاء العملية
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-16">
                {/* Section 1: Basic Profile */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 pb-4 border-b-2 border-slate-900 dark:border-white w-fit pr-4">
                        <Info size={18} className="text-indigo-600" />
                        <h4 className="text-[12px] font-black uppercase tracking-[4px] text-slate-900 dark:text-white italic">بيانات التعريف الأساسية</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <FormInput 
                            label="الاسم الكامل للطالب" 
                            icon={UserIcon} 
                            placeholder="FULL_NAME_REQUEST"
                            value={formData.name}
                            onChange={(val: any) => setFormData({ ...formData, name: val })}
                            required
                        />
                        <FormInput 
                            label="المستوى الأكاديمي" 
                            icon={GraduationCap} 
                            placeholder="GRADE_LEVEL_REQUEST"
                            value={formData.grade}
                            onChange={(val: any) => setFormData({ ...formData, grade: val })}
                            required
                            borderColor="border-indigo-600"
                        />
                        <FormInput 
                            label="المنهج الدراسي" 
                            placeholder="CURRICULUM_TYPE"
                            value={formData.curriculum}
                            onChange={(val: any) => setFormData({ ...formData, curriculum: val })}
                            borderColor="border-amber-500"
                        />
                        <FormInput 
                            label="هاتف التواصل (الأساسي)" 
                            icon={Phone} 
                            type="tel"
                            placeholder="PRIMARY_CONTACT_NUM"
                            value={formData.parentPhone}
                            onChange={(val: any) => setFormData({ ...formData, parentPhone: val })}
                            required
                            borderColor="border-emerald-500"
                            dir="ltr"
                        />
                        <FormInput 
                            label="هاتف الطالب (اختياري)" 
                            type="tel"
                            placeholder="PERSONAL_CONTACT_NUM"
                            value={formData.studentPhone}
                            onChange={(val: any) => setFormData({ ...formData, studentPhone: val })}
                            borderColor="border-indigo-400"
                            dir="ltr"
                        />
                        <FormInput 
                            label="توصيف التسعير الافتراضي" 
                            type="number"
                            placeholder="PRICING_MODEL_VAL"
                            value={formData.sessionPrice}
                            onChange={(val: any) => setFormData({ ...formData, sessionPrice: val })}
                            required
                            borderColor="border-slate-900 dark:border-white"
                        />
                    </div>
                </div>

                {/* Section 2: Secure Access */}
                <div className="bg-slate-950 text-white p-10 border-r-8 border-indigo-600 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 -skew-x-12 transform translate-x-32 -translate-y-32"></div>
                    
                    <div className="flex items-center gap-4 mb-12 relative z-10">
                        <Shield className="text-indigo-500" size={24} />
                        <h4 className="text-[12px] font-black uppercase tracking-[4px] text-white italic">بروتوكول الوصول والتحقق الآمن</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] px-1 italic">معرف الوصول (USERNAME)</label>
                            <div className="relative">
                                <input
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-6 py-5 bg-white/5 border-2 border-white/10 focus:outline-none focus:border-indigo-600 transition-all font-black text-sm italic placeholder:text-slate-700 tracking-widest uppercase"
                                    placeholder="ENTRY_ID_PENDING"
                                />
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 font-bold tracking-[4px] text-[10px]">SECURED</div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] px-1 italic">مفتاح التشفير (ACCESS_KEY)</label>
                            <div className="relative">
                                <Key className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-6 pr-14 py-5 bg-white/5 border-2 border-white/10 focus:outline-none focus:border-indigo-600 transition-all font-black text-sm tracking-[5px]"
                                    placeholder={initialData ? "••••••••" : "INIT_SECURITY_PHRASE"}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Notes */}
                <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] px-1 italic">ملاحظات الحالة الأكاديمية والمتابعة</label>
                     <textarea
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800/20 border-2 border-slate-100 dark:border-slate-800 focus:outline-none focus:border-slate-900 dark:focus:border-white dark:text-white font-black text-sm min-h-[160px] transition-all placeholder:italic placeholder:text-slate-400 italic"
                        placeholder="أدخل أي تقارير أو تفاصيل تقنية حول سير العملية التعليمية..."
                    />
                </div>

                <div className="flex items-center justify-end pt-12 border-t-2 border-slate-100 dark:border-slate-800">
                    <button
                        type="submit"
                        className="px-16 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] md:text-xs font-black uppercase tracking-[6px] italic shadow-[10px_10px_0px_0px_rgba(79,70,229,0.3)] hover:-translate-y-2 hover:shadow-[15px_15px_0px_0px_rgba(79,70,229,0.4)] transition-all flex items-center gap-5 active:scale-95"
                    >
                        <Save size={24} />
                        {initialData ? 'تأمين التحديث الحـالي' : 'إدراج الطالب تحت المراقبة'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const FormInput = ({ label, icon: Icon, placeholder, value, onChange, required, type = "text", borderColor = "border-emerald-600", dir = "rtl" }: any) => (
    <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] px-1 italic">{label}</label>
        <div className="relative group">
            {Icon && <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-900 dark:group-focus-within:text-white" size={18} />}
            <input
                required={required}
                type={type}
                dir={dir}
                value={value}
                onChange={e => onChange(e.target.value)}
                className={cn(
                    "w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-r-4 focus:outline-none focus:bg-white dark:focus:bg-slate-800 dark:text-white font-black text-sm italic transition-all",
                    borderColor,
                    Icon && "pr-14"
                )}
                placeholder={placeholder}
            />
        </div>
    </div>
);
