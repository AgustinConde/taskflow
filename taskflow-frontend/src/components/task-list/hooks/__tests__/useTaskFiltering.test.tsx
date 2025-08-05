import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTaskFiltering } from '../useTaskFiltering';
import type { Task } from '../../../../types/Task';
import type { Category } from '../../../../types/Category';

const mockTasks: Task[] = [
    {
        id: 1,
        title: 'Complete project documentation',
        description: 'Write comprehensive docs for the project',
        isCompleted: false,
        dueDate: '2024-12-31T23:59:59.000Z',
        categoryId: 1,
        createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
        id: 2,
        title: 'Review code changes',
        description: 'Check PR for security issues',
        isCompleted: true,
        dueDate: null,
        categoryId: 2,
        createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
        id: 3,
        title: 'Fix login bug',
        description: 'Authentication fails on mobile',
        isCompleted: false,
        dueDate: '2024-06-15T10:00:00.000Z',
        categoryId: 1,
        createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
        id: 4,
        title: 'Uncategorized task',
        description: 'Task without category',
        isCompleted: false,
        dueDate: null,
        categoryId: null,
        createdAt: '2024-01-01T00:00:00.000Z'
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
        name: 'Review',
        color: '#2196F3',
        userId: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
    }
];

describe('useTaskFiltering', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should initialize with default values', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            expect(result.current.search).toBe('');
            expect(result.current.filter).toBe('all');
            expect(result.current.filteredTasks).toEqual(mockTasks);
        });

        it('should return all tasks when no filters applied', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            expect(result.current.filteredTasks).toHaveLength(4);
            expect(result.current.filteredTasks).toEqual(mockTasks);
        });
    });

    describe('Search Functionality', () => {
        it('should filter tasks by title', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setSearch('documentation');
            });

            expect(result.current.search).toBe('documentation');
            expect(result.current.filteredTasks).toHaveLength(1);
            expect(result.current.filteredTasks[0].title).toBe('Complete project documentation');
        });

        it('should filter tasks by description', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setSearch('security');
            });

            expect(result.current.filteredTasks).toHaveLength(1);
            expect(result.current.filteredTasks[0].id).toBe(2);
        });

        it('should filter tasks by category name', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setSearch('Development');
            });

            expect(result.current.filteredTasks).toHaveLength(2);
            expect(result.current.filteredTasks.every(task => task.categoryId === 1)).toBe(true);
        });

        it('should be case insensitive', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setSearch('COMPLETE');
            });

            expect(result.current.filteredTasks).toHaveLength(1);
            expect(result.current.filteredTasks[0].title).toBe('Complete project documentation');
        });

        it('should search across title, description, and category', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setSearch('development');
            });

            expect(result.current.filteredTasks).toHaveLength(2);
        });

        it('should handle search with only whitespace', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setSearch('   ');
            });

            expect(result.current.filteredTasks).toEqual(mockTasks);
        });

        it('should handle empty search string', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setSearch('documentation');
            });

            expect(result.current.filteredTasks).toHaveLength(1);

            act(() => {
                result.current.setSearch('');
            });

            expect(result.current.filteredTasks).toEqual(mockTasks);
        });

        it('should handle search with no matches', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setSearch('nonexistent');
            });

            expect(result.current.filteredTasks).toHaveLength(0);
        });
    });

    describe('Filter by Completion Status', () => {
        it('should filter completed tasks', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setFilter('completed');
            });

            expect(result.current.filter).toBe('completed');
            expect(result.current.filteredTasks).toHaveLength(1);
            expect(result.current.filteredTasks[0].id).toBe(2);
            expect(result.current.filteredTasks[0].isCompleted).toBe(true);
        });

        it('should filter pending tasks', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setFilter('pending');
            });

            expect(result.current.filter).toBe('pending');
            expect(result.current.filteredTasks).toHaveLength(3);
            expect(result.current.filteredTasks.every(task => !task.isCompleted)).toBe(true);
        });

        it('should show all tasks when filter is "all"', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setFilter('completed');
            });

            expect(result.current.filteredTasks).toHaveLength(1);

            act(() => {
                result.current.setFilter('all');
            });

            expect(result.current.filter).toBe('all');
            expect(result.current.filteredTasks).toEqual(mockTasks);
        });
    });

    describe('Filter by Category', () => {
        it('should filter tasks by specific category ID', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setFilter(1);
            });

            expect(result.current.filter).toBe(1);
            expect(result.current.filteredTasks).toHaveLength(2);
            expect(result.current.filteredTasks.every(task => task.categoryId === 1)).toBe(true);
        });

        it('should filter tasks by another category ID', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setFilter(2);
            });

            expect(result.current.filter).toBe(2);
            expect(result.current.filteredTasks).toHaveLength(1);
            expect(result.current.filteredTasks[0].categoryId).toBe(2);
        });

        it('should filter uncategorized tasks', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setFilter('none');
            });

            expect(result.current.filter).toBe('none');
            expect(result.current.filteredTasks).toHaveLength(1);
            expect(result.current.filteredTasks[0].id).toBe(4);
            expect(result.current.filteredTasks[0].categoryId).toBe(null);
        });

        it('should handle filter by non-existent category', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setFilter(999);
            });

            expect(result.current.filteredTasks).toHaveLength(0);
        });
    });

    describe('Combined Filters', () => {
        it('should combine search and completion status filters', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setSearch('review');
                result.current.setFilter('completed');
            });

            expect(result.current.filteredTasks).toHaveLength(1);
            expect(result.current.filteredTasks[0].id).toBe(2);
            expect(result.current.filteredTasks[0].isCompleted).toBe(true);
        });

        it('should combine search and category filters', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setSearch('fix');
                result.current.setFilter(1);
            });

            expect(result.current.filteredTasks).toHaveLength(1);
            expect(result.current.filteredTasks[0].id).toBe(3);
            expect(result.current.filteredTasks[0].categoryId).toBe(1);
        });

        it('should return empty when combined filters have no matches', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, mockCategories));

            act(() => {
                result.current.setSearch('review');
                result.current.setFilter('pending');
            });

            expect(result.current.filteredTasks).toHaveLength(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty tasks array', () => {
            const { result } = renderHook(() => useTaskFiltering([], mockCategories));

            expect(result.current.filteredTasks).toEqual([]);

            act(() => {
                result.current.setSearch('test');
                result.current.setFilter('completed');
            });

            expect(result.current.filteredTasks).toEqual([]);
        });

        it('should handle empty categories array', () => {
            const { result } = renderHook(() => useTaskFiltering(mockTasks, []));

            act(() => {
                result.current.setSearch('Development');
            });

            expect(result.current.filteredTasks).toHaveLength(0);
        });

        it('should handle tasks with undefined descriptions', () => {
            const tasksWithUndefinedDesc: Task[] = [
                {
                    ...mockTasks[0],
                    description: undefined as any
                }
            ];

            const { result } = renderHook(() => useTaskFiltering(tasksWithUndefinedDesc, mockCategories));

            act(() => {
                result.current.setSearch('Complete');
            });

            expect(result.current.filteredTasks).toHaveLength(1);
        });

        it('should handle tasks with undefined categoryId when searching by category', () => {
            const tasksWithUndefinedCategory: Task[] = [
                {
                    ...mockTasks[0],
                    categoryId: undefined as any
                }
            ];

            const { result } = renderHook(() => useTaskFiltering(tasksWithUndefinedCategory, mockCategories));

            act(() => {
                result.current.setFilter('none');
            });

            expect(result.current.filteredTasks).toHaveLength(1);
        });
    });

    describe('Reactive Updates', () => {
        it('should update filtered tasks when tasks prop changes', () => {
            const { result, rerender } = renderHook(
                ({ tasks, categories }: { tasks: Task[], categories: Category[] }) => useTaskFiltering(tasks, categories),
                {
                    initialProps: { tasks: mockTasks.slice(0, 2), categories: mockCategories }
                }
            );

            expect(result.current.filteredTasks).toHaveLength(2);

            rerender({ tasks: mockTasks, categories: mockCategories });

            expect(result.current.filteredTasks).toHaveLength(4);
        });

        it('should update filtered tasks when categories prop changes', () => {
            const { result, rerender } = renderHook(
                ({ tasks, categories }: { tasks: Task[], categories: Category[] }) => useTaskFiltering(tasks, categories),
                {
                    initialProps: { tasks: mockTasks, categories: [] as Category[] }
                }
            );

            act(() => {
                result.current.setSearch('Development');
            });

            expect(result.current.filteredTasks).toHaveLength(0);

            rerender({ tasks: mockTasks, categories: mockCategories });

            expect(result.current.filteredTasks).toHaveLength(2);
        });

        it('should maintain filter state across prop updates', () => {
            const { result, rerender } = renderHook(
                ({ tasks, categories }: { tasks: Task[], categories: Category[] }) => useTaskFiltering(tasks, categories),
                {
                    initialProps: { tasks: mockTasks.slice(0, 2), categories: mockCategories }
                }
            );

            act(() => {
                result.current.setFilter('completed');
                result.current.setSearch('review');
            });

            expect(result.current.filter).toBe('completed');
            expect(result.current.search).toBe('review');

            rerender({ tasks: mockTasks, categories: mockCategories });

            expect(result.current.filter).toBe('completed');
            expect(result.current.search).toBe('review');
        });
    });
});
