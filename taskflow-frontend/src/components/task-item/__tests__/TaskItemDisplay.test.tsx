import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import TaskItemDisplay from '../TaskItemDisplay';
import type { Task } from '../../../types/Task';
import type { Category } from '../../../types/Category';

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
    description: 'Work category',
    userId: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
};

const renderDisplay = (props = {}) => {
    const defaultProps = {
        task: mockTask,
        onToggleCompleted: vi.fn(),
        taskCategory: null,
        ...props
    };

    return {
        ...render(<TaskItemDisplay {...defaultProps} />),
        props: defaultProps
    };
};

describe('TaskItemDisplay', () => {
    it('renders task title', () => {
        renderDisplay();
        expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('renders task description', () => {
        renderDisplay();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('renders unchecked checkbox for incomplete task', () => {
        renderDisplay();
        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('renders checked checkbox for complete task', () => {
        renderDisplay({ task: { ...mockTask, isCompleted: true } });
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('toggles completion on checkbox click', async () => {
        const { props } = renderDisplay();
        await userEvent.click(screen.getByRole('checkbox'));
        expect(props.onToggleCompleted).toHaveBeenCalledOnce();
    });

    it('renders category chip when category exists', () => {
        renderDisplay({ taskCategory: mockCategory });
        expect(screen.getByText('Work')).toBeInTheDocument();
    });

    it('does not render category chip when no category', () => {
        renderDisplay({ taskCategory: null });
        expect(screen.queryByText('Work')).not.toBeInTheDocument();
    });

    it('applies category color to chip', () => {
        renderDisplay({ taskCategory: mockCategory });
        const chip = screen.getByText('Work').closest('.MuiChip-root');
        expect(chip).toHaveStyle({ backgroundColor: '#7C3AED' });
    });

    it('shows description as title attribute', () => {
        renderDisplay();
        const description = screen.getByText('Test Description');
        expect(description).toHaveAttribute('title', 'Test Description');
    });
});
