import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>حفظ</Button>)
    expect(screen.getByRole('button', { name: 'حفظ' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>اضغط</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(
      <Button onClick={handleClick} disabled>
        تعطيل
      </Button>,
    )
    expect(screen.getByRole('button')).toBeDisabled()
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn()
    render(
      <Button onClick={handleClick} isLoading>
        تحميل
      </Button>,
    )
    expect(screen.getByRole('button')).toBeDisabled()
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders spinner when isLoading', () => {
    render(<Button isLoading>حفظ</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button.querySelector('svg.animate-spin')).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    render(<Button>افتراضي</Button>)
    expect(screen.getByRole('button').className).toContain('bg-primary')
  })

  it('applies secondary variant', () => {
    render(<Button variant="secondary">ثانوي</Button>)
    expect(screen.getByRole('button').className).toContain('bg-card')
  })

  it('applies destructive variant', () => {
    render(<Button variant="destructive">حذف</Button>)
    expect(screen.getByRole('button').className).toContain('bg-error')
  })

  it('applies outline variant', () => {
    render(<Button variant="outline">حدود</Button>)
    expect(screen.getByRole('button').className).toContain('border-primary/40')
  })

  it('applies ghost variant', () => {
    render(<Button variant="ghost">شبح</Button>)
    expect(screen.getByRole('button').className).toContain('bg-transparent')
  })

  it('applies warning variant', () => {
    render(<Button variant="warning">تحذير</Button>)
    expect(screen.getByRole('button').className).toContain('bg-warning')
  })

  it('applies success variant', () => {
    render(<Button variant="success">نجاح</Button>)
    expect(screen.getByRole('button').className).toContain('bg-success')
  })

  it('applies size sm', () => {
    render(<Button size="sm">صغير</Button>)
    expect(screen.getByRole('button').className).toContain('h-8')
  })

  it('applies size lg', () => {
    render(<Button size="lg">كبير</Button>)
    expect(screen.getByRole('button').className).toContain('h-12')
  })

  it('applies size icon', () => {
    render(<Button size="icon">✕</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-10')
    expect(btn.className).toContain('w-10')
  })

  it('renders leftIcon', () => {
    render(<Button leftIcon={<span data-testid="icon">I</span>}>زر</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders rightIcon', () => {
    render(<Button rightIcon={<span data-testid="icon">R</span>}>زر</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('hides icons when loading', () => {
    render(
      <Button isLoading leftIcon={<span data-testid="icon">X</span>}>
        زر
      </Button>,
    )
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument()
  })

  it('merges custom className', () => {
    render(<Button className="extra-class">زر</Button>)
    expect(screen.getByRole('button').className).toContain('extra-class')
  })

  it('applies disabled styles', () => {
    render(<Button disabled>معطل</Button>)
    expect(screen.getByRole('button').className).toContain('disabled:opacity-40')
  })

  it('has focus-visible ring for accessibility', () => {
    render(<Button>تركيز</Button>)
    expect(screen.getByRole('button').className).toContain('focus-visible:ring-2')
    expect(screen.getByRole('button').className).toContain('focus-visible:ring-focus')
  })

  it('rides the button elevation recipe', () => {
    render(<Button>ارتفاع</Button>)
    const btn = screen.getByRole('button').className
    expect(btn).toContain('shadow-button')
    expect(btn).toContain('hover:shadow-button-hover')
    expect(btn).toContain('active:shadow-button-pressed')
    expect(btn).toContain('active:scale-[0.985]')
  })

  it('flattens disabled buttons without hover-feel', () => {
    render(<Button disabled>معطل</Button>)
    expect(screen.getByRole('button').className).toContain('disabled:shadow-none')
  })

  it('carries an inner hairline on filled primary', () => {
    render(<Button>أساسي</Button>)
    expect(screen.getByRole('button').className).toContain('ring-1')
    expect(screen.getByRole('button').className).toContain('ring-inset')
  })
})
