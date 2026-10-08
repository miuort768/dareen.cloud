const RASTER_EXT = /\.(png|jpe?g)$/i

/**
 * Local public rasters always ship with generated `.webp`/`.avif` siblings
 * (scripts/convert-webp.mjs), so a <picture> delivers them ~3x smaller.
 *
 * `/uploads/` (user uploads) and `/icons/` (PWA icons) have no siblings, and a
 * <picture> whose <source> 404s renders nothing at all — no fallback to the
 * <img> — so those paths are deliberately excluded, as are remote/absolute URLs
 * and anything that is already a modern format.
 */
export const pictureVariants = (src?: string) => {
  if (!src || !src.startsWith('/')) return null
  if (src.startsWith('/uploads/') || src.startsWith('/icons/')) return null
  if (!RASTER_EXT.test(src)) return null
  const base = src.replace(RASTER_EXT, '')
  return { avif: `${base}.avif`, webp: `${base}.webp` }
}
