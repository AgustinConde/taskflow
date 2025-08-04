import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../../__tests__/mocks/server';
import { taskService } from '../taskService';
import { mockTasks } from '../../__tests__/fixtures/tasks';

describe('TaskService', () => {
    beforeEach(() => {
        server.resetHandlers();
    });

    describe('getTasks', () => {
        it('should fetch tasks successfully', async () => {
            const tasks = await taskService.getTasks();

            expect(Array.isArray(tasks)).toBe(true);
            expect(tasks.length).toBeGreaterThan(0);
            expect(tasks[0]).toHaveProperty('id');
            expect(tasks[0]).toHaveProperty('title');
            expect(tasks[0]).toHaveProperty('isCompleted');
        });
    });

    describe('createTask', () => {
        it('should create a new task', async () => {
            const newTask = {
                title: 'Test Task',
                description: 'Test Description',
                categoryId: 1,
                dueDate: new Date().toISOString()
            };

            const result = await taskService.createTask(newTask);

            expect(result).toHaveProperty('id');
            expect(result.title).toBe(newTask.title);
            expect(result.description).toBe(newTask.description);
            expect(result.categoryId).toBe(newTask.categoryId);
            expect(result.isCompleted).toBe(false);
        });

        it('should create task with minimal data', async () => {
            const newTask = {
                title: 'Minimal Task'
            };

            const result = await taskService.createTask(newTask);

            expect(result).toHaveProperty('id');
            expect(result.title).toBe(newTask.title);
            expect(result.isCompleted).toBe(false);
        });
    });

    describe('updateTask', () => {
        it('should update an existing task', async () => {
            const taskId = 1;
            const updates = {
                title: 'Updated Task',
                description: 'Updated Description',
                isCompleted: true
            };

            const result = await taskService.updateTask(taskId, updates);

            expect(result).toHaveProperty('id', taskId);
            expect(result.title).toBe(updates.title);
            expect(result.description).toBe(updates.description);
            expect(result.isCompleted).toBe(updates.isCompleted);
        });

        it('should toggle task completion status', async () => {
            const taskId = 1;
            const updates = { isCompleted: true };

            const result = await taskService.updateTask(taskId, updates);

            expect(result.isCompleted).toBe(true);
        });
    });

    describe('deleteTask', () => {
        it('should delete a task', async () => {
            const taskId = 1;

            await expect(taskService.deleteTask(taskId)).resolves.not.toThrow();
        });
    });

    describe('getTaskById', () => {
        it('should fetch a specific task', async () => {
            const taskId = 1;

            const result = await taskService.getTask(taskId);

            expect(result).toHaveProperty('id', taskId);
            expect(result).toHaveProperty('title');
            expect(result).toHaveProperty('isCompleted');
        });

        it('should handle non-existent task', async () => {
            const taskId = 99999;

            await expect(taskService.getTask(taskId)).rejects.toThrow();
        });
    });
});
