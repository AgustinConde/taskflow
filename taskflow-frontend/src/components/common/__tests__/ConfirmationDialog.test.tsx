import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material';
import ConfirmationDialog from '../ConfirmationDialog';
import { useConfirmationDialogIcon, useConfirmationDialogStyles } from '../ConfirmationDialog.hooks';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                cancel: 'Cancel',
                confirm: 'Confirm',
                deleting: 'Deleting',
            };
            return translations[key] || key;
        }
    })
}));

vi.mock('@mui/icons-material', () => ({
    Warning: () => <div data-testid="WarningIcon" />,
    Delete: () => <div data-testid="DeleteIcon" />
}));

function setupMocks() {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    return { onClose, onConfirm };
}

function renderConfirmationDialog(props = {}) {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        onConfirm: vi.fn(),
        title: 'Test Title',
        message: 'Test Message',
        ...props
    };

    return render(
        <QueryClientProvider client={new QueryClient()}>
            <ThemeProvider theme={createTheme()}>
                <ConfirmationDialog {...defaultProps} />
            </ThemeProvider>
        </QueryClientProvider>
    );
}

describe('ConfirmationDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Functionality', () => {
        it('should render dialog with title and message', () => {
            renderConfirmationDialog();

            expect(screen.getByText('Test Title')).toBeInTheDocument();
            expect(screen.getByText('Test Message')).toBeInTheDocument();
        });

        it('should not render when open is false', () => {
            renderConfirmationDialog({ open: false });

            expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
        });

        it('should render different dialog types', () => {
            const { rerender } = renderConfirmationDialog({ type: 'warning' });
            expect(screen.getByTestId('WarningIcon')).toBeInTheDocument();

            rerender(
                <QueryClientProvider client={new QueryClient()}>
                    <ThemeProvider theme={createTheme()}>
                        <ConfirmationDialog
                            open={true}
                            onClose={vi.fn()}
                            onConfirm={vi.fn()}
                            title="Delete Title"
                            message="Delete Message"
                            type="delete"
                        />
                    </ThemeProvider>
                </QueryClientProvider>
            );
            expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();

            rerender(
                <QueryClientProvider client={new QueryClient()}>
                    <ThemeProvider theme={createTheme()}>
                        <ConfirmationDialog
                            open={true}
                            onClose={vi.fn()}
                            onConfirm={vi.fn()}
                            title="Info Title"
                            message="Info Message"
                            type="info"
                        />
                    </ThemeProvider>
                </QueryClientProvider>
            );
            expect(screen.getByTestId('WarningIcon')).toBeInTheDocument();
        });

        it('should use default type when not specified', () => {
            renderConfirmationDialog({ type: undefined });
            expect(screen.getByTestId('WarningIcon')).toBeInTheDocument();
        });
    });

    describe('Dialog Actions', () => {
        it('should render cancel and confirm buttons', () => {
            renderConfirmationDialog();

            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
        });

        it('should show custom button text when provided', () => {
            renderConfirmationDialog({
                confirmText: 'Delete',
                cancelText: 'Keep'
            });

            expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /keep/i })).toBeInTheDocument();
        });

        it('should handle button clicks', () => {
            const mocks = setupMocks();
            renderConfirmationDialog(mocks);

            fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
            expect(mocks.onClose).toHaveBeenCalled();

            fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
            expect(mocks.onConfirm).toHaveBeenCalled();
        });

        it('should show loading state and disable buttons', () => {
            renderConfirmationDialog({ loading: true });

            const confirmButton = screen.getByRole('button', { name: /deleting/i });
            const cancelButton = screen.getByRole('button', { name: /cancel/i });

            expect(confirmButton).toBeDisabled();
            expect(cancelButton).toBeDisabled();
        });

        it('should use default texts when not provided', () => {
            renderConfirmationDialog({
                confirmText: undefined,
                cancelText: undefined
            });

            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
        });

        it('should handle null text values', () => {
            renderConfirmationDialog({
                confirmText: null,
                cancelText: null
            });

            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
        });
    });

    describe('Dialog Styling & Hooks', () => {
        it('should return correct icon props for delete type', () => {
            const { result } = renderHook(() => useConfirmationDialogIcon('delete'));
            const iconProps = result.current.getIconProps();

            expect(iconProps.iconType).toBe('delete');
            expect(iconProps.color).toBeDefined();
        });

        it('should return correct icon props for warning type', () => {
            const { result } = renderHook(() => useConfirmationDialogIcon('warning'));
            const iconProps = result.current.getIconProps();

            expect(iconProps.iconType).toBe('warning');
            expect(iconProps.color).toBeDefined();
        });

        it('should return correct icon props for info type', () => {
            const { result } = renderHook(() => useConfirmationDialogIcon('info'));
            const iconProps = result.current.getIconProps();

            expect(iconProps.iconType).toBe('warning');
            expect(iconProps.color).toBeDefined();
        });

        it('should return correct styles for delete type', () => {
            const { result } = renderHook(() => useConfirmationDialogStyles('delete'));
            const buttonColor = result.current.getConfirmButtonColor();
            const bgColor = result.current.getBackgroundColor();

            expect(buttonColor).toBe('error');
            expect(bgColor).toBe('error.50');
        });

        it('should return correct styles for warning type', () => {
            const { result } = renderHook(() => useConfirmationDialogStyles('warning'));
            const buttonColor = result.current.getConfirmButtonColor();
            const bgColor = result.current.getBackgroundColor();

            expect(buttonColor).toBe('warning');
            expect(bgColor).toBe('warning.50');
        });

        it('should return correct styles for info type', () => {
            const { result } = renderHook(() => useConfirmationDialogStyles('info'));
            const buttonColor = result.current.getConfirmButtonColor();

            expect(buttonColor).toBe('primary');
        });
    });
});
