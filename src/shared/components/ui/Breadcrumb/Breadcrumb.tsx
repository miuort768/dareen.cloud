import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
  icon?: React.ReactNode
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: 'chevron' | 'slash' | React.ComponentType
  className?: string
}

const DefaultSeparator = () => <ChevronLeft size={14} className="shrink-0 text-muted" />

const SlashSeparator = () => <span className="shrink-0 select-none text-muted">/</span>

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = 'chevron',
  className,
}) => {
  const SeparatorComponent =
    separator === 'slash' ? SlashSeparator : separator === 'chevron' ? DefaultSeparator : separator

  const isLast = (index: number) => index === items.length - 1

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && <SeparatorComponent />}
            {isLast(index) ? (
              <span
                aria-current="page"
                className="inline-flex max-w-[200px] items-center gap-1 truncate text-sm font-bold text-primary"
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                to={item.href}
                className="inline-flex max-w-[160px] items-center gap-1 truncate text-sm text-muted transition-colors hover:text-main"
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                {item.label}
              </Link>
            ) : item.onClick ? (
              <button
                onClick={item.onClick}
                className="inline-flex max-w-[160px] items-center gap-1 truncate text-sm text-muted transition-colors hover:text-main"
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            ) : (
              <span className="inline-flex max-w-[160px] items-center gap-1 truncate text-sm text-muted">
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

Breadcrumb.displayName = 'Breadcrumb'
