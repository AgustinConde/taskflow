import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { categoryService } from '../../../services/categoryService';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../../types/Category';

export const useCategoryOperations = () => {
    const { t } = useTranslation();
    const { showSuccess, showError } = useNotifications();

    const loadCategories = useCallback(async (setCategories: (cats: Category[]) => void, setLoading: (loading: boolean) => void) => {
        setLoading(true);
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (error) {
            showError(t('errorLoadingCategories'));
        } finally {
            setLoading(false);
        }
    }, [showError, t]);

    const validateForm = useCallback((formData: { name: string; color: string }) => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = t('nameRequired');
        }

        if (!formData.color) {
            errors.color = t('colorRequired');
        }

        return { errors, isValid: Object.keys(errors).length === 0 };
    }, [t]);

    const saveCategory = useCallback(async (
        formData: { name: string; color: string; description: string },
        editingCategory: Category | null,
        setLoading: (loading: boolean) => void,
        onSuccess: () => void
    ) => {
        setLoading(true);
        try {
            if (editingCategory) {
                const updateData: UpdateCategoryRequest = {
                    name: formData.name,
                    color: formData.color,
                    description: formData.description || undefined
                };
                await categoryService.updateCategory(editingCategory.id, updateData);
                showSuccess(t('categoryUpdated'));
            } else {
                const createData: CreateCategoryRequest = {
                    name: formData.name,
                    color: formData.color,
                    description: formData.description || undefined
                };
                await categoryService.createCategory(createData);
                showSuccess(t('categoryCreated'));
            }
            onSuccess();
        } catch (error) {
            showError(editingCategory ? t('errorUpdatingCategory') : t('errorCreatingCategory'));
        } finally {
            setLoading(false);
        }
    }, [showSuccess, showError, t]);

    const deleteCategory = useCallback(async (
        category: Category,
        setLoading: (loading: boolean) => void,
        onSuccess: () => void
    ) => {
        if (!window.confirm(t('deleteCategoryMsg'))) return;

        setLoading(true);
        try {
            await categoryService.deleteCategory(category.id);
            showSuccess(t('categoryDeleted'));
            onSuccess();
        } catch (error) {
            showError(t('errorDeletingCategory'));
        } finally {
            setLoading(false);
        }
    }, [showSuccess, showError, t]);

    return {
        loadCategories,
        validateForm,
        saveCategory,
        deleteCategory
    };
};
