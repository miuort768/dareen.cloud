import { describe, it, expect } from 'vitest'
import { pictureVariants } from './pictureVariants'

describe('pictureVariants', () => {
  it('derives webp/avif siblings for local public rasters', () => {
    expect(pictureVariants('/hero-child.v2.png')).toEqual({
      webp: '/hero-child.v2.webp',
      avif: '/hero-child.v2.avif',
    })
    expect(pictureVariants('/dareen_logo_new.v2.jpg')).toEqual({
      webp: '/dareen_logo_new.v2.webp',
      avif: '/dareen_logo_new.v2.avif',
    })
    expect(pictureVariants('/chat-avatar.v2.jpeg')).toEqual({
      webp: '/chat-avatar.v2.webp',
      avif: '/chat-avatar.v2.avif',
    })
  })

  it('skips uploads and PWA icons (no generated siblings exist)', () => {
    expect(pictureVariants('/uploads/blog/cover.png')).toBeNull()
    expect(pictureVariants('/icons/icon-48x48.png')).toBeNull()
  })

  it('skips remote URLs, modern formats and missing sources', () => {
    expect(pictureVariants('https://example.com/a.png')).toBeNull()
    expect(pictureVariants('/bbook.webp')).toBeNull()
    expect(pictureVariants('/logo.v2.svg')).toBeNull()
    expect(pictureVariants('data:image/png;base64,AAA')).toBeNull()
    expect(pictureVariants(undefined)).toBeNull()
  })
})
