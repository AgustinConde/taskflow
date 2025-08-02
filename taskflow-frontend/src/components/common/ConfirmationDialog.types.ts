export type ConfirmationDialogType = 'delete' | 'warning' | 'info';

export interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmationDialogType;
    loading?: boolean;
}

export const CONFIRMATION_DIALOG_CONSTANTS = {
    ICON_SIZE: 48,
    ICON_SIZE_LARGE: 56,
    MIN_BUTTON_WIDTH: 100,
    BORDER_RADIUS: 2,
} as const;
