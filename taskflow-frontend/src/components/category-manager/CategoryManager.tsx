import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    useTheme
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import CategoryForm from './CategoryForm';
import CategoryList from './CategoryList';
import CategoryFormActions from './CategoryFormActions';

import { useCategoryState } from './hooks/useCategoryState';
import { useCategoryOperations } from './hooks/useCategoryOperations';

interface CategoryManagerProps {
    open: boolean;
    onClose: () => void;
    onCategoriesChange?: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ open, onClose, onCategoriesChange }) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const {
        categories,
        setCategories,
        loading,
        setLoading,
        formData,
        setFormData,
        editingCategory,
        formErrors,
        setFormErrors,
        resetForm,
        startEdit,
        PREDEFINED_COLORS
    } = useCategoryState();

    const {
        loadCategories,
        validateForm,
        saveCategory,
        deleteCategory
    } = useCategoryOperations();

    useEffect(() => {
        if (open) {
            loadCategories(setCategories, setLoading);
        }
    }, [open, loadCategories]);

    const handleSave = async () => {
        const { errors, isValid } = validateForm(formData);
        setFormErrors(errors);

        if (!isValid) return;

        await saveCategory(
            formData,
            editingCategory,
            setLoading,
            () => {
                resetForm();
                loadCategories(setCategories, setLoading);
                onCategoriesChange?.();
            }
        );
    };

    const handleDelete = async (category: any) => {
        await deleteCategory(
            category,
            setLoading,
            () => {
                loadCategories(setCategories, setLoading);
                onCategoriesChange?.();
            }
        );
    };

    const handleEdit = (category: any) => {
        startEdit(category);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleCancel = () => {
        resetForm();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        minHeight: 500,
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        ...(theme.palette.mode === 'dark' ? {
                            '--Paper-overlay': 'none !important',
                        } : {})
                    }
                }
            }}
        >
            <DialogTitle
                sx={{
                    background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    position: 'relative',
                    py: 2.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
            >
                {t('manageCategories')}
                <Button
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255,255,255,0.9)',
                        minWidth: 'auto',
                        p: 1,
                        borderRadius: 2,
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'white'
                        }
                    }}
                >
                    <CloseIcon />
                </Button>
            </DialogTitle>

            <DialogContent sx={{ p: 3, backgroundColor: 'background.default' }}>
                {/* Form Section */}
                <Box sx={{
                    mb: 3,
                    p: 3,
                    mt: 2,
                    background: theme => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(99, 102, 241, 0.05))'
                        : 'linear-gradient(135deg, rgba(124, 58, 237, 0.02), rgba(99, 102, 241, 0.02))',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                    <CategoryForm
                        formData={formData}
                        setFormData={setFormData}
                        formErrors={formErrors}
                        predefinedColors={PREDEFINED_COLORS}
                        editingCategory={editingCategory}
                    />

                    <Box sx={{ mt: 2 }}>
                        <CategoryFormActions
                            editingCategory={editingCategory}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            loading={loading}
                        />
                    </Box>
                </Box>

                {/* Categories List Section */}
                <Box sx={{
                    p: 3,
                    background: theme => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(59, 130, 246, 0.05))'
                        : 'linear-gradient(135deg, rgba(34, 197, 94, 0.02), rgba(59, 130, 246, 0.02))',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                    <CategoryList
                        categories={categories}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{
                p: 3,
                backgroundColor: theme => theme.palette.mode === 'dark'
                    ? theme.palette.grey[900]
                    : theme.palette.grey[50],
                borderTop: 1,
                borderColor: 'divider',
                gap: 2
            }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    size="large"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }
                    }}
                >
                    {t('close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CategoryManager;
