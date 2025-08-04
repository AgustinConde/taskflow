import { describe, it, expect } from 'vitest';
import { render, screen } from '../../__tests__/utils/test-utils';
import ConfirmationDialog from './ConfirmationDialog';

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
