import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { addDays, subDays } from 'date-fns';
import { useDashboardMetrics } from '../useDashboardMetrics';
import type { Task } from '../../../../types/Task';

describe('useDashboardMetrics', () => {
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

    const renderUseDashboardMetrics = (tasks: Task[] = []) => {
        return renderHook(() => useDashboardMetrics(tasks));
    };

    beforeEach(() => {
        vi.useFakeTimers();
        setupMocks();
    });

    describe('Core Metrics Calculation', () => {
        it('should calculate basic metrics correctly', () => {
            const tasks = [
                createMockTask({ id: 1, isCompleted: true }),
                createMockTask({ id: 2, isCompleted: false }),
                createMockTask({ id: 3, isCompleted: true })
            ];

            const { result } = renderUseDashboardMetrics(tasks);

            expect(result.current.total).toBe(3);
            expect(result.current.completed).toBe(2);
            expect(result.current.pending).toBe(1);
            expect(result.current.completionRate).toBe(66.66666666666666);
        });

        it('should handle empty task list', () => {
            const { result } = renderUseDashboardMetrics([]);

            expect(result.current.total).toBe(0);
            expect(result.current.completed).toBe(0);
            expect(result.current.pending).toBe(0);
            expect(result.current.completionRate).toBe(0);
            expect(result.current.overdue).toBe(0);
            expect(result.current.dueSoon).toBe(0);
        });

        it('should calculate completion rate for all completed tasks', () => {
            const tasks = [
                createMockTask({ id: 1, isCompleted: true }),
                createMockTask({ id: 2, isCompleted: true })
            ];

            const { result } = renderUseDashboardMetrics(tasks);

            expect(result.current.completionRate).toBe(100);
        });
    });

    describe('Due Date Analysis', () => {
        it('should identify overdue tasks correctly', () => {
            const yesterday = subDays(new Date(), 1).toISOString();
            const tomorrow = addDays(new Date(), 1).toISOString();

            const tasks = [
                createMockTask({ id: 1, isCompleted: false, dueDate: yesterday }),
                createMockTask({ id: 2, isCompleted: false, dueDate: tomorrow }),
                createMockTask({ id: 3, isCompleted: true, dueDate: yesterday })
            ];

            const { result } = renderUseDashboardMetrics(tasks);

            expect(result.current.overdue).toBe(1);
        });

        it('should identify due soon tasks correctly', () => {
            const inTwoDays = addDays(new Date(), 2).toISOString();
            const inFiveDays = addDays(new Date(), 5).toISOString();

            const tasks = [
                createMockTask({ id: 1, isCompleted: false, dueDate: inTwoDays }),
                createMockTask({ id: 2, isCompleted: false, dueDate: inFiveDays }),
                createMockTask({ id: 3, isCompleted: true, dueDate: inTwoDays })
            ];

            const { result } = renderUseDashboardMetrics(tasks);

            expect(result.current.dueSoon).toBe(1);
        });

        it('should handle tasks without due dates', () => {
            const tasks = [
                createMockTask({ id: 1, isCompleted: false, dueDate: null }),
                createMockTask({ id: 2, isCompleted: false })
            ];

            const { result } = renderUseDashboardMetrics(tasks);

            expect(result.current.overdue).toBe(0);
            expect(result.current.dueSoon).toBe(0);
        });
    });

    describe('Performance & Memoization', () => {
        it('should memoize results for same input', () => {
            const tasks = [createMockTask({ id: 1, isCompleted: true })];
            const { result, rerender } = renderUseDashboardMetrics(tasks);

            const firstResult = result.current;
            rerender();
            const secondResult = result.current;

            expect(firstResult).toBe(secondResult);
        });

        it('should handle different task states correctly', () => {
            const tasks = [
                createMockTask({ id: 1, isCompleted: false }),
                createMockTask({ id: 2, isCompleted: true }),
                createMockTask({ id: 3, isCompleted: false })
            ];

            const { result } = renderHook(() => useDashboardMetrics(tasks));

            expect(result.current.total).toBe(3);
            expect(result.current.completed).toBe(1);
            expect(result.current.pending).toBe(2);
        });

        it('should handle complex scenarios with all metrics', () => {
            const yesterday = subDays(new Date(), 1).toISOString();
            const inTwoDays = addDays(new Date(), 2).toISOString();

            const tasks = [
                createMockTask({ id: 1, isCompleted: true }),
                createMockTask({ id: 2, isCompleted: false, dueDate: yesterday }),
                createMockTask({ id: 3, isCompleted: false, dueDate: inTwoDays }),
                createMockTask({ id: 4, isCompleted: false })
            ];

            const { result } = renderUseDashboardMetrics(tasks);

            expect(result.current.total).toBe(4);
            expect(result.current.completed).toBe(1);
            expect(result.current.pending).toBe(3);
            expect(result.current.completionRate).toBe(25);
            expect(result.current.overdue).toBe(1);
            expect(result.current.dueSoon).toBe(1);
        });
    });
});
