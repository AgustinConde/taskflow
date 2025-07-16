import React, { useEffect, useState } from "react";
import type { Task } from "../types/Task";
import { Box, Button, Stack, TextField, Typography, Select, MenuItem, Paper, Snackbar, Alert, AppBar, Toolbar } from "@mui/material";
import TaskItem from "./TaskItem";
import ChecklistIcon from '@mui/icons-material/Checklist';

const API_URL = "http://localhost:5149/api/tasks";

const TaskList: React.FC = () => {
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


    const handleEdit = (task: Task) => {
        setEditingId(task.id);
    };

    const handleEditCancel = () => {
        setEditingId(null);
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
                            onDelete={() => handleDelete(task.id)}
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
        </Box>
    );
};
export default TaskList;