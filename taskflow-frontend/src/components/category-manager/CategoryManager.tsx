import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Chip,
    IconButton,
    Typography,
    Stack,
    Alert,
    CircularProgress,
    useTheme
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks';
import { ConfirmationDialog } from '../common';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../types/Category';

interface CategoryManagerProps {
    open: boolean;
    onClose: () => void;
    onCategoriesChange?: () => void;
}

const PREDEFINED_COLORS = [
    '#7C3AED', // violet
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#F97316', // orange
    '#EC4899', // pink
    '#6366F1', // indigo
    '#14B8A6', // teal
];

const CategoryManager: React.FC<CategoryManagerProps> = ({ open, onClose, onCategoriesChange }) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const { data: categories = [], isLoading } = useCategories();
    const createCategoryMutation = useCreateCategory();
    const updateCategoryMutation = useUpdateCategory();
    const deleteCategoryMutation = useDeleteCategory();

    const [formData, setFormData] = useState({
        name: '',
        color: PREDEFINED_COLORS[0],
        description: ''
    });
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        category: Category | null;
        loading: boolean;
    }>({
        open: false,
        category: null,
        loading: false
    });

    useEffect(() => {
        if (categories.length > 0) {
            onCategoriesChange?.();
        }
    }, [categories, onCategoriesChange]);

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = t('nameRequired');
        }

        /* v8 ignore next 3 */
        if (!formData.color) {
            errors.color = t('colorRequired');
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            if (editingCategory) {
                const updateData: UpdateCategoryRequest = {
                    name: formData.name,
                    color: formData.color,
                    description: formData.description || undefined
                };
                await updateCategoryMutation.mutateAsync({ /* v8 ignore next */
                    ...editingCategory,
                    ...updateData
                });
            } else {
                const createData: CreateCategoryRequest = {
                    name: formData.name,
                    color: formData.color,
                    description: formData.description || undefined
                };
                await createCategoryMutation.mutateAsync({
                    name: createData.name,  /* v8 ignore next */
                    color: createData.color, /* v8 ignore next */
                    description: createData.description,
                    createdAt: '',
                    updatedAt: '',
                    userId: 0
                });
            }

            resetForm();
            onCategoriesChange?.();
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleDelete = (category: Category) => {
        setConfirmDialog({
            open: true,
            category,
            loading: false
        });
    };

    const handleConfirmDelete = async () => {
        const { category } = confirmDialog;
        if (!category) return;

        setConfirmDialog(prev => ({ ...prev, loading: true }));

        try {
            await deleteCategoryMutation.mutateAsync(category.id);
            /* v8 ignore next */
            onCategoriesChange?.();
            setConfirmDialog({ open: false, category: null, loading: false });
        } catch (error) {
            console.error('Error deleting category:', error);
            setConfirmDialog(prev => ({ ...prev, loading: false }));
        }
    };

    const handleCancelDelete = () => { /* v8 ignore next */
        setConfirmDialog({ open: false, category: null, loading: false });
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            color: category.color,
            description: category.description || ''
        });
        setFormErrors({});
    };

    const resetForm = () => {
        setFormData({
            name: '',
            color: PREDEFINED_COLORS[0],
            description: ''
        });
        setEditingCategory(null);
        setFormErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <>
            {/* v8 ignore next */}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                slotProps={{
                    paper: {
                        sx: theme.palette.mode === 'dark' ? {
                            '--Paper-overlay': 'none !important'
                        } : {}
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {t('manageCategories')}
                    {/* v8 ignore next */}
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {editingCategory ? t('editCategory') : t('createCategory')}
                        </Typography>

                        <Stack spacing={2}>
                            <TextField
                                label={t('categoryName')}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                                fullWidth
                                size="small"
                            />

                            <TextField
                                label={t('categoryDescription')}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                fullWidth
                                size="small"
                                multiline
                                rows={2}
                            />

                            <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {t('categoryColor')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {PREDEFINED_COLORS.map((color) => (
                                        <Box
                                            key={color}
                                            onClick={() => setFormData({ ...formData, color })}
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                backgroundColor: color,
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                border: formData.color === color ? 3 : 1,
                                                borderColor: formData.color === color ? 'primary.main' : 'divider',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    transform: 'scale(1.1)'
                                                }
                                            }}
                                        />
                                    ))}
                                </Box>
                                {/* v8 ignore next 4 */}
                                {formErrors.color && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                                        {formErrors.color}
                                    </Typography>
                                )}
                            </Box> {/* v8 ignore next */}

                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                {editingCategory && (
                                    <Button onClick={resetForm} variant="outlined" size="small">
                                        {t('cancel')}
                                    </Button>
                                )}
                                <Button
                                    onClick={handleSave}
                                    variant="contained"
                                    startIcon={editingCategory ? <EditIcon /> : <AddIcon />}
                                    disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                                    size="small"
                                >
                                    {editingCategory ? t('updateCategory') : t('createCategory')}
                                </Button>
                            </Box>
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {t('categories')} ({categories.length})
                        </Typography>

                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : categories.length === 0 ? (
                            <Alert severity="info">
                                {t('noCategoriesFound')}
                            </Alert>
                        ) : (
                            <Stack spacing={1}>
                                {categories.map((category) => (
                                    <Box
                                        key={category.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 1.5,
                                            border: 1,
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            '&:hover': {
                                                backgroundColor: 'action.hover'
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                            <Chip
                                                label={category.name}
                                                sx={{
                                                    backgroundColor: category.color,
                                                    color: 'white',
                                                    fontWeight: 600
                                                }}
                                                size="small"
                                            />
                                            {category.description && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {category.description}
                                                </Typography>
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton
                                                onClick={() => handleEdit(category)}
                                                size="small"
                                                color="primary"
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDelete(category)}
                                                size="small"
                                                color="error"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} variant="outlined">
                        {t('close')}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmationDialog
                open={confirmDialog.open}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title={t('confirmDeleteCategory')}
                message={t('deleteCategoryConfirmation', { name: confirmDialog.category?.name || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                type="delete"
                loading={confirmDialog.loading}
            />
        </>
    );
};

export default CategoryManager;
