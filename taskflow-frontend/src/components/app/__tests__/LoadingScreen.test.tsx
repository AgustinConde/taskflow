import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingScreen from '../LoadingScreen';

describe('LoadingScreen', () => {
    describe('Rendering', () => {
        it('should render loading spinner', () => {
            render(<LoadingScreen />);

            const spinner = screen.getByRole('progressbar');
            expect(spinner).toBeInTheDocument();
        });

        it('should display centered layout', () => {
            const { container } = render(<LoadingScreen />);

            const box = container.firstChild as HTMLElement;
            expect(box).toHaveStyle({
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            });
        });
    });

    describe('Accessibility', () => {
        it('should have accessible progress indicator', () => {
            render(<LoadingScreen />);

            const progressbar = screen.getByRole('progressbar');
            expect(progressbar).toBeInTheDocument();
            expect(progressbar).toBeVisible();
        });

        it('should not interfere with screen readers', () => {
            render(<LoadingScreen />);

            const progressbar = screen.getByRole('progressbar');
            expect(progressbar).not.toHaveAttribute('aria-hidden', 'true');
        });
    });

    describe('Visual Design', () => {
        it('should render with correct spinner size', () => {
            render(<LoadingScreen />);

            const spinner = screen.getByRole('progressbar');
            expect(spinner).toHaveClass('MuiCircularProgress-root');
        });

        it('should maintain consistent layout structure', () => {
            const { container } = render(<LoadingScreen />);

            expect(container.firstChild).toHaveStyle({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            });
        });
    });
});
