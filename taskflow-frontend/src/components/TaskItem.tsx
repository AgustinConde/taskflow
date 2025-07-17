import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Paper, Checkbox, Typography, Box, Stack, Button, TextField } from "@mui/material";
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
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };
    const [localDueDate, setLocalDueDate] = React.useState(task.dueDate ? toLocalInputDateTime(task.dueDate) : "");
    const [localCreatedAt, setLocalCreatedAt] = React.useState(task.createdAt ? toLocalInputDateTime(task.createdAt) : "");

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
        bgColor = (theme) => alpha(theme.palette.primary.light, 0.75);
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

    const localDateTimeToUTCISOString = (local: string) => {
        if (!local) return null;
        const [datePart, timePart] = local.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        const dt = new Date(year, month - 1, day, hour, minute);
        return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
    };

    return (
        <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, backgroundColor: bgColor, flexWrap: 'nowrap', overflowX: 'auto' }}>
            {editing ? (
                <>
                    <TextField
                        value={localTitle}
                        onChange={e => setLocalTitle(e.target.value)}
                        slotProps={{ htmlInput: { maxLength: 100 } }}
                        label={t('title')}
                        sx={{ minWidth: 100, maxWidth: 180, flex: '1 1 100px' }}
                        inputProps={{ style: { textOverflow: 'ellipsis' } }}
                    />
                    <TextField
                        value={localDescription}
                        onChange={e => setLocalDescription(e.target.value)}
                        slotProps={{ htmlInput: { maxLength: 500 } }}
                        label={t('description')}
                        sx={{ minWidth: 120, maxWidth: 220, flex: '2 1 120px' }}
                        inputProps={{ style: { textOverflow: 'ellipsis' } }}
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
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>
                        {task.title}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            flex: 2,
                            maxWidth: 260,
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
                    <Box sx={{ minWidth: 320, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 160, ml: 1 }}>
                            {t('created')}: {task.createdAt ? new Date(task.createdAt).toLocaleString(undefined, {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                            }) : ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140, ml: 2 }}>
                            {task.dueDate
                                ? `(${t('due')}: ${new Date(task.dueDate).toLocaleString(undefined, {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })})`
                                : '\u00A0'}
                        </Typography>
                    </Box>
                    <Box sx={{ minWidth: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', ml: 1 }}>
                        {task.isCompleted ? (
                            <Typography color="primary.main">✔️</Typography>
                        ) : (
                            <Box sx={{ width: 20, height: 20 }} />
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                        <Stack direction="row" spacing={1} sx={{ minWidth: 120, maxWidth: 160 }}>
                            <Button onClick={onEdit} variant="contained" color="primary" sx={{ minWidth: 70, maxWidth: 90, px: 1, fontSize: 14 }}>
                                {t('edit')}
                            </Button>
                            <Button onClick={onDelete} variant="contained" color="error" sx={{ minWidth: 70, maxWidth: 90, px: 1, fontSize: 14 }}>
                                {t('delete')}
                            </Button>
                        </Stack>
                    </Box>
                </>
            )}
        </Paper>
    );
});

export default TaskItem;
