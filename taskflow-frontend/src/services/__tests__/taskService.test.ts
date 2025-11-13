import { describe, it, expect, beforeEach, vi } from 'vitest';
import { taskService } from '../taskService';
import { mockTasks } from '../../__tests__/fixtures/tasks';
import { authService } from '../authService';

function mockFetch(response: any, ok = true) {
    return vi.fn().mockResolvedValue({
        ok,
        json: vi.fn().mockResolvedValue(response)
    });
}

describe('TaskService', () => {
    const originalFetch = global.fetch;
    const token = 'mock-token';
    beforeEach(() => {
        vi.restoreAllMocks();
        global.fetch = originalFetch;
        vi.spyOn(authService, 'getToken').mockReturnValue(token);
    });

    describe('getTasks', () => {
        it('does not include Authorization header if token is missing', async () => {
            vi.spyOn(authService, 'getToken').mockReturnValue(null);
            const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockTasks) });
            global.fetch = fetchSpy;
            await taskService.getTasks();
            const headers = fetchSpy.mock.calls[0][1].headers;
            expect(headers).not.toHaveProperty('Authorization');
        });
        it('fetches tasks successfully', async () => {
            global.fetch = mockFetch(mockTasks);
            const tasks = await taskService.getTasks();
            expect(Array.isArray(tasks)).toBe(true);
            expect(tasks.length).toBeGreaterThan(0);
            expect(tasks[0]).toHaveProperty('id');
        });
        it('throws error on failed fetch', async () => {
            global.fetch = mockFetch({}, false);
            await expect(taskService.getTasks()).rejects.toThrow('Failed to fetch tasks');
        });
    });

    describe('getTask', () => {
        it('fetches a specific task', async () => {
            global.fetch = mockFetch(mockTasks[0]);
            const result = await taskService.getTask(1);
            expect(result).toHaveProperty('id', 1);
        });
        it('throws error if not found', async () => {
            global.fetch = mockFetch({}, false);
            await expect(taskService.getTask(999)).rejects.toThrow('Failed to fetch task');
        });
    });

    describe('createTask', () => {
        it('creates task with UTC date conversion', async () => {
            const newTask = { title: 'Test', description: 'Desc', categoryId: 1, dueDate: '2024-12-31T23:59' };
            global.fetch = mockFetch({ ...newTask, id: 123, isCompleted: false });
            await taskService.createTask(newTask);
            const callArgs = (global.fetch as any).mock.calls[0][1];
            const body = JSON.parse(callArgs.body);
            expect(body.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });

        it('creates a new task', async () => {
            const newTask = { title: 'Test', description: 'Desc', categoryId: 1 };
            global.fetch = mockFetch({ ...newTask, id: 123, isCompleted: false });
            const result = await taskService.createTask(newTask);
            expect(result).toHaveProperty('id');
            expect(result.title).toBe('Test');
        });
        it('throws error with custom message from API', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: vi.fn().mockResolvedValue({ title: 'Custom error' })
            });
            await expect(taskService.createTask({ title: 'fail' })).rejects.toThrow('Custom error');
        });
        it('throws error with default message', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: vi.fn().mockResolvedValue({})
            });
            await expect(taskService.createTask({ title: 'fail' })).rejects.toThrow('Failed to create task');
        });
    });

    describe('updateTask', () => {
        it('updates an existing task', async () => {
            const updates = { title: 'Updated', isCompleted: true };
            global.fetch = mockFetch({ ...mockTasks[0], ...updates });
            const result = await taskService.updateTask(1, updates);
            expect(result.title).toBe('Updated');
            expect(result.isCompleted).toBe(true);
        });
        it('throws error on failed update', async () => {
            global.fetch = mockFetch({}, false);
            await expect(taskService.updateTask(1, {})).rejects.toThrow('Failed to update task');
        });
    });

    describe('deleteTask', () => {
        it('deletes a task successfully', async () => {
            global.fetch = mockFetch({}, true);
            await expect(taskService.deleteTask(1)).resolves.toBeUndefined();
        });
        it('throws error on failed delete', async () => {
            global.fetch = mockFetch({}, false);
            await expect(taskService.deleteTask(1)).rejects.toThrow('Failed to delete task');
        });
    });

    describe('getTaskById', () => {
        it('fetches a specific task', async () => {
            global.fetch = mockFetch(mockTasks[0]);
            const result = await taskService.getTaskById(1);
            expect(result).toHaveProperty('id', 1);
        });
        it('throws error if not found', async () => {
            global.fetch = mockFetch({}, false);
            await expect(taskService.getTaskById(999)).rejects.toThrow('Failed to fetch task');
        });
    });
});
