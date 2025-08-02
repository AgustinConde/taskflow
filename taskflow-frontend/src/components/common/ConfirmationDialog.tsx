import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
} from '@mui/material';
import { Warning, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { ConfirmationDialogProps } from './ConfirmationDialog.types';
import { CONFIRMATION_DIALOG_CONSTANTS } from './ConfirmationDialog.types';
import { useConfirmationDialogIcon, useConfirmationDialogStyles } from './ConfirmationDialog.hooks';

const ConfirmationDialog = React.memo<ConfirmationDialogProps>(({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    type = 'warning',
    loading = false
}) => {
    const { t } = useTranslation();
    const { getIconProps } = useConfirmationDialogIcon(type);
    const { getConfirmButtonColor, getBackgroundColor } = useConfirmationDialogStyles(type);

    const iconProps = getIconProps();

    const renderIcon = () => {
        const iconSize = type === 'delete'
            ? CONFIRMATION_DIALOG_CONSTANTS.ICON_SIZE_LARGE
            : CONFIRMATION_DIALOG_CONSTANTS.ICON_SIZE;

        const iconStyle = {
            color: iconProps.color,
            fontSize: iconSize
        };

        return iconProps.iconType === 'delete'
            ? <Delete sx={iconStyle} />
            : <Warning sx={iconStyle} />;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: CONFIRMATION_DIALOG_CONSTANTS.BORDER_RADIUS,
                        overflow: 'hidden'
                    }
                }
            }}
        >
            <DialogTitle sx={{
                textAlign: 'center',
                pb: 2,
                pt: 3,
                backgroundColor: getBackgroundColor()
            }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    {renderIcon()}
                    <Typography
                        variant="h5"
                        component="div"
                        fontWeight="800"
                        sx={{
                            color: type === 'delete' ? 'error.main' : 'warning.main',
                            letterSpacing: '0.02em'
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions sx={{
                justifyContent: 'center',
                gap: 2,
                px: 3,
                pb: 3
            }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={loading}
                    sx={{ minWidth: CONFIRMATION_DIALOG_CONSTANTS.MIN_BUTTON_WIDTH }}
                >
                    {cancelText || t('cancel')}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={getConfirmButtonColor()}
                    disabled={loading}
                    sx={{ minWidth: CONFIRMATION_DIALOG_CONSTANTS.MIN_BUTTON_WIDTH }}
                >
                    {loading ? t('deleting') + '...' : (confirmText || t('confirm'))}
                </Button>
            </DialogActions>
        </Dialog>
    );
});

ConfirmationDialog.displayName = 'ConfirmationDialog';

export default ConfirmationDialog;
