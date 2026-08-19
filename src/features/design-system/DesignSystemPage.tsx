const DS_VERSION_LABEL = '1.2'
import { AlertTriangle } from 'lucide-react'
import { ColorSection } from './sections/ColorSection'
import { TypographySection } from './sections/TypographySection'
import { ButtonSection } from './sections/ButtonSection'
import { FormSection } from './sections/FormSection'
import { CardSection } from './sections/CardSection'
import { AlertSection } from './sections/AlertSection'
import { TableSection } from './sections/TableSection'
import { ChartSection } from './sections/ChartSection'
import { NavigationSection } from './sections/NavigationSection'
import { SpacingSection } from './sections/SpacingSection'
import { RadiusSection } from './sections/RadiusSection'
import { ShadowSection } from './sections/ShadowSection'
import { MotionSection } from './sections/MotionSection'
import { DarkModeSection } from './sections/DarkModeSection'
import { TokenInspector } from './sections/TokenInspector'
import { AccessibilitySection } from './sections/AccessibilitySection'
import { RegressionChecklist } from './sections/RegressionChecklist'
import { DesignTokenSection } from './sections/DesignTokenSection'
import { SkeletonSection } from './sections/SkeletonSection'
import { DialogSection } from './sections/DialogSection'
import { AvatarSection } from './sections/AvatarSection'
import { DropdownSection } from './sections/DropdownSection'

const SIDEBAR_ITEMS = [
  { id: 'colors', label: 'Colors', component: ColorSection },
  { id: 'design-tokens', label: 'Design Tokens', component: DesignTokenSection },
  { id: 'typography', label: 'Typography', component: TypographySection },
  { id: 'buttons', label: 'Buttons', component: ButtonSection },
  { id: 'forms', label: 'Forms', component: FormSection },
  { id: 'cards', label: 'Cards', component: CardSection },
  { id: 'alerts', label: 'Alerts', component: AlertSection },
  { id: 'tables', label: 'Tables', component: TableSection },
  { id: 'charts', label: 'Charts', component: ChartSection },
  { id: 'navigation', label: 'Navigation', component: NavigationSection },
  { id: 'spacing', label: 'Spacing', component: SpacingSection },
  { id: 'radius', label: 'Radius', component: RadiusSection },
  { id: 'shadows', label: 'Shadows', component: ShadowSection },
  { id: 'motion', label: 'Motion', component: MotionSection },
  { id: 'dark-mode', label: 'Dark Mode', component: DarkModeSection },
  { id: 'inspector', label: 'Token Inspector', component: TokenInspector },
  { id: 'accessibility', label: 'Accessibility', component: AccessibilitySection },
  { id: 'dialog', label: 'Dialog', component: DialogSection },
  { id: 'avatar', label: 'Avatar', component: AvatarSection },
  { id: 'dropdown', label: 'Dropdown', component: DropdownSection },
  { id: 'skeleton', label: 'Skeleton', component: SkeletonSection },
  { id: 'checklist', label: 'Checklist', component: RegressionChecklist },
] as const

export function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-main">Design System</h1>
            <span className="rounded-full border border-warning bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning-dark">
              {DS_VERSION_LABEL}
            </span>
          </div>
          <p className="text-xs text-dim">منصة دارين السابعة التعليمية</p>
        </div>
      </header>

      {/* Experimental Warning */}
      <div role="alert" className="border-b border-error bg-error-soft">
        <div className="mx-auto max-w-7xl px-4 py-2 text-center text-xs font-medium text-error-dark">
          <AlertTriangle size={12} className="me-1 inline" /> Internal Development Only — هذه
          الواجهة للمراجعة الداخلية وليست مرجعًا نهائيًا
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-20 space-y-1">
            {SIDEBAR_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-hover hover:text-main"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 space-y-12">
          {SIDEBAR_ITEMS.map((item) => (
            <section key={item.id} id={item.id}>
              <item.component />
            </section>
          ))}

          {/* Footer */}
          <div className="border-t pt-8 text-center text-xs text-dim">
            <p>Design System v{DS_VERSION_LABEL} &mdash; آخر تحديث: 2026-07-01</p>
            <p className="mt-1">
              مبني على Semantic Tokens من <code className="font-mono text-primary">src/theme/</code>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
