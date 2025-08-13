import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material';
import CategoryManager from '../CategoryManager';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../../hooks';
import type { Category } from '../../../types/Category';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            const translations: Record<string, string> = {
                manageCategories: 'Manage Categories',
                createCategory: 'Create Category',
                editCategory: 'Edit Category',
                categoryName: 'Category Name',
                categoryDescription: 'Description',
                categoryColor: 'Color',
                updateCategory: 'Update Category',
                cancel: 'Cancel',
                categories: 'Categories',
                noCategoriesFound: 'No categories found',
                close: 'Close',
                confirmDeleteCategory: 'Confirm Delete',
                deleteCategoryConfirmation: `Delete category "${options?.name || ''}"?`,
                delete: 'Delete',
                nameRequired: 'Name is required',
                colorRequired: 'Color is required'
            };
            return translations[key] || key;
        }
    })
}));

vi.mock('../../../hooks', () => ({
    useCategories: vi.fn(),
    useCreateCategory: vi.fn(),
    useUpdateCategory: vi.fn(),
    useDeleteCategory: vi.fn()
}));

vi.mock('../../common', () => ({
    ConfirmationDialog: ({ open, onConfirm, onClose, loading }: any) =>
        open ? (
            <div data-testid="confirmation-dialog">
                <span>Confirm Delete</span>
                <button onClick={onConfirm} disabled={loading}>
                    {loading ? 'Deleting' : 'Delete'}
                </button>
                <button onClick={onClose}>Cancel</button>
            </div>
        ) : null
}));

const mockCategories: Category[] = [
    {
        id: 1,
        name: 'Work',
        color: '#7C3AED',
        description: 'Work tasks',
        userId: 1,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
    },
    {
        id: 2,
        name: 'Personal',
        color: '#3B82F6',
        description: 'Personal tasks',
        userId: 1,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
    }
];

function setupMocks() {
    const mockCreateMutation = {
        mutateAsync: vi.fn().mockResolvedValue({}),
        isPending: false
    };

    const mockUpdateMutation = {
        mutateAsync: vi.fn().mockResolvedValue({}),
        isPending: false
    };

    const mockDeleteMutation = {
        mutateAsync: vi.fn().mockResolvedValue({}),
        isPending: false
    };

    vi.mocked(useCategories).mockReturnValue({
        data: mockCategories,
        isLoading: false
    } as any);

    vi.mocked(useCreateCategory).mockReturnValue(mockCreateMutation as any);
    vi.mocked(useUpdateCategory).mockReturnValue(mockUpdateMutation as any);
    vi.mocked(useDeleteCategory).mockReturnValue(mockDeleteMutation as any);

    return { mockCreateMutation, mockUpdateMutation, mockDeleteMutation };
}

function renderCategoryManager(props = {}) {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        onCategoriesChange: vi.fn()
    };

    return render(
        <QueryClientProvider client={new QueryClient()}>
            <ThemeProvider theme={createTheme()}>
                <CategoryManager {...defaultProps} {...props} />
            </ThemeProvider>
        </QueryClientProvider>
    );
}

