import { DS_VERSION_LABEL } from './version';
import { ColorSection } from './sections/ColorSection';
import { TypographySection } from './sections/TypographySection';
import { ButtonSection } from './sections/ButtonSection';
import { FormSection } from './sections/FormSection';
import { CardSection } from './sections/CardSection';
import { AlertSection } from './sections/AlertSection';
import { TableSection } from './sections/TableSection';
import { ChartSection } from './sections/ChartSection';
import { NavigationSection } from './sections/NavigationSection';
import { SpacingSection } from './sections/SpacingSection';
import { RadiusSection } from './sections/RadiusSection';
import { ShadowSection } from './sections/ShadowSection';
import { MotionSection } from './sections/MotionSection';
import { DarkModeSection } from './sections/DarkModeSection';
import { TokenInspector } from './sections/TokenInspector';
import { AccessibilitySection } from './sections/AccessibilitySection';
import { RegressionChecklist } from './sections/RegressionChecklist';
import { DesignTokenSection } from './sections/DesignTokenSection';
import { SkeletonSection } from './sections/SkeletonSection';

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
  { id: 'skeleton', label: 'Skeleton', component: SkeletonSection },
  { id: 'checklist', label: 'Checklist', component: RegressionChecklist },
] as const;

export function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-main">Design System</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-warning-soft text-warning-dark border border-warning font-semibold">
              {DS_VERSION_LABEL}
            </span>
          </div>
          <p className="text-xs text-dim">منصة دارين التعليمية</p>
        </div>
      </header>

      {/* Experimental Warning */}
      <div role="alert" className="bg-error-soft border-b border-error">
        <div className="max-w-7xl mx-auto px-4 py-2 text-xs text-error-dark text-center font-medium">
          ⚠ Internal Development Only — هذه الواجهة للمراجعة الداخلية وليست مرجعًا نهائيًا
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="sticky top-20 space-y-1">
            {SIDEBAR_ITEMS.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block px-3 py-2 text-sm text-muted hover:text-main hover:bg-hover rounded-md transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 space-y-12">
          {SIDEBAR_ITEMS.map(item => (
            <section key={item.id} id={item.id}>
              <item.component />
            </section>
          ))}

          {/* Footer */}
          <div className="border-t pt-8 text-center text-xs text-dim">
            <p>Design System v{DS_VERSION_LABEL} — آخر تحديث: 2026-07-01</p>
            <p className="mt-1">مبني على Semantic Tokens من <code className="text-primary font-mono">src/theme/</code></p>
          </div>
        </main>
      </div>
    </div>
  );
}
