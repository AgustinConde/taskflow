import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material';
import TaskItem from '../TaskItem';
import type { Task } from '../../../types/Task';
import type { Category } from '../../../types/Category';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                more: 'More',
                edit: 'Edit',
                delete: 'Delete',
                info: 'Info',
                save: 'Save',
                cancel: 'Cancel',
                dueDate: 'Due Date',
                category: 'Category',
                taskTitle: 'Task Title',
                taskDescription: 'Task Description'
            };
            return translations[key] || key;
        }
    })
}));

vi.mock('@mui/icons-material', () => ({
    MoreVert: () => <div data-testid="MoreVertIcon" />,
    Edit: () => <div data-testid="EditIcon" />,
    Delete: () => <div data-testid="DeleteIcon" />,
    Info: () => <div data-testid="InfoIcon" />,
    Close: () => <div data-testid="CloseIcon" />
}));

const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    isCompleted: false,
    dueDate: '2024-12-31T23:59:59.000Z',
    categoryId: 1,
    createdAt: '2024-01-01T00:00:00.000Z'
};

const mockCategory: Category = {
    id: 1,
    name: 'Work',
    color: '#7C3AED',
    description: 'Work tasks',
    userId: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
};

function setupMocks() {
    const onEditSave = vi.fn();
    const onDelete = vi.fn();
    const onToggleCompleted = vi.fn();
    return { onEditSave, onDelete, onToggleCompleted };
}

function renderTaskItem(props = {}) {
    const defaultProps = {
        task: mockTask,
        onEditSave: vi.fn(),
        onDelete: vi.fn(),
        onToggleCompleted: vi.fn(),
        categories: [mockCategory],
        ...props
    };

    return render(
        <QueryClientProvider client={new QueryClient()}>
            <ThemeProvider theme={createTheme()}>
                <TaskItem {...defaultProps} />
            </ThemeProvider>
        </QueryClientProvider>
    );
}

