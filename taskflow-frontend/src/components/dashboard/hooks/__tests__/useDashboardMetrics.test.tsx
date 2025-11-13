import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { addDays, subDays } from 'date-fns';
import { useDashboardMetrics } from '../useDashboardMetrics';
import type { Task } from '../../../../types/Task';

describe('useDashboardMetrics', () => {
    const task = (overrides: Partial<Task> = {}): Task => ({
        id: 1, title: 'Test', description: '', isCompleted: false,
        createdAt: '2024-01-15T12:00:00Z', dueDate: null, categoryId: null, ...overrides
    });

    beforeEach(() => vi.useFakeTimers({ now: new Date('2024-01-15T12:00:00Z') }));
    afterEach(() => vi.useRealTimers());

    it('calculates basic metrics', () => {
        const { result } = renderHook(() => useDashboardMetrics([
            task({ id: 1, isCompleted: true }), task({ id: 2 }), task({ id: 3, isCompleted: true })
        ]));
        expect(result.current).toEqual({ total: 3, completed: 2, pending: 1, completionRate: 66.66666666666666, overdue: 0, dueSoon: 0 });
    });

    it('handles empty list', () => {
        const { result } = renderHook(() => useDashboardMetrics([]));
        expect(result.current).toEqual({ total: 0, completed: 0, pending: 0, completionRate: 0, overdue: 0, dueSoon: 0 });
    });

    it('identifies overdue tasks', () => {
        const { result } = renderHook(() => useDashboardMetrics([
            task({ dueDate: subDays(new Date(), 1).toISOString() }),
            task({ dueDate: addDays(new Date(), 1).toISOString() }),
            task({ isCompleted: true, dueDate: subDays(new Date(), 1).toISOString() })
        ]));
        expect(result.current.overdue).toBe(1);
    });

    it('identifies due soon tasks', () => {
        const { result } = renderHook(() => useDashboardMetrics([
            task({ dueDate: addDays(new Date(), 2).toISOString() }),
            task({ dueDate: addDays(new Date(), 5).toISOString() }),
            task({ isCompleted: true, dueDate: addDays(new Date(), 2).toISOString() })
        ]));
        expect(result.current.dueSoon).toBe(1);
    });

    it('memoizes results', () => {
        const tasks = [task({ isCompleted: true })];
        const { result, rerender } = renderHook(() => useDashboardMetrics(tasks));
        const first = result.current;
        rerender();
        expect(result.current).toBe(first);
    });
});
