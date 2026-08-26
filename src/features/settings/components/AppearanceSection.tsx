import { Palette, Moon, Sun, Check } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { THEME_PRESETS } from '../types'

interface AppearanceSectionProps {
  theme: string
  setTheme: (t: string) => void
  themeColor: string
  setThemeColor: (c: string) => void
}

export const AppearanceSection = ({
  theme,
  setTheme,
  themeColor,
  setThemeColor,
}: AppearanceSectionProps) => {
  return (
    <section className="rounded-2xl border border-divider bg-card p-5 shadow-sm md:p-6">
      <div className="mb-6 flex items-center gap-3 border-b border-divider pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
          <Palette size={18} className="text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-main">المظهر</h2>
          <p className="mt-0.5 text-[11px] font-bold text-muted">الوضع الداكن وسمة الألوان</p>
        </div>
        <div className="hidden h-0.5 w-16 rounded-full bg-gradient-to-l from-primary/40 to-transparent sm:block" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-xl border border-divider bg-background p-4 transition-colors hover:border-divider">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              {theme === 'dark' ? (
                <Moon size={16} className="text-primary" />
              ) : (
                <Sun size={16} className="text-warning" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-main">الوضع الداكن</p>
              <p className="mt-0.5 text-[11px] font-bold text-muted">تفعيل/إلغاء الوضع الليلي</p>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
              'relative h-7 w-12 shrink-0 rounded-full transition-all duration-300',
              theme === 'dark'
                ? 'bg-gradient-to-r from-primary to-primary-active shadow-sm shadow-primary/30'
                : 'bg-divider hover:bg-border',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300',
                theme === 'dark' ? 'start-[1.375rem]' : 'start-0.5',
              )}
            />
          </button>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-bold text-main">
            <Palette size={14} className="text-primary" />
            سمة الألوان
          </p>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-7">
            {THEME_PRESETS.map((preset) => {
              const isActive = themeColor === preset.id
              return (
                <button
                  key={preset.id}
                  onClick={() => setThemeColor(preset.id)}
                  className="group flex flex-col items-center gap-2"
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300',
                      isActive
                        ? 'scale-110 shadow-md ring-2 ring-primary ring-offset-2 ring-offset-card'
                        : 'ring-1 ring-divider hover:shadow-sm hover:ring-border',
                    )}
                  >
                    <div
                      className="relative h-full w-full overflow-hidden rounded-[10px] shadow-inner"
                      style={{ backgroundColor: preset.color }}
                    >
                      {isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <Check size={14} className="text-white drop-shadow" />
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold tracking-tight transition-colors',
                      isActive ? 'text-primary' : 'text-muted',
                    )}
                  >
                    {preset.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
