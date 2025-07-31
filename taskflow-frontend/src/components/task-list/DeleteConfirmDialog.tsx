import { Box, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, useTheme } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from 'react-i18next';

interface DeleteConfirmDialogProps {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    loading: boolean;
}

const DeleteConfirmDialog = ({ open, onCancel, onConfirm, loading }: DeleteConfirmDialogProps) => {
    const theme = useTheme();
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            slotProps={{
                paper: {
                    sx: {
                        background: (theme) => theme.palette.mode === 'dark'
                            ? theme.palette.error.dark + 'ee'
                            : theme.palette.error.light + 'ee',
                        color: (theme) => theme.palette.getContrastText(theme.palette.error.main),
                        borderRadius: 3,
                        minWidth: 360,
                        boxShadow: 8,
                    }
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3 }}>
                <WarningAmberIcon sx={{
                    fontSize: 56,
                    color: theme.palette.error.main,
                    mb: 1,
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))'
                }} />
            </Box>

            <DialogTitle
                id="delete-dialog-title"
                sx={{
                    textAlign: 'center',
                    color: theme.palette.error.main,
                    fontWeight: 800,
                    fontSize: 24,
                    pb: 0
                }}
            >
                {t('confirmDelete')}
            </DialogTitle>

            <DialogContent>
                <DialogContentText
                    id="delete-dialog-description"
                    sx={{
                        textAlign: 'center',
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                        fontSize: 17,
                        mb: 1
                    }}
                >
                    {t('deleteMsg')}
                </DialogContentText>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                    onClick={onCancel}
                    disabled={loading}
                    color="inherit"
                    variant="outlined"
                    sx={{
                        minWidth: 100,
                        fontWeight: 600,
                        borderColor: theme.palette.error.main,
                        color: theme.palette.error.main,
                        '&:hover': {
                            borderColor: theme.palette.error.dark,
                            background: theme.palette.error.light + '33'
                        }
                    }}
                >
                    {t('cancel')}
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={loading}
                    autoFocus
                    sx={{
                        minWidth: 120,
                        fontWeight: 700,
                        boxShadow: 2
                    }}
                >
                    {loading ? t('deleting') : t('delete')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmDialog;
