import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, categoryKeys } from '../useCategories';
import { categoryService } from '../../services/categoryService';
import { NotificationProvider } from '../../contexts/NotificationContext';
import type { Category } from '../../types/Category';

vi.mock('../../services/categoryService', () => ({
  categoryService: {
    getCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn()
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key
  })
}));

describe('useCategories Hooks', () => {
  const setupMocks = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    });

    const mockCategories: Category[] = [
      { id: 1, name: 'Work', color: '#ff0000', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', userId: 1 },
      { id: 2, name: 'Personal', color: '#00ff00', createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z', userId: 1 }
    ];

    const createCategory = (overrides: Partial<Category> = {}): Category => ({
      id: 1, name: 'Test Category', color: '#ff0000', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', userId: 1, ...overrides
    });

    const createCategoryInput = (overrides: Partial<Omit<Category, 'id'>> = {}): Omit<Category, 'id'> => ({
      name: 'Test Category', color: '#ff0000', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', userId: 1, ...overrides
    });

    return { queryClient, mockCategories, createCategory, createCategoryInput };
  };

  const renderUseCategories = (queryClient: QueryClient) => renderHook(() => useCategories(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}><NotificationProvider>{children}</NotificationProvider></QueryClientProvider>
    )
  });

  const renderUseCreateCategory = (queryClient: QueryClient) => renderHook(() => useCreateCategory(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}><NotificationProvider>{children}</NotificationProvider></QueryClientProvider>
    )
  });

  const renderUseUpdateCategory = (queryClient: QueryClient) => renderHook(() => useUpdateCategory(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}><NotificationProvider>{children}</NotificationProvider></QueryClientProvider>
    )
  });

  const renderUseDeleteCategory = (queryClient: QueryClient) => renderHook(() => useDeleteCategory(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}><NotificationProvider>{children}</NotificationProvider></QueryClientProvider>
    )
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  describe('Core Functionality', () => {
    it('should fetch categories successfully', async () => {
      const { queryClient, mockCategories } = setupMocks();
      vi.clearAllMocks();
      vi.mocked(categoryService.getCategories).mockResolvedValue(mockCategories);

      const { result } = renderUseCategories(queryClient);

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });
      expect(result.current.data).toEqual(mockCategories);
      expect(categoryService.getCategories).toHaveBeenCalledTimes(1);
    });

    it('should create category with optimistic update', async () => {
      const { queryClient, mockCategories, createCategory, createCategoryInput } = setupMocks();
      const newCategory = createCategoryInput({ name: 'New Category', color: '#0000ff' });
      const createdCategory = createCategory({ id: 3, name: 'New Category', color: '#0000ff' });

      queryClient.setQueryData(categoryKeys.lists(), mockCategories);
      vi.mocked(categoryService.createCategory).mockResolvedValue(createdCategory);

      const { result } = renderUseCreateCategory(queryClient);
      result.current.mutate(newCategory);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(categoryService.createCategory).toHaveBeenCalledWith(newCategory);
      expect(queryClient.getQueryData<Category[]>(categoryKeys.lists())).toContain(createdCategory);
    });

    it('should update category with optimistic update', async () => {
      const { queryClient, mockCategories, createCategory } = setupMocks();
      const updatedCategory = createCategory({ id: 1, name: 'Updated Work' });

      queryClient.setQueryData(categoryKeys.lists(), mockCategories);
      vi.mocked(categoryService.updateCategory).mockResolvedValue(updatedCategory);

      const { result } = renderUseUpdateCategory(queryClient);
      result.current.mutate(updatedCategory);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(categoryService.updateCategory).toHaveBeenCalledWith(1, updatedCategory);
    });

    it('should delete category with optimistic update', async () => {
      const { queryClient, mockCategories } = setupMocks();

      queryClient.setQueryData(categoryKeys.lists(), mockCategories);
      vi.mocked(categoryService.deleteCategory).mockResolvedValue(undefined);

      const { result } = renderUseDeleteCategory(queryClient);
      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(categoryService.deleteCategory).toHaveBeenCalledWith(1);
    });

    it('should use correct query configuration', () => {
      const { queryClient } = setupMocks();
      vi.mocked(categoryService.getCategories).mockResolvedValue([]);

      renderUseCategories(queryClient);

      expect(queryClient.getQueryState(categoryKeys.lists())?.dataUpdatedAt).toBeDefined();
    });
  });

  describe('Error Handling & Rollback', () => {
    it('should handle fetch error gracefully', async () => {
      const { queryClient } = setupMocks();
      vi.mocked(categoryService.getCategories).mockRejectedValue(new Error('Network error'));

      const { result } = renderUseCategories(queryClient);

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('should handle create error', async () => {
      const { queryClient, createCategoryInput } = setupMocks();
      vi.mocked(categoryService.createCategory).mockRejectedValue(new Error('Create failed'));

      const { result } = renderUseCreateCategory(queryClient);
      result.current.mutate(createCategoryInput());

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('should handle update error with rollback', async () => {
      const { queryClient, mockCategories, createCategory } = setupMocks();

      queryClient.setQueryData(categoryKeys.lists(), mockCategories);
      vi.mocked(categoryService.updateCategory).mockRejectedValue(new Error('Update failed'));

      const { result } = renderUseUpdateCategory(queryClient);
      result.current.mutate(createCategory({ id: 1 }));

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(queryClient.getQueryData<Category[]>(categoryKeys.lists())).toEqual(mockCategories);
    });

    it('should handle delete error with rollback', async () => {
      const { queryClient, mockCategories } = setupMocks();

      queryClient.setQueryData(categoryKeys.lists(), mockCategories);
      vi.mocked(categoryService.deleteCategory).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderUseDeleteCategory(queryClient);
      result.current.mutate(1);

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(queryClient.getQueryData<Category[]>(categoryKeys.lists())).toEqual(mockCategories);
    });
  });

  describe('Edge Cases & State Management', () => {
    it('should handle empty list for create', async () => {
      const { queryClient, createCategory, createCategoryInput } = setupMocks();
      const newCategory = createCategoryInput({ name: 'First Category' });
      const createdCategory = createCategory({ id: 1, name: 'First Category' });

      queryClient.setQueryData(categoryKeys.lists(), undefined);
      vi.mocked(categoryService.createCategory).mockResolvedValue(createdCategory);

      const { result } = renderUseCreateCategory(queryClient);
      result.current.mutate(newCategory);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(queryClient.getQueryData<Category[]>(categoryKeys.lists())).toEqual([createdCategory]);
    });

    it('should handle non-existent category operations', async () => {
      const { queryClient, mockCategories, createCategory } = setupMocks();
      const nonExistentCategory = createCategory({ id: 999, name: 'Non-existent' });

      queryClient.setQueryData(categoryKeys.lists(), mockCategories);
      vi.mocked(categoryService.updateCategory).mockResolvedValue(nonExistentCategory);
      vi.mocked(categoryService.deleteCategory).mockResolvedValue(undefined);

      const updateResult = renderUseUpdateCategory(queryClient);
      const deleteResult = renderUseDeleteCategory(queryClient);

      updateResult.result.current.mutate(nonExistentCategory);
      deleteResult.result.current.mutate(999);

      await waitFor(() => {
        expect(updateResult.result.current.isSuccess).toBe(true);
        expect(deleteResult.result.current.isSuccess).toBe(true);
      });

      expect(categoryService.updateCategory).toHaveBeenCalledWith(999, nonExistentCategory);
      expect(categoryService.deleteCategory).toHaveBeenCalledWith(999);
    });

    it('should maintain correct mutation states', async () => {
      const { queryClient, createCategoryInput, createCategory } = setupMocks();
      const newCategory = createCategoryInput({ name: 'Test Category' });

      let resolvePromise!: (value: Category) => void;
      vi.mocked(categoryService.createCategory).mockReturnValue(new Promise(resolve => { resolvePromise = resolve; }));

      const { result } = renderUseCreateCategory(queryClient);

      expect(result.current.isPending).toBe(false);
      result.current.mutate(newCategory);

      await waitFor(() => expect(result.current.isPending).toBe(true));

      resolvePromise(createCategory({ id: 1, name: 'Test Category' }));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isPending).toBe(false);
      });
    });

    it('should handle concurrent mutations', async () => {
      const { queryClient, mockCategories, createCategory, createCategoryInput } = setupMocks();

      queryClient.setQueryData(categoryKeys.lists(), mockCategories);
      vi.mocked(categoryService.createCategory).mockResolvedValue(createCategory({ id: 3, name: 'New' }));
      vi.mocked(categoryService.updateCategory).mockResolvedValue(createCategory({ id: 1, name: 'Updated' }));

      const createResult = renderUseCreateCategory(queryClient);
      const updateResult = renderUseUpdateCategory(queryClient);

      createResult.result.current.mutate(createCategoryInput({ name: 'New' }));
      updateResult.result.current.mutate(createCategory({ id: 1, name: 'Updated' }));

      await waitFor(() => {
        expect(createResult.result.current.isSuccess).toBe(true);
        expect(updateResult.result.current.isSuccess).toBe(true);
      });

      expect(categoryService.createCategory).toHaveBeenCalled();
      expect(categoryService.updateCategory).toHaveBeenCalled();
    });
  });
});