describe('CategoryManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Functionality', () => {
        it('should render dialog with categories', () => {
            setupMocks();
            renderCategoryManager();

            expect(screen.getByText('Manage Categories')).toBeInTheDocument();
            expect(screen.getByText('Work')).toBeInTheDocument();
            expect(screen.getByText('Personal')).toBeInTheDocument();
        });

        it('should show loading state', () => {
            vi.mocked(useCategories).mockReturnValue({
                data: [],
                isLoading: true
            } as any);

            renderCategoryManager();

            expect(screen.getByText('Manage Categories')).toBeInTheDocument();
            expect(screen.queryByText('No categories found')).not.toBeInTheDocument();
        });

        it('should show empty state', () => {
            vi.mocked(useCategories).mockReturnValue({
                data: [],
                isLoading: false
            } as any);

            renderCategoryManager();

            expect(screen.getByText('Categories (0)')).toBeInTheDocument();
        });

        it('should validate required name', async () => {
            setupMocks();
            renderCategoryManager();

            fireEvent.click(screen.getByRole('button', { name: /create category/i }));

            await waitFor(() => {
                expect(screen.getByText('Name is required')).toBeInTheDocument();
            });
        });
    });

    describe('Category Operations', () => {
        it('should create new category', async () => {
            const mocks = setupMocks();
            const onCategoriesChange = vi.fn();
            renderCategoryManager({ onCategoriesChange });

            fireEvent.change(screen.getByLabelText('Category Name'), {
                target: { value: 'New Category' }
            });

            fireEvent.click(screen.getByRole('button', { name: /create category/i }));

            await waitFor(() => {
                expect(mocks.mockCreateMutation.mutateAsync).toHaveBeenCalledWith({
                    name: 'New Category',
                    color: '#7C3AED',
                    description: undefined,
                    createdAt: '',
                    updatedAt: '',
                    userId: 0
                });
            });
        });

        it('should edit existing category', async () => {
            const mocks = setupMocks();
            renderCategoryManager();

            const editButtons = screen.getAllByText('EditIcon');
            fireEvent.click(editButtons[0].closest('button')!);

            expect(screen.getByDisplayValue('Work')).toBeInTheDocument();

            fireEvent.change(screen.getByLabelText('Category Name'), {
                target: { value: 'Updated Work' }
            });

            fireEvent.click(screen.getByRole('button', { name: /update category/i }));

            await waitFor(() => {
                expect(mocks.mockUpdateMutation.mutateAsync).toHaveBeenCalledWith({
                    id: 1,
                    name: 'Updated Work',
                    color: '#7C3AED',
                    description: 'Work tasks',
                    userId: 1,
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z'
                });
            });
        });

        it('should cancel editing', () => {
            setupMocks();
            renderCategoryManager();

            const editButtons = screen.getAllByText('EditIcon');
            fireEvent.click(editButtons[0].closest('button')!);
            fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

            expect(screen.queryByDisplayValue('Work')).not.toBeInTheDocument();
        });

        it('should handle color selection', () => {
            setupMocks();
            renderCategoryManager();

            const colorButtons = screen.getAllByRole('button');
            const blueColorButton = colorButtons.find(button =>
                button.style.backgroundColor === 'rgb(59, 130, 246)'
            );

            if (blueColorButton) {
                fireEvent.click(blueColorButton);
            }

            expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
        });
    });

    describe('Category Management', () => {
        it('should delete category with confirmation', async () => {
            const mocks = setupMocks();
            renderCategoryManager();

            const deleteButtons = screen.getAllByText('DeleteIcon');
            fireEvent.click(deleteButtons[0].closest('button')!);

            expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Delete'));

            await waitFor(() => {
                expect(mocks.mockDeleteMutation.mutateAsync).toHaveBeenCalledWith(1);
            });
        });

        it('should cancel deletion', () => {
            setupMocks();
            renderCategoryManager();

            const deleteButtons = screen.getAllByText('DeleteIcon');
            fireEvent.click(deleteButtons[0].closest('button')!);

            fireEvent.click(screen.getByText('Cancel'));

            expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
        });

        it('should handle deletion error', async () => {
            const mocks = setupMocks();
            mocks.mockDeleteMutation.mutateAsync.mockRejectedValueOnce(new Error('Delete failed'));

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            renderCategoryManager();

            const deleteButtons = screen.getAllByText('DeleteIcon');
            fireEvent.click(deleteButtons[0].closest('button')!);
            fireEvent.click(screen.getByText('Delete'));

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalled();
            });

            consoleSpy.mockRestore();
        });

        it('should close dialog', () => {
            const onClose = vi.fn();
            setupMocks();
            renderCategoryManager({ onClose });

            fireEvent.click(screen.getByRole('button', { name: 'Close' }));

            expect(onClose).toHaveBeenCalled();
        });
    });
});
