import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTaskFiltering } from '../useTaskFiltering';
import type { Task } from '../../../../types/Task';
import type { Category } from '../../../../types/Category';

describe('useTaskFiltering', () => {
    const setupMocks = () => {
        const mockTasks: Task[] = [
            {
                id: 1,
                title: 'Complete project',
                description: 'Write docs',
                isCompleted: false,
                dueDate: '2024-12-31T23:59:59Z',
                categoryId: 1,
                createdAt: '2024-01-01T00:00:00Z'
            },
            {
                id: 2,
                title: 'Review code',
                description: 'Check security',
                isCompleted: true,
                dueDate: null,
                categoryId: 2,
                createdAt: '2024-01-01T00:00:00Z'
            },
            {
                id: 3,
                title: 'Fix bug',
                description: 'Auth issue',
                isCompleted: false,
                dueDate: '2024-06-15T10:00:00Z',
                categoryId: 1,
                createdAt: '2024-01-01T00:00:00Z'
            },
            {
                id: 4,
                title: 'Uncategorized',
                description: 'No category',
                isCompleted: false,
                dueDate: null,
                categoryId: null,
                createdAt: '2024-01-01T00:00:00Z'
            }
        ];

        const mockCategories: Category[] = [
            {
                id: 1,
                name: 'Development',
                color: '#FF5722',
                userId: 1,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z'
            },
            {
                id: 2,
                name: 'Review',
                color: '#2196F3',
                userId: 1,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z'
            }
        ];

        return { mockTasks, mockCategories };
    };

    const renderUseTaskFiltering = (tasks: Task[] = [], categories: Category[] = []) => {
        return renderHook(() => useTaskFiltering(tasks, categories));
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Filtering Logic', () => {
        it('should initialize with default state', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskFiltering(mockTasks, mockCategories);

            expect(result.current.search).toBe('');
            expect(result.current.filter).toBe('all');
            expect(result.current.filteredTasks).toHaveLength(4);
        });

        it('should filter tasks by search term', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskFiltering(mockTasks, mockCategories);

            act(() => {
                result.current.setSearch('project');
            });

            expect(result.current.filteredTasks).toHaveLength(1);
            expect(result.current.filteredTasks[0].title).toBe('Complete project');
        });

        it('should filter tasks by category', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskFiltering(mockTasks, mockCategories);

            act(() => {
                result.current.setFilter(1);
            });

            expect(result.current.filteredTasks).toHaveLength(2);
            expect(result.current.filteredTasks.every(task => task.categoryId === 1)).toBe(true);
        });

        it('should filter tasks by completion status', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskFiltering(mockTasks, mockCategories);

            act(() => {
                result.current.setFilter('completed');
            });

            expect(result.current.filteredTasks).toHaveLength(1);
            expect(result.current.filteredTasks[0].isCompleted).toBe(true);
        });

        it('should handle uncategorized tasks filter', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskFiltering(mockTasks, mockCategories);

            act(() => {
                result.current.setFilter('none');
            });

            expect(result.current.filteredTasks).toHaveLength(1);
            expect(result.current.filteredTasks[0].categoryId).toBeNull();
        });
    });

    describe('Filter Combinations', () => {
        it('should apply search and status filters simultaneously', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskFiltering(mockTasks, mockCategories);

            act(() => {
                result.current.setSearch('bug');
                result.current.setFilter('pending');
            });

            expect(result.current.filteredTasks).toHaveLength(1);
            expect(result.current.filteredTasks[0].title).toBe('Fix bug');
        });

        it('should reset filters to default state', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskFiltering(mockTasks, mockCategories);

            act(() => {
                result.current.setSearch('test');
                result.current.setFilter(1);
            });

            act(() => {
                result.current.setSearch('');
                result.current.setFilter('all');
            });

            expect(result.current.search).toBe('');
            expect(result.current.filter).toBe('all');
            expect(result.current.filteredTasks).toHaveLength(4);
        });

        it('should handle case-insensitive search', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskFiltering(mockTasks, mockCategories);

            act(() => {
                result.current.setSearch('PROJECT');
            });

            expect(result.current.filteredTasks).toHaveLength(1);
            expect(result.current.filteredTasks[0].title).toBe('Complete project');
        });

        it('should search in title, description and category name', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskFiltering(mockTasks, mockCategories);

            act(() => {
                result.current.setSearch('Development');
            });

            expect(result.current.filteredTasks).toHaveLength(2);
            expect(result.current.filteredTasks.every(task => task.categoryId === 1)).toBe(true);
        });
    });

    describe('Edge Cases & Performance', () => {
        it('should handle empty tasks array', () => {
            const { mockCategories } = setupMocks();
            const { result } = renderUseTaskFiltering([], mockCategories);

            expect(result.current.filteredTasks).toHaveLength(0);
        });

        it('should handle empty categories array', () => {
            const { mockTasks } = setupMocks();
            const { result } = renderUseTaskFiltering(mockTasks, []);

            expect(result.current.filteredTasks).toHaveLength(4);
        });

        it('should handle no matching filters gracefully', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskFiltering(mockTasks, mockCategories);

            act(() => {
                result.current.setSearch('nonexistent');
            });

            expect(result.current.filteredTasks).toHaveLength(0);
        });

        it('should maintain filter state across task updates', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result, rerender } = renderUseTaskFiltering(mockTasks, mockCategories);

            act(() => {
                result.current.setSearch('project');
            });

            const newTasks = [...mockTasks, {
                id: 5,
                title: 'New project task',
                description: 'Additional work',
                isCompleted: false,
                dueDate: null,
                categoryId: 1,
                createdAt: '2024-01-01T00:00:00Z'
            }];

            rerender({ tasks: newTasks, categories: mockCategories });

            expect(result.current.search).toBe('project');
            expect(result.current.filteredTasks.length).toBeGreaterThan(0);
        });

        it('should filter pending tasks correctly', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskFiltering(mockTasks, mockCategories);

            act(() => {
                result.current.setFilter('pending');
            });

            expect(result.current.filteredTasks).toHaveLength(3);
            expect(result.current.filteredTasks.every(task => !task.isCompleted)).toBe(true);
        });

        it('should handle tasks with undefined description', () => {
            const tasksWithNullDesc = [
                {
                    id: 1,
                    title: 'Test task',
                    description: null as any,
                    isCompleted: false,
                    dueDate: null,
                    categoryId: 1,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ];
            const { mockCategories } = setupMocks();
            const { result } = renderUseTaskFiltering(tasksWithNullDesc, mockCategories);

            act(() => {
                result.current.setSearch('test');
            });

            expect(result.current.filteredTasks).toHaveLength(1);
        });

        it('should handle whitespace-only search gracefully', () => {
            const { mockTasks, mockCategories } = setupMocks();
            const { result } = renderUseTaskFiltering(mockTasks, mockCategories);

            act(() => {
                result.current.setSearch('   ');
            });

            expect(result.current.filteredTasks).toHaveLength(4);
        });
    });
});
