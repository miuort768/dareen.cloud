import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Input label="اسم الطالب" />)
    expect(screen.getByText('اسم الطالب')).toBeInTheDocument()
  })

  it('associates label with input via htmlFor', () => {
    render(<Input label="الاسم" />)
    const label = screen.getByText('الاسم')
    const input = screen.getByRole('textbox')
    expect(label.getAttribute('for')).toBe(input.id)
  })

  it('shows error message', () => {
    render(<Input label="الحقل" error="هذا الحقل مطلوب" />)
    expect(screen.getByText('هذا الحقل مطلوب')).toBeInTheDocument()
  })

  it('sets aria-invalid when error exists', () => {
    render(<Input error="خطأ" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when no error', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false')
  })

  it('shows helper text when no error', () => {
    render(<Input label="الحقل" helperText="نص مساعد" />)
    expect(screen.getByText('نص مساعد')).toBeInTheDocument()
  })

  it('hides helper text when error exists', () => {
    render(<Input label="الحقل" helperText="نص" error="خطأ" />)
    expect(screen.queryByText('نص')).not.toBeInTheDocument()
  })

  it('shows required indicator on label', () => {
    render(<Input label="مطلوب" required />)
    const label = screen.getByText('مطلوب')
    expect(label.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('applies error styling to input', () => {
    render(<Input error="خطأ" />)
    expect(screen.getByRole('textbox').className).toContain('border-error')
  })

  it('renders left icon', () => {
    render(<Input leftIcon={<span data-testid="icon">🔍</span>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders right icon', () => {
    render(<Input rightIcon={<span data-testid="icon">✕</span>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('accepts different input types', () => {
    render(<Input type="email" label="البريد" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
  })

  it('calls onChange handler', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('applies disabled state', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('applies placeholder', () => {
    render(<Input placeholder="اكتب هنا..." />)
    expect(screen.getByPlaceholderText('اكتب هنا...')).toBeInTheDocument()
  })

  it('applies sm size', () => {
    render(<Input size="sm" />)
    expect(screen.getByRole('textbox').className).toContain('h-9')
  })

  it('applies lg size', () => {
    render(<Input size="lg" />)
    expect(screen.getByRole('textbox').className).toContain('h-12')
  })

  it('applies md size by default', () => {
    render(<Input />)
    expect(screen.getByRole('textbox').className).toContain('h-11')
  })
})
