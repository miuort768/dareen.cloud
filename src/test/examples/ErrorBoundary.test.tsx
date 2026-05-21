import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorBoundary } from '../../components/ErrorBoundary'

const ThrowComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) throw new Error('Test error')
    return <div>Everything is fine</div>
}

describe('ErrorBoundary', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => { })
    })

    it('renders children when no error', () => {
        render(
            <ErrorBoundary>
                <div>Child content</div>
            </ErrorBoundary>,
        )
        expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('renders error UI when child throws', () => {
        render(
            <ErrorBoundary>
                <ThrowComponent shouldThrow={true} />
            </ErrorBoundary>,
        )
        expect(screen.getByText('عذراً، حدث خطأ غير متوقع')).toBeInTheDocument()
        expect(screen.getByText(/Error: Test error/)).toBeInTheDocument()
    })

    it('shows reload button on error', () => {
        render(
            <ErrorBoundary>
                <ThrowComponent shouldThrow={true} />
            </ErrorBoundary>,
        )

        const reloadBtn = screen.getByText('إعادة تحميل الصفحة')
        expect(reloadBtn).toBeInTheDocument()
    })

    it('error state persists after re-render with non-throwing child', () => {
        const { rerender } = render(
            <ErrorBoundary>
                <ThrowComponent shouldThrow={true} />
            </ErrorBoundary>,
        )
        expect(screen.getByText('عذراً، حدث خطأ غير متوقع')).toBeInTheDocument()

        rerender(
            <ErrorBoundary>
                <ThrowComponent shouldThrow={false} />
            </ErrorBoundary>,
        )
        // ErrorBoundary state persists across renders
        expect(screen.getByText('عذراً، حدث خطأ غير متوقع')).toBeInTheDocument()
    })
})
