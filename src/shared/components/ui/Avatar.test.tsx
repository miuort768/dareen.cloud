import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('renders with image when src is provided', () => {
    render(<Avatar src="https://example.com/photo.jpg" name="أحمد" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders alt text on image', () => {
    render(<Avatar src="/photo.jpg" alt="صورة أحمد" name="أحمد" />)
    expect(screen.getByAltText('صورة أحمد')).toBeInTheDocument()
  })

  it('falls back to name as alt when alt not provided', () => {
    render(<Avatar src="/photo.jpg" name="أحمد" />)
    expect(screen.getByAltText('أحمد')).toBeInTheDocument()
  })

  it('renders initial letter when no src', () => {
    render(<Avatar name="أحمد" />)
    expect(screen.getByText('أ')).toBeInTheDocument()
  })

  it('renders question mark when no name and no src', () => {
    render(<Avatar />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('applies md size by default', () => {
    const { container } = render(<Avatar name="أ" />)
    const el = container.querySelector('.w-10')
    expect(el).toBeInTheDocument()
  })

  it('applies sm size', () => {
    const { container } = render(<Avatar name="أ" size="sm" />)
    const el = container.querySelector('.w-8')
    expect(el).toBeInTheDocument()
  })

  it('applies lg size', () => {
    const { container } = render(<Avatar name="أ" size="lg" />)
    const el = container.querySelector('.w-14')
    expect(el).toBeInTheDocument()
  })

  it('applies xl size', () => {
    const { container } = render(<Avatar name="أ" size="xl" />)
    const el = container.querySelector('.w-20')
    expect(el).toBeInTheDocument()
  })

  it('shows online indicator', () => {
    const { container } = render(<Avatar name="أ" indicator="online" />)
    expect(container.querySelector('.bg-success')).toBeInTheDocument()
  })

  it('shows offline indicator', () => {
    const { container } = render(<Avatar name="أ" indicator="offline" />)
    expect(container.querySelector('.bg-muted')).toBeInTheDocument()
  })

  it('shows away indicator', () => {
    const { container } = render(<Avatar name="أ" indicator="away" />)
    expect(container.querySelector('.bg-warning')).toBeInTheDocument()
  })

  it('does not show indicator by default', () => {
    const { container } = render(<Avatar name="أ" />)
    expect(container.querySelector('.bg-success')).not.toBeInTheDocument()
    expect(container.querySelector('.bg-muted')).not.toBeInTheDocument()
    expect(container.querySelector('.bg-warning')).not.toBeInTheDocument()
  })

  it('renders with rounded-full', () => {
    const { container } = render(<Avatar name="أ" />)
    expect(container.firstChild?.firstChild).toHaveClass('rounded-full')
  })

  it('merges custom className', () => {
    const { container } = render(<Avatar name="أ" className="extra-class" />)
    expect(container.firstChild).toHaveClass('extra-class')
  })
})
