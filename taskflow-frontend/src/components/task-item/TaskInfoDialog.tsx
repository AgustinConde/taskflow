import {
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Button, Chip, Stack, Typography, Box, Alert, AlertTitle, useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Task } from '../../types/Task';

interface TaskInfoDialogProps {
    open: boolean;
    onClose: () => void;
    task: Task;
}

const TaskInfoDialog = ({ open, onClose, task }: TaskInfoDialogProps) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            slotProps={{
                paper: {
                    sx: theme.palette.mode === 'dark' ? {
                        '--Paper-overlay': 'none !important',
                    } : {}
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> {/* v8 ignore next */}
                {task.title}
                <Chip
                    label={task.isCompleted ? t('completed') : t('pending')}
                    variant="filled"
                    color={task.isCompleted ? "primary" : "default"}
                    sx={{ borderRadius: '4px', height: '24px', fontSize: '0.7rem', opacity: 0.8, fontWeight: 600 }}
                />
            </DialogTitle>
            <DialogContent>
                <DialogContentText component="div">
                    <Stack direction="row" spacing={1} justifyContent={'space-between'}>
                        <Stack>
                            <Typography fontSize='0.7rem' fontWeight={600}>
                                {t('created')}
                            </Typography>
                            <Typography fontSize='0.79rem'>
                                {task.createdAt ? new Date(task.createdAt).toLocaleString(undefined, {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }) : '-'}
                            </Typography>
                        </Stack>

                        <Stack>
                            <Typography fontSize='0.7rem' fontWeight={600} textAlign='right'>
                                {t('due')}
                            </Typography>
                            <Typography fontSize='0.79rem'>
                                {task.dueDate ? new Date(task.dueDate).toLocaleString(undefined, {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }) : '-'}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Box component="span" sx={{
                        display: 'block',
                        whiteSpace: 'pre-line',
                        textAlign: 'justify',
                        mt: 2,
                        mb: 0,
                        wordBreak: 'break-word'
                    }}>
                        <Alert icon={false} sx={{
                            bgcolor: theme => theme.palette.mode === 'light'
                                ? '#dacffc'
                                : theme.palette.primary.main,
                            color: 'text.primary'
                        }}>
                            <AlertTitle sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                                {t('description')}
                            </AlertTitle>
                            {task.description || '-'}
                        </Alert>
                    </Box>
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ pt: 1, pb: 2 }}>
                <Button /* v8 ignore next */
                    onClick={onClose}
                    autoFocus
                    sx={theme => ({
                        color: theme.palette.mode === 'dark'
                            ? theme.palette.primary.light
                            : theme.palette.primary.main,
                        fontWeight: 600
                    })}
                >
                    {t('close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskInfoDialog;
