import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { NotificationContext } from '../../../../contexts/NotificationContext';
import { useTaskManagement } from '../useTaskManagement';
import { taskService } from '../../../../services/taskService';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../../../contexts/NotificationContext';
import type { Task } from '../../../../types/Task';

vi.mock('../../../../services/taskService');
vi.mock('react-i18next');
vi.mock('../../../contexts/NotificationContext', () => ({
    useNotifications: () => ({
        showSuccess: vi.fn(),
        showError: vi.fn(),
        showNotification: vi.fn(),
        showWarning: vi.fn(),
        showInfo: vi.fn(),
        hideNotification: vi.fn(),
    })
}));

const mockTasks: Task[] = [
    {
        id: 1,
        title: 'Task 1',
        description: 'Desc',
        isCompleted: false,
        createdAt: '2025-08-26T00:00:00.000Z',
        dueDate: null,
        categoryId: null
    },
    {
        id: 2,
        title: 'Task 2',
        description: 'Desc',
        isCompleted: true,
        createdAt: '2025-08-26T00:00:00.000Z',
        dueDate: null,
        categoryId: null
    }
];

const setupMocks = () => {
    (taskService.getTasks as any).mockResolvedValue([...mockTasks]);
    (taskService.createTask as any).mockResolvedValue({});
    (taskService.updateTask as any).mockResolvedValue({});
    (taskService.deleteTask as any).mockResolvedValue({});
    (useTranslation as any).mockReturnValue({ t: (k: string) => k });

};

const notificationMock = {
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showNotification: vi.fn(),
    showWarning: vi.fn(),
    showInfo: vi.fn(),
    hideNotification: vi.fn(),
    clearAll: vi.fn(),
};

const ProviderWrapper = ({ children }: { children: React.ReactNode }) => (
    <NotificationContext.Provider value={notificationMock}>
        {children}
    </NotificationContext.Provider>
);

const getHook = () => {
    setupMocks();
    return renderHook(() => useTaskManagement(), { wrapper: ProviderWrapper });
};