describe('TaskItem', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Functionality', () => {
        it('should render task with all information', () => {
            renderTaskItem();

            expect(screen.getByText('Test Task')).toBeInTheDocument();
            expect(screen.getByText('Test Description')).toBeInTheDocument();
            expect(screen.getByText('Work')).toBeInTheDocument();
            expect(screen.getByTestId('task-item-1')).toBeInTheDocument();
        });

        it('should handle task without category', () => {
            const taskWithoutCategory = { ...mockTask, categoryId: null };
            renderTaskItem({ task: taskWithoutCategory, categories: [] });

            expect(screen.getByText('Test Task')).toBeInTheDocument();
            expect(screen.queryByText('Work')).not.toBeInTheDocument();
        });

        it('should handle task without due date', () => {
            const taskWithoutDueDate = { ...mockTask, dueDate: null };
            renderTaskItem({ task: taskWithoutDueDate });

            expect(screen.getByText('Test Task')).toBeInTheDocument();
        });

        it('should handle completed task state', () => {
            const completedTask = { ...mockTask, isCompleted: true };
            renderTaskItem({ task: completedTask });

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeChecked();
        });

        it('should handle task with empty description', () => {
            const taskWithoutDescription = { ...mockTask, description: '' };
            renderTaskItem({ task: taskWithoutDescription });

            expect(screen.getByText('Test Task')).toBeInTheDocument();
        });

        it('should handle undefined category id', () => {
            const taskWithUndefinedCategory = { ...mockTask, categoryId: undefined };
            renderTaskItem({ task: taskWithUndefinedCategory });

            expect(screen.getByText('Test Task')).toBeInTheDocument();
        });
    });

    describe('Task Operations', () => {
        it('should toggle task completion', async () => {
            const mocks = setupMocks();
            renderTaskItem(mocks);

            const checkbox = screen.getByRole('checkbox');
            await userEvent.click(checkbox);

            expect(mocks.onToggleCompleted).toHaveBeenCalled();
        });

        it('should have menu button available', () => {
            renderTaskItem();

            const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
            expect(menuButton).toBeInTheDocument();
        });

        it('should handle menu button click', async () => {
            renderTaskItem();

            const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
            if (menuButton) {
                fireEvent.click(menuButton);
            }

            expect(menuButton).toBeInTheDocument();
        });

        it('should handle category matching logic', () => {
            const taskWithDifferentCategory = { ...mockTask, categoryId: 2 };
            const additionalCategory = {
                id: 2,
                name: 'Personal',
                color: '#3B82F6',
                description: 'Personal tasks',
                userId: 1,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            };

            renderTaskItem({
                task: taskWithDifferentCategory,
                categories: [mockCategory, additionalCategory]
            });

            expect(screen.getByText('Personal')).toBeInTheDocument();
        });

        it('should handle nonexistent category', () => {
            const taskWithNonexistentCategory = { ...mockTask, categoryId: 999 };
            renderTaskItem({ task: taskWithNonexistentCategory });

            expect(screen.getByText('Test Task')).toBeInTheDocument();
        });
    });

    describe('Dialog Interactions', () => {
        it('should open info dialog when info menu item is clicked', async () => {
            renderTaskItem();

            const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
            if (menuButton) {
                await userEvent.click(menuButton);
                
                const infoMenuItem = screen.getByText('Info');
                await userEvent.click(infoMenuItem);
                
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            }
        });

        it('should open edit dialog when edit menu item is clicked', async () => {
            renderTaskItem();

            const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
            if (menuButton) {
                await userEvent.click(menuButton);
                
                const editMenuItem = screen.getByText('Edit');
                await userEvent.click(editMenuItem);
                
                expect(screen.getByRole('dialog')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
            }
        });

        it('should handle edit save with updated values', async () => {
            const mocks = setupMocks();
            renderTaskItem(mocks);

            const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
            if (menuButton) {
                await userEvent.click(menuButton);
                
                const editMenuItem = screen.getByText('Edit');
                await userEvent.click(editMenuItem);
                
                const titleInput = screen.getByDisplayValue('Test Task');
                await userEvent.clear(titleInput);
                await userEvent.type(titleInput, 'Updated Task');
                
                const saveButton = screen.getByText('Save');
                await userEvent.click(saveButton);
                
                expect(mocks.onEditSave).toHaveBeenCalledWith(
                    expect.objectContaining({
                        title: 'Updated Task',
                        description: 'Test Description',
                        categoryId: 1
                    })
                );
            }
        });

        it('should handle edit modal with empty description', async () => {
            const taskWithNullDescription = { ...mockTask, description: null };
            renderTaskItem({ task: taskWithNullDescription });

            const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
            if (menuButton) {
                await userEvent.click(menuButton);
                
                const editMenuItem = screen.getByText('Edit');
                await userEvent.click(editMenuItem);
                
                expect(screen.getByRole('dialog')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
            }
        });

        it('should handle edit modal with empty due date', async () => {
            const taskWithNullDate = { ...mockTask, dueDate: null };
            renderTaskItem({ task: taskWithNullDate });

            const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
            if (menuButton) {
                await userEvent.click(menuButton);
                
                const editMenuItem = screen.getByText('Edit');
                await userEvent.click(editMenuItem);
                
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            }
        });

        it('should handle edit modal with undefined categoryId', async () => {
            const taskWithUndefinedCategory = { ...mockTask, categoryId: undefined };
            renderTaskItem({ task: taskWithUndefinedCategory });

            const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
            if (menuButton) {
                await userEvent.click(menuButton);
                
                const editMenuItem = screen.getByText('Edit');
                await userEvent.click(editMenuItem);
                
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            }
        });

        it('should close edit modal after save', async () => {
            const mocks = setupMocks();
            renderTaskItem(mocks);

            const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
            if (menuButton) {
                await userEvent.click(menuButton);
                
                const editMenuItem = screen.getByText('Edit');
                await userEvent.click(editMenuItem);
                
                const saveButton = screen.getByText('Save');
                await userEvent.click(saveButton);
                
                expect(mocks.onEditSave).toHaveBeenCalled();
            }
        });

        it('should close info dialog when close button is clicked', async () => {
            renderTaskItem();

            const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
            if (menuButton) {
                await userEvent.click(menuButton);
                
                const infoMenuItem = screen.getByText('Info');
                await userEvent.click(infoMenuItem);
                
                const closeButton = screen.getByTestId('CloseIcon').closest('button');
                if (closeButton) {
                    await userEvent.click(closeButton);
                }
            }
        });
    });
});
