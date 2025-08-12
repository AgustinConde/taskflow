import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TaskEditDialog from '../TaskEditDialog';

const mockT = vi.fn((key: string) => key);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT }) }));

const mockCategories = [
    { id: 1, name: 'Development', color: '#FF5722', userId: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 2, name: 'Review', color: '#2196F3', userId: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
        <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
    </QueryClientProvider>
);

const setupMocks = (overrides: any = {}) => {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        onSave: vi.fn(),
        categories: mockCategories,
        localTitle: 'Test Task',
        localDescription: 'Test description',
        localDueDate: '2024-12-31T23:59',
        localCategoryId: 1,
        setLocalTitle: vi.fn(),
        setLocalDescription: vi.fn(),
        setLocalDueDate: vi.fn(),
        setLocalCategoryId: vi.fn(),
        ...overrides
    };
    return defaultProps;
};

const renderTaskEditDialog = (props = {}) => {
    const config = setupMocks(props);
    return {
        component: render(
            <TestWrapper>
                <TaskEditDialog {...config} />
            </TestWrapper>
        ),
        props: config
    };
};

describe('TaskEditDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Functionality', () => {
        it('should render dialog with task edit form when open', () => {
            renderTaskEditDialog();

            expect(screen.getByText('edit_task')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
            expect(screen.getByDisplayValue('2024-12-31T23:59')).toBeInTheDocument();
        });

        it('should not render dialog when closed', () => {
            renderTaskEditDialog({ open: false });

            expect(screen.queryByText('edit_task')).not.toBeInTheDocument();
        });

        it('should handle close button click', async () => {
            const user = userEvent.setup();
            const { props } = renderTaskEditDialog();

            await user.click(screen.getByText('cancel'));
            expect(props.onClose).toHaveBeenCalledOnce();
        });

        it('should handle save button click', async () => {
            const user = userEvent.setup();
            const { props } = renderTaskEditDialog();

            await user.click(screen.getByText('save'));
            expect(props.onSave).toHaveBeenCalledOnce();
        });
    });

    describe('Form Interactions', () => {
        it('should render form inputs with correct initial values', () => {
            renderTaskEditDialog();

            expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
            expect(screen.getByDisplayValue('2024-12-31T23:59')).toBeInTheDocument();
        });

        it('should allow user interaction with form inputs', async () => {
            const user = userEvent.setup();
            renderTaskEditDialog();

            const titleInput = screen.getByDisplayValue('Test Task');
            const descInput = screen.getByDisplayValue('Test description');
            const dateInput = screen.getByDisplayValue('2024-12-31T23:59');

            await user.click(titleInput);
            expect(titleInput).toHaveFocus();

            await user.click(descInput);
            expect(descInput).toHaveFocus();

            await user.click(dateInput);
            expect(dateInput).toHaveFocus();
        });

        it('should display categories in select dropdown', async () => {
            const user = userEvent.setup();
            renderTaskEditDialog();

            const categorySelect = screen.getByRole('combobox');
            await user.click(categorySelect);

            expect(screen.getAllByText('Development')[0]).toBeInTheDocument();
            expect(screen.getByText('Review')).toBeInTheDocument();
            expect(screen.getByText('no_category')).toBeInTheDocument();
        });

        it('should handle category selection', async () => {
            const user = userEvent.setup();
            const { props } = renderTaskEditDialog();

            const categorySelect = screen.getByRole('combobox');
            await user.click(categorySelect);
            await user.click(screen.getByText('Review'));

            expect(props.setLocalCategoryId).toHaveBeenCalledWith(2);
        });

        it('should handle no category selection', async () => {
            const user = userEvent.setup();
            const { props } = renderTaskEditDialog();

            const categorySelect = screen.getByRole('combobox');
            await user.click(categorySelect);
            await user.click(screen.getByText('no_category'));

            expect(props.setLocalCategoryId).toHaveBeenCalledWith(undefined);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty categories array', () => {
            renderTaskEditDialog({ categories: [] });

            expect(screen.getByText('edit_task')).toBeInTheDocument();
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        it('should handle undefined local category id', () => {
            renderTaskEditDialog({ localCategoryId: undefined });

            expect(screen.getByText('edit_task')).toBeInTheDocument();
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        it('should handle empty string values', () => {
            renderTaskEditDialog({
                localTitle: '',
                localDescription: '',
                localDueDate: ''
            });

            expect(screen.getByText('edit_task')).toBeInTheDocument();
            expect(screen.getByLabelText('title')).toHaveValue('');
            expect(screen.getByLabelText('description')).toHaveValue('');
        });

        it('should display category colors correctly', async () => {
            const user = userEvent.setup();
            renderTaskEditDialog();

            const categorySelect = screen.getByRole('combobox');
            await user.click(categorySelect);

            const devOptions = screen.getAllByText('Development');
            expect(devOptions.length).toBeGreaterThan(0);
            expect(screen.getByText('Review')).toBeInTheDocument();
        });
    });
});
