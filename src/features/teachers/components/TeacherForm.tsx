import { useState, useEffect } from 'react';
import { Plus, Edit, Save, Shield, Key, Info, User, Phone, Tag, DollarSign, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Teacher } from '../types';

interface TeacherFormProps {
    onSubmit: (data: Omit<Teacher, 'id'>) => void;
    initialData?: Teacher | null;
    onCancel: () => void;
}

export const TeacherForm = ({ onSubmit, initialData, onCancel }: TeacherFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        phone1: '',
        phone2: '',
        subject: '',
        price: '',
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
                password: initialData.password || ''
            });
            setEnableLogin(!!initialData.username);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            price: Number(formData.price),
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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-500" dir="rtl">
            {/* Header Section */}
            <div className="bg-slate-900 dark:bg-black px-6 py-8 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#5c59f2] text-white flex items-center justify-center rounded-2xl shadow-lg">
                        {initialData ? <Edit size={24} /> : <Plus size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">{initialData ? 'تعديل بيانات المعلمة' : 'إدراج معلمة جديدة'}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {initialData ? 'تحديث السجل الأكاديمي' : 'فتح سجل كادر جديد'}
                        </p>
                    </div>
                </div>
                <button 
                    type="button" 
                    onClick={onCancel}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-white/10 rounded-xl transition-all"
                >
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-10">
                {/* Basic Info Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-50 dark:border-slate-800">
                        <div className="w-8 h-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                            <Info size={16} className="text-[#5c59f2]" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-tight">بيانات التعريف الأساسية</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormInput label="الاسم الكامل" icon={User} value={formData.name} onChange={(val: any) => setFormData({ ...formData, name: val })} required placeholder="مثال: سارة محمد" />
                        <FormInput label="رقم الهاتف" icon={Phone} type="tel" value={formData.phone1} onChange={(val: any) => setFormData({ ...formData, phone1: val })} required placeholder="05XXXXXXXX" dir="ltr" />
                        <FormInput label="التخصص الأكاديمي" icon={Tag} value={formData.subject} onChange={(val: any) => setFormData({ ...formData, subject: val })} required placeholder="مثال: لغة عربية" />
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">تعريفة الحصة</label>
                            <div className="relative group">
                                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={14} />
                                <input
                                    required
                                    type="number"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 focus:outline-none focus:border-emerald-500 dark:text-white rounded-xl text-xs font-bold transition-all"
                                    placeholder="0.00"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-emerald-500 uppercase">ج.م</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Platform Access Section */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-transparent">
                    <label 
                        onClick={() => setEnableLogin(!enableLogin)}
                        className="flex items-center gap-3 cursor-pointer group mb-6"
                    >
                        <div className={cn(
                            "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                            enableLogin ? "bg-[#5c59f2] border-[#5c59f2]" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        )}>
                            {enableLogin && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />}
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">تفعيل حساب المعلمة على المنصة</span>
                    </label>

                    {enableLogin && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">اسم المستخدم</label>
                                    <button type="button" onClick={generateUsername} className="text-[9px] text-[#5c59f2] font-bold hover:underline uppercase">توليد تلقائي</button>
                                </div>
                                <div className="relative">
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                    <input
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full pl-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:outline-none focus:border-[#5c59f2] rounded-xl text-xs font-bold font-mono"
                                        placeholder="username"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">كلمة المرور</label>
                                    <button type="button" onClick={generatePassword} className="text-[9px] text-[#5c59f2] font-bold hover:underline uppercase">توليد تلقائي</button>
                                </div>
                                <div className="relative">
                                    <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                    <input
                                        type="text"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:outline-none focus:border-[#5c59f2] rounded-xl text-xs font-bold font-mono tracking-widest"
                                        placeholder="password"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end pt-6 border-t border-slate-50 dark:border-slate-800">
                    <button
                        type="submit"
                        className="px-10 py-3 bg-[#5c59f2] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-700 rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                    >
                        <Save size={16} />
                        {initialData ? 'تحديث البيانات' : 'إتمام الإضافة'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const FormInput = ({ label, icon: Icon, placeholder, value, onChange, required, type = "text", dir = "rtl" }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">{label}</label>
        <div className="relative group">
            {Icon && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#5c59f2] transition-colors" size={14} />}
            <input
                required={required}
                type={type}
                dir={dir}
                value={value}
                onChange={e => onChange(e.target.value)}
                className={cn(
                    "w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 focus:outline-none focus:border-[#5c59f2] dark:text-white rounded-xl text-xs font-bold transition-all",
                    Icon && "pr-10",
                    dir === 'ltr' && "font-mono"
                )}
                placeholder={placeholder}
            />
        </div>
    </div>
);
