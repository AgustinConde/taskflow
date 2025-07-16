import React, { useEffect, useState } from "react";
import type { Task } from "../types/Task";
import { Box, Button, Stack, TextField, Typography, Select, MenuItem, Paper, Snackbar, Alert, Checkbox, AppBar, Toolbar } from "@mui/material";
import { alpha } from '@mui/material/styles';
import ChecklistIcon from '@mui/icons-material/Checklist';

const API_URL = "http://localhost:5149/api/tasks";

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDate, setEditDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [editDueDate, setEditDueDate] = useState("");
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
    const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt'>('dueDate');
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState<string | null>(null);

    const fetchTasks = () => {
        setLoading(true);
        fetch(API_URL)
            .then((res) => res.json())
            .then((data) => {
                setTasks(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching tasks:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError(null);
        const newTask = {
            title,
            description,
            isCompleted: false,
            createdAt: new Date().toISOString(),
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        };
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData?.title || "Error creating task");
            }
            setTitle("");
            setDescription("");
            setDueDate("");
            fetchTasks();
            showToast("Task created successfully!");
        } catch (err: any) {
            setError(err.message || "Error creating task");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error deleting task");
            fetchTasks();
            showToast("Task deleted successfully!");
        } catch (err: any) {
            setError(err.message || "Error deleting task");
        }
    };

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

    const handleEdit = (task: Task) => {
        setEditingId(task.id);
        setEditTitle(task.title);
        setEditDescription(task.description || "");
        setEditDate(task.createdAt.slice(0, 10)); // YYYY-MM-DD
        setEditDueDate(task.dueDate ? toLocalInputDateTime(task.dueDate) : "");
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditTitle("");
        setEditDescription("");
        setEditDate("");
        setEditDueDate("");
    };


    const localDateTimeToUTCISOString = (local: string) => {
        if (!local) return null;
        const [datePart, timePart] = local.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        const dt = new Date(year, month - 1, day, hour, minute);
        return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
    };

    const handleEditSave = async (task: Task) => {
        setError(null);
        try {
            const updatedTask = {
                ...task,
                title: editTitle,
                description: editDescription,
                createdAt: editDate ? new Date(editDate).toISOString() : task.createdAt,
                dueDate: editDueDate ? localDateTimeToUTCISOString(editDueDate) : null,
            };
            const res = await fetch(`${API_URL}/${task.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTask),
            });
            if (!res.ok) throw new Error("Error updating task");
            setEditingId(null);
            setEditTitle("");
            setEditDescription("");
            setEditDate("");
            setEditDueDate("");
            fetchTasks();
            showToast("Task updated successfully!");
        } catch (err: any) {
            setError(err.message || "Error updating task");
        }
    };

    const handleToggleCompleted = async (task: Task) => {
        setError(null);
        try {
            const updatedTask = {
                ...task,
                isCompleted: !task.isCompleted,
            };
            const res = await fetch(`${API_URL}/${task.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTask),
            });
            if (!res.ok) throw new Error("Error updating task");
            fetchTasks();
        } catch (err: any) {
            setError(err.message || "Error updating task");
        }
    };

    const filteredTasks = tasks
        .filter(task => {
            if (search.trim() !== "") {
                const text = (task.title + " " + (task.description || "")).toLowerCase();
                if (!text.includes(search.toLowerCase())) return false;
            }
            if (filter === 'completed') return task.isCompleted;
            if (filter === 'pending') return !task.isCompleted;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'dueDate') {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return a.dueDate.localeCompare(b.dueDate);
            } else {
                return a.createdAt.localeCompare(b.createdAt);
            }
        });

    if (loading) return <Typography align="center" variant="h6" sx={{ mt: 8 }}>Loading...</Typography>;

    return (
        <Box sx={{ maxWidth: 900, margin: "0 auto", padding: 2 }}>
            <AppBar
                position="static"
                elevation={3}
                sx={{
                    borderRadius: 2,
                    mb: 4,
                    background: theme => `linear-gradient(90deg, ${theme.palette.primary.main} 60%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: 4,
                }}
            >
                <Toolbar sx={{ justifyContent: 'center', minHeight: 72, pt: 1 }}>
                    <ChecklistIcon sx={{ fontSize: 38, mr: 2, color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))' }} />
                    <Typography
                        variant="h4"
                        fontWeight={800}
                        letterSpacing={2}
                        sx={{
                            color: 'white',
                            textShadow: '0 2px 8px rgba(0,0,0,0.10)',
                            fontFamily: 'Montserrat, Roboto, Arial',
                        }}
                    >
                        TaskFlow
                    </Typography>
                </Toolbar>
            </AppBar>
            <Paper elevation={3} sx={{ mb: 4, p: 3, backgroundColor: theme => theme.palette.primary.light + '22', borderRadius: 3 }}>
                <Typography
                    variant="h6"
                    align="center"
                    gutterBottom
                    sx={theme => ({
                        color: theme.palette.mode === 'dark' ? theme.palette.primary.contrastText : theme.palette.primary.main,
                        textShadow: theme.palette.mode === 'dark' ? '0 1px 6px rgba(0,0,0,0.25)' : 'none',
                        fontWeight: 700,
                        letterSpacing: 1,
                        mb: 3,
                    })}
                >
                    Gestión de tareas
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        slotProps={{ htmlInput: { maxLength: 100 } }}
                        sx={{ minWidth: 200, maxWidth: 220 }}
                    />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        slotProps={{ htmlInput: { maxLength: 500 } }}
                        sx={{ minWidth: 200, maxWidth: 220 }}
                    />
                    <TextField
                        label="Due Date"
                        type="datetime-local"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ minWidth: 200, maxWidth: 220 }}
                    />
                    <Button type="submit" variant="contained" color="primary" disabled={creating || !title} sx={{ minWidth: 120 }}>
                        {creating ? "Creating..." : "Add Task"}
                    </Button>
                </Box>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2, justifyContent: 'center' }}>
                    <TextField
                        label="Search tasks..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        size="small"
                        sx={{ minWidth: 200, maxWidth: 220, height: 40, '.MuiInputBase-root': { height: 40 } }}
                    />
                    <Box>
                        <Typography variant="body2" component="span" sx={{ mr: 1 }}>Filter:</Typography>
                        <Select
                            value={filter}
                            onChange={e => setFilter(e.target.value as any)}
                            size="small"
                            sx={{ minWidth: 120 }}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                        </Select>
                    </Box>
                    <Box>
                        <Typography variant="body2" component="span" sx={{ mr: 1 }}>Sort by:</Typography>
                        <Select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as any)}
                            size="small"
                            sx={{ minWidth: 120 }}
                        >
                            <MenuItem value="dueDate">Due date</MenuItem>
                            <MenuItem value="createdAt">Created at</MenuItem>
                        </Select>
                    </Box>
                </Stack>
            </Paper>
            {filteredTasks.length === 0 ? (
                <Typography align="center" color="text.secondary">No tasks found.</Typography>
            ) : (
                <Stack spacing={2}>
                    {filteredTasks.map((task) => {
                        let bgColor: ((theme: import('@mui/material/styles').Theme) => string) | undefined = undefined;
                        if (!task.isCompleted && task.dueDate) {
                            const now = new Date();
                            const due = new Date(task.dueDate);
                            const diffMs = due.getTime() - now.getTime();
                            const diffHrs = diffMs / (1000 * 60 * 60);
                            if (diffHrs < 3) {
                                bgColor = (theme) => alpha(theme.palette.error.main, 0.45); // rojo fuerte
                            } else if (diffHrs < 24) {
                                bgColor = (theme) => alpha(theme.palette.error.light, 0.25); // rojo suave
                            } else if (diffHrs < 72) {
                                bgColor = (theme) => alpha(theme.palette.warning.light, 0.25); // amarillo suave
                            }
                        }
                        return (
                            <Paper key={task.id} elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, backgroundColor: bgColor }}>
                                {editingId === task.id ? (
                                    <>
                                        <TextField
                                            value={editTitle}
                                            onChange={e => setEditTitle(e.target.value)}
                                            slotProps={{ htmlInput: { maxLength: 100 } }}
                                            label="Title"
                                            sx={{ minWidth: 120 }}
                                        />
                                        <TextField
                                            value={editDescription}
                                            onChange={e => setEditDescription(e.target.value)}
                                            slotProps={{ htmlInput: { maxLength: 500 } }}
                                            label="Description"
                                            sx={{ minWidth: 160 }}
                                        />
                                        <TextField
                                            type="date"
                                            value={editDate}
                                            onChange={e => setEditDate(e.target.value)}
                                            label="Created"
                                            slotProps={{ inputLabel: { shrink: true } }}
                                            sx={{ minWidth: 120 }}
                                        />
                                        <TextField
                                            type="datetime-local"
                                            value={editDueDate}
                                            onChange={e => setEditDueDate(e.target.value)}
                                            label="Due"
                                            slotProps={{ inputLabel: { shrink: true } }}
                                            sx={{ minWidth: 160 }}
                                        />
                                        <Stack direction="row" spacing={1}>
                                            <Button onClick={() => handleEditSave(task)} variant="contained" color="primary">
                                                Save
                                            </Button>
                                            <Button onClick={handleEditCancel} variant="contained" color="error">
                                                Cancel
                                            </Button>
                                        </Stack>
                                    </>
                                ) : (
                                    <>
                                        <Checkbox
                                            checked={task.isCompleted}
                                            onChange={() => handleToggleCompleted(task)}
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
                                        <Box sx={{ minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                            {task.dueDate && (
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                    (Due: {new Date(task.dueDate).toLocaleString(undefined, {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })})
                                                </Typography>
                                            )}
                                        </Box>
                                        {task.isCompleted && <Typography color="primary.main" sx={{ ml: 1 }}>✔️</Typography>}
                                        <Stack direction="row" spacing={1}>
                                            <Button onClick={() => handleEdit(task)} variant="contained" color="primary">
                                                Edit
                                            </Button>
                                            <Button onClick={() => handleDelete(task.id)} variant="contained" color="error">
                                                Delete
                                            </Button>
                                        </Stack>
                                    </>
                                )}
                            </Paper>
                        );
                    })}
                </Stack>
            )}
            <Snackbar
                open={!!toast}
                autoHideDuration={2500}
                onClose={() => setToast(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setToast(null)} severity="success" sx={{ width: '100%' }}>
                    {toast}
                </Alert>
            </Snackbar>
        </Box>
    );
};
export default TaskList;