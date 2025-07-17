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
    const [localDate, setLocalDate] = React.useState(task.createdAt.slice(0, 10));
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

    React.useEffect(() => {
        if (editing) {
            setLocalTitle(task.title);
            setLocalDescription(task.description || "");
            setLocalDate(task.createdAt.slice(0, 10));
            setLocalDueDate(task.dueDate ? toLocalInputDateTime(task.dueDate) : "");
        }
    }, [editing, task]);
    let bgColor: ((theme: import('@mui/material/styles').Theme) => string) | undefined = undefined;
    if (task.isCompleted) {
        bgColor = (theme) => alpha(theme.palette.success.light || '#BBF7D0', 0.55);
    } else if (task.dueDate) {
        const now = new Date();
        const due = new Date(task.dueDate);
        const diffMs = due.getTime() - now.getTime();
        const diffHrs = diffMs / (1000 * 60 * 60);
        if (diffHrs < 3) {
            bgColor = (theme) => alpha(theme.palette.error.main, 0.45);
        } else if (diffHrs < 24) {
            bgColor = (theme) => alpha(theme.palette.error.light, 0.25);
        } else if (diffHrs < 72) {
            bgColor = (theme) => alpha(theme.palette.warning.light, 0.25);
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
        <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, backgroundColor: bgColor }}>
            {editing ? (
                <>
                    <TextField
                        value={localTitle}
                        onChange={e => setLocalTitle(e.target.value)}
                        slotProps={{ htmlInput: { maxLength: 100 } }}
                        label={t('title')}
                        sx={{ minWidth: 120 }}
                    />
                    <TextField
                        value={localDescription}
                        onChange={e => setLocalDescription(e.target.value)}
                        slotProps={{ htmlInput: { maxLength: 500 } }}
                        label={t('description')}
                        sx={{ minWidth: 160 }}
                    />
                    <Box sx={{ minWidth: 120, display: 'flex', alignItems: 'center', pl: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            {t('created')}: {new Date(task.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                            })}
                        </Typography>
                    </Box>
                    <TextField
                        type="datetime-local"
                        value={localDueDate}
                        onChange={e => setLocalDueDate(e.target.value)}
                        label={t('due')}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ minWidth: 160 }}
                    />
                    <Stack direction="row" spacing={1}>
                        <Button onClick={() => onEditSave({
                            ...task,
                            title: localTitle,
                            description: localDescription,
                            dueDate: localDueDate ? localDateTimeToUTCISOString(localDueDate) : null,
                        })} variant="contained" color="primary">
                            {t('save')}
                        </Button>
                        <Button onClick={onEditCancel} variant="contained" color="error">
                            {t('cancel')}
                        </Button>
                    </Stack>
                </>
            ) : (
                <>
                    <Checkbox
                        checked={task.isCompleted}
                        onChange={onToggleCompleted}
                        color="secondary"
                        sx={{ mr: 1 }}
                    />
                    <Typography variant="subtitle1" sx={{ textDecoration: task.isCompleted ? 'line-through' : 'none', flex: 1 }}>
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
                    <Box sx={{ minWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                        {task.dueDate ? (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                ({t('due')}: {new Date(task.dueDate).toLocaleString(undefined, {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })})
                            </Typography>
                        ) : (
                            <Box sx={{ width: '100%', height: 20, ml: 1 }} />
                        )}
                    </Box>
                    <Box sx={{ minWidth: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', ml: 1 }}>
                        {task.isCompleted ? (
                            <Typography color="primary.main">✔️</Typography>
                        ) : (
                            <Box sx={{ width: 20, height: 20 }} />
                        )}
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button onClick={onEdit} variant="contained" color="primary">
                            {t('edit')}
                        </Button>
                        <Button onClick={onDelete} variant="contained" color="error">
                            {t('delete')}
                        </Button>
                    </Stack>
                </>
            )}
        </Paper>
    );
});

export default TaskItem;
