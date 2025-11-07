import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Stack, FormControl, InputLabel, Select, MenuItem, Box
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../types/Category';
import type { TaskLocation } from '../../types/Location';
import { LocationPicker } from '../location';

interface TaskEditDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    categories: Category[];
    localTitle: string;
    setLocalTitle: (title: string) => void;
    localDescription: string;
    setLocalDescription: (description: string) => void;
    localDueDate: string;
    setLocalDueDate: (date: string) => void;
    localCategoryId: number | undefined;
    setLocalCategoryId: (id: number | undefined) => void;
    localLocation: TaskLocation | null;
    setLocalLocation: (location: TaskLocation | null) => void;
}

const TaskEditDialog = ({
    open,
    onClose,
    onSave,
    categories,
    localTitle,
    setLocalTitle,
    localDescription,
    setLocalDescription,
    localDueDate,
    setLocalDueDate,
    localCategoryId,
    setLocalCategoryId,
    localLocation,
    setLocalLocation
}: TaskEditDialogProps) => {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        /* v8 ignore next 3 */
                        background: theme => theme.palette.mode === 'dark'
                            ? `linear-gradient(145deg, ${theme.palette.background.paper})`
                            : `linear-gradient(145deg, ${theme.palette.background.paper})`,
                        boxShadow: 12,
                        minHeight: 400,
                        overflow: 'visible',
                        position: 'relative',
                        /* v8 ignore next 3 */
                        ...(theme => theme.palette.mode === 'dark' ? {
                            '--Paper-overlay': 'none !important',
                        } : {})
                    }
                }
            }}
        >
            <DialogTitle
                sx={{
                    textAlign: 'center',
                    position: 'relative',
                    background: theme => {
                        const start = theme.palette.mode === 'dark'
                            ? theme.palette.primary.dark
                            : theme.palette.primary.main;
                        const end = theme.palette.mode === 'dark'
                            ? (theme.palette.secondary.dark || theme.palette.secondary.main)
                            : theme.palette.secondary.main;
                        return `linear-gradient(135deg, ${start}, ${end})`;
                    },
                    color: theme => theme.palette.getContrastText(
                        theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main
                    ),
                    fontWeight: 700,
                    fontSize: '1.4rem',
                    py: 2.5,
                    textShadow: '0 1px 4px rgba(0,0,0,0.35)',
                    borderRadius: '12px 12px 0 0',
                    overflow: 'hidden',
                    boxShadow: theme => `0 10px 24px ${alpha(theme.palette.primary.main, 0.32)}`,
                    borderBottom: theme => `1px solid ${alpha(theme.palette.primary.main, 0.45)}`,
                    zIndex: 0,
                    '& > *': {
                        position: 'relative',
                        zIndex: 1
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 0,
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.18) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }
                }}
            >
                <EditOutlinedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('edit_task')}
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 3 }}>
                <Stack spacing={3} sx={{ mt: 2 }}>
                    <TextField
                        label={t('title')}
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                background: theme => alpha(theme.palette.background.paper, 0.8),
                                '&:hover': {
                                    boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                                },
                                '&.Mui-focused': {
                                    boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`
                                }
                            }
                        }}
                    />

                    <TextField
                        label={t('description')}
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                background: theme => alpha(theme.palette.background.paper, 0.8),
                                '&:hover': {
                                    boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                                },
                                '&.Mui-focused': {
                                    boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`
                                }
                            }
                        }}
                    />

                    <TextField
                        label={t('due_date')}
                        type="datetime-local"
                        value={localDueDate}
                        onChange={(e) => setLocalDueDate(e.target.value)}
                        fullWidth
                        variant="outlined"
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                background: theme => alpha(theme.palette.background.paper, 0.8),
                                '&:hover': {
                                    boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                                },
                                '&.Mui-focused': {
                                    boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`
                                }
                            }
                        }}
                    />

                    <FormControl fullWidth>
                        <InputLabel>{t('category')}</InputLabel>
                        <Select
                            value={localCategoryId || ''}
                            onChange={(e) => setLocalCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                            label={t('category')}
                            sx={{
                                borderRadius: 2,
                                background: theme => alpha(theme.palette.background.paper, 0.8),
                                '&:hover': {
                                    boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                                },
                                '&.Mui-focused': {
                                    boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`
                                }
                            }}
                        >
                            <MenuItem value="">
                                <em>{t('no_category')}</em>
                            </MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                backgroundColor: category.color || '#6366F1'
                                            }}
                                        />
                                        {category.name}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <LocationPicker
                        value={localLocation}
                        onChange={setLocalLocation}
                        placeholder={t('location.searchPlaceholder', 'Search for a place...')}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2.5, gap: 1, justifyContent: 'center' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        borderColor: theme => theme.palette.grey[400],
                        color: theme => theme.palette.text.secondary,
                        fontWeight: 600,
                        minWidth: 100,
                        '&:hover': {
                            borderColor: theme => theme.palette.grey[600],
                            background: theme => alpha(theme.palette.grey[500], 0.1)
                        }
                    }}
                >
                    {t('cancel')}
                </Button>

                <Button
                    onClick={onSave}
                    variant="contained"
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: 'white',
                        fontWeight: 600,
                        minWidth: 100,
                        boxShadow: 3,
                        '&:hover': {
                            background: theme => `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                            boxShadow: 6,
                            transform: 'translateY(-1px)'
                        }
                    }}
                >
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskEditDialog;
