import { useEffect, useState } from 'react';

export const PublicThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('public-theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('public-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('public-theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 99999,
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        border: '2px solid rgba(255,255,255,0.3)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        background: isDark
          ? 'linear-gradient(135deg, #1e2a4a, #0f172a)'
          : 'linear-gradient(135deg, #ffffff, #f1f5f9)',
        transition: 'all 0.3s ease',
      }}
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
};
