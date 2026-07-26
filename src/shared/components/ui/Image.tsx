import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '../../../lib/utils';

const FALLBACK_SRC =
  'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="var(--border)" width="400" height="300"/><text fill="var(--text-dim)" font-family="sans-serif" font-size="14" text-anchor="middle" x="200" y="155">تعذر تحميل الصورة</text></svg>'
  );

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  withSkeleton?: boolean;
  imgClassName?: string;
  srcSet?: string;
  sizes?: string;
  webpSrc?: string;
}

export const Image = ({
  className,
  imgClassName,
  loading = 'lazy',
  decoding = 'async',
  withSkeleton,
  alt,
  srcSet,
  sizes,
  webpSrc,
  ...props
}: ImageProps) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (webpSrc) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        {withSkeleton && !loaded && (
          <div className="absolute inset-0 animate-pulse bg-surface dark:bg-surface rounded-inherit" />
        )}
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <img
            {...props}
            srcSet={srcSet}
            sizes={sizes}
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
              imgClassName,
              withSkeleton && !loaded && 'opacity-0',
              loaded && 'opacity-100 transition-opacity duration-slow',
              error && 'opacity-80'
            )}
          />
        </picture>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {withSkeleton && !loaded && (
        <div className="absolute inset-0 animate-pulse bg-surface dark:bg-surface rounded-inherit" />
      )}
      <img
        {...props}
        srcSet={srcSet}
        sizes={sizes}
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
          imgClassName,
          withSkeleton && !loaded && 'opacity-0',
          loaded && 'opacity-100 transition-opacity duration-slow',
          error && 'opacity-80'
        )}
      />
    </div>
  );
};
