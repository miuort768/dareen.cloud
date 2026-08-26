import { ArrowLeft, Library } from 'lucide-react'
import { Breadcrumb } from '../../shared/components/ui'
import type { BreadcrumbItem } from '../../shared/components/ui'

interface BlogBreadcrumbProps {
  items: BreadcrumbItem[]
  currentName?: string
  onBack: () => void
  onHome: () => void
  showChangeButton?: boolean
  isMobile?: boolean
}

export const BlogBreadcrumb = ({
  items,
  currentName,
  onBack,
  onHome,
  showChangeButton,
  isMobile,
}: BlogBreadcrumbProps) => {
  const breadcrumbItems: BreadcrumbItem[] = currentName ? [...items, { label: currentName }] : items

  const content = (
    <>
      <div className="mb-4">
        <Breadcrumb items={breadcrumbItems} separator="chevron" />
      </div>

      <div className="mb-6 flex gap-2">
        {showChangeButton && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-extrabold text-main transition-all duration-200 hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft size={14} />
            <span>تغيير المادة</span>
          </button>
        )}
        <button
          type="button"
          onClick={onHome}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-on-primary transition-all duration-200 hover:bg-primary-hover sm:w-auto sm:justify-start"
        >
          <Library size={14} />
          <span>الرئيسية</span>
        </button>
      </div>
    </>
  )

  if (isMobile) {
    return <div className="mb-4 mt-1 rounded-2xl border border-border bg-card p-4">{content}</div>
  }
  return <>{content}</>
}
