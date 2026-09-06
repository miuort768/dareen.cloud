import { useEffect, useState } from 'react'

export function DarkModeSection() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const toggle = () => {
    document.documentElement.classList.toggle('dark')
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">الوضع الغامق — Dark Mode</h2>
      <div className="rounded-card border p-6 text-center">
        <p className="mb-4 text-sm text-muted">
          الحالي: <strong className="text-main">{isDark ? 'Dark' : 'Light'}</strong>
        </p>
        <button
          onClick={toggle}
          aria-pressed={isDark}
          className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-on-primary outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus"
        >
          {isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الغامق'}
        </button>
        <p className="mt-3 text-xs text-dim">
          * هذا الزر يبدّل class على html element — يعمل في كل الصفحات
        </p>
      </div>
    </section>
  )
}
