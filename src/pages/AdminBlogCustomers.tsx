import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Trash2, Phone, MessageCircle, Search, Clock, Globe, Inbox, Calendar, Users, BookOpen, TrendingUp } from 'lucide-react';
import { api, safeArray } from '../lib/api';
import { confirm } from '../lib/confirmDialog';
import { motion } from 'framer-motion';
import { useIsLoading, useAcademyName } from '../context/AppContext';
import { cn } from '../lib/utils';
import { COUNTRY_CURRICULUM } from '../components/blog/blogCustomers';
import type { BlogCustomer } from '../components/blog/blogCustomers';

interface CountryStyle {
    badge: string;
    iconBg: string;
    iconColor: string;
    dot: string;
}

const COUNTRY_STYLES: Record<string, CountryStyle> = {
    'الكويت': { badge: 'bg-info-soft text-info-dark', iconBg: 'bg-info-soft', iconColor: 'text-info-dark', dot: 'bg-info' },
    'السعودية': { badge: 'bg-success-soft text-success', iconBg: 'bg-success-soft', iconColor: 'text-success', dot: 'bg-success' },
    'قطر': { badge: 'bg-warning-soft text-warning', iconBg: 'bg-warning-soft', iconColor: 'text-warning', dot: 'bg-warning' },
    'الإمارات': { badge: 'bg-error-soft text-error', iconBg: 'bg-error-soft', iconColor: 'text-error', dot: 'bg-error' },
    'عمان': { badge: 'bg-primary-soft text-primary', iconBg: 'bg-primary-soft', iconColor: 'text-primary', dot: 'bg-primary' },
};

const FALLBACK_STYLE: CountryStyle = { badge: 'bg-primary-soft text-primary', iconBg: 'bg-primary-soft', iconColor: 'text-primary', dot: 'bg-primary' };

const getCountryStyle = (country: string) => COUNTRY_STYLES[country] || FALLBACK_STYLE;

