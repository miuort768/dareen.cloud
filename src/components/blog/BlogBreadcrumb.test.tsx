import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlogBreadcrumb } from './BlogBreadcrumb';

describe('BlogBreadcrumb', () => {
    const defaultProps = {
        items: [
            { label: 'الرئيسية', onClick: vi.fn() },
            { label: 'التأسيس', onClick: vi.fn() },
        ],
        onBack: vi.fn(),
        onHome: vi.fn(),
    };

    it('renders breadcrumb items', () => {
        render(<BlogBreadcrumb {...defaultProps} />);
        expect(screen.getByText('الرئيسية')).toBeDefined();
        expect(screen.getByText('التأسيس')).toBeDefined();
    });

    it('renders current name when provided', () => {
        render(<BlogBreadcrumb {...defaultProps} currentName="رياضيات" />);
        expect(screen.getByText('رياضيات')).toBeDefined();
    });

    it('renders change button when showChangeButton is true', () => {
        render(<BlogBreadcrumb {...defaultProps} showChangeButton />);
        expect(screen.getByText('تغيير المادة')).toBeDefined();
    });

    it('does not render change button when showChangeButton is false', () => {
        render(<BlogBreadcrumb {...defaultProps} showChangeButton={false} />);
        expect(screen.queryByText('تغيير المادة')).toBeNull();
    });

    it('renders home button', () => {
        render(<BlogBreadcrumb {...defaultProps} />);
        expect(screen.getByText('الرئيسية')).toBeDefined();
    });
});
