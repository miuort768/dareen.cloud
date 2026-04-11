import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Info, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { ChatbotWidget } from './ChatbotWidget';
import { cn } from '../../lib/utils';

export const FloatingActions = () => {
    const { adminPhone } = useSettings();
    const [showChat, setShowChat] = useState(false);
    const whatsappNumber = adminPhone.replace(/\D/g, '');

    const actions = [
        {
            id: 'whatsapp',
            icon: <MessageCircle className="w-5 h-5" />,
            label: 'واتساب',
            color: 'bg-[#25D366]',
            href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في الاستفسار عن خدمات معهد دارين')}`,
            isExternal: true
        },
        {
            id: 'about',
            icon: <Info className="w-5 h-5" />,
            label: 'من نحن',
            color: 'bg-red-600',
            href: '/about',
            isExternal: false
        },
        {
            id: 'chat',
            icon: <MessageSquare className="w-5 h-5" />,
            label: 'مساعدة',
            color: 'bg-emerald-600',
            onClick: () => setShowChat(!showChat)
        }
    ];

    return (
        <>
            <div className="fixed md:top-[35%] md:bottom-auto bottom-8 right-6 z-[9999] flex flex-col gap-3">
                <AnimatePresence>
                    {actions.map((action, index) => (
                        <motion.div
                            key={action.id}
                            initial={{ opacity: 0, scale: 0.5, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ 
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: index * 0.1 
                            }}
                            className="relative group"
                        >
                            {/* Hover Label (Darasly style) */}
                            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 overflow-hidden pointer-events-none">
                                <motion.div 
                                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 dark:border-slate-800/50 shadow-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300"
                                >
                                    <span className="text-[10px] font-black text-slate-800 dark:text-white whitespace-nowrap uppercase tracking-wider">
                                        {action.label}
                                    </span>
                                </motion.div>
                            </div>

                            {action.href ? (
                                <a
                                    href={action.href}
                                    target={action.isExternal ? "_blank" : "_self"}
                                    rel={action.isExternal ? "noopener noreferrer" : ""}
                                    className={cn(
                                        "w-12 h-12 flex items-center justify-center text-white shadow-2xl transition-all duration-500 hover:scale-[1.15] active:scale-90 relative overflow-hidden",
                                        action.color
                                    )}
                                    style={{ 
                                        borderRadius: '1.1rem',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
                                    }}
                                >
                                    {/* Glass Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                                    <div className="relative z-10">{action.icon}</div>
                                </a>
                            ) : (
                                <button
                                    onClick={action.onClick}
                                    className={cn(
                                        "w-12 h-12 flex items-center justify-center text-white shadow-2xl transition-all duration-500 hover:scale-[1.15] active:scale-90 relative overflow-hidden",
                                        action.color
                                    )}
                                    style={{ 
                                        borderRadius: '1.1rem',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                                    <div className="relative z-10">{action.icon}</div>
                                </button>
                            )}
                            
                            {/* Unread dot or indicator for chat */}
                            {action.id === 'chat' && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 border-2 border-white dark:border-slate-950 rounded-full animate-pulse"></div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Integrate the existing Chatbot but trigger it from our button */}
            {showChat && (
                <div className="fixed inset-0 z-[10000] pointer-events-none">
                    <ChatbotWidget forcedOpen={true} onClose={() => setShowChat(false)} />
                </div>
            )}
        </>
    );
};
