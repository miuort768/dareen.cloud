export function calcPercent(used: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((Math.max(0, used) / total) * 100));
}

export type ProgressVariant = 'attendance' | 'usage' | 'success' | 'primary' | 'info' | 'warning' | 'error';

export function getProgressColor(value: number, variant: ProgressVariant = 'usage'): string {
  switch (variant) {
    case 'attendance':
      return value > 85 ? 'bg-error' : value > 60 ? 'bg-warning' : 'bg-success';
    case 'usage':
      return value < 30 ? 'bg-error' : value < 70 ? 'bg-warning' : 'bg-success';
    case 'success':
      return 'bg-success';
    case 'primary':
      return 'bg-primary';
    case 'info':
      return 'bg-info';
    case 'warning':
      return 'bg-warning';
    case 'error':
      return 'bg-error';
  }
}

export function getProgressCSSColor(value: number, variant: ProgressVariant = 'usage'): string {
  switch (variant) {
    case 'attendance':
      return value > 85 ? 'var(--bg-error)' : value > 60 ? 'var(--bg-warning)' : 'var(--bg-success)';
    case 'usage':
      return value < 30 ? 'var(--bg-error)' : value < 70 ? 'var(--bg-warning)' : 'var(--bg-success)';
    case 'success':
      return 'var(--bg-success)';
    case 'primary':
      return 'var(--bg-primary)';
    case 'info':
      return 'var(--bg-info)';
    case 'warning':
      return 'var(--bg-warning)';
    case 'error':
      return 'var(--bg-error)';
  }
}
