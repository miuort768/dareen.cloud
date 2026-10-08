import { useState, type ImgHTMLAttributes } from 'react'
import { cn } from '../../../lib/utils'
import { pictureVariants } from './pictureVariants'

const FALLBACK_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="var(--border)" width="400" height="300"/><text fill="var(--text-dim)" font-family="sans-serif" font-size="14" text-anchor="middle" x="200" y="155">طھط¹ط°ط± طھط­ظ…ظٹظ„ ط§ظ„طµظˆط±ط©</text></svg>',
  )

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  withSkeleton?: boolean
  imgClassName?: string
  srcSet?: string
  sizes?: string
  webpSrc?: string
  avifSrc?: string
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
  avifSrc,
  ...props
}: ImageProps) => {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const derived = pictureVariants(props.src)
  const avif = webpSrc ? avifSrc : derived?.avif
  const webp = webpSrc ?? derived?.webp

  const img = (
    <img
      {...props}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt || ''}
      loading={loading}
      decoding={decoding}
      onError={(e) => {
        if (!error) {
          setError(true)
          e.currentTarget.src = FALLBACK_SRC
        }
        props.onError?.(e)
      }}
      onLoad={(e) => {
        setLoaded(true)
        props.onLoad?.(e)
      }}
      className={cn(
        'h-full w-full object-cover',
        imgClassName,
        withSkeleton && !loaded && 'opacity-0',
        loaded && 'opacity-100 transition-opacity duration-slow',
        error && 'opacity-80',
      )}
    />
  )

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {withSkeleton && !loaded && (
        <div className="rounded-inherit absolute inset-0 animate-pulse bg-surface" />
      )}
      {webp ? (
        <picture className="block h-full w-full">
          {avif && <source srcSet={avif} type="image/avif" />}
          <source srcSet={webp} type="image/webp" />
          {img}
        </picture>
      ) : (
        img
      )}
    </div>
  )
}
