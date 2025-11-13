import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingScreen from '../LoadingScreen';

describe('LoadingScreen', () => {
    it('renders progress indicator', () => {
        render(<LoadingScreen />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('centers content vertically', () => {
        const { container } = render(<LoadingScreen />);
        const box = container.firstChild as HTMLElement;
        expect(box).toHaveStyle({ minHeight: '100vh', display: 'flex' });
    });
});
