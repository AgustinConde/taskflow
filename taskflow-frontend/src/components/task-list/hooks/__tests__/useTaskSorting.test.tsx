import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTaskSorting } from '../useTaskSorting';
import type { Task } from '../../../../types/Task';
import type { Category } from '../../../../types/Category';
import type { DropResult } from '@hello-pangea/dnd';

describe('useTaskSorting', () => {
    const setupMocks = () => {
        const mockTasks: Task[] = [
            {
                id: 1,
                title: 'Task A',
                description: 'Description A',
                isCompleted: false,
                dueDate: '2024-12-31T23:59:59Z',
                categoryId: 1,
                createdAt: '2024-01-01T00:00:00Z'
            },
            {
                id: 2,
                title: 'Task B',
                description: 'Description B',
                isCompleted: false,
                dueDate: '2024-06-15T10:00:00Z',
                categoryId: 2,
                createdAt: '2024-01-02T00:00:00Z'
            },
            {
                id: 3,
                title: 'Task C',
                description: 'Description C',
                isCompleted: true,
                dueDate: null,
                categoryId: 1,
                createdAt: '2024-01-03T00:00:00Z'
            }
        ];

        const mockCategories: Category[] = [
            {
                id: 1,
                name: 'Work',
                color: '#ff0000',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                userId: 1
            },
            {
                id: 2,
                name: 'Personal',
                color: '#00ff00',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                userId: 1
            }
        ];

        return { mockTasks, mockCategories };
    };

    const renderUseTaskSorting = (
        filteredTasks: Task[] = [],
        categories: Category[] = [],
        allTasks: Task[] = []
    ) => {
        return renderHook(
            ({ filteredTasks, categories, allTasks }) =>
                useTaskSorting(filteredTasks, categories, allTasks),
            {
                initialProps: { filteredTasks, categories, allTasks }
            }
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Sorting Logic', () => {
        it('should initialize with default sort type', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);

            expect(result.current.sortBy).toBe('custom');
            expect(result.current.isCustomSort).toBe(true);
            expect(result.current.sortedTasks).toEqual(mockTasks);
        });

        it('should sort by due date correctly', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);

            act(() => {
                result.current.setSortBy('dueDate');
            });

            expect(result.current.sortBy).toBe('dueDate');
            expect(result.current.isCustomSort).toBe(false);
            expect(result.current.sortedTasks[0].id).toBe(2); // June 15 comes first
            expect(result.current.sortedTasks[1].id).toBe(1); // December 31 comes second
            expect(result.current.sortedTasks[2].id).toBe(3); // null dates come last
        });

        it('should sort by created date correctly', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);

            act(() => {
                result.current.setSortBy('createdAt');
            });

            expect(result.current.sortBy).toBe('createdAt');
            expect(result.current.sortedTasks[0].id).toBe(1); // Jan 1
            expect(result.current.sortedTasks[1].id).toBe(2); // Jan 2
            expect(result.current.sortedTasks[2].id).toBe(3); // Jan 3
        });

        it('should sort by category correctly', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);

            act(() => {
                result.current.setSortBy('category');
            });

            expect(result.current.sortBy).toBe('category');
            // Personal comes before Work alphabetically
            expect(result.current.sortedTasks[0].categoryId).toBe(2); // Personal
            expect(result.current.sortedTasks[1].categoryId).toBe(1); // Work
            expect(result.current.sortedTasks[2].categoryId).toBe(1); // Work
        });

        it('should handle custom sorting', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);

            expect(result.current.sortBy).toBe('custom');
            expect(result.current.sortedTasks).toEqual(mockTasks);
        });
    });

    describe('Drag and Drop Operations', () => {
        it('should handle valid drag and drop operation', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);

            const dropResult: DropResult = {
                draggableId: '1',
                type: 'DEFAULT',
                source: { index: 0, droppableId: 'tasks' },
                destination: { index: 2, droppableId: 'tasks' },
                reason: 'DROP',
                mode: 'FLUID',
                combine: null
            };

            act(() => {
                result.current.handleDragEnd(dropResult);
            });

            // Task originally at index 0 should now be at index 2
            expect(result.current.sortedTasks[0].id).toBe(2);
            expect(result.current.sortedTasks[1].id).toBe(3);
            expect(result.current.sortedTasks[2].id).toBe(1);
        });

        it('should ignore drag operation if not in custom sort mode', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);

            act(() => {
                result.current.setSortBy('dueDate');
            });

            const originalOrder = [...result.current.sortedTasks];
            const dropResult: DropResult = {
                draggableId: '1',
                type: 'DEFAULT',
                source: { index: 0, droppableId: 'tasks' },
                destination: { index: 2, droppableId: 'tasks' },
                reason: 'DROP',
                mode: 'FLUID',
                combine: null
            };

            act(() => {
                result.current.handleDragEnd(dropResult);
            });

            expect(result.current.sortedTasks).toEqual(originalOrder);
        });

        it('should ignore drag operation without destination', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);

            const originalOrder = [...result.current.sortedTasks];
            const dropResult: DropResult = {
                draggableId: '1',
                type: 'DEFAULT',
                source: { index: 0, droppableId: 'tasks' },
                destination: null,
                reason: 'CANCEL',
                mode: 'FLUID',
                combine: null
            };

            act(() => {
                result.current.handleDragEnd(dropResult);
            });

            expect(result.current.sortedTasks).toEqual(originalOrder);
        });

        it('should ignore drag operation with same source and destination', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);

            const originalOrder = [...result.current.sortedTasks];
            const dropResult: DropResult = {
                draggableId: '1',
                type: 'DEFAULT',
                source: { index: 1, droppableId: 'tasks' },
                destination: { index: 1, droppableId: 'tasks' },
                reason: 'DROP',
                mode: 'FLUID',
                combine: null
            };

            act(() => {
                result.current.handleDragEnd(dropResult);
            });

            expect(result.current.sortedTasks).toEqual(originalOrder);
        });
    });

    describe('Edge Cases & Performance', () => {
        it('should handle empty task lists gracefully', () => {
            const { mockCategories } = setupMocks();
            const { result } = renderUseTaskSorting([], mockCategories, []);

            expect(result.current.sortedTasks).toEqual([]);
            expect(result.current.sortBy).toBe('custom');
        });

        it('should handle tasks without categories', () => {
            const tasksWithoutCategories: Task[] = [
                {
                    id: 1,
                    title: 'Task 1',
                    description: 'Description',
                    isCompleted: false,
                    dueDate: null,
                    categoryId: null,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ];

            const { result } = renderUseTaskSorting(tasksWithoutCategories, [], tasksWithoutCategories);

            act(() => {
                result.current.setSortBy('category');
            });

            expect(result.current.sortedTasks).toEqual(tasksWithoutCategories);
        });

        it('should handle tasks with missing category references', () => {
            const tasks: Task[] = [
                {
                    id: 1,
                    title: 'Task 1',
                    description: 'Description',
                    isCompleted: false,
                    dueDate: null,
                    categoryId: 999, // Non-existent category
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ];

            const { result } = renderUseTaskSorting(tasks, [], tasks);

            act(() => {
                result.current.setSortBy('category');
            });

            expect(result.current.sortedTasks).toEqual(tasks);
        });

        it('should update custom order when all tasks change', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result, rerender } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);

            const newTasks: Task[] = [
                ...mockTasks,
                {
                    id: 4,
                    title: 'Task D',
                    description: 'Description D',
                    isCompleted: false,
                    dueDate: null,
                    categoryId: 1,
                    createdAt: '2024-01-04T00:00:00Z'
                }
            ];

            rerender({
                filteredTasks: newTasks,
                categories: mockCategories,
                allTasks: newTasks
            });

            expect(result.current.sortedTasks).toHaveLength(4);
        });

        it('should maintain order efficiency with many tasks', () => {
            const largeMockTasks: Task[] = Array.from({ length: 100 }, (_, i) => ({
                id: i + 1,
                title: `Task ${i + 1}`,
                description: `Description ${i + 1}`,
                isCompleted: i % 2 === 0,
                dueDate: i % 3 === 0 ? `2024-01-${String(i % 28 + 1).padStart(2, '0')}T00:00:00Z` : null,
                categoryId: (i % 3) + 1,
                createdAt: `2024-01-01T${String(i % 24).padStart(2, '0')}:00:00Z`
            }));

            const { result } = renderUseTaskSorting(largeMockTasks, [], largeMockTasks);

            act(() => {
                result.current.setSortBy('dueDate');
            });

            expect(result.current.sortedTasks).toHaveLength(100);
            expect(result.current.sortBy).toBe('dueDate');
        });
    });
});
