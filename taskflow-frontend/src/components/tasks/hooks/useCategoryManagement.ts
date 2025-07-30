import { useState, useEffect } from 'react';
import { categoryService } from '../../../services/categoryService';
import type { Category } from '../../../types/Category';

export const useCategoryManagement = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (err: any) {
            console.error("Error fetching categories:", err);
        }
    };

    const openCategoryManager = () => {
        setCategoryManagerOpen(true);
    };

    const closeCategoryManager = () => {
        setCategoryManagerOpen(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return {
        categories,
        categoryManagerOpen,
        openCategoryManager,
        closeCategoryManager,
        fetchCategories
    };
};
