import { BookMarked } from 'lucide-react'
import { Image } from '../../shared/components/ui'
import { cn } from '../../lib/utils'

interface BlogCoverImageProps {
  src?: string
  alt: string
  className?: string
  imgClassName?: string
  iconSize?: number
}

/**
 * غلاف المقال الموحد — يعرض الصورة إن وُجدت، وإلا صورة افتراضية (أيقونة كتاب)
 * الصورة غير إجبارية في المقالات.
 */
export const BlogCoverImage = ({
  src,
  alt,
  className,
  imgClassName,
  iconSize = 40,
}: BlogCoverImageProps) => {
  if (src) {
    return <Image src={src} alt={alt} className={className} imgClassName={imgClassName} />
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        'flex items-center justify-center bg-gradient-to-br from-primary-soft to-background text-primary/40',
        className,
      )}
    >
      <BookMarked size={iconSize} strokeWidth={1.5} />
    </div>
  )
}
