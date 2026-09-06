import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn — tailwind-merge shadow group guard', () => {
  it('keeps a custom shadow scale token alongside a shadow color', () => {
    expect(cn('shadow-elevation-2 shadow-primary/20')).toBe('shadow-elevation-2 shadow-primary/20')
    expect(cn('shadow-soft shadow-primary/20')).toBe('shadow-soft shadow-primary/20')
    expect(cn('shadow-card shadow-primary/10')).toBe('shadow-card shadow-primary/10')
    expect(cn('shadow-glass shadow-black/10')).toBe('shadow-glass shadow-black/10')
    expect(cn('shadow-elevation-4 shadow-black/20')).toBe('shadow-elevation-4 shadow-black/20')
  })

  it('keeps arbitrary + branded shadow scales with colors', () => {
    expect(cn('shadow-gold shadow-primary/20')).toBe('shadow-gold shadow-primary/20')
    expect(cn('shadow-elevation-1 shadow-primary/10')).toBe('shadow-elevation-1 shadow-primary/10')
  })

  it('drops the earlier shadow scale when a later same-group scale wins', () => {
    expect(cn('shadow-soft shadow-2xl')).toBe('shadow-2xl')
    expect(cn('shadow-elevation-1 shadow-elevation-2')).toBe('shadow-elevation-2')
  })

  it('keeps hover: shadow variants independent of the base scale', () => {
    expect(cn('shadow-soft hover:shadow-elevation-1')).toBe('shadow-soft hover:shadow-elevation-1')
    expect(cn('shadow-elevation-2 hover:shadow-elevation-4')).toBe(
      'shadow-elevation-2 hover:shadow-elevation-4',
    )
  })
})
