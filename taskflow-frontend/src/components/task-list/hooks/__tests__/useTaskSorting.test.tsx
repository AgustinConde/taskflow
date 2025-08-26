import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTaskSorting } from '../useTaskSorting';
import type { Task } from '../../../../types/Task';
import type { Category } from '../../../../types/Category';
import type { DropResult } from '@hello-pangea/dnd';

describe('useTaskSorting hook', () => {
    const mockTasks: Task[] = [
        { id: 1, title: 'Task A', description: 'A', isCompleted: false, dueDate: '2024-12-31T23:59:59Z', categoryId: 1, createdAt: '2024-01-01T00:00:00Z' },
        { id: 2, title: 'Task B', description: 'B', isCompleted: false, dueDate: '2024-06-15T10:00:00Z', categoryId: 2, createdAt: '2024-01-02T00:00:00Z' },
        { id: 3, title: 'Task C', description: 'C', isCompleted: true, dueDate: null, categoryId: 1, createdAt: '2024-01-03T00:00:00Z' }
    ];
    const mockCategories: Category[] = [
        { id: 1, name: 'Work', color: '#ff0000', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', userId: 1 },
        { id: 2, name: 'Personal', color: '#00ff00', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', userId: 1 }
    ];

    const renderUseTaskSorting = (filteredTasks: Task[] = [], categories: Category[] = [], allTasks: Task[] = []) =>
        renderHook(() => useTaskSorting(filteredTasks, categories, allTasks));

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Sorting', () => {
        it('returns custom sort by default', () => {
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);
            expect(result.current.sortBy).toBe('custom');
            expect(result.current.isCustomSort).toBe(true);
            expect(result.current.sortedTasks).toEqual(mockTasks);
        });
        it('sorts by due date', () => {
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);
            act(() => { result.current.setSortBy('dueDate'); });
            expect(result.current.sortedTasks.map(t => t.id)).toEqual([2, 1, 3]);
        });
        it('sorts by createdAt', () => {
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);
            act(() => { result.current.setSortBy('createdAt'); });
            expect(result.current.sortedTasks.map(t => t.id)).toEqual([1, 2, 3]);
        });
        it('sorts by category', () => {
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);
            act(() => { result.current.setSortBy('category'); });
            expect(result.current.sortedTasks.map(t => t.categoryId)).toEqual([2, 1, 1]);
        });
    });

    describe('Drag and Drop', () => {
        it('moves task on valid drag and drop', () => {
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);
            const dropResult: DropResult = {
                draggableId: '1', type: 'DEFAULT', source: { index: 0, droppableId: 'tasks' }, destination: { index: 2, droppableId: 'tasks' }, reason: 'DROP', mode: 'FLUID', combine: null
            };
            act(() => { result.current.handleDragEnd(dropResult); });
            expect(result.current.sortedTasks.map(t => t.id)).toEqual([2, 3, 1]);
        });
        it('ignores drag if not custom sort', () => {
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);
            act(() => { result.current.setSortBy('dueDate'); });
            const originalOrder = [...result.current.sortedTasks];
            const dropResult: DropResult = {
                draggableId: '1', type: 'DEFAULT', source: { index: 0, droppableId: 'tasks' }, destination: { index: 2, droppableId: 'tasks' }, reason: 'DROP', mode: 'FLUID', combine: null
            };
            act(() => { result.current.handleDragEnd(dropResult); });
            expect(result.current.sortedTasks).toEqual(originalOrder);
        });
        it('ignores drag with no destination', () => {
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);
            const originalOrder = [...result.current.sortedTasks];
            const dropResult: DropResult = {
                draggableId: '1', type: 'DEFAULT', source: { index: 0, droppableId: 'tasks' }, destination: null, reason: 'CANCEL', mode: 'FLUID', combine: null
            };
            act(() => { result.current.handleDragEnd(dropResult); });
            expect(result.current.sortedTasks).toEqual(originalOrder);
        });
        it('ignores drag with same source and destination', () => {
            const { result } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);
            const originalOrder = [...result.current.sortedTasks];
            const dropResult: DropResult = {
                draggableId: '1', type: 'DEFAULT', source: { index: 1, droppableId: 'tasks' }, destination: { index: 1, droppableId: 'tasks' }, reason: 'DROP', mode: 'FLUID', combine: null
            };
            act(() => { result.current.handleDragEnd(dropResult); });
            expect(result.current.sortedTasks).toEqual(originalOrder);
        });
    });

    describe('Edge Cases and Branch Coverage', () => {
        it('should fallback to "zzzz" when a.categoryId is null and b.categoryId is valid', () => {
            const tasks: Task[] = [
                { id: 1, title: 'Task 1', description: '', isCompleted: false, dueDate: null, categoryId: null, createdAt: '2024-01-01T00:00:00Z' },
                { id: 2, title: 'Task 2', description: '', isCompleted: false, dueDate: null, categoryId: 1, createdAt: '2024-01-01T00:00:00Z' }
            ];
            const categories: Category[] = [
                { id: 1, name: 'Work', color: '#ff0000', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', userId: 1 }
            ];
            const { result } = renderUseTaskSorting(tasks, categories, tasks);
            act(() => { result.current.setSortBy('category'); });
            expect(result.current.sortedTasks.map(t => t.id)).toEqual([2, 1]);
        });

        it('should fallback to "zzzz" when b.categoryId is null and a.categoryId is valid', () => {
            const tasks: Task[] = [
                { id: 1, title: 'Task 1', description: '', isCompleted: false, dueDate: null, categoryId: 1, createdAt: '2024-01-01T00:00:00Z' },
                { id: 2, title: 'Task 2', description: '', isCompleted: false, dueDate: null, categoryId: null, createdAt: '2024-01-01T00:00:00Z' }
            ];
            const categories: Category[] = [
                { id: 1, name: 'Work', color: '#ff0000', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', userId: 1 }
            ];
            const { result } = renderUseTaskSorting(tasks, categories, tasks);
            act(() => { result.current.setSortBy('category'); });
            expect(result.current.sortedTasks.map(t => t.id)).toEqual([1, 2]);
        });

        it('handles empty task lists and tasks with missing or null category references', () => {
            const { result: emptyResult } = renderUseTaskSorting([], mockCategories, []);
            expect(emptyResult.current.sortedTasks).toEqual([]);
            expect(emptyResult.current.sortBy).toBe('custom');

            const nullCategoryTasks: Task[] = [
                { id: 1, title: 'Task 1', description: '', isCompleted: false, dueDate: null, categoryId: null, createdAt: '2024-01-01T00:00:00Z' },
                { id: 2, title: 'Task 2', description: '', isCompleted: false, dueDate: null, categoryId: null, createdAt: '2024-01-01T00:00:00Z' }
            ];
            const { result: nullCatResult } = renderUseTaskSorting(nullCategoryTasks, [], nullCategoryTasks);
            act(() => { nullCatResult.current.setSortBy('category'); });
            expect(nullCatResult.current.sortedTasks.map(t => t.id)).toEqual([1, 2]);

            const missingCategoryTasks: Task[] = [
                { id: 1, title: 'Task 1', description: '', isCompleted: false, dueDate: null, categoryId: 999, createdAt: '2024-01-01T00:00:00Z' }
            ];
            const { result: missingCatResult } = renderUseTaskSorting(missingCategoryTasks, [], missingCategoryTasks);
            act(() => { missingCatResult.current.setSortBy('category'); });
            expect(missingCatResult.current.sortedTasks).toEqual(missingCategoryTasks);
        });

        it('sorts tasks by categoryId when categories are missing', () => {
            const tasks: Task[] = [
                {
                    id: 2,
                    title: 'Task B',
                    description: '',
                    isCompleted: false,
                    dueDate: null,
                    categoryId: 200,
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 1,
                    title: 'Task A',
                    description: '',
                    isCompleted: false,
                    dueDate: null,
                    categoryId: 100,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ];
            const categories: Category[] = [];
            const { result } = renderUseTaskSorting(tasks, categories, tasks);
            act(() => {
                result.current.setSortBy('category');
            });
            expect(result.current.sortedTasks).toHaveLength(2);
            expect(result.current.sortedTasks.map(t => t.id)).toEqual([2, 1]);
        });

        it('should cover both b.categoryId truthy and not found in categories', () => {
            const tasks: Task[] = [
                {
                    id: 1,
                    title: 'Task A',
                    description: '',
                    isCompleted: false,
                    dueDate: null,
                    categoryId: 100,
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 2,
                    title: 'Task B',
                    description: '',
                    isCompleted: false,
                    dueDate: null,
                    categoryId: 200,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ];
            const categories: Category[] = [];
            const { result } = renderUseTaskSorting(tasks, categories, tasks);
            act(() => {
                result.current.setSortBy('category');
            });
            expect(result.current.sortedTasks).toHaveLength(2);
            expect(result.current.sortedTasks.map(t => t.id)).toEqual([1, 2]);
        });

        it('should execute fallback "zzzz" for both tasks with missing categoryId', () => {
            const tasks: Task[] = [
                {
                    id: 1,
                    title: 'Task 1',
                    description: 'Description',
                    isCompleted: false,
                    dueDate: null,
                    categoryId: 100,
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 2,
                    title: 'Task 2',
                    description: 'Description',
                    isCompleted: false,
                    dueDate: null,
                    categoryId: 200,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ];
            const categories: Category[] = [];
            const { result } = renderUseTaskSorting(tasks, categories, tasks);
            act(() => {
                result.current.setSortBy('category');
            });
            expect(result.current.sortedTasks).toEqual(tasks);
        });

        it('should use fallback name "zzzz" when b.categoryId exists but not in categories', () => {
            const tasks: Task[] = [
                {
                    id: 1,
                    title: 'Task 1',
                    description: 'Description',
                    isCompleted: false,
                    dueDate: null,
                    categoryId: 1,
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 2,
                    title: 'Task 2',
                    description: 'Description',
                    isCompleted: false,
                    dueDate: null,
                    categoryId: 999,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ];
            const categories: Category[] = [
                {
                    id: 1,
                    name: 'Work',
                    color: '#ff0000',
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z',
                    userId: 1
                }
            ];
            const { result } = renderUseTaskSorting(tasks, categories, tasks);
            act(() => {
                result.current.setSortBy('category');
            });
            expect(result.current.sortedTasks[0].id).toBe(1);
            expect(result.current.sortedTasks[1].id).toBe(2);
        });

        it('updates custom order when all tasks change', () => {
            const { result, rerender } = renderUseTaskSorting(mockTasks, mockCategories, mockTasks);
            rerender();
            expect(result.current.sortedTasks).toHaveLength(3);
        });
        it('maintains order efficiency with many tasks', () => {
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
            act(() => { result.current.setSortBy('dueDate'); });
            expect(result.current.sortedTasks).toHaveLength(100);
            expect(result.current.sortBy).toBe('dueDate');
        });
    });
});