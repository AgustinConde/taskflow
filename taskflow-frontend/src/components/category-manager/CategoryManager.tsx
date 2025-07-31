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
                        borderRadius: 2,
                        minHeight: 500,
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
                    textAlign: 'center',
                    position: 'relative'
                }}
            >
                {t('categoryManager')}
                <Button
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'white',
                        minWidth: 'auto',
                        p: 1
                    }}
                >
                    <CloseIcon />
                </Button>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    {/* Form Section */}
                    <Box sx={{ flex: 1, minWidth: 300 }}>
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
                    <Box sx={{ flex: 1, minWidth: 300 }}>
                        <CategoryList
                            categories={categories}
                            loading={loading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} variant="outlined">
                    {t('close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CategoryManager;
