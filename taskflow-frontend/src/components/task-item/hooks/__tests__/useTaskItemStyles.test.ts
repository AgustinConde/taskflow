import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTaskItemStyles } from '../useTaskItemStyles';
import type { Task } from '../../../../types/Task';

const mockTheme = {
    palette: {
        primary: { main: '#1976d2' },
        error: { main: '#d32f2f', light: '#ef5350' },
        warning: { main: '#ed6c02' },
        background: { paper: '#ffffff' }
    }
};

function setupMocks() {
    return {};
}

function renderUseTaskItemStyles(task: Task) {
    return renderHook(() => useTaskItemStyles(task));
}

function createMockTask(overrides: Partial<Task> = {}): Task {
    return {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        isCompleted: false,
        dueDate: null,
        categoryId: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        ...overrides
    };
}

describe('useTaskItemStyles', () => {
    beforeEach(() => {
        setupMocks();
    });

    describe('background color calculation', () => {
        it('should return completed task background when task is completed', () => {
            const completedTask = createMockTask({ isCompleted: true });
            const { result } = renderUseTaskItemStyles(completedTask);

            const backgroundFn = result.current.backgroundColor;
            const backgroundColor = backgroundFn(mockTheme as any);

            expect(backgroundColor).toContain('rgba');
            expect(backgroundColor).toContain('0.6');
        });

        it('should return overdue background for past due tasks', () => {
            const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const overdueTask = createMockTask({ dueDate: pastDate });
            const { result } = renderUseTaskItemStyles(overdueTask);

            const backgroundFn = result.current.backgroundColor;
            const backgroundColor = backgroundFn(mockTheme as any);

            expect(backgroundColor).toContain('rgba');
            expect(backgroundColor).toContain('0.7');
        });

        it('should return urgent background for tasks due within 3 hours', () => {
            const urgentDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
            const urgentTask = createMockTask({ dueDate: urgentDate });
            const { result } = renderUseTaskItemStyles(urgentTask);

            const backgroundFn = result.current.backgroundColor;
            const backgroundColor = backgroundFn(mockTheme as any);

            expect(backgroundColor).toContain('rgba');
            expect(backgroundColor).toContain('0.4');
        });

        it('should return warning background for tasks due within 24 hours', () => {
            const warningDate = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
            const warningTask = createMockTask({ dueDate: warningDate });
            const { result } = renderUseTaskItemStyles(warningTask);

            const backgroundFn = result.current.backgroundColor;
            const backgroundColor = backgroundFn(mockTheme as any);

            expect(backgroundColor).toContain('rgba');
            expect(backgroundColor).toContain('0.3');
        });

        it('should return default background for tasks due far in future', () => {
            const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
            const futureTask = createMockTask({ dueDate: futureDate });
            const { result } = renderUseTaskItemStyles(futureTask);

            const backgroundFn = result.current.backgroundColor;
            const backgroundColor = backgroundFn(mockTheme as any);

            expect(backgroundColor).toBe('#ffffff');
        });

        it('should return default background for tasks without due date', () => {
            const taskWithoutDate = createMockTask({ dueDate: null });
            const { result } = renderUseTaskItemStyles(taskWithoutDate);

            const backgroundFn = result.current.backgroundColor;
            const backgroundColor = backgroundFn(mockTheme as any);

            expect(backgroundColor).toBe('#ffffff');
        });
    });

    describe('edge cases', () => {
        it('should handle exactly 3 hours boundary condition', () => {
            const exactDate = new Date(Date.now() + 3 * 60 * 60 * 1000 + 60000).toISOString();
            const exactTask = createMockTask({ dueDate: exactDate });
            const { result } = renderUseTaskItemStyles(exactTask);

            const backgroundFn = result.current.backgroundColor;
            const backgroundColor = backgroundFn(mockTheme as any);

            expect(backgroundColor).toContain('rgba');
            expect(backgroundColor).toContain('0.3');
        });

        it('should handle exactly 24 hours boundary condition', () => {
            const exactDate = new Date(Date.now() + 24 * 60 * 60 * 1000 + 1000).toISOString();
            const exactTask = createMockTask({ dueDate: exactDate });
            const { result } = renderUseTaskItemStyles(exactTask);

            const backgroundFn = result.current.backgroundColor;
            const backgroundColor = backgroundFn(mockTheme as any);

            expect(backgroundColor).toBe('#ffffff');
        });

        it('should prioritize completed status over due date', () => {
            const overdueDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const completedOverdueTask = createMockTask({
                isCompleted: true,
                dueDate: overdueDate
            });
            const { result } = renderUseTaskItemStyles(completedOverdueTask);

            const backgroundFn = result.current.backgroundColor;
            const backgroundColor = backgroundFn(mockTheme as any);

            expect(backgroundColor).toContain('rgba');
            expect(backgroundColor).toContain('0.6');
        });
    });
});
