import React, { useEffect, useState } from "react";
import type { Task } from "../types/Task";
import { Box, Button, Stack, TextField, Typography, Select, MenuItem, Paper, Snackbar, Alert, AppBar, Toolbar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, useTheme } from "@mui/material";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TaskItem from "./TaskItem";
import ChecklistIcon from '@mui/icons-material/Checklist';

const API_URL = "http://localhost:5149/api/tasks";

const TaskList: React.FC = () => {
    const theme = useTheme();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
    const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt'>('dueDate');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
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

    const handleEdit = (task: Task) => {
        setEditingId(task.id);
    };

    const handleEditSave = async (task: Task) => {
        setError(null);
        try {
            const res = await fetch(`${API_URL}/${task.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(task),
            });
            if (!res.ok) throw new Error("Error updating task");
            setEditingId(null);
            fetchTasks();
            showToast("Task updated successfully!");
        } catch (err: any) {
            setError(err.message || "Error updating task");
        }
    };

    const handleEditCancel = () => {
        setEditingId(null);
    };

    const handleDeleteCancel = () => {
        setDeleteId(null);
    };

    useEffect(() => {
        fetchTasks();
    }, []);


    const handleDeleteRequest = (id: number) => {
        setDeleteId(id);
    };

    const handleDeleteConfirm = async () => {
        if (deleteId == null) return;
        setDeleteLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/${deleteId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error deleting task");
            setDeleteId(null);
            fetchTasks();
            showToast("Task deleted successfully!");
        } catch (err: any) {
            setError(err.message || "Error deleting task");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleToggleCompleted = async (task: Task) => {
        setError(null);
        setTasks(prevTasks => prevTasks.map(t =>
            t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
        ));
        const updatedTask = { ...task, isCompleted: !task.isCompleted };
        fetch(`${API_URL}/${task.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTask),
        })
            .then(res => {
                if (!res.ok) throw new Error("Error updating task");
            })
            .catch((err) => {
                setError(err.message || "Error updating task");
                setTasks(prevTasks => prevTasks.map(t =>
                    t.id === task.id ? { ...t, isCompleted: task.isCompleted } : t
                ));
            });
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
                    {filteredTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            editing={editingId === task.id}
                            onEdit={() => handleEdit(task)}
                            onEditSave={handleEditSave}
                            onEditCancel={handleEditCancel}
                            onDelete={() => handleDeleteRequest(task.id)}
                            onToggleCompleted={() => handleToggleCompleted(task)}
                        />
                    ))}
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

            <Dialog
                open={deleteId !== null}
                onClose={handleDeleteCancel}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
                PaperProps={{
                    sx: {
                        background: theme => theme.palette.mode === 'dark'
                            ? theme.palette.error.dark + 'ee'
                            : theme.palette.error.light + 'ee',
                        color: theme => theme.palette.getContrastText(theme.palette.error.main),
                        borderRadius: 3,
                        minWidth: 360,
                        boxShadow: 8,
                    }
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3 }}>
                    <WarningAmberIcon sx={{ fontSize: 56, color: theme.palette.error.main, mb: 1, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))' }} />
                </Box>
                <DialogTitle id="delete-dialog-title" sx={{ textAlign: 'center', color: theme.palette.error.main, fontWeight: 800, fontSize: 24, pb: 0 }}>
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description" sx={{ textAlign: 'center', color: theme.palette.text.primary, fontWeight: 500, fontSize: 17, mb: 1 }}>
                        Are you sure you want to delete this task?<br />This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button onClick={handleDeleteCancel} disabled={deleteLoading} color="inherit" variant="outlined" sx={{ minWidth: 100, fontWeight: 600, borderColor: theme.palette.error.main, color: theme.palette.error.main, '&:hover': { borderColor: theme.palette.error.dark, background: theme.palette.error.light + '33' } }}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleteLoading} autoFocus sx={{ minWidth: 120, fontWeight: 700, boxShadow: 2 }}>
                        {deleteLoading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
export default TaskList;