import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';



export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: 'chevron' | 'slash' | React.ReactNode;
  className?: string;
}

const DefaultSeparator = () => (
  <ChevronLeft size={14} className="text-muted shrink-0" />
);

const SlashSeparator = () => (
  <span className="text-muted select-none shrink-0">/</span>
);

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = 'chevron',
  className,
}) => {
  const SeparatorComponent = separator === 'slash'
    ? SlashSeparator
    : separator === 'chevron'
      ? DefaultSeparator
      : separator;

  const isLast = (index: number) => index === items.length - 1;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && <SeparatorComponent />}
            {isLast(index) ? (
              <span
                aria-current="page"
                className="text-sm font-bold text-primary truncate max-w-[200px] inline-flex items-center gap-1"
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                to={item.href}
                className="text-sm text-muted hover:text-main transition-colors inline-flex items-center gap-1 truncate max-w-[160px]"
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                {item.label}
              </Link>
            ) : item.onClick ? (
              <button
                onClick={item.onClick}
                className="text-sm text-muted hover:text-main transition-colors inline-flex items-center gap-1 truncate max-w-[160px]"
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            ) : (
              <span className="text-sm text-muted inline-flex items-center gap-1 truncate max-w-[160px]">
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

Breadcrumb.displayName = 'Breadcrumb';
