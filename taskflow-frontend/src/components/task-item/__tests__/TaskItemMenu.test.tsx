import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material';
import TaskItemMenu from '../TaskItemMenu';

vi.mock('react-i18next', () => ({
    __esModule: true,
    useTranslation: () => ({ t: (key: string) => key })
}));

const renderMenu = (props = {}) => {
    const defaultProps = {
        anchorEl: null,
        menuOpen: false,
        onMenuOpen: vi.fn(),
        onMenuClose: vi.fn(),
        onInfoOpen: vi.fn(),
        onEditOpen: vi.fn(),
        onDelete: vi.fn(),
        ...props
    };

    return {
        ...render(
            <QueryClientProvider client={new QueryClient()}>
                <ThemeProvider theme={createTheme()}>
                    <TaskItemMenu {...defaultProps} />
                </ThemeProvider>
            </QueryClientProvider>
        ),
        props: defaultProps
    };
};

describe('TaskItemMenu', () => {
    const anchor = document.createElement('div');

    beforeEach(() => vi.clearAllMocks());

    it('renders menu button', () => {
        renderMenu();
        expect(screen.getByRole('button', { name: /more/i })).toBeInTheDocument();
    });

    it('opens menu on button click', async () => {
        const { props } = renderMenu();
        await userEvent.click(screen.getByRole('button'));
        expect(props.onMenuOpen).toHaveBeenCalledOnce();
    });

    it('shows menu items when open', () => {
        renderMenu({ menuOpen: true, anchorEl: anchor });
        expect(screen.getByText('info')).toBeInTheDocument();
        expect(screen.getByText('edit')).toBeInTheDocument();
        expect(screen.getByText('delete')).toBeInTheDocument();
    });

    it('hides menu items when closed', () => {
        renderMenu({ menuOpen: false });
        expect(screen.queryByText('info')).not.toBeInTheDocument();
    });

    it('handles info click', async () => {
        const { props } = renderMenu({ menuOpen: true, anchorEl: anchor });
        await userEvent.click(screen.getByText('info'));
        expect(props.onInfoOpen).toHaveBeenCalledOnce();
        expect(props.onMenuClose).toHaveBeenCalledOnce();
    });

    it('handles edit click', async () => {
        const { props } = renderMenu({ menuOpen: true, anchorEl: anchor });
        await userEvent.click(screen.getByText('edit'));
        expect(props.onEditOpen).toHaveBeenCalledOnce();
        expect(props.onMenuClose).toHaveBeenCalledOnce();
    });

    it('handles delete click', async () => {
        const { props } = renderMenu({ menuOpen: true, anchorEl: anchor });
        await userEvent.click(screen.getByText('delete'));
        expect(props.onDelete).toHaveBeenCalledOnce();
        expect(props.onMenuClose).toHaveBeenCalledOnce();
    });
});
