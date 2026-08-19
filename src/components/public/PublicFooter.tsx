import { Link, useNavigate } from 'react-router-dom'
import { Instagram, Phone, MapPin } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { useAcademyName } from '../../context/AppContext'

export const PublicFooter = () => {
  const navigate = useNavigate()
  const academyName = useAcademyName()
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  const footerDescription = useSettingsStore((s) => s.footerDescription)
  const footerAddress = useSettingsStore((s) => s.footerAddress)
  const footerInstagram = useSettingsStore((s) => s.footerInstagram)

  const instagramHandle = (footerInstagram || 'daren_school').replace(/^@/, '')

  return (
    <footer className="relative min-h-[300px] overflow-hidden border-t border-border bg-surface pb-6 pt-4 text-main transition-colors duration-500 dark:border-primary/20 dark:bg-card md:pb-6 md:pt-6">
      {/* Decorative blurs — dark: gold glow */}
      <div className="pointer-events-none absolute inset-0 opacity-10 dark:opacity-[0.04]">
        <div className="absolute -right-[20%] -top-[50%] h-[80%] w-[80%] rounded-full bg-primary-soft blur-[120px] dark:bg-primary"></div>
        <div className="absolute -bottom-[50%] -left-[20%] h-[80%] w-[80%] rounded-full bg-primary-soft blur-[120px] dark:bg-primary"></div>
        <div className="border-border/20 absolute end-10 top-10 h-20 w-20 rotate-45 border dark:border-primary/10"></div>
        <div className="border-border/20 absolute bottom-20 start-10 h-32 w-32 -rotate-12 border dark:border-primary/10"></div>
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {/* Brand + description */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-none bg-gradient-to-br from-primary to-primary-hover shadow-lg dark:from-primary dark:to-primary">
                <span className="text-2xl font-black text-on-primary dark:text-card">د</span>
              </div>
              <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text font-heading text-lg font-black text-transparent dark:from-primary dark:to-primary">
                {academyName}
              </span>
            </div>
            <p className="dark:text-warning/60 border-s-2 border-border ps-4 text-sm leading-relaxed text-muted dark:border-primary/30 lg:text-xs">
              {footerDescription ||
                'نصنع مستقبل أطفالكم من خلال تعليم متميز يجمع بين القيم الأصيلة والأساليب الحديثة. شريككم الموثوق في رحلة التعليم.'}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-main dark:text-main">
              <span className="h-0.5 w-8 bg-accent dark:bg-primary"></span>
              روابط سريعة
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'الدورات', path: '/courses' },
                { name: 'من نحن', path: '/about' },
                { name: 'اتصل بنا', path: '/contact' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="dark:text-main/60 flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent dark:hover:text-primary"
                  >
                    <span className="text-accent dark:text-primary">›</span> {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-main dark:text-main">
              <span className="h-0.5 w-8 bg-accent dark:bg-primary"></span>
              تواصل معنا
            </h3>
            <ul className="space-y-4">
              <li className="dark:text-main/60 flex items-start gap-3 text-sm text-muted">
                <MapPin className="h-5 w-5 shrink-0 text-accent dark:text-primary" />
                <span>{footerAddress || 'بني سويف - مصر'}</span>
              </li>
              <li className="dark:text-main/60 flex items-center gap-3 text-sm text-muted">
                <Phone className="h-5 w-5 shrink-0 text-accent dark:text-primary" />
                <a
                  href={`https://wa.me/${adminPhone?.replace(/\D/g, '') || '965000000000'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent dark:hover:text-primary"
                  dir="ltr"
                >
                  +{adminPhone?.replace(/\D/g, '') || '965000000000'}
                </a>
              </li>
              <li className="dark:text-main/60 flex items-center gap-3 text-sm text-muted">
                <Instagram className="h-5 w-5 shrink-0 text-accent dark:text-primary" />
                <a
                  href={`https://www.instagram.com/${instagramHandle}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent dark:hover:text-primary"
                >
                  @{instagramHandle}
                </a>
              </li>
            </ul>
          </div>

          {/* Join us */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-main dark:text-main">
              <span className="h-0.5 w-8 bg-accent dark:bg-primary"></span>
              انضم الينا الان
            </h3>
            <div className="space-y-3">
              <Link
                to="/jobs"
                className="block w-full border border-border bg-primary-soft px-4 py-3 text-center text-sm text-primary transition-all hover:border-accent hover:bg-primary-light dark:border-primary/20 dark:bg-white/5 dark:text-primary dark:hover:border-primary/40 dark:hover:bg-primary/10"
              >
                التقديم للوظائف
              </Link>
              <Link
                to="/terms-of-work"
                className="block w-full transform bg-gradient-to-r from-accent to-accent-hover py-3 text-center text-sm font-black text-on-accent transition-all hover:-translate-y-0.5 hover:shadow-lg dark:from-primary dark:to-primary dark:text-card dark:shadow-primary/20"
              >
                قوانين العمل
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-5 dark:border-primary/15 md:flex-row md:gap-4 md:pt-6">
          <div className="text-center md:text-start">
            <p className="dark:text-main/40 text-sm text-muted">
              &copy; {new Date().getFullYear()}{' '}
              <span className="font-medium text-main dark:text-main">{academyName}</span>. جميع
              الحقوق محفوظة.
            </p>
          </div>

          <div className="text-center">
            <div
              onClick={() => navigate('/a.abdullah')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate('/a.abdullah')
                }
              }}
              className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden border border-primary-active bg-gradient-to-r from-primary to-primary-hover px-4 py-2 dark:border-primary/30 dark:from-primary dark:to-primary"
            >
              <div className="via-on-primary/10 pointer-events-none absolute inset-0 z-0 h-full w-full animate-shine-slow bg-gradient-to-r from-transparent to-transparent dark:via-white/10"></div>
              <span className="relative z-10 h-1.5 w-1.5 animate-pulse bg-accent dark:bg-card"></span>
              <span className="text-on-primary/80 dark:text-card/70 relative z-10 font-heading text-micro font-bold tracking-wide">
                تصميم وتطوير
              </span>
              <span className="relative z-10 font-heading text-micro font-black text-on-primary dark:text-card">
                مستر احمد عبدالله
              </span>
              <span className="relative z-10 h-1.5 w-1.5 animate-pulse bg-accent dark:bg-card"></span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 md:justify-end">
            <Link
              to="/privacy-policy"
              className="dark:text-main/40 text-sm text-muted transition-colors hover:text-accent dark:hover:text-primary"
            >
              سياسة الخصوصية
            </Link>
            <Link
              to="/refund-policy"
              className="dark:text-main/40 text-sm text-muted transition-colors hover:text-accent dark:hover:text-primary"
            >
              سياسة الاسترجاع والإلغاء
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
