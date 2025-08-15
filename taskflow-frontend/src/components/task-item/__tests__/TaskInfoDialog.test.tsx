import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TaskInfoDialog from '../TaskInfoDialog';

const mockTranslations = {
    close: 'close',
    completed: 'completed',
    pending: 'pending',
    created: 'created',
    due: 'due',
    description: 'description'
};

const mockT = vi.fn((key: string) => mockTranslations[key as keyof typeof mockTranslations] || key);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT }) }));

const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test task description',
    isCompleted: false,
    dueDate: '2024-12-31T23:59:59.000Z',
    categoryId: 1,
    createdAt: '2024-01-01T00:00:00.000Z'
};

const renderDialog = (overrides = {}) => {
    const props = {
        open: true,
        onClose: vi.fn(),
        task: mockTask,
        ...overrides
    };

    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

    return {
        ...render(
            <QueryClientProvider client={client}>
                <ThemeProvider theme={createTheme()}>
                    <TaskInfoDialog {...props} />
                </ThemeProvider>
            </QueryClientProvider>
        ),
        ...props
    };
};

const renderWithTheme = (theme: any, props = {}) => {
    const config = {
        open: true,
        onClose: vi.fn(),
        task: mockTask,
        ...props
    };

    const client = new QueryClient();

    return render(
        <QueryClientProvider client={client}>
            <ThemeProvider theme={theme}>
                <TaskInfoDialog {...config} />
            </ThemeProvider>
        </QueryClientProvider>
    );
};

describe('TaskInfoDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render dialog with task information', () => {
        renderDialog();

        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.getByText('Test task description')).toBeInTheDocument();
        expect(screen.getByText('pending')).toBeInTheDocument();
    });

    it('should display completed status and primary chip color', () => {
        renderDialog({ task: { ...mockTask, isCompleted: true } });

        const chip = screen.getByText('completed');
        expect(chip).toBeInTheDocument();
        expect(chip.closest('.MuiChip-colorPrimary')).toBeInTheDocument();
    });

    it('should display pending status and default chip color', () => {
        renderDialog({ task: { ...mockTask, isCompleted: false } });

        const chip = screen.getByText('pending');
        expect(chip).toBeInTheDocument();
        expect(chip.closest('.MuiChip-colorDefault')).toBeInTheDocument();
    });

    it('should handle close button interaction', async () => {
        const user = userEvent.setup();
        const { onClose } = renderDialog();

        await user.click(screen.getByText('close'));
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('should not render when closed', () => {
        renderDialog({ open: false });

        expect(screen.queryByText('Test Task')).not.toBeInTheDocument();
    });

    it('should format dates correctly', () => {
        renderDialog();

        expect(screen.getByText('created')).toBeInTheDocument();
        expect(screen.getByText('due')).toBeInTheDocument();
        expect(screen.getByText('12/31/2023, 09:00 PM')).toBeInTheDocument();
        expect(screen.getByText('12/31/2024, 08:59 PM')).toBeInTheDocument();
    });

    it('should handle null dates', () => {
        renderDialog({ task: { ...mockTask, createdAt: null, dueDate: null } });
        expect(screen.getAllByText('-')).toHaveLength(2);
    });

    it('should handle empty description', () => {
        renderDialog({ task: { ...mockTask, description: '' } });
        expect(screen.getByText('description')).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should handle null description', () => {
        renderDialog({ task: { ...mockTask, description: null } });
        expect(screen.getByText('description')).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should apply dark theme button colors', () => {
        const darkTheme = createTheme({
            palette: {
                mode: 'dark',
                primary: { main: '#1976d2', light: '#42a5f5' }
            }
        });

        renderWithTheme(darkTheme);
        expect(screen.getByText('close')).toBeInTheDocument();
    });

    it('should apply light theme button colors', () => {
        const lightTheme = createTheme({ palette: { mode: 'light' } });
        renderWithTheme(lightTheme);
        expect(screen.getByText('close')).toBeInTheDocument();
    });

    it('should handle different task titles', () => {
        renderDialog({ task: { ...mockTask, title: 'Custom Task Title' } });

        expect(screen.getByText('Custom Task Title')).toBeInTheDocument();
    });
});
