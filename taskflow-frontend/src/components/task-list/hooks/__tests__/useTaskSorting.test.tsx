import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTaskSorting } from '../useTaskSorting';
import type { Task } from '../../../../types/Task';
import type { Category } from '../../../../types/Category';
import type { DropResult } from '@hello-pangea/dnd';

const mockTasks: Task[] = [
    {
        id: 1,
        title: 'First task',
        description: 'Description 1',
        isCompleted: false,
        dueDate: '2024-12-31T23:59:59.000Z',
        categoryId: 1,
        createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
        id: 2,
        title: 'Second task',
        description: 'Description 2',
        isCompleted: false,
        dueDate: '2024-06-15T10:00:00.000Z',
        categoryId: 2,
        createdAt: '2024-01-02T00:00:00.000Z'
    },
    {
        id: 3,
        title: 'Third task',
        description: 'Description 3',
        isCompleted: false,
        dueDate: null,
        categoryId: 1,
        createdAt: '2024-01-03T00:00:00.000Z'
    },
    {
        id: 4,
        title: 'Fourth task',
        description: 'Description 4',
        isCompleted: false,
        dueDate: '2024-03-01T12:00:00.000Z',
        categoryId: null,
        createdAt: '2024-01-04T00:00:00.000Z'
    }
];

const mockCategories: Category[] = [
    {
        id: 1,
        name: 'Development',
        color: '#FF5722',
        userId: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
        id: 2,
        name: 'Design',
        color: '#2196F3',
        userId: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
    }
];

