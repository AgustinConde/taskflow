import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { subDays } from 'date-fns';
import { useFilteredTasks, useActivityChartData } from '../useChartData';
import type { Task } from '../../../../types/Task';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en' }
    })
}));

describe('useChartData', () => {
    const setupMocks = () => {
        const now = new Date('2024-01-15T12:00:00Z');
        vi.setSystemTime(now);
        return { now };
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

    beforeEach(() => {
        vi.useFakeTimers();
        setupMocks();
    });

    describe('useFilteredTasks', () => {
        const renderUseFilteredTasks = (tasks: Task[], timeRange: '7d' | '30d' | '90d' | 'all') => {
            return renderHook(() => useFilteredTasks(tasks, timeRange));
        };

        it('should return all tasks for "all" time range', () => {
            const tasks = [
                createMockTask({ id: 1, createdAt: '2024-01-01T12:00:00Z' }),
                createMockTask({ id: 2, createdAt: '2023-12-01T12:00:00Z' })
            ];

            const { result } = renderUseFilteredTasks(tasks, 'all');
            expect(result.current).toHaveLength(2);
        });

        it('should filter tasks by 7d time range', () => {
            const now = new Date('2024-01-15T12:00:00Z');
            const recent = subDays(now, 3).toISOString();
            const old = subDays(now, 10).toISOString();

            const tasks = [
                createMockTask({ id: 1, createdAt: recent }),
                createMockTask({ id: 2, createdAt: old })
            ];

            const { result } = renderUseFilteredTasks(tasks, '7d');
            expect(result.current).toHaveLength(1);
            expect(result.current[0].id).toBe(1);
        });

        it('should filter tasks by 30d time range', () => {
            const now = new Date('2024-01-15T12:00:00Z');
            const recent = subDays(now, 20).toISOString();
            const old = subDays(now, 40).toISOString();

            const tasks = [
                createMockTask({ id: 1, createdAt: recent }),
                createMockTask({ id: 2, createdAt: old })
            ];

            const { result } = renderUseFilteredTasks(tasks, '30d');
            expect(result.current).toHaveLength(1);
            expect(result.current[0].id).toBe(1);
        });

        it('should filter tasks by 90d time range', () => {
            const now = new Date('2024-01-15T12:00:00Z');
            const recent = subDays(now, 60).toISOString();
            const old = subDays(now, 120).toISOString();

            const tasks = [
                createMockTask({ id: 1, createdAt: recent }),
                createMockTask({ id: 2, createdAt: old })
            ];

            const { result } = renderUseFilteredTasks(tasks, '90d');
            expect(result.current).toHaveLength(1);
            expect(result.current[0].id).toBe(1);
        });
    });

    describe('useActivityChartData', () => {
        const renderUseActivityChartData = (
            tasks: Task[],
            filteredTasks: Task[],
            timeRange: '7d' | '30d' | '90d' | 'all'
        ) => {
            return renderHook(() => useActivityChartData(tasks, filteredTasks, timeRange));
        };

        it('should generate correct chart structure', () => {
            const tasks = [createMockTask({ id: 1, isCompleted: true })];
            const { result } = renderUseActivityChartData(tasks, tasks, '7d');

            expect(result.current).toHaveProperty('labels');
            expect(result.current).toHaveProperty('datasets');
            expect(result.current.datasets).toHaveLength(2);
            expect(result.current.datasets[0]).toHaveProperty('label');
            expect(result.current.datasets[0]).toHaveProperty('data');
            expect(result.current.datasets[0]).toHaveProperty('borderColor');
            expect(result.current.datasets[0]).toHaveProperty('backgroundColor');
        });

        it('should generate correct number of labels for 7d range', () => {
            const tasks = [createMockTask({ id: 1 })];
            const { result } = renderUseActivityChartData(tasks, tasks, '7d');

            expect(result.current.labels).toHaveLength(7);
            expect(result.current.datasets[0].data).toHaveLength(7);
            expect(result.current.datasets[1].data).toHaveLength(7);
        });

        it('should generate correct number of labels for 30d range', () => {
            const tasks = [createMockTask({ id: 1 })];
            const { result } = renderUseActivityChartData(tasks, tasks, '30d');

            expect(result.current.labels).toHaveLength(30);
            expect(result.current.datasets[0].data).toHaveLength(30);
            expect(result.current.datasets[1].data).toHaveLength(30);
        });

        it('should count created and completed tasks correctly', () => {
            const today = new Date('2024-01-15T12:00:00Z').toISOString();

            const tasks = [
                createMockTask({ id: 1, createdAt: today, isCompleted: false }),
                createMockTask({ id: 2, createdAt: today, isCompleted: true }),
                createMockTask({ id: 3, createdAt: today, isCompleted: true })
            ];

            const { result } = renderUseActivityChartData(tasks, tasks, '7d');

            const todayIndex = result.current.labels.length - 1;
            expect(result.current.datasets[0].data[todayIndex]).toBe(3);
            expect(result.current.datasets[1].data[todayIndex]).toBe(2);
        });
    });

    describe('Performance & Edge Cases', () => {
        it('should handle empty tasks arrays', () => {
            const { result: filteredResult } = renderHook(() => useFilteredTasks([], '7d'));
            expect(filteredResult.current).toEqual([]);

            const { result: chartResult } = renderHook(() => useActivityChartData([], [], '7d'));
            expect(chartResult.current.datasets[0].data.every(count => count === 0)).toBe(true);
        });

        it('should memoize filtered tasks results', () => {
            const tasks = [createMockTask({ id: 1 })];
            const { result, rerender } = renderHook(() => useFilteredTasks(tasks, '7d'));

            const firstResult = result.current;
            rerender();
            const secondResult = result.current;

            expect(firstResult).toBe(secondResult);
        });

        it('should generate consistent chart data structure', () => {
            const tasks = [createMockTask({ id: 1 })];
            const { result } = renderHook(() => useActivityChartData(tasks, tasks, '7d'));

            const chartData = result.current;

            expect(chartData.labels).toHaveLength(7);
            expect(chartData.datasets).toHaveLength(2);
            expect(chartData.datasets[0].label).toBe('tasksCreated');
            expect(chartData.datasets[1].label).toBe('tasksCompleted');
        });

        it('should handle tasks without createdAt dates', () => {
            const tasks = [
                createMockTask({ id: 1, createdAt: undefined as any }),
                createMockTask({ id: 2, createdAt: '2024-01-15T12:00:00Z' })
            ];

            const { result } = renderHook(() => useFilteredTasks(tasks, '7d'));
            expect(result.current).toHaveLength(1);
            expect(result.current[0].id).toBe(2);
        });
    });
});
