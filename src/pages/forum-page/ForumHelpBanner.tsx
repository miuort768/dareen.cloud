import { useState } from 'react';
import { useCurrentUser } from '../../context/AppContext';
import { BookOpen, ShieldCheck, Heart, Sparkles, GraduationCap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ForumHelpBanner = () => {
    const currentUser = useCurrentUser();
    const role = currentUser?.role || 'student';
    const [showModal, setShowModal] = useState(false);

    const getRoleRules = () => {
        switch (role) {
            case 'parent':
                return {
                    roleTitle: 'شريك النجاح (ولي الأمر)',
                    badgeClass: 'bg-primary/10 text-primary border-primary/30',
                    icon: Heart,
                    rules: [
                        'متابعة الاستفسارات الخاصة بالتحصيل الأكاديمي للأبناء بأسلوب راقٍ ومباشر.',
                        'التواصل الفعال والمحترم مع الكادر التعليمي في البيئة التعليمية.',
                        'طرح الاقتراحات البناءة والحلول التي تساهم في تطوير بيئة التعلم.',
                        'الالتزام بالخصوصية وعدم نشر أي بيانات شخصية تخص الطلاب أو المعلمات.'
                    ]
                };
            case 'teacher':
                return {
                    roleTitle: 'المعلمة',
                    badgeClass: 'bg-success/10 text-success border-success/30',
                    icon: ShieldCheck,
                    rules: [
                        'توجيه ونصح الطلاب برفق وإيجابية وتحفيزهم على التفاعل والمشاركة.',
                        'مشاركة الوسائل والأفكار التعليمية المبتكرة والنافعة.',
                        'الرد على استفسارات الطلاب وأولياء الأمور باحترافية وأسلوب تربوي.',
                        'الحفاظ على بيئة مناقشة آمنة وإيجابية تشجع على الإبداع.'
                    ]
                };
            case 'admin':
                return {
                    roleTitle: 'مدير النظام',
                    badgeClass: 'bg-error/10 text-error border-error/30',
                    icon: Sparkles,
                    rules: [
                        'الإشراف العام على جودة المحتوى والمناقشات في المنتدى.',
                        'مراجعة البلاغات والتأكد من ملاءمة المشاركات للسياسات العامية.',
                        'تعديل وإدارة المحتوى والتعليقات لضمان انضباط المنتدى.',
                        'تقديم الدعم الكامل لجميع أطراف العملية التعليمية.'
                    ]
                };
            default: // student
                return {
                    roleTitle: 'الطالب / الطالبة',
                    badgeClass: 'bg-info/10 text-info border-info/30',
                    icon: GraduationCap,
                    rules: [
                        'الالتزام بالأدب والاحترام في التعامل مع المعلمات والزملاء.',
                        'طرح الأسئلة والاستفسارات الأكاديمية والتعليمية المفيدة.',
                        'عدم مشاركة المعلومات الشخصية أو الحسابات الخارجية.',
                        'المشاركة الإيجابية والمناقشة البناءة في الموضوعات المطروحة.'
                    ]
                };
        }
    };

    const currentRules = getRoleRules();
    const Icon = currentRules.icon;

    return (
        <div className="max-w-[700px] mx-auto px-4 mt-8 mb-8">
            <div className="bg-card border border-border rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5 text-center md:text-start">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <h4 className="text-main font-bold text-sm">قواعد وإرشادات المنتدى</h4>
                            <span className={`text-micro font-bold px-2 py-0.5 rounded-lg border ${currentRules.badgeClass}`}>
                                خاص بـ {currentRules.roleTitle}
                            </span>
                        </div>
                        <p className="text-muted text-xs font-medium">قواعد مخصصة لدورك في المنصة لضمان بيئة آمنة ومثمرة</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-on-primary px-5 py-2.5 text-xs font-bold rounded-xl hover:bg-primary-hover transition-all active:scale-95 shrink-0"
                >
                    عرض القواعد والتعليمات
                </button>
            </div>

            {/* Rules Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-lg bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
                            dir="rtl"
                        >
                            <div className="p-5 bg-primary text-on-primary flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <Icon size={20} />
                                    <h3 className="font-bold text-sm">إرشادات وقواعد {currentRules.roleTitle}</h3>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/10 hover:bg-error transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-xs font-bold text-muted mb-2">
                                    عزيزي/عزيزتي {currentRules.roleTitle}، نرجو الالتزام بالقواعد التالية لضمان تجربة تعليمية راقية:
                                </p>
                                <ul className="space-y-3">
                                    {currentRules.rules.map((rule, index) => (
                                        <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border/50">
                                            <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                                                {index + 1}
                                            </span>
                                            <span className="text-xs font-bold text-main leading-relaxed">{rule}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full mt-4 py-3 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary-hover transition-all"
                                >
                                    فهمت وأوافق على الإرشادات
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
