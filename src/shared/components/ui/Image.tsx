import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '../../../lib/utils';

const FALLBACK_SRC =
  'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="#e2e8f0" width="400" height="300"/><text fill="#94a3b8" font-family="sans-serif" font-size="14" text-anchor="middle" x="200" y="155">تعذر تحميل الصورة</text></svg>'
  );

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  withSkeleton?: boolean;
}

export const Image = ({
  className,
  loading = 'lazy',
  decoding = 'async',
  withSkeleton,
  alt,
  ...props
}: ImageProps) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {withSkeleton && !loaded && (
        <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-inherit" />
      )}
      <img
        {...props}
        alt={alt || ''}
        loading={loading}
        decoding={decoding}
        onError={(e) => {
          if (!error) {
            setError(true);
            e.currentTarget.src = FALLBACK_SRC;
          }
          props.onError?.(e);
        }}
        onLoad={() => {
          setLoaded(true);
          props.onLoad?.();
        }}
        className={cn(
          'w-full h-full object-cover',
          withSkeleton && !loaded && 'opacity-0',
          loaded && 'opacity-100 transition-opacity duration-300',
          error && 'opacity-80'
        )}
      />
    </div>
  );
};
