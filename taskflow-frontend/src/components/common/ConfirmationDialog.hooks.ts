import { useTheme } from '@mui/material';
import type { ConfirmationDialogType } from './ConfirmationDialog.types';

export const useConfirmationDialogIcon = (type: ConfirmationDialogType) => {
    const theme = useTheme();

    const getIconProps = () => {
        switch (type) {
            case 'delete':
                return {
                    color: theme.palette.error.main,
                    iconType: 'delete' as const
                };
            case 'warning':
                return {
                    color: theme.palette.warning.main,
                    iconType: 'warning' as const
                };
            default:
                return {
                    color: theme.palette.info.main,
                    iconType: 'warning' as const
                };
        }
    };

    return { getIconProps };
};

export const useConfirmationDialogStyles = (type: ConfirmationDialogType) => {
    const getConfirmButtonColor = () => {
        switch (type) {
            case 'delete':
                return 'error' as const;
            case 'warning':
                return 'warning' as const;
            default:
                return 'primary' as const;
        }
    };

    const getBackgroundColor = () => {
        return type === 'delete' ? 'error.50' : 'warning.50';
    };

    return { getConfirmButtonColor, getBackgroundColor };
};
