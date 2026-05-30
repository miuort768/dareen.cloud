import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, GraduationCap, LogIn } from 'lucide-react';
import { PublicNavbar } from './PublicNavbar';

export const MobileHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: 'الرئيسية', path: '/' },
    { label: 'الدورات', path: '/courses' },
    { label: 'المكتبة', path: '/books' },
    { label: 'من نحن', path: '/about' },
    { label: 'اتصل بنا', path: '/contact' },
  ];

  return (
    <>
      <div className="hidden md:block">
        <PublicNavbar />
      </div>
      <header className="md:hidden flex items-center justify-between px-2 pt-3 pb-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[15px] font-black text-indigo-950 dark:text-indigo-100 leading-tight">دارين السابعة</p>
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 leading-tight">للتعليم والتدريب</p>
            <p className="text-[7px] text-indigo-600 dark:text-indigo-400 leading-tight mt-0.5">دارين للتعليم والتعلم عبر الإنترنت</p>
          </div>
        </Link>
        <div className="relative ml-1">
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center">
            {menuOpen ? <X className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
          </button>
          {menuOpen && (
            <div className="absolute top-12 left-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 min-w-[180px]">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)} className="flex items-center px-4 py-3 text-[12px] font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0 whitespace-nowrap">
                  {item.label}
                </Link>
              ))}
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-[12px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors border-t border-slate-100 dark:border-slate-700">
                <LogIn size={14} />
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
};