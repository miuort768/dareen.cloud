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
