import React from 'react';
import { User, Phone, Mail, Save } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ParentFormProps {
    isEdit: boolean;
    formData: { name: string; phone: string; email: string; username?: string; password?: string };
    onChange: (data: { name: string; phone: string; email: string; username?: string; password?: string }) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const ParentForm: React.FC<ParentFormProps> = ({
    isEdit,
    formData,
    onChange,
    onSubmit
}) => {
    return (
        <div className="px-4 md:px-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                        <User size={16} className="text-[#5c59f2]" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-tight">
                        {isEdit ? 'تعديل بيانات الحساب' : 'تسجيل ولي أمر جديد'}
                    </h3>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">اسم ولي الأمر الكامل</label>
                            <div className="relative group">
                                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500" size={14} />
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => onChange({ ...formData, name: e.target.value })}
                                    className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:outline-none focus:border-primary-500 rounded-xl text-xs font-bold"
                                    placeholder="مثال: أحمد محمد علي"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">رقم الجوال الفعال</label>
                            <div className="relative group">
                                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500" size={14} />
                                <input
                                    required
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => onChange({ ...formData, phone: e.target.value })}
                                    className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:outline-none focus:border-primary-500 rounded-xl text-left text-xs font-bold font-mono"
                                    dir="ltr"
                                    placeholder="05XXXXXXXX"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">البريد الإلكتروني (اختياري)</label>
                            <div className="relative group">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500" size={14} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => onChange({ ...formData, email: e.target.value })}
                                    className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:outline-none focus:border-primary-500 rounded-xl text-left text-xs font-bold"
                                    dir="ltr"
                                    placeholder="example@mail.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">اسم المستخدم (للدخول)</label>
                            <div className="relative group">
                                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500" size={14} />
                                <input
                                    required
                                    type="text"
                                    value={formData.username || ''}
                                    onChange={e => onChange({ ...formData, username: e.target.value })}
                                    className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:outline-none focus:border-primary-500 rounded-xl text-left text-xs font-bold font-mono"
                                    dir="ltr"
                                    placeholder="رقم الهاتف أو اسم مستخدم"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">كلمة المرور</label>
                            <div className="relative group">
                                <Save className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500" size={14} />
                                <input
                                    required={!isEdit}
                                    type="password"
                                    value={formData.password || ''}
                                    onChange={e => onChange({ ...formData, password: e.target.value })}
                                    className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:outline-none focus:border-primary-500 rounded-xl text-left text-xs font-bold font-mono"
                                    dir="ltr"
                                    placeholder={isEdit ? "اتركها فارغة إذا لا تريد التغيير" : "******"}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                        <button
                            type="submit"
                            className="bg-[#5c59f2] text-white px-8 py-2 font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-700 rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                        >
                            <Save size={14} />
                            {isEdit ? 'تحديث البيانات' : 'إتمام الحفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
