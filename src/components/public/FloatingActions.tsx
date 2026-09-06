import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Moon, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useSettingsStore } from '../../store/settingsStore'
import { useDarkMode } from '../../shared/hooks/useDarkMode'
import { cn } from '../../lib/utils'

export const FloatingActions = () => {
  const location = useLocation()
  const isBooksPage = location.pathname.startsWith('/books')
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  const telegramHandle = useSettingsStore((s) => s.telegramHandle)
  const whatsappNumbers = useSettingsStore((s) => s.whatsappNumbers)
  const [theme, setTheme] = useDarkMode()

  const getNumber = (label: string): string => {
    try {
      const entries: { label: string; phone: string }[] = JSON.parse(whatsappNumbers)
      const found = entries.find((e) => e.label === label)
      return found ? found.phone.replace(/\D/g, '') : adminPhone.replace(/\D/g, '')
    } catch (e) {
      console.warn(e)
      return adminPhone.replace(/\D/g, '')
    }
  }

  const whatsappNumber = getNumber('تواصل معانا')
  const tgHandle = typeof telegramHandle === 'string' ? telegramHandle : ''

  const actions = [
    {
      id: 'whatsapp',
      icon: <MessageCircle className="h-5 w-5" />,
      label: 'استفسار واتساب',
      color: 'bg-success',
      href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في الاستفسار عن خدمات دارين السابعة')}`,
      isExternal: true,
    },
    {
      id: 'telegram',
      icon: <Send className="h-5 w-5" />,
      label: 'تليجرام',
      color: 'bg-info',
      href: tgHandle.startsWith('http') ? tgHandle : `https://t.me/${tgHandle}`,
      isExternal: true,
    },
    {
      id: 'theme',
      icon: theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />,
      label: theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي',
      color: 'bg-primary',
      onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      hideMobile: true,
    },
  ]

  return (
    <>
      <div
        className={cn(
          'fixed end-4 top-[70%] z-[9999] flex -translate-y-1/2 flex-col items-end gap-2 md:end-auto md:start-6 md:top-1/2 md:items-start md:gap-3',
          isBooksPage && 'hidden md:flex',
        )}
      >
        <AnimatePresence>
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              className={action.hideMobile ? 'group relative hidden md:block' : 'group relative'}
              initial={{ opacity: 0, scale: 0.5, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: index * 0.1,
              }}
            >
              {/* Hover Label */}
              <div className="pointer-events-none absolute end-full top-1/2 me-4 -translate-y-1/2 overflow-hidden md:start-full md:ms-4">
                <motion.div className="-translate-x-4 rounded-full border border-white/20 bg-white/80 px-3 py-1.5 opacity-0 shadow-elevation-4 backdrop-blur-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:border-border dark:bg-card md:translate-x-4">
                  <span className="whitespace-nowrap text-micro font-black uppercase tracking-wider text-main">
                    {action.label}
                  </span>
                </motion.div>
              </div>

              {action.href ? (
                <a
                  href={action.href}
                  target={action.isExternal ? '_blank' : '_self'}
                  rel={action.isExternal ? 'noopener noreferrer' : ''}
                  aria-label={action.label}
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[0.9rem] text-on-primary shadow-elevation-4 transition-all duration-500 hover:scale-[1.15] active:scale-90 md:h-12 md:w-12',
                    action.color,
                  )}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                  <div className="relative z-10 scale-[0.85] md:scale-100">{action.icon}</div>
                </a>
              ) : (
                <button
                  onClick={action.onClick}
                  aria-label={action.label}
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[0.9rem] text-on-primary shadow-elevation-4 transition-all duration-500 hover:scale-[1.15] active:scale-90 md:h-12 md:w-12',
                    action.color,
                  )}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                  <div className="relative z-10 scale-[0.85] md:scale-100">{action.icon}</div>
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
