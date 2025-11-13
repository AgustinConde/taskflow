import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AuthTabs from '../AuthTabs';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));
vi.mock('@mui/icons-material', () => ({
    Login: () => <div data-testid="LoginIcon" />,
    PersonAdd: () => <div data-testid="PersonAddIcon" />
}));

describe('AuthTabs', () => {
    const renderTabs = (activeTab = 0) => {
        const onTabChange = vi.fn();
        return {
            ...render(
                <ThemeProvider theme={createTheme()}>
                    <AuthTabs activeTab={activeTab} onTabChange={onTabChange} />
                </ThemeProvider>
            ),
            onTabChange
        };
    };

    it('renders both tabs with icons', () => {
        renderTabs();
        expect(screen.getByRole('tab', { name: 'login' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'register' })).toBeInTheDocument();
        expect(screen.getByTestId('LoginIcon')).toBeInTheDocument();
        expect(screen.getByTestId('PersonAddIcon')).toBeInTheDocument();
    });

    it('shows correct selection', () => {
        renderTabs(0);
        expect(screen.getByRole('tab', { name: 'login' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tab', { name: 'register' })).toHaveAttribute('aria-selected', 'false');
    });

    it('calls onTabChange when clicked', async () => {
        const { onTabChange } = renderTabs();
        await userEvent.click(screen.getByRole('tab', { name: 'register' }));
        expect(onTabChange).toHaveBeenCalledWith(expect.any(Object), 1);
    });
});
