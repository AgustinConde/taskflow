import { useState } from 'react';
import type { Category } from '../../../types/Category';

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

export const useCategoryState = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        color: PREDEFINED_COLORS[0],
        description: ''
    });
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const resetForm = () => {
        setFormData({
            name: '',
            color: PREDEFINED_COLORS[0],
            description: ''
        });
        setEditingCategory(null);
        setFormErrors({});
    };

    const startEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            color: category.color || PREDEFINED_COLORS[0],
            description: category.description || ''
        });
        setFormErrors({});
    };

    return {
        categories,
        setCategories,
        loading,
        setLoading,
        formData,
        setFormData,
        editingCategory,
        setEditingCategory,
        formErrors,
        setFormErrors,
        resetForm,
        startEdit,
        PREDEFINED_COLORS
    };
};