describe('useTaskManagement', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchTasks', () => {
        it('fetches and sets tasks', async () => {
            const { result } = getHook();
            await act(async () => {
                await result.current.fetchTasks();
            });
            expect(result.current.tasks).toEqual(mockTasks);
            expect(result.current.loading).toBe(false);
        });

        it('handles fetch error', async () => {
            (taskService.getTasks as any).mockRejectedValueOnce(new Error('fail'));
            const { result } = getHook();
            await act(async () => {
                await result.current.fetchTasks();
            });
            expect(result.current.tasks).toEqual(mockTasks);
            expect(result.current.loading).toBe(false);
        });
    });

    describe('createTask', () => {
        it('creates a task and refreshes list', async () => {
            const { result } = getHook();
            await act(async () => {
                const res = await result.current.createTask({
                    title: 'New', description: 'Desc', dueDate: null, categoryId: null
                });
                expect(res).toBe(true);
            });
            expect(taskService.createTask).toHaveBeenCalled();
            expect(result.current.creating).toBe(false);
        });

        it('handles create error', async () => {
            (taskService.createTask as any).mockRejectedValueOnce(new Error('fail'));
            const { result } = getHook();
            await act(async () => {
                const res = await result.current.createTask({
                    title: 'New', description: 'Desc', dueDate: null, categoryId: null
                });
                expect(res).toBe(false);
            });
            expect(result.current.creating).toBe(false);
        });
    });

    describe('updateTask', () => {
        it('updates a task and refreshes list', async () => {
            const { result } = getHook();
            await act(async () => {
                const res = await result.current.updateTask({ ...mockTasks[0] });
                expect(res).toBe(true);
            });
            expect(taskService.updateTask).toHaveBeenCalled();
        });

        it('handles update error', async () => {
            (taskService.updateTask as any).mockRejectedValueOnce(new Error('fail'));
            const { result } = getHook();
            await act(async () => {
                const res = await result.current.updateTask({ ...mockTasks[0] });
                expect(res).toBe(false);
            });
        });
    });

    describe('toggleTaskCompleted', () => {
        it('toggles completion and updates', async () => {
            const { result } = getHook();
            await act(async () => {
                await result.current.toggleTaskCompleted(mockTasks[0]);
            });
            expect(taskService.updateTask).toHaveBeenCalledWith(1, { ...mockTasks[0], isCompleted: true });
            expect(result.current.tasks[0].isCompleted).toBe(false);
        });

        it('reverts on update error', async () => {
            (taskService.updateTask as any).mockRejectedValueOnce(new Error('fail'));
            const { result } = getHook();
            await act(async () => {
                await result.current.toggleTaskCompleted(mockTasks[0]);
            });
            expect(result.current.tasks[0].isCompleted).toBe(false);
        });
    });

    describe('delete flow', () => {
        it('sets and cancels deleteId', () => {
            const { result } = getHook();
            act(() => {
                result.current.requestDeleteTask(1);
            });
            expect(result.current.deleteId).toBe(1);
            act(() => {
                result.current.cancelDeleteTask();
            });
            expect(result.current.deleteId).toBe(null);
        });

        it('confirms delete and refreshes', async () => {
            const { result } = getHook();
            act(() => {
                result.current.requestDeleteTask(1);
            });
            await act(async () => {
                const res = await result.current.confirmDeleteTask();
                expect(res).toBe(true);
            });
            expect(taskService.deleteTask).toHaveBeenCalledWith(1);
            expect(result.current.deleteId).toBe(null);
            expect(result.current.deleteLoading).toBe(false);
        });

        it('handles delete error', async () => {
            (taskService.deleteTask as any).mockRejectedValueOnce(new Error('fail'));
            const { result } = getHook();
            act(() => {
                result.current.requestDeleteTask(1);
            });
            await act(async () => {
                const res = await result.current.confirmDeleteTask();
                expect(res).toBe(false);
            });
            expect(result.current.deleteLoading).toBe(false);
        });
    });

    describe('initial effect', () => {
        it('fetches tasks on mount', async () => {
            const { result } = getHook();
            await act(async () => {
                await result.current.fetchTasks();
            });
            expect(result.current.tasks).toEqual(mockTasks);
        });
    });

    describe('createTask date conversion', () => {
        it('returns null if dueDate is null', async () => {
            const { result } = getHook();
            await act(async () => {
                await result.current.createTask({
                    title: 'Test',
                    description: 'Desc',
                    dueDate: null,
                    categoryId: null
                });
            });
            expect(taskService.createTask).toHaveBeenCalledWith(
                expect.objectContaining({ dueDate: null })
            );
        });

        it('converts local date to UTC string', async () => {
            const { result } = getHook();
            const localDate = '2025-08-26T12:00:00';
            await act(async () => {
                await result.current.createTask({
                    title: 'Test',
                    description: 'Desc',
                    dueDate: localDate,
                    categoryId: null
                });
            });
            expect(taskService.createTask).toHaveBeenCalledWith(
                expect.objectContaining({
                    dueDate: new Date(localDate).toISOString()
                })
            );
        });
    });

    describe('toggleTaskCompleted only updates correct task', () => {
        it('only toggles the specified task', async () => {
            const { result } = getHook();
            const initialTasks = [
                { ...mockTasks[0] },
                { ...mockTasks[1] }
            ];
            (taskService.getTasks as any).mockResolvedValue(initialTasks);
            await act(async () => {
                await result.current.fetchTasks();
            });
            await act(async () => {
                await result.current.toggleTaskCompleted(initialTasks[1]);
            });
            expect(result.current.tasks[0].isCompleted).toBe(false);
            expect(result.current.tasks[1].isCompleted).toBe(false);
            expect(taskService.updateTask).toHaveBeenCalledWith(2, { ...initialTasks[1], isCompleted: false });
        });
    });
});
