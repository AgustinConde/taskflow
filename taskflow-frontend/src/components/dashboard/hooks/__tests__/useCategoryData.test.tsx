import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useCategoryChartData } from '../useCategoryData';
import type { Task } from '../../../../types/Task';
import type { Category } from '../../../../types/Category';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

describe('useCategoryChartData', () => {
    const setupMocks = () => {
        const mockCategories: Category[] = [
            { id: 1, name: 'Work', color: '#ff5722', createdAt: '2024-01-15T12:00:00Z', updatedAt: '2024-01-15T12:00:00Z', userId: 1 },
            { id: 2, name: 'Personal', color: '#2196f3', createdAt: '2024-01-15T12:00:00Z', updatedAt: '2024-01-15T12:00:00Z', userId: 1 },
            { id: 3, name: 'Shopping', color: '#4caf50', createdAt: '2024-01-15T12:00:00Z', updatedAt: '2024-01-15T12:00:00Z', userId: 1 }
        ];
        return { mockCategories };
    };

    const createMockTask = (overrides: Partial<Task> = {}): Task => ({
        id: 1,
        title: 'Test Task',
        description: '',
        isCompleted: false,
        createdAt: '2024-01-15T12:00:00Z',
        dueDate: null,
        categoryId: null,
        ...overrides
    });

    const renderUseCategoryChartData = (tasks: Task[] = [], categories: Category[] = []) => {
        return renderHook(() => useCategoryChartData(tasks, categories));
    };

    describe('Core Chart Data Generation', () => {
        it('should generate correct chart data for categorized tasks', () => {
            const { mockCategories } = setupMocks();
            const tasks = [
                createMockTask({ id: 1, categoryId: 1 }),
                createMockTask({ id: 2, categoryId: 1 }),
                createMockTask({ id: 3, categoryId: 2 }),
                createMockTask({ id: 4, categoryId: 3 })
            ];

            const { result } = renderUseCategoryChartData(tasks, mockCategories);

            expect(result.current.labels).toEqual(['Work', 'Personal', 'Shopping']);
            expect(result.current.datasets[0].data).toEqual([2, 1, 1]);
            expect(result.current.datasets[0].backgroundColor).toEqual(['#ff5722', '#2196f3', '#4caf50']);
        });

        it('should handle tasks without categories', () => {
            const { mockCategories } = setupMocks();
            const tasks = [
                createMockTask({ id: 1, categoryId: 1 }),
                createMockTask({ id: 2, categoryId: null }),
                createMockTask({ id: 3, categoryId: null })
            ];

            const { result } = renderUseCategoryChartData(tasks, mockCategories);

            expect(result.current.labels).toEqual(['Work', 'Personal', 'Shopping', 'uncategorized']);
            expect(result.current.datasets[0].data).toEqual([1, 0, 0, 2]);
            expect(result.current.datasets[0].backgroundColor).toEqual(['#ff5722', '#2196f3', '#4caf50', '#9CA3AF']);
        });

        it('should handle empty categories list', () => {
            const tasks = [
                createMockTask({ id: 1, categoryId: null }),
                createMockTask({ id: 2, categoryId: null })
            ];

            const { result } = renderUseCategoryChartData(tasks, []);

            expect(result.current.labels).toEqual(['uncategorized']);
            expect(result.current.datasets[0].data).toEqual([2]);
            expect(result.current.datasets[0].backgroundColor).toEqual(['#9CA3AF']);
        });
    });

    describe('Data Structure & Properties', () => {
        it('should return correct chart structure', () => {
            const { mockCategories } = setupMocks();
            const tasks = [createMockTask({ id: 1, categoryId: 1 })];

            const { result } = renderUseCategoryChartData(tasks, mockCategories);

            expect(result.current).toHaveProperty('labels');
            expect(result.current).toHaveProperty('datasets');
            expect(result.current.datasets[0]).toHaveProperty('data');
            expect(result.current.datasets[0]).toHaveProperty('backgroundColor');
            expect(result.current.datasets[0]).toHaveProperty('borderWidth');
            expect(result.current.datasets[0].borderWidth).toBe(0);
        });

        it('should exclude categories with zero tasks', () => {
            const { mockCategories } = setupMocks();
            const tasks = [createMockTask({ id: 1, categoryId: 1 })];

            const { result } = renderUseCategoryChartData(tasks, mockCategories);

            expect(result.current.labels).toEqual(['Work', 'Personal', 'Shopping']);
            expect(result.current.datasets[0].data).toEqual([1, 0, 0]);
        });

        it('should handle tasks with non-existent category IDs', () => {
            const { mockCategories } = setupMocks();
            const tasks = [
                createMockTask({ id: 1, categoryId: 999 }),
                createMockTask({ id: 2, categoryId: 1 })
            ];

            const { result } = renderUseCategoryChartData(tasks, mockCategories);

            expect(result.current.datasets[0].data).toEqual([1, 0, 0]);
        });
    });

    describe('Performance & Memoization', () => {
        it('should memoize results for same input', () => {
            const { mockCategories } = setupMocks();
            const tasks = [createMockTask({ id: 1, categoryId: 1 })];
            const { result, rerender } = renderUseCategoryChartData(tasks, mockCategories);

            const firstResult = result.current;
            rerender();
            const secondResult = result.current;

            expect(firstResult).toBe(secondResult);
        });

        it('should recalculate when tasks change', () => {
            const { mockCategories } = setupMocks();
            const initialTasks = [createMockTask({ id: 1, categoryId: 1 })];
            const { result } = renderUseCategoryChartData(initialTasks, mockCategories);

            expect(result.current.datasets[0].data[0]).toBe(1);

            const updatedTasks = [
                createMockTask({ id: 1, categoryId: 1 }),
                createMockTask({ id: 2, categoryId: 1 })
            ];

            const { result: newResult } = renderUseCategoryChartData(updatedTasks, mockCategories);
            expect(newResult.current.datasets[0].data[0]).toBe(2);
        });

        it('should handle edge cases gracefully', () => {
            const { result: emptyResult } = renderUseCategoryChartData([], []);
            expect(emptyResult.current.labels).toEqual([]);
            expect(emptyResult.current.datasets[0].data).toEqual([]);

            const { mockCategories } = setupMocks();
            const { result: noTasksResult } = renderUseCategoryChartData([], mockCategories);
            expect(noTasksResult.current.labels).toEqual(['Work', 'Personal', 'Shopping']);
            expect(noTasksResult.current.datasets[0].data).toEqual([0, 0, 0]);
        });
    });
});
