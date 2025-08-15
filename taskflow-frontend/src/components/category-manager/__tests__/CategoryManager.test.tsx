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
    return render(
        <QueryClientProvider client={new QueryClient()}>
            <ThemeProvider theme={createTheme()}>
                <CategoryManager open={true} onClose={vi.fn()} onCategoriesChange={vi.fn()} {...props} />
            </ThemeProvider>
        </QueryClientProvider>
    );
}

describe('CategoryManager', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders dialog with categories', () => {
        setupMocks();
        renderCategoryManager();
        expect(screen.getByText('Manage Categories')).toBeInTheDocument();
        expect(screen.getByText('Work')).toBeInTheDocument();
        expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    it('shows loading state', () => {
        vi.mocked(useCategories).mockReturnValue({ data: [], isLoading: true } as any);
        renderCategoryManager();
        expect(screen.getByText('Manage Categories')).toBeInTheDocument();
        expect(screen.queryByText('No categories found')).not.toBeInTheDocument();
    });

    it('shows empty state', () => {
        vi.mocked(useCategories).mockReturnValue({ data: [], isLoading: false } as any);
        renderCategoryManager();
        expect(screen.getByText('Categories (0)')).toBeInTheDocument();
    });

    it('validates required name', async () => {
        setupMocks();
        renderCategoryManager();
        fireEvent.click(screen.getByRole('button', { name: /create category/i }));
        await waitFor(() => {
            expect(screen.getByText('Name is required')).toBeInTheDocument();
        });
    });

    it('creates new category', async () => {
        const mocks = setupMocks();
        renderCategoryManager();
        fireEvent.change(screen.getByLabelText('Category Name'), { target: { value: 'New Category' } });
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

    it('edits existing category', async () => {
        const mocks = setupMocks();
        renderCategoryManager();
        const editButtons = screen.getAllByText('EditIcon');
        fireEvent.click(editButtons[0].closest('button')!);
        fireEvent.change(screen.getByLabelText('Category Name'), { target: { value: 'Updated Work' } });
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

    it('shows cancel button only when editing', async () => {
        setupMocks();
        renderCategoryManager();
        expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
        const editButtons = screen.getAllByText('EditIcon');
        fireEvent.click(editButtons[0].closest('button')!);
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });
    });

    it('cancels editing and resets form', async () => {
        setupMocks();
        renderCategoryManager();
        const editButtons = screen.getAllByText('EditIcon');
        fireEvent.click(editButtons[0].closest('button')!);
        fireEvent.change(screen.getByLabelText('Category Name'), { target: { value: 'Modified Work' } });
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);
        await waitFor(() => {
            expect(screen.queryByDisplayValue('Modified Work')).not.toBeInTheDocument();
            expect(screen.queryByDisplayValue('Work')).not.toBeInTheDocument();
        });
    });

    it('deletes category with confirmation', async () => {
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

    it('cancels deletion', () => {
        setupMocks();
        renderCategoryManager();
        const deleteButtons = screen.getAllByText('DeleteIcon');
        fireEvent.click(deleteButtons[0].closest('button')!);
        fireEvent.click(screen.getByText('Cancel'));
        expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
    });

    it('handles deletion error', async () => {
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

    it('handles description in create mode', async () => {
        setupMocks();
        renderCategoryManager();
        fireEvent.change(screen.getByLabelText(/category name/i), { target: { value: 'Test Category' } });
        fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test description' } });
        fireEvent.click(screen.getByRole('button', { name: /create category/i }));
        await waitFor(() => {
            expect(screen.queryByDisplayValue('Test Category')).not.toBeInTheDocument();
        });
    });

    it('handles empty description in create mode', async () => {
        setupMocks();
        renderCategoryManager();
        fireEvent.change(screen.getByLabelText(/category name/i), { target: { value: 'Test Category' } });
        fireEvent.click(screen.getByRole('button', { name: /create category/i }));
        await waitFor(() => {
            expect(screen.queryByDisplayValue('Test Category')).not.toBeInTheDocument();
        });
    });

    it('handles description in edit mode', async () => {
        setupMocks();
        renderCategoryManager();
        const editButtons = screen.getAllByText('EditIcon');
        fireEvent.click(editButtons[0].closest('button')!);
        fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Updated description' } });
        fireEvent.click(screen.getByRole('button', { name: /update category/i }));
        await waitFor(() => {
            expect(screen.queryByDisplayValue('Work')).not.toBeInTheDocument();
        });
    });

    it('handles cancel delete dialog', async () => {
        setupMocks();
        renderCategoryManager();
        const deleteButtons = screen.getAllByText('DeleteIcon');
        fireEvent.click(deleteButtons[0].closest('button')!);
        await waitFor(() => {
            expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Cancel'));
        await waitFor(() => {
            expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
        });
    });

    it('handles error when updating category', async () => {
        const mocks = setupMocks();
        mocks.mockUpdateMutation.mutateAsync.mockRejectedValueOnce(new Error('Update failed'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        renderCategoryManager();
        const editButtons = screen.getAllByText('EditIcon');
        fireEvent.click(editButtons[0].closest('button')!);
        fireEvent.change(screen.getByLabelText('Category Name'), { target: { value: 'Error Update' } });
        fireEvent.click(screen.getByRole('button', { name: /update category/i }));
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error saving category:', expect.any(Error));
        });
        consoleSpy.mockRestore();
    });

    it('handles error when deleting category', async () => {
        const mocks = setupMocks();
        mocks.mockDeleteMutation.mutateAsync.mockRejectedValueOnce(new Error('Delete failed'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        renderCategoryManager();
        const deleteButtons = screen.getAllByText('DeleteIcon');
        fireEvent.click(deleteButtons[0].closest('button')!);
        fireEvent.click(screen.getByText('Delete'));
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error deleting category:', expect.any(Error));
        });
        consoleSpy.mockRestore();
    });

    it('closes confirm dialog when handleCancelDelete is called', async () => {
        setupMocks();
        renderCategoryManager();
        const deleteButtons = screen.getAllByText('DeleteIcon');
        fireEvent.click(deleteButtons[0].closest('button')!);
        await waitFor(() => expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Cancel'));
        await waitFor(() => expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument());
    });
});
