import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types/Category';

export const categoryKeys = {
    all: ['categories'] as const,
    lists: () => [...categoryKeys.all, 'list'] as const,
    details: () => [...categoryKeys.all, 'detail'] as const,
    detail: (id: number) => [...categoryKeys.details(), id] as const,
};

export const useCategories = () => {
    const { isAuthenticated } = useAuth();
    return useQuery({
        queryKey: categoryKeys.lists(),
        queryFn: () => categoryService.getCategories(),
        staleTime: 1000 * 60 * 5,
        enabled: isAuthenticated,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotifications();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: (category: Omit<Category, 'id'>) => categoryService.createCategory(category),
        onSuccess: (newCategory) => {
            queryClient.setQueryData<Category[]>(categoryKeys.lists(), (oldCategories) => {
                return oldCategories ? [...oldCategories, newCategory] : [newCategory];
            });

            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });

            showSuccess(t('categoryCreatedSuccessfully', 'Category created successfully'));
        },
        onError: (error) => {
            console.error('Error creating category:', error);
            showError(t('errorCreatingCategory', 'Error creating category'));
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotifications();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: (category: Category) => categoryService.updateCategory(category.id!, category),
        onMutate: async (updatedCategory) => {
            await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });

            const previousCategories = queryClient.getQueryData<Category[]>(categoryKeys.lists());

            queryClient.setQueryData<Category[]>(categoryKeys.lists(), (oldCategories) => {
                return oldCategories?.map(category =>
                    category.id === updatedCategory.id ? updatedCategory : category
                ) || [];
            });

            return { previousCategories };
        },
        onError: (error, _updatedCategory, context) => {
            if (context?.previousCategories) {
                queryClient.setQueryData(categoryKeys.lists(), context.previousCategories);
            }
            console.error('Error updating category:', error);
            showError(t('errorUpdatingCategory', 'Error updating category'));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
        },
        onSuccess: () => {
            showSuccess(t('categoryUpdated', 'Category updated successfully'));
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotifications();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: (categoryId: number) => categoryService.deleteCategory(categoryId),
        onMutate: async (deletedCategoryId) => {
            await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });

            const previousCategories = queryClient.getQueryData<Category[]>(categoryKeys.lists());

            queryClient.setQueryData<Category[]>(categoryKeys.lists(), (oldCategories) => {
                return oldCategories?.filter(category => category.id !== deletedCategoryId) || [];
            });

            return { previousCategories };
        },
        onError: (error, _deletedCategoryId, context) => {
            if (context?.previousCategories) {
                queryClient.setQueryData(categoryKeys.lists(), context.previousCategories);
            }
            console.error('Error deleting category:', error);
            showError(t('errorDeletingCategory', 'Error deleting category'));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
        },
        onSuccess: () => {
            showSuccess(t('categoryDeletedSuccessfully', 'Category deleted successfully'));
        },
    });
};
