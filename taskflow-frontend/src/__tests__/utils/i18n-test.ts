import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            // Common
            cancel: 'Cancel',
            confirm: 'Confirm',
            delete: 'Delete',
            save: 'Save',
            edit: 'Edit',
            close: 'Close',
            loading: 'Loading...',

            // Tasks
            title: 'Title',
            description: 'Description',
            dueDate: 'Due Date',
            addTask: 'Add Task',
            editTask: 'Edit Task',
            taskCreated: 'Task created successfully',
            taskUpdated: 'Task updated successfully',
            taskDeleted: 'Task deleted successfully',

            // Categories
            categories: 'Categories',
            categoryName: 'Category Name',
            categoryColor: 'Category Color',
            addCategory: 'Add Category',
            editCategory: 'Edit Category',
            deleteCategory: 'Delete Category',
            categoryCreated: 'Category created successfully',
            categoryUpdated: 'Category updated successfully',
            categoryDeleted: 'Category deleted successfully',
            noCategoriesFound: 'No categories found. Create your first category!',
            confirmDeleteCategory: 'Delete category?',
            deleteCategoryConfirmation: 'Are you sure you want to delete the category "{{name}}"?',

            // Validation
            nameRequired: 'Name is required',
            colorRequired: 'Color is required',
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
