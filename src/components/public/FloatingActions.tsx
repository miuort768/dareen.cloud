import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSettingsStore } from '../../store/settingsStore';
import { useDarkMode } from '../../shared/hooks/useDarkMode';
import { cn } from '../../lib/utils';

export const FloatingActions = () => {
    const location = useLocation();
    const isBooksPage = location.pathname.startsWith('/books');
    const adminPhone = useSettingsStore(s => s.adminPhone);
    const telegramHandle = useSettingsStore(s => s.telegramHandle);
    const whatsappNumbers = useSettingsStore(s => s.whatsappNumbers);
    const [theme, setTheme] = useDarkMode();

    const getNumber = (label: string): string => {
      try {
        const entries: { label: string; phone: string }[] = JSON.parse(whatsappNumbers);
        const found = entries.find((e) => e.label === label);
        return found ? found.phone.replace(/\D/g, '') : adminPhone.replace(/\D/g, '');
      } catch (e) { console.warn(e); return adminPhone.replace(/\D/g, ''); }
    };

    const whatsappNumber = getNumber('تواصل معانا');
    const tgHandle = typeof telegramHandle === 'string' ? telegramHandle : '';

    const actions = [
        {
            id: 'whatsapp',
            icon: <MessageCircle className="w-5 h-5" />,
            label: 'استفسار واتساب',
            color: 'bg-success',
            href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في الاستفسار عن خدمات دارين السابعة')}`,
            isExternal: true
        },
        {
            id: 'telegram',
            icon: <Send className="w-5 h-5" />,
            label: 'تليجرام',
            color: 'bg-info',
            href: tgHandle.startsWith('http') ? tgHandle : `https://t.me/${tgHandle}`,
            isExternal: true
        },
        {
            id: 'theme',
            icon: theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />,
            label: theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي',
            color: 'bg-primary',
            onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
            hideMobile: true
        }
    ];

    return (
        <>
            <div className={cn("fixed top-[70%] md:top-1/2 -translate-y-1/2 end-4 md:start-6 z-[9999] flex flex-col gap-2 md:gap-3", isBooksPage && "hidden md:flex")}>
                <AnimatePresence>
                    {actions.map((action, index) => (
                        <motion.div
                            key={action.id}
                            className={action.hideMobile ? 'hidden md:block relative group' : 'relative group'}
                            initial={{ opacity: 0, scale: 0.5, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ 
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: index * 0.1 
                            }}
                        >
                            {/* Hover Label */}
                            <div className="absolute end-full me-4 md:start-full md:ms-4 top-1/2 -translate-y-1/2 overflow-hidden pointer-events-none">
                                <motion.div 
                                    className="bg-white/80 dark:bg-primary-active/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 dark:border-border/50 shadow-xl opacity-0 group-hover:opacity-100 -translate-x-4 md:translate-x-4 group-hover:translate-x-0 transition-all duration-300"
                                >
                                    <span className="text-micro font-black text-main dark:text-main whitespace-nowrap uppercase tracking-wider">
                                        {action.label}
                                    </span>
                                </motion.div>
                            </div>

                            {action.href ? (
                                <a
                                    href={action.href}
                                    target={action.isExternal ? "_blank" : "_self"}
                                    rel={action.isExternal ? "noopener noreferrer" : ""}
                                    aria-label={action.label}
                                    className={cn(
                                        "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-on-primary shadow-xl transition-all duration-500 hover:scale-[1.15] active:scale-90 relative overflow-hidden rounded-[0.9rem]",
                                        action.color
                                    )}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                                    <div className="relative z-10 scale-[0.85] md:scale-100">{action.icon}</div>
                                </a>
                            ) : (
                                <button
                                    onClick={action.onClick}
                                    aria-label={action.label}
                                    className={cn(
                                        "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-on-primary shadow-xl transition-all duration-500 hover:scale-[1.15] active:scale-90 relative overflow-hidden rounded-[0.9rem]",
                                        action.color
                                    )}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                                    <div className="relative z-10 scale-[0.85] md:scale-100">{action.icon}</div>
                                </button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
};

