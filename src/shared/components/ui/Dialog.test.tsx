import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dialog } from './Dialog'

describe('Dialog', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<Dialog isOpen={false} onClose={() => {}} message="رسالة" />)
    expect(container.innerHTML).toBe('')
  })

  it('renders when isOpen is true', () => {
    render(<Dialog isOpen={true} onClose={() => {}} message="رسالة تأكيد" />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('displays message', () => {
    render(<Dialog isOpen={true} onClose={() => {}} message="هل أنت متأكد؟" />)
    expect(screen.getByText('هل أنت متأكد؟')).toBeInTheDocument()
  })

  it('displays title when provided', () => {
    render(<Dialog isOpen={true} onClose={() => {}} title="تأكيد الحذف" message="رسالة" />)
    expect(screen.getByText('تأكيد الحذف')).toBeInTheDocument()
  })

  it('renders confirm button with default label', () => {
    render(<Dialog isOpen={true} onClose={() => {}} onConfirm={() => {}} message="رسالة" />)
    expect(screen.getByRole('button', { name: 'تأكيد' })).toBeInTheDocument()
  })

  it('renders confirm button with custom label', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        confirmLabel="احذف"
        message="رسالة"
      />,
    )
    expect(screen.getByRole('button', { name: 'احذف' })).toBeInTheDocument()
  })

  it('renders cancel button when onCancel provided', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        onCancel={() => {}}
        message="رسالة"
      />,
    )
    expect(screen.getByRole('button', { name: 'إلغاء' })).toBeInTheDocument()
  })

  it('renders cancel button with custom label', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        onCancel={() => {}}
        cancelLabel="رجوع"
        message="رسالة"
      />,
    )
    expect(screen.getByRole('button', { name: 'رجوع' })).toBeInTheDocument()
  })

  it('does not render cancel button when onCancel not provided', () => {
    render(<Dialog isOpen={true} onClose={() => {}} onConfirm={() => {}} message="رسالة" />)
    expect(screen.queryByRole('button', { name: 'إلغاء' })).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirm button clicked', () => {
    const handleConfirm = vi.fn()
    render(<Dialog isOpen={true} onClose={() => {}} onConfirm={handleConfirm} message="رسالة" />)
    fireEvent.click(screen.getByRole('button', { name: 'تأكيد' }))
    expect(handleConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button clicked', () => {
    const handleCancel = vi.fn()
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        onCancel={handleCancel}
        message="رسالة"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'إلغاء' }))
    expect(handleCancel).toHaveBeenCalledTimes(1)
  })

  it('shows loading state on confirm button', () => {
    render(
      <Dialog isOpen={true} onClose={() => {}} onConfirm={() => {}} isLoading message="رسالة" />,
    )
    const confirmBtn = screen.getByRole('button', { name: 'تأكيد' })
    expect(confirmBtn).toBeDisabled()
    expect(confirmBtn.querySelector('svg.animate-spin')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        message="رسالة"
        icon={<span data-testid="icon">⚠</span>}
      />,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('applies variant color to icon container', () => {
    const { container } = render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        variant="error"
        message="رسالة"
        icon={<span>✕</span>}
      />,
    )
    expect(container.querySelector('.text-error')).toBeInTheDocument()
  })
})
