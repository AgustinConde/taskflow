import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SettingsDialog from '../SettingsDialog';
import { authService } from '../../../services/authService';

vi.mock('../../../services/authService');

describe('SettingsDialog', () => {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        mode: 'light' as const,
        onThemeModeChange: vi.fn(),
        currentLanguage: 'en',
        onLanguageChange: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(authService.getUserSettings).mockResolvedValue({ autoDeleteCompletedTasks: true });
        vi.mocked(authService.updateUserSettings).mockResolvedValue();
    });

    it('renders when open', async () => {
        render(<SettingsDialog {...defaultProps} />);
        await waitFor(() => screen.getByRole('dialog'));
    });

    it('loads settings on open', async () => {
        render(<SettingsDialog {...defaultProps} />);
        await waitFor(() => expect(authService.getUserSettings).toHaveBeenCalled());
    });

    it('changes theme mode', async () => {
        render(<SettingsDialog {...defaultProps} />);
        await waitFor(() => screen.getByRole('button', { name: /dark/i }));
        await userEvent.click(screen.getByRole('button', { name: /dark/i }));
        expect(defaultProps.onThemeModeChange).toHaveBeenCalledWith('dark');
    });

    it('changes language', async () => {
        render(<SettingsDialog {...defaultProps} />);
        await waitFor(() => screen.getByRole('button', { name: /es/i }));
        await userEvent.click(screen.getByRole('button', { name: /es/i }));
        expect(defaultProps.onLanguageChange).toHaveBeenCalledWith('es');
    });

    it('toggles auto-delete setting', async () => {
        render(<SettingsDialog {...defaultProps} />);
        await waitFor(() => screen.getByRole('checkbox'));

        const checkbox = screen.getByRole('checkbox');
        await userEvent.click(checkbox);

        await waitFor(() => expect(authService.updateUserSettings).toHaveBeenCalledWith({ autoDeleteCompletedTasks: false }));
    });

    it('shows success message after saving', async () => {
        render(<SettingsDialog {...defaultProps} />);
        await waitFor(() => screen.getByRole('checkbox'));

        await userEvent.click(screen.getByRole('checkbox'));

        await waitFor(() => screen.getByText('settings.saved'));
    });

    it('handles load error', async () => {
        vi.mocked(authService.getUserSettings).mockRejectedValue(new Error('Load error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(<SettingsDialog {...defaultProps} />);

        await waitFor(() => screen.getByText(/error/i));
        consoleSpy.mockRestore();
    });

    it('handles save error', async () => {
        vi.mocked(authService.updateUserSettings).mockRejectedValue(new Error('Save error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(<SettingsDialog {...defaultProps} />);
        await waitFor(() => screen.getByRole('checkbox'));

        await userEvent.click(screen.getByRole('checkbox'));

        await waitFor(() => screen.getByText(/error/i));
        consoleSpy.mockRestore();
    });

    it('closes dialog', async () => {
        render(<SettingsDialog {...defaultProps} />);
        await waitFor(() => screen.getByRole('button', { name: /close/i }));

        await userEvent.click(screen.getByRole('button', { name: /close/i }));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('does not load settings when closed', () => {
        render(<SettingsDialog {...defaultProps} open={false} />);
        expect(authService.getUserSettings).not.toHaveBeenCalled();
    });

    it('normalizes Spanish language variants', async () => {
        render(<SettingsDialog {...defaultProps} currentLanguage="es-MX" />);
        await waitFor(() => screen.getByRole('button', { name: /es/i }));
    });

    it('shows loading indicator', async () => {
        vi.mocked(authService.getUserSettings).mockImplementation(() => new Promise(() => { }));

        render(<SettingsDialog {...defaultProps} />);
        await waitFor(() => screen.getByRole('progressbar'));
    });

    it('disables checkbox while saving', async () => {
        vi.mocked(authService.updateUserSettings).mockImplementation(() => new Promise(() => { }));

        render(<SettingsDialog {...defaultProps} />);
        await waitFor(() => screen.getByRole('checkbox'));

        const checkbox = screen.getByRole('checkbox');
        await userEvent.click(checkbox);

        await waitFor(() => expect(checkbox).toBeDisabled());
    });

    it('does not change theme when clicking same value', async () => {
        render(<SettingsDialog {...defaultProps} mode="light" />);
        await waitFor(() => screen.getByRole('button', { name: /light/i }));

        await userEvent.click(screen.getByRole('button', { name: /light/i }));
        expect(defaultProps.onThemeModeChange).not.toHaveBeenCalled();
    });

    it('does not change language when clicking same value', async () => {
        render(<SettingsDialog {...defaultProps} currentLanguage="en" />);
        await waitFor(() => screen.getByRole('button', { name: /en/i }));

        await userEvent.click(screen.getByRole('button', { name: /en/i }));
        expect(defaultProps.onLanguageChange).not.toHaveBeenCalled();
    });

    it('renders with dark theme', async () => {
        const darkTheme = createTheme({ palette: { mode: 'dark' } });
        render(
            <ThemeProvider theme={darkTheme}>
                <SettingsDialog {...defaultProps} mode="dark" />
            </ThemeProvider>
        );
        await waitFor(() => screen.getByRole('dialog'));
    });
});
