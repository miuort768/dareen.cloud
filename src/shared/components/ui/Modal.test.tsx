import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="عنوان">
        <p>محتوى</p>
      </Modal>,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="عنوان">
        <p>محتوى</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('displays title', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="عنوان النافذة">
        <p>محتوى</p>
      </Modal>,
    )
    expect(screen.getByText('عنوان النافذة')).toBeInTheDocument()
  })

  it('has role="dialog"', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="عنوان">
        <p>محتوى</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('has aria-modal="true"', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="عنوان">
        <p>محتوى</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('has aria-label from title', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="نافذة">
        <p>محتوى</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'نافذة')
  })

  it('has default aria-label when no title', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>محتوى</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'نافذة منبثقة')
  })

  it('renders children content', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="عنوان">
        <p>محتوى النافذة</p>
      </Modal>,
    )
    expect(screen.getByText('محتوى النافذة')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="عنوان">
        <p>محتوى</p>
      </Modal>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'إغلاق' }))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape is pressed', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="عنوان">
        <p>محتوى</p>
      </Modal>,
    )
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('renders close button with aria-label', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="عنوان">
        <p>محتوى</p>
      </Modal>,
    )
    expect(screen.getByRole('button', { name: 'إغلاق' })).toBeInTheDocument()
  })

  it('close button has focus-visible ring', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="عنوان">
        <p>محتوى</p>
      </Modal>,
    )
    expect(screen.getByRole('button', { name: 'إغلاق' }).className).toContain(
      'focus-visible:ring-2',
    )
  })
})