describe('useTaskSorting', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should initialize with default values', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, mockCategories, mockTasks));

            expect(result.current.sortBy).toBe('custom');
            expect(result.current.isCustomSort).toBe(true);
            expect(result.current.sortedTasks).toEqual(mockTasks);
        });

        it('should initialize custom order from allTasks when customOrder is empty', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, mockCategories, mockTasks));

            expect(result.current.sortedTasks.map(t => t.id)).toEqual([1, 2, 3, 4]);
        });

        it('should handle empty tasks array', () => {
            const { result } = renderHook(() => useTaskSorting([], mockCategories, []));

            expect(result.current.sortedTasks).toEqual([]);
            expect(result.current.sortBy).toBe('custom');
        });
    });

    describe('Sort by Due Date', () => {
        it('should sort tasks by due date in ascending order', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, mockCategories, mockTasks));

            act(() => {
                result.current.setSortBy('dueDate');
            });

            expect(result.current.sortBy).toBe('dueDate');
            expect(result.current.isCustomSort).toBe(false);

            expect(result.current.sortedTasks.map(t => t.id)).toEqual([4, 2, 1, 3]);
        });

        it('should handle tasks with null due dates by placing them last', () => {
            const tasksWithNullDates: Task[] = [
                { ...mockTasks[0], dueDate: null },
                { ...mockTasks[1], dueDate: '2024-06-15T10:00:00.000Z' },
                { ...mockTasks[2], dueDate: null }
            ];

            const { result } = renderHook(() => useTaskSorting(tasksWithNullDates, mockCategories, tasksWithNullDates));

            act(() => {
                result.current.setSortBy('dueDate');
            });

            expect(result.current.sortedTasks[0].id).toBe(2);
            expect(result.current.sortedTasks[1].dueDate).toBe(null);
            expect(result.current.sortedTasks[2].dueDate).toBe(null);
        });

        it('should handle all tasks with null due dates', () => {
            const tasksWithAllNullDates: Task[] = mockTasks.map(task => ({ ...task, dueDate: null }));

            const { result } = renderHook(() => useTaskSorting(tasksWithAllNullDates, mockCategories, tasksWithAllNullDates));

            act(() => {
                result.current.setSortBy('dueDate');
            });

            expect(result.current.sortedTasks.map(t => t.id)).toEqual([1, 2, 3, 4]);
        });
    });

    describe('Sort by Created Date', () => {
        it('should sort tasks by created date in ascending order', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, mockCategories, mockTasks));

            act(() => {
                result.current.setSortBy('createdAt');
            });

            expect(result.current.sortBy).toBe('createdAt');
            expect(result.current.isCustomSort).toBe(false);

            expect(result.current.sortedTasks.map(t => t.id)).toEqual([1, 2, 3, 4]);
        });

        it('should handle tasks created at the same time', () => {
            const tasksWithSameCreatedDate: Task[] = mockTasks.map(task => ({
                ...task,
                createdAt: '2024-01-01T00:00:00.000Z'
            }));

            const { result } = renderHook(() => useTaskSorting(tasksWithSameCreatedDate, mockCategories, tasksWithSameCreatedDate));

            act(() => {
                result.current.setSortBy('createdAt');
            });

            expect(result.current.sortedTasks.map(t => t.id)).toEqual([1, 2, 3, 4]);
        });
    });

    describe('Sort by Category', () => {
        it('should sort tasks by category name alphabetically', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, mockCategories, mockTasks));

            act(() => {
                result.current.setSortBy('category');
            });

            expect(result.current.sortBy).toBe('category');
            expect(result.current.isCustomSort).toBe(false);

            const sortedIds = result.current.sortedTasks.map(t => t.id);
            expect(sortedIds[0]).toBe(2);
            expect(sortedIds.slice(1, 3)).toEqual(expect.arrayContaining([1, 3]));
            expect(sortedIds[3]).toBe(4);
        });

        it('should handle tasks without categories by placing them last', () => {
            const tasksWithMixedCategories: Task[] = [
                { ...mockTasks[0], categoryId: null },
                { ...mockTasks[1], categoryId: 1 },
                { ...mockTasks[2], categoryId: null }
            ];

            const { result } = renderHook(() => useTaskSorting(tasksWithMixedCategories, mockCategories, tasksWithMixedCategories));

            act(() => {
                result.current.setSortBy('category');
            });

            expect(result.current.sortedTasks[0].categoryId).toBe(1);
            expect(result.current.sortedTasks[1].categoryId).toBe(null);
            expect(result.current.sortedTasks[2].categoryId).toBe(null);
        });

        it('should handle non-existent category IDs', () => {
            const tasksWithInvalidCategories: Task[] = [
                { ...mockTasks[0], categoryId: 999 },
                { ...mockTasks[1], categoryId: 1 }
            ];

            const { result } = renderHook(() => useTaskSorting(tasksWithInvalidCategories, mockCategories, tasksWithInvalidCategories));

            act(() => {
                result.current.setSortBy('category');
            });

            expect(result.current.sortedTasks[0].categoryId).toBe(1);
        });
    });

    describe('Custom Sort with Drag and Drop', () => {
        it('should maintain custom order', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, mockCategories, mockTasks));

            expect(result.current.sortBy).toBe('custom');
            expect(result.current.isCustomSort).toBe(true);
        });

        it('should handle drag and drop reordering', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, mockCategories, mockTasks));

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

            expect(result.current.sortedTasks.map(t => t.id)).toEqual([2, 3, 1, 4]);
        });

        it('should ignore drag events when not in custom sort mode', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, mockCategories, mockTasks));

            act(() => {
                result.current.setSortBy('dueDate');
            });

            const originalOrder = result.current.sortedTasks.map(t => t.id);

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

            expect(result.current.sortedTasks.map(t => t.id)).toEqual(originalOrder);
        });

        it('should handle drag with no destination', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, mockCategories, mockTasks));

            const originalOrder = result.current.sortedTasks.map(t => t.id);

            const dropResult: DropResult = {
                draggableId: '1',
                type: 'DEFAULT',
                source: { index: 0, droppableId: 'tasks' },
                destination: null,
                reason: 'DROP',
                mode: 'FLUID',
                combine: null
            };

            act(() => {
                result.current.handleDragEnd(dropResult);
            });

            expect(result.current.sortedTasks.map(t => t.id)).toEqual(originalOrder);
        });

        it('should handle drag to same position', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, mockCategories, mockTasks));

            const originalOrder = result.current.sortedTasks.map(t => t.id);

            const dropResult: DropResult = {
                draggableId: '1',
                type: 'DEFAULT',
                source: { index: 0, droppableId: 'tasks' },
                destination: { index: 0, droppableId: 'tasks' },
                reason: 'DROP',
                mode: 'FLUID',
                combine: null
            };

            act(() => {
                result.current.handleDragEnd(dropResult);
            });

            expect(result.current.sortedTasks.map(t => t.id)).toEqual(originalOrder);
        });

        it('should handle moving item to the end', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, mockCategories, mockTasks));

            const dropResult: DropResult = {
                draggableId: '1',
                type: 'DEFAULT',
                source: { index: 0, droppableId: 'tasks' },
                destination: { index: 3, droppableId: 'tasks' },
                reason: 'DROP',
                mode: 'FLUID',
                combine: null
            };

            act(() => {
                result.current.handleDragEnd(dropResult);
            });

            expect(result.current.sortedTasks.map(t => t.id)).toEqual([2, 3, 4, 1]);
        });

        it('should handle moving item from end to beginning', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, mockCategories, mockTasks));

            const dropResult: DropResult = {
                draggableId: '4',
                type: 'DEFAULT',
                source: { index: 3, droppableId: 'tasks' },
                destination: { index: 0, droppableId: 'tasks' },
                reason: 'DROP',
                mode: 'FLUID',
                combine: null
            };

            act(() => {
                result.current.handleDragEnd(dropResult);
            });

            expect(result.current.sortedTasks.map(t => t.id)).toEqual([4, 1, 2, 3]);
        });
    });

    describe('Task List Updates', () => {
        it('should update custom order when allTasks changes with new tasks', () => {
            const { result, rerender } = renderHook(
                ({ filteredTasks, categories, allTasks }: {
                    filteredTasks: Task[],
                    categories: Category[],
                    allTasks: Task[]
                }) => useTaskSorting(filteredTasks, categories, allTasks),
                {
                    initialProps: {
                        filteredTasks: mockTasks.slice(0, 2),
                        categories: mockCategories,
                        allTasks: mockTasks.slice(0, 2)
                    }
                }
            );

            expect(result.current.sortedTasks).toHaveLength(2);

            rerender({
                filteredTasks: mockTasks,
                categories: mockCategories,
                allTasks: mockTasks
            });

            expect(result.current.sortedTasks).toHaveLength(4);
            expect(result.current.sortedTasks.map(t => t.id)).toEqual([1, 2, 3, 4]);
        });

        it('should remove deleted tasks from custom order', () => {
            const { result, rerender } = renderHook(
                ({ filteredTasks, categories, allTasks }: {
                    filteredTasks: Task[],
                    categories: Category[],
                    allTasks: Task[]
                }) => useTaskSorting(filteredTasks, categories, allTasks),
                {
                    initialProps: {
                        filteredTasks: mockTasks,
                        categories: mockCategories,
                        allTasks: mockTasks
                    }
                }
            );

            expect(result.current.sortedTasks).toHaveLength(4);

            const remainingTasks = mockTasks.slice(0, 2);
            rerender({
                filteredTasks: remainingTasks,
                categories: mockCategories,
                allTasks: remainingTasks
            });

            expect(result.current.sortedTasks).toHaveLength(2);
            expect(result.current.sortedTasks.map(t => t.id)).toEqual([1, 2]);
        });
    });

    describe('Filter Integration', () => {
        it('should work with filtered subset of tasks', () => {
            const filteredTasks = mockTasks.slice(0, 2);

            const { result } = renderHook(() => useTaskSorting(filteredTasks, mockCategories, mockTasks));

            act(() => {
                result.current.setSortBy('dueDate');
            });

            expect(result.current.sortedTasks).toHaveLength(2);
            expect(result.current.sortedTasks.map(t => t.id)).toEqual([2, 1]);
        });

        it('should maintain custom order for filtered tasks', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, mockCategories, mockTasks));

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

            expect(result.current.sortedTasks.map(t => t.id)).toEqual([2, 3, 1, 4]);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty categories array', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, [], mockTasks));

            act(() => {
                result.current.setSortBy('category');
            });

            expect(result.current.sortedTasks).toHaveLength(4);
        });

        it('should handle tasks with undefined category names', () => {
            const categoriesWithoutNames: Category[] = mockCategories.map(cat => ({
                ...cat,
                name: undefined as any
            }));

            const { result } = renderHook(() => useTaskSorting(mockTasks, categoriesWithoutNames, mockTasks));

            act(() => {
                result.current.setSortBy('category');
            });

            expect(result.current.sortedTasks).toHaveLength(4);
        });

        it('should handle switching between sort types', () => {
            const { result } = renderHook(() => useTaskSorting(mockTasks, mockCategories, mockTasks));

            expect(result.current.sortBy).toBe('custom');

            act(() => {
                result.current.setSortBy('dueDate');
            });

            const dueDateOrder = result.current.sortedTasks.map(t => t.id);

            act(() => {
                result.current.setSortBy('category');
            });

            const categoryOrder = result.current.sortedTasks.map(t => t.id);

            act(() => {
                result.current.setSortBy('custom');
            });

            expect(result.current.sortedTasks.map(t => t.id)).toEqual([1, 2, 3, 4]);

            expect(dueDateOrder).not.toEqual(categoryOrder);
        });
    });
});
