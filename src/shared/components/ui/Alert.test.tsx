import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert } from './Alert'

describe('Alert', () => {
  it('renders children text', () => {
    render(<Alert>رسالة تنبيه</Alert>)
    expect(screen.getByText('رسالة تنبيه')).toBeInTheDocument()
  })

  it('has role="alert" for accessibility', () => {
    render(<Alert>تنبيه</Alert>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('applies info variant by default', () => {
    const { container } = render(<Alert>معلومة</Alert>)
    expect(container.firstChild).toHaveClass('bg-info-soft')
  })

  it('applies success variant', () => {
    const { container } = render(<Alert variant="success">تم بنجاح</Alert>)
    expect(container.firstChild).toHaveClass('bg-success-soft')
  })

  it('applies warning variant', () => {
    const { container } = render(<Alert variant="warning">حذف</Alert>)
    expect(container.firstChild).toHaveClass('bg-warning-soft')
  })

  it('applies error variant', () => {
    const { container } = render(<Alert variant="error">فشل</Alert>)
    expect(container.firstChild).toHaveClass('bg-error-soft')
  })

  it('applies neutral variant', () => {
    const { container } = render(<Alert variant="neutral">عادي</Alert>)
    expect(container.firstChild).toHaveClass('bg-surface')
  })

  it('applies premium variant', () => {
    const { container } = render(<Alert variant="premium">مميز</Alert>)
    expect(container.firstChild).toHaveClass('bg-gradient-to-br')
  })

  it('merges custom className', () => {
    const { container } = render(<Alert className="extra-class">نص</Alert>)
    expect(container.firstChild).toHaveClass('extra-class')
  })

  it('renders as a div element', () => {
    const { container } = render(<Alert>محتوى</Alert>)
    expect(container.firstChild?.nodeName).toBe('DIV')
  })

  it('has rounded corners', () => {
    const { container } = render(<Alert>محتوى</Alert>)
    expect(container.firstChild).toHaveClass('rounded-xl')
  })

  it('has border styling', () => {
    const { container } = render(<Alert>محتوى</Alert>)
    expect(container.firstChild).toHaveClass('border')
  })
})
