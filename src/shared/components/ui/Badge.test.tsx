import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>نشط</Badge>)
    expect(screen.getByText('نشط')).toBeInTheDocument()
  })

  it('applies default variant', () => {
    const { container } = render(<Badge>افتراضي</Badge>)
    expect(container.firstChild).toHaveClass('bg-surface')
  })

  it('applies success variant', () => {
    const { container } = render(<Badge variant="success">نجاح</Badge>)
    expect(container.firstChild).toHaveClass('bg-success-soft')
  })

  it('applies warning variant', () => {
    const { container } = render(<Badge variant="warning">تحذير</Badge>)
    expect(container.firstChild).toHaveClass('bg-warning-soft')
  })

  it('applies error variant', () => {
    const { container } = render(<Badge variant="error">خطأ</Badge>)
    expect(container.firstChild).toHaveClass('bg-error-soft')
  })

  it('applies info variant', () => {
    const { container } = render(<Badge variant="info">معلومة</Badge>)
    expect(container.firstChild).toHaveClass('bg-info-soft')
  })

  it('applies premium variant', () => {
    const { container } = render(<Badge variant="premium">مميز</Badge>)
    expect(container.firstChild).toHaveClass('bg-gradient-to-l')
  })

  it('applies glow variant', () => {
    const { container } = render(<Badge variant="glow">توهج</Badge>)
    expect(container.firstChild).toHaveClass('shadow-elevation-1')
  })

  it('applies sm size', () => {
    const { container } = render(<Badge size="sm">صغير</Badge>)
    expect(container.firstChild).toHaveClass('text-micro')
  })

  it('applies md size by default', () => {
    const { container } = render(<Badge>وسط</Badge>)
    expect(container.firstChild).toHaveClass('text-xs')
  })

  it('merges custom className', () => {
    const { container } = render(<Badge className="extra">وسط</Badge>)
    expect(container.firstChild).toHaveClass('extra')
  })

  it('renders as a span element', () => {
    const { container } = render(<Badge>نص</Badge>)
    expect(container.firstChild?.nodeName).toBe('SPAN')
  })

  it('has rounded-full for pill shape', () => {
    const { container } = render(<Badge>حبّة</Badge>)
    expect(container.firstChild).toHaveClass('rounded-full')
  })
})
