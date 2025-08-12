import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAppData } from '../useAppData';
import * as tasksHooks from '../../../../hooks/useTasks';
import * as categoriesHooks from '../../../../hooks/useCategories';

vi.mock('../../../../hooks/useTasks');
vi.mock('../../../../hooks/useCategories');

const mockTasks = [
    { id: 1, title: 'Test task', description: 'Test description', isCompleted: false, dueDate: '2024-12-31', categoryId: 1, createdAt: '2024-01-01' }
];

const mockCategories = [
    { id: 1, name: 'Development', color: '#FF5722', userId: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
];

const setupMocks = (overrides: any = {}) => {
    const config = {
        tasks: mockTasks,
        categories: mockCategories,
        tasksLoading: false,
        categoriesLoading: false,
        ...overrides
    };

    vi.mocked(tasksHooks.useTasks).mockReturnValue({
        data: config.tasks,
        isLoading: config.tasksLoading,
        error: null,
        refetch: vi.fn()
    } as any);

    vi.mocked(categoriesHooks.useCategories).mockReturnValue({
        data: config.categories,
        isLoading: config.categoriesLoading,
        error: null,
        refetch: vi.fn()
    } as any);

    return config;
};

const renderUseAppData = () => renderHook(() => useAppData());

describe('useAppData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupMocks();
    });

    describe('Core Functionality', () => {
        it('should return tasks and categories with correct data', () => {
            const { result } = renderUseAppData();

            expect(result.current.tasks).toEqual(mockTasks);
            expect(result.current.categories).toEqual(mockCategories);
            expect(result.current.dataLoading).toBe(false);
        });

        it('should handle undefined data with default empty arrays', () => {
            setupMocks({ tasks: undefined, categories: undefined });
            const { result } = renderUseAppData();

            expect(result.current.tasks).toEqual([]);
            expect(result.current.categories).toEqual([]);
            expect(result.current.dataLoading).toBe(false);
        });
    });

    describe('Loading States', () => {
        it('should return dataLoading true when tasks are loading', () => {
            setupMocks({ tasksLoading: true });
            const { result } = renderUseAppData();

            expect(result.current.dataLoading).toBe(true);
        });

        it('should return dataLoading true when categories are loading', () => {
            setupMocks({ categoriesLoading: true });
            const { result } = renderUseAppData();

            expect(result.current.dataLoading).toBe(true);
        });

        it('should return dataLoading true when both are loading', () => {
            setupMocks({ tasksLoading: true, categoriesLoading: true });
            const { result } = renderUseAppData();

            expect(result.current.dataLoading).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty data arrays', () => {
            setupMocks({ tasks: [], categories: [] });
            const { result } = renderUseAppData();

            expect(result.current.tasks).toEqual([]);
            expect(result.current.categories).toEqual([]);
            expect(result.current.dataLoading).toBe(false);
        });
    });
});
