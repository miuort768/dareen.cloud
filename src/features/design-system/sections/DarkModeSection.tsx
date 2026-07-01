import { useEffect, useState } from 'react';

export function DarkModeSection() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <section>
      <h2 className="text-lg font-bold mb-4">الوضع الغامق — Dark Mode</h2>
      <div className="rounded-card border p-6 text-center">
        <p className="text-muted text-sm mb-4">
          الحالي: <strong className="text-main">{isDark ? 'Dark' : 'Light'}</strong>
        </p>
        <button
          onClick={toggle}
          className="px-6 py-3 rounded-md bg-primary text-on-primary hover:bg-primary-hover transition-colors text-sm font-medium"
        >
          {isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الغامق'}
        </button>
        <p className="text-xs text-dim mt-3">
          * هذا الزر يبدّل class على html element — يعمل في كل الصفحات
        </p>
      </div>
    </section>
  );
}
