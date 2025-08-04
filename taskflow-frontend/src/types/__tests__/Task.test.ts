import { describe, it, expect } from 'vitest';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../Task';

describe('Task Types', () => {
    describe('Task interface', () => {
        it('should have correct structure with all fields', () => {
            const mockTask: Task = {
                id: 1,
                title: 'Test Task',
                description: 'A test task description',
                isCompleted: false,
                createdAt: '2025-01-01T00:00:00Z',
                dueDate: '2025-01-15T00:00:00Z',
                categoryId: 1,
                categoryName: 'Work'
            };

            expect(typeof mockTask.id).toBe('number');
            expect(typeof mockTask.title).toBe('string');
            expect(typeof mockTask.description).toBe('string');
            expect(typeof mockTask.isCompleted).toBe('boolean');
            expect(typeof mockTask.createdAt).toBe('string');
            expect(typeof mockTask.dueDate).toBe('string');
            expect(typeof mockTask.categoryId).toBe('number');
            expect(typeof mockTask.categoryName).toBe('string');
        });

        it('should allow optional fields to be undefined', () => {
            const mockTask: Task = {
                id: 1,
                title: 'Minimal Task',
                isCompleted: false,
                createdAt: '2025-01-01T00:00:00Z',
                dueDate: null,
                categoryId: null
            };

            expect(mockTask.description).toBeUndefined();
            expect(mockTask.categoryName).toBeUndefined();
            expect(mockTask.dueDate).toBeNull();
            expect(mockTask.categoryId).toBeNull();
        });

        it('should allow null values for nullable fields', () => {
            const mockTask: Task = {
                id: 1,
                title: 'Task with nulls',
                isCompleted: true,
                createdAt: '2025-01-01T00:00:00Z',
                dueDate: null,
                categoryId: null,
                categoryName: undefined
            };

            expect(mockTask.dueDate).toBeNull();
            expect(mockTask.categoryId).toBeNull();
        });

        it('should enforce required fields', () => {
            const mockTask: Task = {
                id: 1,
                title: 'Required Fields Test',
                isCompleted: false,
                createdAt: '2025-01-01T00:00:00Z',
                dueDate: null,
                categoryId: null
            };

            expect(mockTask.id).toBeDefined();
            expect(mockTask.title).toBeDefined();
            expect(typeof mockTask.isCompleted).toBe('boolean');
            expect(mockTask.createdAt).toBeDefined();
        });

        it('should handle completed and uncompleted states', () => {
            const completedTask: Task = {
                id: 1,
                title: 'Completed Task',
                isCompleted: true,
                createdAt: '2025-01-01T00:00:00Z',
                dueDate: null,
                categoryId: null
            };

            const uncompletedTask: Task = {
                id: 2,
                title: 'Uncompleted Task',
                isCompleted: false,
                createdAt: '2025-01-01T00:00:00Z',
                dueDate: null,
                categoryId: null
            };

            expect(completedTask.isCompleted).toBe(true);
            expect(uncompletedTask.isCompleted).toBe(false);
        });
    });

    describe('CreateTaskRequest interface', () => {
        it('should have correct structure with all fields', () => {
            const mockRequest: CreateTaskRequest = {
                title: 'New Task',
                description: 'A new task description',
                dueDate: '2025-01-15T00:00:00Z',
                categoryId: 1,
                categoryName: 'Work'
            };

            expect(typeof mockRequest.title).toBe('string');
            expect(typeof mockRequest.description).toBe('string');
            expect(typeof mockRequest.dueDate).toBe('string');
            expect(typeof mockRequest.categoryId).toBe('number');
            expect(typeof mockRequest.categoryName).toBe('string');
        });

        it('should allow minimal request with only title', () => {
            const mockRequest: CreateTaskRequest = {
                title: 'Simple Task'
            };

            expect(mockRequest.title).toBe('Simple Task');
            expect(mockRequest.description).toBeUndefined();
            expect(mockRequest.dueDate).toBeUndefined();
            expect(mockRequest.categoryId).toBeUndefined();
            expect(mockRequest.categoryName).toBeUndefined();
        });

        it('should allow null values for nullable fields', () => {
            const mockRequest: CreateTaskRequest = {
                title: 'Task with nulls',
                description: undefined,
                dueDate: null,
                categoryId: null,
                categoryName: undefined
            };

            expect(mockRequest.dueDate).toBeNull();
            expect(mockRequest.categoryId).toBeNull();
        });

        it('should enforce required title field', () => {
            const mockRequest: CreateTaskRequest = {
                title: 'Title is required'
            };

            expect(mockRequest.title).toBeDefined();
            expect(typeof mockRequest.title).toBe('string');
        });

        it('should be compatible with Task creation', () => {
            const createRequest: CreateTaskRequest = {
                title: 'Test Task',
                description: 'Test description',
                dueDate: '2025-01-15T00:00:00Z',
                categoryId: 1,
                categoryName: 'Work'
            };

            const taskData: Partial<Task> = {
                ...createRequest,
                id: 1,
                isCompleted: false,
                createdAt: '2025-01-01T00:00:00Z'
            };

            expect(taskData.title).toBe(createRequest.title);
            expect(taskData.description).toBe(createRequest.description);
            expect(taskData.dueDate).toBe(createRequest.dueDate);
            expect(taskData.categoryId).toBe(createRequest.categoryId);
            expect(taskData.categoryName).toBe(createRequest.categoryName);
        });
    });

    describe('UpdateTaskRequest interface', () => {
        it('should have correct structure with all fields', () => {
            const mockRequest: UpdateTaskRequest = {
                title: 'Updated Task',
                description: 'Updated description',
                isCompleted: true,
                dueDate: '2025-01-20T00:00:00Z',
                categoryId: 2,
                categoryName: 'Personal'
            };

            expect(typeof mockRequest.title).toBe('string');
            expect(typeof mockRequest.description).toBe('string');
            expect(typeof mockRequest.isCompleted).toBe('boolean');
            expect(typeof mockRequest.dueDate).toBe('string');
            expect(typeof mockRequest.categoryId).toBe('number');
            expect(typeof mockRequest.categoryName).toBe('string');
        });

        it('should allow all fields to be optional', () => {
            const mockRequest: UpdateTaskRequest = {
            };

            expect(mockRequest.title).toBeUndefined();
            expect(mockRequest.description).toBeUndefined();
            expect(mockRequest.isCompleted).toBeUndefined();
            expect(mockRequest.dueDate).toBeUndefined();
            expect(mockRequest.categoryId).toBeUndefined();
            expect(mockRequest.categoryName).toBeUndefined();
        });

        it('should allow partial updates', () => {
            const titleOnlyUpdate: UpdateTaskRequest = {
                title: 'New Title Only'
            };

            const completionOnlyUpdate: UpdateTaskRequest = {
                isCompleted: true
            };

            const dueDateOnlyUpdate: UpdateTaskRequest = {
                dueDate: '2025-02-01T00:00:00Z'
            };

            expect(titleOnlyUpdate.title).toBe('New Title Only');
            expect(titleOnlyUpdate.isCompleted).toBeUndefined();

            expect(completionOnlyUpdate.isCompleted).toBe(true);
            expect(completionOnlyUpdate.title).toBeUndefined();

            expect(dueDateOnlyUpdate.dueDate).toBe('2025-02-01T00:00:00Z');
            expect(dueDateOnlyUpdate.title).toBeUndefined();
        });

        it('should allow setting fields to null', () => {
            const clearFieldsUpdate: UpdateTaskRequest = {
                description: undefined,
                dueDate: null,
                categoryId: null,
                categoryName: undefined
            };

            expect(clearFieldsUpdate.dueDate).toBeNull();
            expect(clearFieldsUpdate.categoryId).toBeNull();
        });

        it('should be compatible with Task updates', () => {
            const existingTask: Task = {
                id: 1,
                title: 'Original Task',
                description: 'Original description',
                isCompleted: false,
                createdAt: '2025-01-01T00:00:00Z',
                dueDate: '2025-01-10T00:00:00Z',
                categoryId: 1,
                categoryName: 'Work'
            };

            const updateRequest: UpdateTaskRequest = {
                title: 'Updated Task',
                isCompleted: true,
                dueDate: null
            };

            const updatedTask: Task = {
                ...existingTask,
                ...updateRequest
            };

            expect(updatedTask.title).toBe(updateRequest.title);
            expect(updatedTask.isCompleted).toBe(updateRequest.isCompleted);
            expect(updatedTask.dueDate).toBe(updateRequest.dueDate);
            expect(updatedTask.description).toBe(existingTask.description);
            expect(updatedTask.categoryId).toBe(existingTask.categoryId);
            expect(updatedTask.id).toBe(existingTask.id);
        });
    });

    describe('Type compatibility and relationships', () => {
        it('should ensure CreateTaskRequest can extend to Task', () => {
            const createRequest: CreateTaskRequest = {
                title: 'Test Task',
                description: 'Test description',
                dueDate: '2025-01-15T00:00:00Z',
                categoryId: 1,
                categoryName: 'Work'
            };

            const task: Task = {
                ...createRequest,
                id: 1,
                isCompleted: false,
                createdAt: '2025-01-01T00:00:00Z'
            };

            expect(task.title).toBe(createRequest.title);
            expect(task.description).toBe(createRequest.description);
            expect(task.dueDate).toBe(createRequest.dueDate);
            expect(task.categoryId).toBe(createRequest.categoryId);
            expect(task.categoryName).toBe(createRequest.categoryName);
        });

        it('should ensure UpdateTaskRequest can partially update Task', () => {
            const original: Task = {
                id: 1,
                title: 'Original',
                description: 'Original desc',
                isCompleted: false,
                createdAt: '2025-01-01T00:00:00Z',
                dueDate: '2025-01-10T00:00:00Z',
                categoryId: 1,
                categoryName: 'Work'
            };

            const update: UpdateTaskRequest = {
                title: 'Updated Title',
                isCompleted: true
            };

            const result: Task = {
                ...original,
                ...update
            };

            expect(result.title).toBe(update.title);
            expect(result.isCompleted).toBe(update.isCompleted);
            expect(result.description).toBe(original.description);
            expect(result.dueDate).toBe(original.dueDate);
        });

        it('should handle category relationships consistently', () => {
            const taskWithCategory: Task = {
                id: 1,
                title: 'Categorized Task',
                isCompleted: false,
                createdAt: '2025-01-01T00:00:00Z',
                dueDate: null,
                categoryId: 1,
                categoryName: 'Work'
            };

            const createWithCategory: CreateTaskRequest = {
                title: 'New Categorized Task',
                categoryId: 1,
                categoryName: 'Work'
            };

            const updateWithCategory: UpdateTaskRequest = {
                categoryId: 2,
                categoryName: 'Personal'
            };

            expect(taskWithCategory.categoryId).toBeDefined();
            expect(taskWithCategory.categoryName).toBeDefined();
            expect(createWithCategory.categoryId).toBeDefined();
            expect(createWithCategory.categoryName).toBeDefined();
            expect(updateWithCategory.categoryId).toBeDefined();
            expect(updateWithCategory.categoryName).toBeDefined();
        });
    });

    describe('Edge cases and validation scenarios', () => {
        it('should handle empty strings appropriately', () => {
            const taskWithEmptyDescription: Task = {
                id: 1,
                title: 'Task with empty description',
                description: '',
                isCompleted: false,
                createdAt: '2025-01-01T00:00:00Z',
                dueDate: null,
                categoryId: null
            };

            expect(typeof taskWithEmptyDescription.description).toBe('string');
            expect(taskWithEmptyDescription.description).toBe('');
        });

        it('should handle special characters in titles and descriptions', () => {
            const specialChars = [
                'Task with spaces',
                'Task-with-dashes',
                'Task_with_underscores',
                'Task with émojis 📝',
                'Task with "quotes"',
                "Task with 'single quotes'",
                'Task with line\nbreaks'
            ];

            specialChars.forEach(title => {
                const task: Task = {
                    id: 1,
                    title: title,
                    description: `Description for ${title}`,
                    isCompleted: false,
                    createdAt: '2025-01-01T00:00:00Z',
                    dueDate: null,
                    categoryId: null
                };

                expect(task.title).toBe(title);
                expect(task.description).toBe(`Description for ${title}`);
            });
        });

        it('should handle date strings in various formats', () => {
            const dateFormats = [
                '2025-01-15T00:00:00Z',
                '2025-01-15T12:30:45.123Z',
                '2025-12-31T23:59:59Z',
                '2025-01-01T00:00:00.000Z'
            ];

            dateFormats.forEach(date => {
                const task: Task = {
                    id: 1,
                    title: 'Date test task',
                    isCompleted: false,
                    createdAt: date,
                    dueDate: date,
                    categoryId: null
                };

                expect(task.createdAt).toBe(date);
                expect(task.dueDate).toBe(date);
            });
        });

        it('should handle large IDs', () => {
            const largeId = 999999999;
            const largeCategoryId = 888888888;

            const task: Task = {
                id: largeId,
                title: 'Large ID test',
                isCompleted: false,
                createdAt: '2025-01-01T00:00:00Z',
                dueDate: null,
                categoryId: largeCategoryId
            };

            expect(task.id).toBe(largeId);
            expect(task.categoryId).toBe(largeCategoryId);
            expect(typeof task.id).toBe('number');
            expect(typeof task.categoryId).toBe('number');
        });

        it('should handle mixed null and undefined appropriately', () => {
            const task: Task = {
                id: 1,
                title: 'Mixed null/undefined test',
                description: undefined,
                isCompleted: false,
                createdAt: '2025-01-01T00:00:00Z',
                dueDate: null,
                categoryId: null,
                categoryName: undefined
            };

            expect(task.description).toBeUndefined();
            expect(task.dueDate).toBeNull();
            expect(task.categoryId).toBeNull();
            expect(task.categoryName).toBeUndefined();
        });
    });
});
