import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dropdown } from './Dropdown'

const sampleItems = [
  { label: 'تعديل', value: 'edit' },
  { label: 'حذف', value: 'delete', danger: true },
  { label: 'عرض', value: 'view' },
]

describe('Dropdown', () => {
  it('renders trigger', () => {
    render(<Dropdown trigger={<span>القائمة</span>} items={sampleItems} onSelect={() => {}} />)
    expect(screen.getByText('القائمة')).toBeInTheDocument()
  })

  it('does not show menu initially', () => {
    render(<Dropdown trigger={<span>القائمة</span>} items={sampleItems} onSelect={() => {}} />)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('shows menu when trigger is clicked', () => {
    render(<Dropdown trigger={<span>القائمة</span>} items={sampleItems} onSelect={() => {}} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('has aria-haspopup on trigger', () => {
    render(<Dropdown trigger={<span>القائمة</span>} items={sampleItems} onSelect={() => {}} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'true')
  })

  it('sets aria-expanded to false initially', () => {
    render(<Dropdown trigger={<span>القائمة</span>} items={sampleItems} onSelect={() => {}} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('sets aria-expanded to true when open', () => {
    render(<Dropdown trigger={<span>القائمة</span>} items={sampleItems} onSelect={() => {}} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders all items when open', () => {
    render(<Dropdown trigger={<span>القائمة</span>} items={sampleItems} onSelect={() => {}} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('menuitem', { name: 'تعديل' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'حذف' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'عرض' })).toBeInTheDocument()
  })

  it('calls onSelect and closes when item is clicked', () => {
    const handleSelect = vi.fn()
    render(<Dropdown trigger={<span>القائمة</span>} items={sampleItems} onSelect={handleSelect} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('menuitem', { name: 'تعديل' }))
    expect(handleSelect).toHaveBeenCalledWith('edit')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('does not call onSelect for disabled items', () => {
    const handleSelect = vi.fn()
    const items = [...sampleItems, { label: 'معطل', value: 'disabled', disabled: true }]
    render(<Dropdown trigger={<span>القائمة</span>} items={items} onSelect={handleSelect} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('menuitem', { name: 'معطل' }))
    expect(handleSelect).not.toHaveBeenCalled()
  })

  it('applies danger styling to danger items', () => {
    render(<Dropdown trigger={<span>القائمة</span>} items={sampleItems} onSelect={() => {}} />)
    fireEvent.click(screen.getByRole('button'))
    const dangerItem = screen.getByRole('menuitem', { name: 'حذف' })
    expect(dangerItem.className).toContain('text-error')
  })

  it('renders item icons', () => {
    const items = [
      { label: 'مع أيقونة', value: 'icon', icon: <span data-testid="item-icon">✏</span> },
    ]
    render(<Dropdown trigger={<span>القائمة</span>} items={items} onSelect={() => {}} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByTestId('item-icon')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <Dropdown
        trigger={<span>القائمة</span>}
        items={sampleItems}
        onSelect={() => {}}
        className="extra"
      />,
    )
    expect(container.firstChild).toHaveClass('extra')
  })
})
