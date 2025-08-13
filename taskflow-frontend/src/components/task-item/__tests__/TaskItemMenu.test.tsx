import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material';
import TaskItemMenu from '../TaskItemMenu';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                more: 'More',
                info: 'Info',
                edit: 'Edit',
                delete: 'Delete'
            };
            return translations[key] || key;
        }
    })
}));

vi.mock('@mui/icons-material', () => ({
    MoreVert: () => <div data-testid="MoreVertIcon" />,
    InfoOutlined: () => <div data-testid="InfoOutlinedIcon" />,
    EditOutlined: () => <div data-testid="EditOutlinedIcon" />,
    DeleteOutline: () => <div data-testid="DeleteOutlineIcon" />
}));

function setupMocks() {
    const onMenuOpen = vi.fn();
    const onMenuClose = vi.fn();
    const onInfoOpen = vi.fn();
    const onEditOpen = vi.fn();
    const onDelete = vi.fn();
    return { onMenuOpen, onMenuClose, onInfoOpen, onEditOpen, onDelete };
}

function renderTaskItemMenu(props = {}) {
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

    return render(
        <QueryClientProvider client={new QueryClient()}>
            <ThemeProvider theme={createTheme()}>
                <TaskItemMenu {...defaultProps} />
            </ThemeProvider>
        </QueryClientProvider>
    );
}

describe('TaskItemMenu', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Functionality', () => {
        it('should render menu button', () => {
            renderTaskItemMenu();

            const menuButton = screen.getByRole('button', { name: /more/i });
            expect(menuButton).toBeInTheDocument();
            expect(screen.getByTestId('MoreVertIcon')).toBeInTheDocument();
        });

        it('should call onMenuOpen when menu button clicked', async () => {
            const mocks = setupMocks();
            renderTaskItemMenu(mocks);

            const menuButton = screen.getByRole('button', { name: /more/i });
            await userEvent.click(menuButton);

            expect(mocks.onMenuOpen).toHaveBeenCalled();
        });

        it('should render menu when open', () => {
            const anchorEl = document.createElement('div');
            renderTaskItemMenu({ menuOpen: true, anchorEl });

            expect(screen.getByText('Info')).toBeInTheDocument();
            expect(screen.getByText('Edit')).toBeInTheDocument();
            expect(screen.getByText('Delete')).toBeInTheDocument();
        });

        it('should not render menu when closed', () => {
            renderTaskItemMenu({ menuOpen: false });

            expect(screen.queryByText('Info')).not.toBeInTheDocument();
            expect(screen.queryByText('Edit')).not.toBeInTheDocument();
            expect(screen.queryByText('Delete')).not.toBeInTheDocument();
        });
    });

    describe('Menu Actions', () => {
        it('should handle info click', async () => {
            const mocks = setupMocks();
            const anchorEl = document.createElement('div');
            renderTaskItemMenu({ ...mocks, menuOpen: true, anchorEl });

            const infoItem = screen.getByText('Info');
            await userEvent.click(infoItem);

            expect(mocks.onInfoOpen).toHaveBeenCalled();
            expect(mocks.onMenuClose).toHaveBeenCalled();
        });

        it('should handle edit click', async () => {
            const mocks = setupMocks();
            const anchorEl = document.createElement('div');
            renderTaskItemMenu({ ...mocks, menuOpen: true, anchorEl });

            const editItem = screen.getByText('Edit');
            await userEvent.click(editItem);

            expect(mocks.onEditOpen).toHaveBeenCalled();
            expect(mocks.onMenuClose).toHaveBeenCalled();
        });

        it('should handle delete click', async () => {
            const mocks = setupMocks();
            const anchorEl = document.createElement('div');
            renderTaskItemMenu({ ...mocks, menuOpen: true, anchorEl });

            const deleteItem = screen.getByText('Delete');
            await userEvent.click(deleteItem);

            expect(mocks.onDelete).toHaveBeenCalled();
            expect(mocks.onMenuClose).toHaveBeenCalled();
        });
    });

    describe('Menu Behavior', () => {
        it('should render all menu icons', () => {
            const anchorEl = document.createElement('div');
            renderTaskItemMenu({ menuOpen: true, anchorEl });

            expect(screen.getByTestId('InfoOutlinedIcon')).toBeInTheDocument();
            expect(screen.getByTestId('EditOutlinedIcon')).toBeInTheDocument();
            expect(screen.getByTestId('DeleteOutlineIcon')).toBeInTheDocument();
        });

        it('should handle menu positioning', () => {
            const anchorEl = document.createElement('div');
            renderTaskItemMenu({ menuOpen: true, anchorEl });

            const menu = screen.getByRole('menu');
            expect(menu).toBeInTheDocument();
        });

        it('should handle anchor element properly', () => {
            const anchorEl = document.createElement('div');
            renderTaskItemMenu({ menuOpen: true, anchorEl });

            expect(screen.getByRole('menu')).toBeInTheDocument();
        });
    });
});
