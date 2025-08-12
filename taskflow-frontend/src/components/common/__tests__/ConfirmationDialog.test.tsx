import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { render, screen } from '../../../__tests__/utils/test-utils';
import ConfirmationDialog from '../ConfirmationDialog';
import { useConfirmationDialogIcon, useConfirmationDialogStyles } from '../ConfirmationDialog.hooks';

describe('ConfirmationDialog', () => {
    const defaultProps = {
        open: true,
        onClose: () => { },
        onConfirm: () => { },
        title: 'Test Title',
        message: 'Test Message',
    };

    it('should render dialog with title and message', () => {
        render(<ConfirmationDialog {...defaultProps} />);

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Message')).toBeInTheDocument();
    });

    it('should render cancel and confirm buttons', () => {
        render(<ConfirmationDialog {...defaultProps} />);

        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
        render(<ConfirmationDialog {...defaultProps} open={false} />);

        expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('should show custom button text when provided', () => {
        render(
            <ConfirmationDialog
                {...defaultProps}
                confirmText="Delete"
                cancelText="Keep"
            />
        );

        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /keep/i })).toBeInTheDocument();
    });

    it('should show loading state', () => {
        render(<ConfirmationDialog {...defaultProps} loading={true} />);

        const confirmButton = screen.getByRole('button', { name: /deleting/i });
        expect(confirmButton).toBeDisabled();
    });
});

describe('ConfirmationDialog Hooks', () => {
    describe('useConfirmationDialogIcon', () => {
        it('should return delete icon props for delete type', () => {
            const { result } = renderHook(() => useConfirmationDialogIcon('delete'));
            const iconProps = result.current.getIconProps();

            expect(iconProps.iconType).toBe('delete');
            expect(iconProps.color).toBeDefined();
        });

        it('should return warning icon props for warning type', () => {
            const { result } = renderHook(() => useConfirmationDialogIcon('warning'));
            const iconProps = result.current.getIconProps();

            expect(iconProps.iconType).toBe('warning');
            expect(iconProps.color).toBeDefined();
        });

        it('should return info icon props for info type', () => {
            const { result } = renderHook(() => useConfirmationDialogIcon('info'));
            const iconProps = result.current.getIconProps();

            expect(iconProps.iconType).toBe('warning');
            expect(iconProps.color).toBeDefined();
        });
    });

    describe('useConfirmationDialogStyles', () => {
        it('should return error button color for delete type', () => {
            const { result } = renderHook(() => useConfirmationDialogStyles('delete'));
            const buttonColor = result.current.getConfirmButtonColor();
            const bgColor = result.current.getBackgroundColor();

            expect(buttonColor).toBe('error');
            expect(bgColor).toBe('error.50');
        });

        it('should return warning button color for warning type', () => {
            const { result } = renderHook(() => useConfirmationDialogStyles('warning'));
            const buttonColor = result.current.getConfirmButtonColor();
            const bgColor = result.current.getBackgroundColor();

            expect(buttonColor).toBe('warning');
            expect(bgColor).toBe('warning.50');
        });

        it('should return primary button color for info type', () => {
            const { result } = renderHook(() => useConfirmationDialogStyles('info'));
            const buttonColor = result.current.getConfirmButtonColor();

            expect(buttonColor).toBe('primary');
        });
    });
});
