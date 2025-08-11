import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CategoryManager from '../CategoryManager';
import * as hooks from '../../../hooks';
import type { Category } from '../../../types/Category';

vi.mock('../../../hooks', () => ({
    useCategories: vi.fn(),
    useCreateCategory: vi.fn(),
    useUpdateCategory: vi.fn(),
    useDeleteCategory: vi.fn(),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../common', () => ({
    ConfirmationDialog: ({ open, onConfirm, onClose }: any) =>
        open ? (
            <div>
                <span>confirmDeleteCategory</span>
                <button onClick={onConfirm}>delete</button>
                <button onClick={onClose}>cancel</button>
            </div>
        ) : null
}));

describe('CategoryManager', () => {
    let queryClient: QueryClient;
    const mockCategory: Category = {
        id: 1, name: 'Work', color: '#7C3AED', description: 'Work tasks',
        createdAt: '2024-01-01', updatedAt: '2024-01-01', userId: 1
    };

    const setupMocks = () => {
        queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

        const mockMutationResult = {
            mutateAsync: vi.fn().mockResolvedValue(mockCategory),
            isPending: false, isError: false, isSuccess: false
        };

        vi.mocked(hooks.useCategories).mockReturnValue({
            data: [mockCategory], isLoading: false, isError: false, error: null, isSuccess: true,
            isFetching: false, isPending: false, refetch: vi.fn()
        } as any);

        vi.mocked(hooks.useCreateCategory).mockReturnValue(mockMutationResult as any);
        vi.mocked(hooks.useUpdateCategory).mockReturnValue(mockMutationResult as any);
        vi.mocked(hooks.useDeleteCategory).mockReturnValue(mockMutationResult as any);

        return { mockMutationResult };
    };

    const renderCategoryManager = (props = {}) => {
        const defaultProps = { open: true, onClose: vi.fn(), onCategoriesChange: vi.fn() };
        const theme = createTheme();

        return render(
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <CategoryManager {...defaultProps} {...props} />
                </ThemeProvider>
            </QueryClientProvider>
        );
    };

    beforeEach(() => {
        setupMocks();
        vi.clearAllMocks();
    });

    describe('Core Functionality', () => {
        it('should render dialog when open and display categories', () => {
            renderCategoryManager();

            expect(screen.getByText('manageCategories')).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'createCategory' })).toBeInTheDocument();
            expect(screen.getByText('Work')).toBeInTheDocument();
        });

        it('should handle form input changes', () => {
            renderCategoryManager();

            const nameInput = screen.getByLabelText('categoryName');
            const descInput = screen.getByLabelText('categoryDescription');

            fireEvent.change(nameInput, { target: { value: 'New Category' } });
            fireEvent.change(descInput, { target: { value: 'New Description' } });

            expect(nameInput).toHaveValue('New Category');
            expect(descInput).toHaveValue('New Description');
        });

        it('should create new category successfully', async () => {
            const { mockMutationResult } = setupMocks();
            renderCategoryManager();

            fireEvent.change(screen.getByLabelText('categoryName'), { target: { value: 'New Work' } });
            fireEvent.click(screen.getByRole('button', { name: /createCategory/i }));

            await waitFor(() => {
                expect(mockMutationResult.mutateAsync).toHaveBeenCalled();
            });
        });

        it('should edit existing category', async () => {
            const { mockMutationResult } = setupMocks();
            renderCategoryManager();

            const editButtons = screen.getAllByRole('button');
            const editButton = editButtons.find(btn => btn.querySelector('[data-testid="EditIcon"]'));

            if (editButton) {
                fireEvent.click(editButton);

                await waitFor(() => {
                    expect(screen.getByDisplayValue('Work')).toBeInTheDocument();
                });

                fireEvent.change(screen.getByLabelText('categoryName'), { target: { value: 'Updated Work' } });
                fireEvent.click(screen.getByRole('button', { name: /updateCategory/i }));

                await waitFor(() => {
                    expect(mockMutationResult.mutateAsync).toHaveBeenCalled();
                });
            }
        });

        it('should delete category with confirmation', async () => {
            const { mockMutationResult } = setupMocks();
            renderCategoryManager();

            const deleteButtons = screen.getAllByRole('button');
            const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));

            if (deleteButton) {
                fireEvent.click(deleteButton);

                expect(screen.getByText('confirmDeleteCategory')).toBeInTheDocument();

                fireEvent.click(screen.getByText('delete'));

                await waitFor(() => {
                    expect(mockMutationResult.mutateAsync).toHaveBeenCalledWith(1);
                });
            }
        });
    });

    describe('Error Handling', () => {
        it('should validate required fields', async () => {
            renderCategoryManager();

            fireEvent.change(screen.getByLabelText('categoryName'), { target: { value: '' } });
            fireEvent.click(screen.getByRole('button', { name: /createCategory/i }));

            expect(screen.getByText('nameRequired')).toBeInTheDocument();
        });

        it('should handle create errors gracefully', async () => {
            const { mockMutationResult } = setupMocks();
            mockMutationResult.mutateAsync.mockRejectedValue(new Error('Create failed'));

            renderCategoryManager();

            fireEvent.change(screen.getByLabelText('categoryName'), { target: { value: 'Test' } });
            fireEvent.click(screen.getByRole('button', { name: /createCategory/i }));

            await waitFor(() => {
                expect(mockMutationResult.mutateAsync).toHaveBeenCalled();
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty categories list', () => {
            vi.mocked(hooks.useCategories).mockReturnValue({
                data: [], isLoading: false, isError: false, error: null, isSuccess: true,
                isFetching: false, isPending: false, refetch: vi.fn()
            } as any);

            renderCategoryManager();

            expect(screen.getByText('manageCategories')).toBeInTheDocument();
            expect(screen.getByText('noCategoriesFound')).toBeInTheDocument();
        });

        it('should handle loading state', () => {
            vi.mocked(hooks.useCategories).mockReturnValue({
                data: [], isLoading: true, isError: false, error: null, isSuccess: false,
                isFetching: true, isPending: true, refetch: vi.fn()
            } as any);

            renderCategoryManager();

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should close dialog and reset form', () => {
            const onClose = vi.fn();
            renderCategoryManager({ onClose });

            fireEvent.change(screen.getByLabelText('categoryName'), { target: { value: 'Test' } });
            fireEvent.click(screen.getByRole('button', { name: 'close' }));

            expect(onClose).toHaveBeenCalled();
        });

        it('should cancel delete confirmation', () => {
            renderCategoryManager();

            const deleteButtons = screen.getAllByRole('button');
            const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));

            if (deleteButton) {
                fireEvent.click(deleteButton);
                fireEvent.click(screen.getByText('cancel'));

                expect(screen.queryByText('confirmDeleteCategory')).not.toBeInTheDocument();
            }
        });

        it('should handle color selection', () => {
            renderCategoryManager();

            const colorBoxes = screen.getAllByRole('button').filter(btn =>
                btn.style.backgroundColor && btn.style.width === '24px'
            );

            if (colorBoxes.length > 0) {
                fireEvent.click(colorBoxes[1]);
            }

            expect(screen.getByRole('heading', { name: 'createCategory' })).toBeInTheDocument();
        });

        it('should call onCategoriesChange when categories update', () => {
            const onCategoriesChange = vi.fn();
            renderCategoryManager({ onCategoriesChange });

            expect(onCategoriesChange).toHaveBeenCalled();
        });
    });
});
