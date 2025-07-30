import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Task } from "../types/Task";
import type { Category } from "../types/Category";
import { Box, Button, Stack, TextField, Typography, Select, MenuItem, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, useTheme, CircularProgress, FormControl, InputLabel } from "@mui/material";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CategoryIcon from '@mui/icons-material/Category';
import TaskItem from "./TaskItem";
import CategoryManager from "./CategoryManager";
import { useTranslation } from "react-i18next";
import { taskService } from "../services/taskService";
import { categoryService } from "../services/categoryService";
import { useNotifications } from "../contexts/NotificationContext";

const TaskList: React.FC = () => {
    const theme = useTheme();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | number | 'none'>('all');
    const [sortBy, setSortBy] = useState<'custom' | 'dueDate' | 'createdAt' | 'category'>('custom');
    const [customOrder, setCustomOrder] = useState<number[]>([]);
    const [creating, setCreating] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [search, setSearch] = useState("");
    const { t } = useTranslation();
    const { showSuccess, showError } = useNotifications();

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const data = await taskService.getTasks();
            setTasks(data);
            if (customOrder.length === 0) {
                setCustomOrder(data.map((t: Task) => t.id));
            } else {
                const ids = data.map((t: Task) => t.id);
                setCustomOrder(prev => [
                    ...prev.filter((id: number) => ids.includes(id)),
                    ...ids.filter((id: number) => !prev.includes(id))
                ]);
            }
        } catch (err: any) {
            console.error("Error fetching tasks:", err);
            showError(err.message || 'Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (err: any) {
            console.error("Error fetching categories:", err);
        }
    };

    const showToast = (msg: string) => {
        showSuccess(msg);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        const localDateTimeToUTCISOString = (local: string) => {
            if (!local) return null;
            const utcDate = new Date(local).toISOString();
            return utcDate;
        };

        const newTask = {
            title,
            description,
            isCompleted: false,
            dueDate: dueDate ? localDateTimeToUTCISOString(dueDate) : null,
            categoryId: categoryId,
        };

        try {
            await taskService.createTask(newTask);
            setTitle("");
            setDescription("");
            setDueDate("");
            setCategoryId(null);
            await fetchTasks();
            showToast(t('taskCreated'));
        } catch (err: any) {
            showError(err.message || t('errorCreatingTask'));
        } finally {
            setCreating(false);
        }
    };

    const handleEditSave = async (task: Task) => {
        try {
            await taskService.updateTask(task.id, task);
            await fetchTasks();
            showToast(t('taskUpdated'));
        } catch (err: any) {
            showError(err.message || t('errorUpdatingTask'));
        }
    };

    const handleDeleteCancel = () => {
        setDeleteId(null);
    };

    useEffect(() => {
        fetchTasks();
        fetchCategories();
    }, []);

    const handleDeleteRequest = (id: number) => {
        setDeleteId(id);
    };

    const handleDeleteConfirm = async () => {
        if (deleteId == null) return;
        setDeleteLoading(true);
        try {
            await taskService.deleteTask(deleteId);
            setDeleteId(null);
            await fetchTasks();
            showToast(t('taskDeleted'));
        } catch (err: any) {
            showError(err.message || t('errorDeletingTask'));
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleToggleCompleted = async (task: Task) => {
        setTasks(prevTasks => prevTasks.map(t =>
            t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
        ));
        const updatedTask = { ...task, isCompleted: !task.isCompleted };

        try {
            await taskService.updateTask(task.id, updatedTask);
        } catch (err: any) {
            showError(err.message || t('errorUpdatingTask'));
            setTasks(prevTasks => prevTasks.map(t =>
                t.id === task.id ? { ...t, isCompleted: task.isCompleted } : t
            ));
        }
    };

    let filteredTasks = tasks
        .filter(task => {
            if (search.trim() !== "") {
                const categoryName = task.categoryId ?
                    categories.find(cat => cat.id === task.categoryId)?.name || "" :
                    "";
                const text = (task.title + " " + (task.description || "") + " " + categoryName).toLowerCase();
                if (!text.includes(search.toLowerCase())) return false;
            }

            if (filter === 'completed') return task.isCompleted;
            if (filter === 'pending') return !task.isCompleted;
            if (filter === 'none') return task.categoryId === null || task.categoryId === undefined;
            if (typeof filter === 'number') return task.categoryId === filter;

            return true;
        });

    if (sortBy === 'dueDate') {
        filteredTasks = [...filteredTasks].sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    } else if (sortBy === 'createdAt') {
        filteredTasks = [...filteredTasks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'category') {
        filteredTasks = [...filteredTasks].sort((a, b) => {
            const aCategoryName = a.categoryId ?
                categories.find(cat => cat.id === a.categoryId)?.name || "zzzz" :
                "zzzz";
            const bCategoryName = b.categoryId ?
                categories.find(cat => cat.id === b.categoryId)?.name || "zzzz" :
                "zzzz";
            return aCategoryName.localeCompare(bCategoryName);
        });
    } else if (sortBy === 'custom') {
        filteredTasks = [...filteredTasks].sort((a, b) => customOrder.indexOf(a.id) - customOrder.indexOf(b.id));
    }

    const onDragEnd = (result: DropResult) => {
        if (sortBy !== 'custom') return;
        if (!result.destination) return;
        const from = result.source.index;
        const to = result.destination.index;
        if (from === to) return;
        const filteredIds = filteredTasks.map(t => t.id);
        const newOrder = [...customOrder];
        const idToMove = filteredIds[from];
        const oldIndex = newOrder.indexOf(idToMove);
        newOrder.splice(oldIndex, 1);
        let insertAt = newOrder.indexOf(filteredIds[to]);
        if (to > from) insertAt++;
        newOrder.splice(insertAt, 0, idToMove);
        setCustomOrder(newOrder);
    };

    return (
        <Box sx={{ maxWidth: 900, margin: "0 auto", padding: 2, position: 'relative' }}>
            <Paper elevation={3} sx={{ mb: 4, p: 3, backgroundColor: theme => theme.palette.primary.light + '22', borderRadius: 3 }}>
                <Typography
                    variant="h6"
                    align="center"
                    gutterBottom
                    sx={theme => ({
                        color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.primary.main,
                        textShadow: theme.palette.mode === 'dark' ? '0 1px 6px rgba(0,0,0,0.25)' : 'none',
                        fontWeight: 700,
                        letterSpacing: 1,
                        mb: 3,
                    })}
                >
                    {t('taskManagement')}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                    <TextField
                        label={t('title')}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        slotProps={{ htmlInput: { maxLength: 100 } }}
                        sx={{ minWidth: 220, maxWidth: 260, flex: '0 1 220px' }}
                    />
                    <TextField
                        label={t('description')}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        slotProps={{ htmlInput: { maxLength: 500 } }}
                        sx={{ minWidth: 220, maxWidth: 260, flex: '0 1 220px' }}
                    />
                    <TextField
                        label={t('dueDate')}
                        type="datetime-local"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ minWidth: 220, maxWidth: 260, flex: '0 1 220px' }}
                    />
                    <FormControl sx={{ minWidth: 220, maxWidth: 260, flex: '0 1 220px' }}>
                        <InputLabel>{t('category')}</InputLabel>
                        <Select
                            value={categoryId || ''}
                            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                            label={t('category')}
                        >
                            <MenuItem value="">
                                <em>{t('noCategorySelected')}</em>
                            </MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                backgroundColor: category.color,
                                                borderRadius: '50%'
                                            }}
                                        />
                                        {category.name}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button type="submit" variant="contained" color="primary" disabled={creating || !title} sx={{ minWidth: 150, maxWidth: 180, flex: '0 1 150px', whiteSpace: 'nowrap' }}>
                        {creating ? t('creating') : t('addTask')}
                    </Button>
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'center',
                    mb: 2,
                    flexWrap: 'wrap'
                }}>
                    <TextField
                        label={t('searchTasks')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        size="small"
                        sx={{
                            minWidth: { xs: '100%', sm: 200 },
                            maxWidth: { xs: '100%', sm: 220 },
                            height: 40,
                            '.MuiInputBase-root': { height: 40 },
                            order: { xs: 1, sm: 1 }
                        }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<CategoryIcon />}
                        onClick={() => setCategoryManagerOpen(true)}
                        size="small"
                        sx={{
                            height: 40,
                            whiteSpace: 'nowrap',
                            minWidth: 'fit-content',
                            order: { xs: 4, sm: 2 }
                        }}
                    >
                        {t('manageCategories')}
                    </Button>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        minWidth: 'fit-content',
                        order: { xs: 2, sm: 3 }
                    }}>
                        <Typography
                            variant="body2"
                            component="span"
                            sx={{
                                mr: 1,
                                whiteSpace: 'nowrap',
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }}
                        >
                            {t('filter')}
                        </Typography>
                        <Select
                            value={filter}
                            onChange={e => setFilter(e.target.value as any)}
                            size="small"
                            sx={{ minWidth: { xs: 120, sm: 140 } }}
                        >
                            <MenuItem value="all">{t('all')}</MenuItem>
                            <MenuItem value="completed">{t('completed')}</MenuItem>
                            <MenuItem value="pending">{t('pending')}</MenuItem>
                            <MenuItem value="none">{t('noCategory')}</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                backgroundColor: category.color,
                                                borderRadius: '50%'
                                            }}
                                        />
                                        {category.name}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        minWidth: 'fit-content',
                        order: { xs: 3, sm: 4 }
                    }}>
                        <Typography
                            variant="body2"
                            component="span"
                            sx={{
                                mr: 1,
                                whiteSpace: 'nowrap',
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }}
                        >
                            {t('sortBy')}
                        </Typography>
                        <Select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as any)}
                            size="small"
                            sx={{ minWidth: { xs: 100, sm: 120 } }}
                        >
                            <MenuItem value="custom">{t('custom')}</MenuItem>
                            <MenuItem value="dueDate">{t('dueDateSort')}</MenuItem>
                            <MenuItem value="createdAt">{t('createdAt')}</MenuItem>
                            <MenuItem value="category">{t('category')}</MenuItem>
                        </Select>
                    </Box>
                </Box>
            </Paper>
            {loading ? <Box width="100%" display="flex" justifyContent="center" alignItems="center"> <CircularProgress size="3rem" /></Box> : filteredTasks.length === 0 ? (
                <Typography align="center" color="text.secondary">{t('noTasks')}</Typography>
            ) : sortBy === 'custom' ? (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="tasklist-droppable">
                        {(provided) => (
                            <Stack spacing={2} ref={provided.innerRef} {...provided.droppableProps}>
                                {filteredTasks.map((task, idx) => (
                                    task.id ? (
                                        <Draggable key={task.id} draggableId={task.id.toString()} index={idx}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        opacity: snapshot.isDragging ? 0.7 : 1,
                                                    }}
                                                >
                                                    <TaskItem
                                                        task={task}
                                                        onEditSave={handleEditSave}
                                                        onDelete={() => handleDeleteRequest(task.id)}
                                                        onToggleCompleted={() => handleToggleCompleted(task)}
                                                        categories={categories}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ) : null
                                ))}
                                {provided.placeholder}
                            </Stack>
                        )}
                    </Droppable>
                </DragDropContext>
            ) : (
                <Stack spacing={2}>
                    {filteredTasks.map((task) => (
                        task.id ? (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onEditSave={handleEditSave}
                                onDelete={() => handleDeleteRequest(task.id)}
                                onToggleCompleted={() => handleToggleCompleted(task)}
                                categories={categories}
                            />
                        ) : null
                    ))}
                </Stack>
            )}

            <Dialog
                open={deleteId !== null}
                onClose={handleDeleteCancel}
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
                    <WarningAmberIcon sx={{ fontSize: 56, color: theme.palette.error.main, mb: 1, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))' }} />
                </Box>
                <DialogTitle id="delete-dialog-title" sx={{ textAlign: 'center', color: theme.palette.error.main, fontWeight: 800, fontSize: 24, pb: 0 }}>
                    {t('confirmDelete')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description" sx={{ textAlign: 'center', color: theme.palette.text.primary, fontWeight: 500, fontSize: 17, mb: 1 }}>
                        {t('deleteMsg')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button onClick={handleDeleteCancel} disabled={deleteLoading} color="inherit" variant="outlined" sx={{ minWidth: 100, fontWeight: 600, borderColor: theme.palette.error.main, color: theme.palette.error.main, '&:hover': { borderColor: theme.palette.error.dark, background: theme.palette.error.light + '33' } }}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleteLoading} autoFocus sx={{ minWidth: 120, fontWeight: 700, boxShadow: 2 }}>
                        {deleteLoading ? t('deleting') : t('delete')}
                    </Button>
                </DialogActions>
            </Dialog>

            <CategoryManager
                open={categoryManagerOpen}
                onClose={() => setCategoryManagerOpen(false)}
                onCategoriesChange={fetchCategories}
            />
        </Box>
    );
};
export default TaskList;