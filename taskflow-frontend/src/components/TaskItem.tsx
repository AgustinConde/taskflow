import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Paper, Checkbox, Typography, Box, Stack, Button, TextField, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Alert, Chip, AlertTitle, useTheme } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { alpha } from "@mui/material/styles";
import type { Task } from "../types/Task";

export interface TaskItemProps {
    task: Task;
    editing: boolean;
    onEdit: () => void;
    onEditSave: (updated: Task) => void;
    onEditCancel: () => void;
    onDelete: () => void;
    onToggleCompleted: () => void;
}


const TaskItem: React.FC<TaskItemProps> = memo(({
    task,
    editing,
    onEdit,
    onEditSave,
    onEditCancel,
    onDelete,
    onToggleCompleted,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [localTitle, setLocalTitle] = React.useState(task.title);
    const [localDescription, setLocalDescription] = React.useState(task.description || "");
    const toLocalInputDateTime = (utcString: string) => {
        if (!utcString) return "";
        const date = new Date(utcString);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const yyyy = date.getFullYear();
        const mm = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const hh = pad(date.getHours());
        const min = pad(date.getMinutes());
        const result = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
        return result;
    };
    const [localDueDate, setLocalDueDate] = React.useState(task.dueDate ? toLocalInputDateTime(task.dueDate) : "");
    const [localCreatedAt, setLocalCreatedAt] = React.useState(task.createdAt ? toLocalInputDateTime(task.createdAt) : "");

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [infoOpen, setInfoOpen] = React.useState(false);
    const menuOpen = Boolean(anchorEl);

    React.useEffect(() => {
        if (editing) {
            setLocalTitle(task.title);
            setLocalDescription(task.description || "");
            setLocalDueDate(task.dueDate ? toLocalInputDateTime(task.dueDate) : "");
            setLocalCreatedAt(task.createdAt ? toLocalInputDateTime(task.createdAt) : "");
        }
    }, [editing, task]);
    let bgColor: ((theme: import('@mui/material/styles').Theme) => string) | undefined = undefined;
    if (task.isCompleted) {
        bgColor = (theme) => alpha(theme.palette.primary.main, 0.75);
    } else if (task.dueDate) {
        const now = new Date();
        const due = new Date(task.dueDate);
        const diffMs = due.getTime() - now.getTime();
        const diffHrs = diffMs / (1000 * 60 * 60);
        if (diffMs < 0) {
            bgColor = (theme) => alpha(theme.palette.error.main, 0.7);
        } else if (diffHrs < 3) {
            bgColor = (theme) => alpha(theme.palette.error.light, 0.4);
        } else if (diffHrs < 24) {
            bgColor = (theme) => alpha(theme.palette.warning.main, 0.3);
        }
    }

    if (!bgColor) {
        bgColor = (theme) => theme.palette.background.paper;
    }

    const localDateTimeToUTCISOString = (local: string) => {
        if (!local) return null;
        const utcDate = new Date(local).toISOString();
        return utcDate;
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const handleInfoOpen = () => {
        setInfoOpen(true);
        handleMenuClose();
    };
    const handleInfoClose = () => {
        setInfoOpen(false);
    };

    return (
        <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, backgroundColor: bgColor, flexWrap: 'nowrap', overflowX: 'auto' }}>
            {editing ? (
                <>
                    <TextField
                        value={localTitle}
                        onChange={e => setLocalTitle(e.target.value)}
                        slotProps={{ htmlInput: { maxLength: 100, style: { textOverflow: 'ellipsis' } } }}
                        label={t('title')}
                        sx={{ minWidth: 100, maxWidth: 180, flex: '1 1 100px' }}
                    />
                    <TextField
                        value={localDescription}
                        onChange={e => setLocalDescription(e.target.value)}
                        slotProps={{ htmlInput: { maxLength: 500, style: { textOverflow: 'ellipsis' } } }}
                        label={t('description')}
                        sx={{ minWidth: 120, maxWidth: 220, flex: '2 1 120px' }}
                    />
                    <TextField
                        type="datetime-local"
                        value={localDueDate}
                        onChange={e => setLocalDueDate(e.target.value)}
                        label={t('due')}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ minWidth: 120, maxWidth: 180, flex: '1 1 120px' }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                        <Stack direction="row" spacing={1} sx={{ minWidth: 120, maxWidth: 160 }}>
                            <Button onClick={() => onEditSave({
                                ...task,
                                title: localTitle,
                                description: localDescription,
                                dueDate: localDueDate ? localDateTimeToUTCISOString(localDueDate) : null,
                            })} variant="contained" color="primary" sx={{ minWidth: 70, maxWidth: 90, px: 1, fontSize: 14 }}>
                                {t('save')}
                            </Button>
                            <Button onClick={onEditCancel} variant="contained" color="error" sx={{ minWidth: 70, maxWidth: 90, px: 1, fontSize: 14 }}>
                                {t('cancel')}
                            </Button>
                        </Stack>
                    </Box>
                </>
            ) : (
                <>
                    <Checkbox
                        checked={task.isCompleted}
                        onChange={onToggleCompleted}
                        color="secondary"
                        sx={{ mr: 1 }}
                    />
                    <Typography variant="subtitle1" sx={{ flex: 1, minWidth: 80, maxWidth: 180 }}>
                        {task.title}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            flex: 3,
                            minWidth: 120,
                            maxWidth: 340,
                            whiteSpace: 'pre-line',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                        title={task.description}
                    >
                        {task.description}
                    </Typography>
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={handleMenuOpen} aria-label="more" size="small">
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={handleMenuClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem onClick={handleInfoOpen}>
                                <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> {t('info')}
                            </MenuItem>
                            <MenuItem onClick={() => { handleMenuClose(); onEdit(); }}>
                                <EditOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> {t('edit')}
                            </MenuItem>
                            <MenuItem onClick={() => { handleMenuClose(); onDelete(); }}>
                                <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> {t('delete')}
                            </MenuItem>
                        </Menu>
                        <Dialog 
                            open={infoOpen} 
                            onClose={handleInfoClose} 
                            maxWidth="xs" 
                            fullWidth
                            slotProps={{
                                paper: {
                                    sx: theme.palette.mode === 'dark' ? {
                                        '--Paper-overlay': 'none'
                                    } : {}
                                }
                            }}
                        >
                            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                        <Stack >
                                            <Typography fontSize='0.7rem' fontWeight={600}>{t('created')}</Typography>
                                            <Typography fontSize='0.79rem'>
                                                {task.createdAt ? new Date(task.createdAt).toLocaleString(undefined, {
                                                    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                                                }) : '-'}
                                            </Typography>
                                        </Stack>
                                        <Stack >
                                            <Typography fontSize='0.7rem' fontWeight={600} textAlign='right'>{t('due')}</Typography>
                                            <Typography fontSize='0.79rem'>
                                                {task.dueDate ? new Date(task.dueDate).toLocaleString(undefined, {
                                                    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                                                }) : '-'}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                    <Box component="span" sx={{ display: 'block', whiteSpace: 'pre-line', textAlign: 'justify', mt: 0.5, mb: 1, wordBreak: 'break-word' }}>
                                        <Alert icon={false} sx={{
                                            bgcolor: theme => theme.palette.mode === 'light' ? '#dacffc' : theme.palette.primary.main,
                                            color: 'text.primary'
                                        }}>
                                            <AlertTitle sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{t('description')}</AlertTitle>
                                            {task.description || '-'}
                                        </Alert>
                                    </Box>
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleInfoClose}
                                    autoFocus
                                    sx={theme => ({
                                        color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
                                        fontWeight: 600
                                    })}
                                >
                                    {t('close')}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                </>
            )}
        </Paper>
    );
});

export default TaskItem;