export const AdminBlogCustomers = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `عملاء المدونة | ${academyName}`; }, [academyName]);
    const queryClient = useQueryClient();
    const authLoading = useIsLoading();
    const { data: customers = [], isLoading: loading, error: queryError } = useQuery<BlogCustomer[], Error>({
        queryKey: ['blog-customers'],
        queryFn: () => api.get('/blog-customers'),
        select: (data) => safeArray<BlogCustomer>(data),
        enabled: !authLoading,
    });
    const error = queryError?.message || null;
    const [search, setSearch] = useState('');

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            message: 'هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.',
            title: 'حذف العميل',
            confirmText: 'حذف',
            cancelText: 'تراجع',
            isDestructive: true,
            icon: <Trash2 size={28} />
        });
        if (!confirmed) return;
        try {
            await api.delete(`/blog-customers/${id}`);
            queryClient.invalidateQueries({ queryKey: ['blog-customers'] });
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = customers.filter(c => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
            (c.country || '').toLowerCase().includes(q) ||
            c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
            (COUNTRY_CURRICULUM[c.country] || '').toLowerCase().includes(q)
        );
    });

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString('ar-EG', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const todayCount = useMemo(() => customers.filter(c => {
        const d = new Date(c.createdAt);
        const now = new Date();
        return d.toDateString() === now.toDateString();
    }).length, [customers]);

    const weekCount = useMemo(() => {
        const now = new Date();
        const day = (now.getDay() + 6) % 7;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - day);
        weekStart.setHours(0, 0, 0, 0);
        return customers.filter(c => new Date(c.createdAt) >= weekStart).length;
    }, [customers]);

    const uniqueCountries = useMemo(() => new Set(customers.map(c => c.country).filter(Boolean)).size, [customers]);

    const kpiCards = useMemo(() => [
        { label: 'إجمالي العملاء', value: customers.length, icon: Users, gradient: 'bg-gradient-to-br from-primary-soft to-transparent', iconBg: 'bg-primary-soft text-primary', accent: 'bg-primary' },
        { label: 'عملاء اليوم', value: todayCount, icon: Calendar, gradient: 'bg-gradient-to-br from-info-soft to-transparent', iconBg: 'bg-info-soft text-info-dark', accent: 'bg-info' },
        { label: 'عدد الدول', value: uniqueCountries, icon: Globe, gradient: 'bg-gradient-to-br from-success-soft to-transparent', iconBg: 'bg-success-soft text-success', accent: 'bg-success' },
        { label: 'عملاء الأسبوع', value: weekCount, icon: TrendingUp, gradient: 'bg-gradient-to-br from-warning-soft to-transparent', iconBg: 'bg-warning-soft text-warning', accent: 'bg-warning' },
    ], [customers.length, todayCount, uniqueCountries, weekCount]);

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-page mx-auto px-2">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8 mb-4">
                    <div className="absolute -top-16 -end-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -start-10 w-56 h-56 bg-success-soft rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm"><Mail className="text-white" size={20} /></div>
                                <span className="text-white/70 text-xs font-medium">المكتبة التعليمية</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">عملاء المدونة</h1>
                            <p className="text-white/70 text-sm">عملاء النشرة البريدية — الدولة ورقم الهاتف</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">الإجمالي</p>
                                <p className="text-2xl font-bold text-white">{customers.length}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">اليوم</p>
                                <p className="text-2xl font-bold text-white">{todayCount}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {kpiCards.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
                                    whileHover={{ scale: 1.02, y: -2 }} className={cn('relative overflow-hidden rounded-xl bg-gradient-to-br border border-border p-4', kpi.gradient)}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn('p-2 rounded-lg', kpi.iconBg)}><Icon size={16} /></div>
                                        <div className={cn('h-1 w-12 rounded-full', kpi.accent)} />
                                    </div>
                                    <p className="text-xs text-muted mb-1">{kpi.label}</p>
                                    <p className="text-2xl font-bold text-main">{kpi.value}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="relative mb-4">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
                        <input
                            type="text"
                            placeholder="بحث بالدولة أو رقم الهاتف..."
                            aria-label="ابحث في عملاء المدونة"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-card border border-border rounded-xl py-3 ps-9 pe-3 text-xs font-bold text-main placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus transition-all"
                        />
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={`skel-${i}`} className="bg-card h-28 animate-pulse border border-border rounded-2xl" />
                                ))}
                            </div>
                        ) : error ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-card border border-error rounded-2xl p-6 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-error-soft flex items-center justify-center mx-auto mb-3">
                                    <Trash2 size={20} className="text-error" />
                                </div>
                                <p className="text-xs font-bold text-error">{error}</p>
                                <button type="button" onClick={() => window.location.reload()}
                                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-on-primary text-[10px] font-semibold hover:bg-primary-hover transition-all duration-200 min-h-[44px] active:scale-[0.97]">
                                    إعادة تحميل
                                </button>
                            </motion.div>
                        ) : filtered.length === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-3">
                                    <Inbox size={22} className="text-primary" />
                                </div>
                                <p className="text-base font-bold text-main">لا يوجد عملاء</p>
                                <p className="text-xs text-muted mt-1.5">سيظهر عملاء النشرة البريدية هنا</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filtered.map((cust, index) => {
                                    const style = getCountryStyle(cust.country);
                                    return (
                                        <motion.div key={cust.id}
                                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.03 }}
                                            className="group bg-card border border-border hover:border-primary transition-all duration-200 overflow-hidden rounded-2xl shadow-sm hover:shadow-md">
                                            <div className="h-0.5 w-full bg-gradient-to-r from-primary to-primary-light" />
                                            <div className="p-4 md:p-5 relative z-10">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', style.iconBg)}>
                                                            <Globe size={15} className={style.iconColor} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-sm font-bold text-main">{cust.country}</h3>
                                                            <p className="text-[11px] text-muted truncate">{COUNTRY_CURRICULUM[cust.country] || 'دولة أخرى'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                                                        <a href={`tel:${cust.phone}`}
                                                            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-success bg-success-soft hover:bg-success-light transition-all text-[10px] font-bold min-h-[44px] active:scale-95"
                                                            aria-label={`اتصال بـ ${cust.phone}`}>
                                                            <Phone size={13} />
                                                        </a>
                                                        <a href={`https://wa.me/${cust.phone.replace(/\D/g, '')}`}
                                                            target="_blank" rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-success bg-success-soft hover:bg-success-light transition-all text-[10px] font-bold min-h-[44px] active:scale-95"
                                                            aria-label="مراسلة عبر واتساب">
                                                            <MessageCircle size={13} />
                                                        </a>
                                                        <button type="button" onClick={() => handleDelete(cust.id)}
                                                            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg text-error bg-error-soft hover:bg-error-light transition-all duration-200 text-[10px] font-semibold min-h-[44px] active:scale-95"
                                                            aria-label="حذف العميل">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-background text-main text-[10px] font-bold" dir="ltr">
                                                        <span className="truncate max-w-[140px]">{cust.phone}</span>
                                                        <Phone size={10} className="text-success" />
                                                    </span>
                                                    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold', style.badge)}>
                                                        <span className="truncate max-w-[100px]">{COUNTRY_CURRICULUM[cust.country] || cust.country}</span>
                                                        <BookOpen size={10} />
                                                    </span>
                                                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-background text-muted text-[10px] font-bold">
                                                        <span>{formatDate(cust.createdAt)}</span>
                                                        <Clock size={10} />
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
