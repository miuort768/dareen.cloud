import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, GraduationCap, LogIn, Sun, Bed, Home, BookOpen, Book, Info, Phone } from 'lucide-react';
import { PublicNavbar } from './PublicNavbar';
import { useDarkMode } from '../../shared/hooks/useDarkMode';

export const MobileHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useDarkMode();

  const navItems = [
    { label: 'الرئيسية', path: '/', icon: Home },
    { label: 'الدورات', path: '/courses', icon: BookOpen },
    { label: 'المكتبة', path: '/books', icon: Book },
    { label: 'من نحن', path: '/about', icon: Info },
    { label: 'اتصل بنا', path: '/contact', icon: Phone },
  ];

  return (
    <>
      <div className="hidden md:block">
        <PublicNavbar />
      </div>
      <header className="md:hidden flex items-center justify-between px-2 pt-3 pb-2">
        <div className="flex items-center gap-1">
          <Link to="/" className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary)] flex items-center justify-center shadow-lg shadow-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-[150%] h-full animate-shine pointer-events-none z-0"></div>
            <GraduationCap className="w-6 h-6 text-on-primary relative z-10" />
          </div>
          <div>
            <p className="text-base font-black text-main dark:text-on-primary leading-tight">دارين السابعة</p>
            <p className="text-micro font-bold leading-tight text-main dark:text-on-primary">أفضل مدرسة افتراضية</p>
            <p className="text-micro text-main dark:text-on-primary leading-tight mt-0.5">Dareen for Education & Online Learning</p>
          </div>
        </Link>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'} className="w-10 h-10 rounded-full bg-white dark:bg-primary shadow-sm border border-border dark:border-border flex items-center justify-center shrink-0">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-warning" /> : <Bed className="w-4 h-4 text-primary" />}
          </button>
          <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} className="w-10 h-10 rounded-full bg-white dark:bg-primary shadow-sm border border-border dark:border-border flex items-center justify-center">
            {menuOpen ? <X className="w-5 h-5 text-muted dark:text-on-primary" /> : <Menu className="w-5 h-5 text-muted dark:text-on-primary" />}
          </button>
          {menuOpen && (
            <div className="absolute top-12 end-0 bg-white dark:bg-primary rounded-2xl shadow-2xl border border-border dark:border-border overflow-hidden z-50 min-w-[180px]">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-main dark:text-on-primary hover:bg-primary-soft dark:hover:bg-primary/30 hover:text-primary dark:hover:text-primary transition-colors border-b border-border dark:border-border last:border-0 whitespace-nowrap">
                  <item.icon size={16} className="shrink-0" />
                  {item.label}
                </Link>
              ))}
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-primary dark:text-on-primary hover:bg-info-light dark:hover:bg-info/30 transition-colors border-t border-border dark:border-border">
                <LogIn size={14} />
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>
        </div>
      </header>
    </>
  );
};