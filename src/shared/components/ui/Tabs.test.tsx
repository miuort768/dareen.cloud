import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tabs } from './Tabs'

const sampleTabs = [
  { label: 'الكل', value: 'all' },
  { label: 'نشط', value: 'active' },
  { label: 'منتهي', value: 'inactive' },
]

describe('Tabs', () => {
  it('renders all tabs', () => {
    render(<Tabs tabs={sampleTabs} activeTab="all" onChange={() => {}} />)
    expect(screen.getByRole('tab', { name: 'الكل' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'نشط' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'منتهي' })).toBeInTheDocument()
  })

  it('has tablist role', () => {
    render(<Tabs tabs={sampleTabs} activeTab="all" onChange={() => {}} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('marks active tab as selected', () => {
    render(<Tabs tabs={sampleTabs} activeTab="active" onChange={() => {}} />)
    expect(screen.getByRole('tab', { name: 'نشط' })).toHaveAttribute('aria-selected', 'true')
  })

  it('marks inactive tab as not selected', () => {
    render(<Tabs tabs={sampleTabs} activeTab="active" onChange={() => {}} />)
    expect(screen.getByRole('tab', { name: 'الكل' })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onChange when tab is clicked', () => {
    const handleChange = vi.fn()
    render(<Tabs tabs={sampleTabs} activeTab="all" onChange={handleChange} />)
    fireEvent.click(screen.getByRole('tab', { name: 'نشط' }))
    expect(handleChange).toHaveBeenCalledWith('active')
  })

  it('applies underline variant by default', () => {
    const { container } = render(<Tabs tabs={sampleTabs} activeTab="all" onChange={() => {}} />)
    expect(container.firstChild).toHaveClass('border-b')
  })

  it('applies pills variant', () => {
    const { container } = render(
      <Tabs tabs={sampleTabs} activeTab="all" onChange={() => {}} variant="pills" />,
    )
    expect(container.firstChild).toHaveClass('p-1')
  })

  it('applies buttons variant', () => {
    const { container } = render(
      <Tabs tabs={sampleTabs} activeTab="all" onChange={() => {}} variant="buttons" />,
    )
    expect(container.firstChild).toHaveClass('gap-2')
  })

  it('renders tab icon', () => {
    const tabs = [{ label: 'الرئيسية', value: 'home', icon: <span data-testid="icon">🏠</span> }]
    render(<Tabs tabs={tabs} activeTab="home" onChange={() => {}} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders tab badge', () => {
    const tabs = [{ label: 'الرسائل', value: 'messages', badge: 5 }]
    render(<Tabs tabs={tabs} activeTab="messages" onChange={() => {}} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders string badge', () => {
    const tabs = [{ label: 'الإشعارات', value: 'notifs', badge: 'جديد' }]
    render(<Tabs tabs={tabs} activeTab="notifs" onChange={() => {}} />)
    expect(screen.getByText('جديد')).toBeInTheDocument()
  })

  it('applies focus-visible for accessibility', () => {
    render(<Tabs tabs={sampleTabs} activeTab="all" onChange={() => {}} />)
    const tab = screen.getByRole('tab', { name: 'الكل' })
    expect(tab.className).toContain('focus-visible:ring-2')
  })

  it('merges custom className', () => {
    const { container } = render(
      <Tabs tabs={sampleTabs} activeTab="all" onChange={() => {}} className="extra" />,
    )
    expect(container.firstChild).toHaveClass('extra')
  })
})
