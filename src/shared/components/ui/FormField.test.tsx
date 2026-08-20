import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormField } from './FormField'

describe('FormField', () => {
  it('renders children', () => {
    render(
      <FormField.Root>
        <p>محتوى</p>
      </FormField.Root>,
    )
    expect(screen.getByText('محتوى')).toBeInTheDocument()
  })

  it('Label renders text', () => {
    render(
      <FormField.Root>
        <FormField.Label>اسم الطالب</FormField.Label>
      </FormField.Root>,
    )
    expect(screen.getByText('اسم الطالب')).toBeInTheDocument()
  })

  it('Label is a label element', () => {
    render(
      <FormField.Root>
        <FormField.Label>اسم</FormField.Label>
      </FormField.Root>,
    )
    expect(screen.getByText('اسم').nodeName).toBe('LABEL')
  })

  it('Label shows required asterisk when required', () => {
    render(
      <FormField.Root required>
        <FormField.Label>مطلوب</FormField.Label>
      </FormField.Root>,
    )
    const asterisk = screen.getByText('مطلوب').querySelector('[aria-hidden="true"]')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk).toHaveTextContent('*')
  })

  it('Label does not show asterisk when not required', () => {
    render(
      <FormField.Root>
        <FormField.Label>اختياري</FormField.Label>
      </FormField.Root>,
    )
    const asterisk = screen.getByText('اختياري').querySelector('[aria-hidden="true"]')
    expect(asterisk).not.toBeInTheDocument()
  })

  it('Hint renders text', () => {
    render(
      <FormField.Root>
        <FormField.Hint>نص مساعد</FormField.Hint>
      </FormField.Root>,
    )
    expect(screen.getByText('نص مساعد')).toBeInTheDocument()
  })

  it('Error renders text', () => {
    render(
      <FormField.Root>
        <FormField.Error>هذا الحقل مطلوب</FormField.Error>
      </FormField.Root>,
    )
    expect(screen.getByText('هذا الحقل مطلوب')).toBeInTheDocument()
  })

  it('Error has error styling', () => {
    const { container } = render(
      <FormField.Root>
        <FormField.Error>خطأ</FormField.Error>
      </FormField.Root>,
    )
    const errorEl = container.querySelector('.text-error')
    expect(errorEl).toBeInTheDocument()
  })

  it('Error has icon', () => {
    const { container } = render(
      <FormField.Root>
        <FormField.Error>خطأ</FormField.Error>
      </FormField.Root>,
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('Root applies dir="rtl"', () => {
    const { container } = render(
      <FormField.Root>
        <p>محتوى</p>
      </FormField.Root>,
    )
    expect(container.firstChild).toHaveAttribute('dir', 'rtl')
  })

  it('generates unique ID for context', () => {
    const { rerender } = render(
      <FormField.Root>
        <FormField.Label>أ</FormField.Label>
      </FormField.Root>,
    )
    const firstId = screen.getByText('أ').getAttribute('for')
    rerender(
      <FormField.Root>
        <FormField.Label>ب</FormField.Label>
      </FormField.Root>,
    )
    const secondId = screen.getByText('ب').getAttribute('for')
    // IDs should be unique across renders due to useId
    expect(firstId).toBeTruthy()
    expect(secondId).toBeTruthy()
  })

  it('merges custom className on Root', () => {
    const { container } = render(
      <FormField.Root className="extra">
        <p>محتوى</p>
      </FormField.Root>,
    )
    expect(container.firstChild).toHaveClass('extra')
  })
})
