import React from 'react';
import { User, Phone, Mail, Save } from 'lucide-react';

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
        <div className="bg-white p-4 md:p-8 rounded-none shadow-xl border-x-4 border-x-primary-600 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary-50/50 -translate-x-16 -translate-y-16 rotate-45 pointer-events-none dark:opacity-5"></div>

            <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-1 h-8 bg-primary-600"></div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">
                    {isEdit ? 'تعديل بيانات الحساب' : 'تسجيل ولي أمر جديد'}
                </h3>
            </div>

            <form onSubmit={onSubmit} className="relative space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">اسم ولي الأمر الكامل</label>
                        <div className="relative group">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500" size={16} />
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => onChange({ ...formData, name: e.target.value })}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-slate-800/50 dark:border-slate-700 dark:text-white rounded-none text-sm font-bold"
                                placeholder="مثال: أحمد محمد علي"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">رقم الجوال الفعال</label>
                        <div className="relative group">
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500" size={16} />
                            <input
                                required
                                type="tel"
                                value={formData.phone}
                                onChange={e => onChange({ ...formData, phone: e.target.value })}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-slate-800/50 dark:border-slate-700 dark:text-white rounded-none text-left text-sm font-bold"
                                dir="ltr"
                                placeholder="05XXXXXXXX"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">البريد الإلكتروني (إن وجد)</label>
                        <div className="relative group">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500" size={16} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => onChange({ ...formData, email: e.target.value })}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-slate-800/50 dark:border-slate-700 dark:text-white rounded-none text-left text-sm font-bold"
                                dir="ltr"
                                placeholder="example@mail.com"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">اسم المستخدم (للدخول)</label>
                        <div className="relative group">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500" size={16} />
                            <input
                                required
                                type="text"
                                value={formData.username || ''}
                                onChange={e => onChange({ ...formData, username: e.target.value })}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-slate-800/50 dark:border-slate-700 dark:text-white rounded-none text-left text-sm font-bold"
                                dir="ltr"
                                placeholder="رقم الهاتف أو اسم مستخدم"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">كلمة المرور</label>
                        <div className="relative group">
                            <Save className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500" size={16} />
                            <input
                                required={!isEdit}
                                type="password"
                                value={formData.password || ''}
                                onChange={e => onChange({ ...formData, password: e.target.value })}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:bg-slate-800/50 dark:border-slate-700 dark:text-white rounded-none text-left text-sm font-bold"
                                dir="ltr"
                                placeholder={isEdit ? "اتركها فارغة إذا لا تريد التغيير" : "******"}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="submit"
                        className="w-full md:w-auto min-w-[200px] bg-primary-600 text-white px-8 py-3.5 font-black text-sm uppercase tracking-widest hover:bg-primary-700 rounded-none flex items-center justify-center gap-3 shadow-lg shadow-primary-600/20"
                    >
                        <Save size={18} />
                        {isEdit ? 'تحديث البيانات' : 'إتمام الحفظ'}
                    </button>
                </div>
            </form>
        </div>
    );
};
