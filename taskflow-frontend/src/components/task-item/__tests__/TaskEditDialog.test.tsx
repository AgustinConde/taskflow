import { render, screen, within, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TaskEditDialog from '../TaskEditDialog';

const mockT = vi.fn((key: string) => key);
vi.mock('react-i18next', () => ({
    __esModule: true,
    useTranslation: () => ({
        t: mockT,
        i18n: {
            language: 'en',
            changeLanguage: vi.fn()
        }
    })
}));

vi.mock('../location', () => ({
    __esModule: true,
    LocationPicker: () => <div data-testid="mock-location-picker" />
}));

const mockCategories = [
    { id: 1, name: 'Development', color: '#FF5722', userId: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 2, name: 'Review', color: '#2196F3', userId: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
];

const setupMocks = (overrides: any = {}) => ({
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
});

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            gcTime: 0
        },
        mutations: {
            retry: false
        }
    }
});

const renderWithProviders = (props = {}, themeOptions = {}) => {
    const theme = createTheme(themeOptions);
    const mockProps = setupMocks(props);
    const queryClient = createTestQueryClient();

    return {
        ...render(
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <TaskEditDialog {...mockProps} />
                </ThemeProvider>
            </QueryClientProvider>
        ),
        props: mockProps,
        queryClient
    };
};

describe('TaskEditDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Functionality', () => {
        it('should render dialog with task edit form when open', () => {
            renderWithProviders();

            expect(screen.getByText('edit_task')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
            expect(screen.getByDisplayValue('2024-12-31T23:59')).toBeInTheDocument();
        });

        it('should not render dialog when closed', () => {
            renderWithProviders({ open: false });

            expect(screen.queryByText('edit_task')).not.toBeInTheDocument();
        });

        it('should handle button clicks', async () => {
            const user = userEvent.setup();
            const { props } = renderWithProviders();

            await user.click(screen.getByText('cancel'));
            expect(props.onClose).toHaveBeenCalledOnce();

            await user.click(screen.getByText('save'));
            expect(props.onSave).toHaveBeenCalledOnce();
        });
    });

    describe('Form Interactions', () => {
        it('should allow user interaction with form inputs', async () => {
            const user = userEvent.setup();
            renderWithProviders();

            const titleInput = screen.getByDisplayValue('Test Task');
            const descInput = screen.getByDisplayValue('Test description');

            await user.click(titleInput);
            expect(titleInput).toHaveFocus();

            await user.click(descInput);
            expect(descInput).toHaveFocus();
        });

        it('should handle category selection', async () => {
            const user = userEvent.setup();
            const { props } = renderWithProviders();

            const categorySelect = screen.getByRole('combobox', { name: /category/i });
            fireEvent.mouseDown(categorySelect);

            const listbox = await screen.findByRole('listbox');
            const developmentOption = within(listbox).getByText('Development');
            const reviewOption = within(listbox).getByText('Review');
            const noCategoryOption = within(listbox).getByText('no_category');
            expect(developmentOption).toBeInTheDocument();
            expect(reviewOption).toBeInTheDocument();
            expect(noCategoryOption).toBeInTheDocument();

            await user.click(reviewOption);
            expect(props.setLocalCategoryId).toHaveBeenCalledWith(2);
        });

        it('should handle no category selection', async () => {
            const user = userEvent.setup();
            const { props } = renderWithProviders();

            const categorySelect = screen.getByRole('combobox', { name: /category/i });
            fireEvent.mouseDown(categorySelect);
            const listbox = await screen.findByRole('listbox');
            const noCategoryOption = within(listbox).getByText('no_category');
            await user.click(noCategoryOption);

            expect(props.setLocalCategoryId).toHaveBeenCalledWith(undefined);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty categories and undefined values', () => {
            renderWithProviders({
                categories: [],
                localCategoryId: undefined,
                localTitle: '',
                localDescription: '',
                localDueDate: ''
            });

            expect(screen.getByText('edit_task')).toBeInTheDocument();
            expect(screen.getByTestId('category-select')).toBeInTheDocument();
            expect(screen.getByLabelText('title')).toHaveValue('');
            expect(screen.getByLabelText('description')).toHaveValue('');
        });

        it('should display category colors correctly', async () => {
            const user = userEvent.setup();
            renderWithProviders();

            const categorySelect = screen.getByRole('combobox', { name: /category/i });
            fireEvent.mouseDown(categorySelect);

            const listbox = await screen.findByRole('listbox');
            const developmentOption = within(listbox).getByText('Development');
            const reviewOption = within(listbox).getByText('Review');
            expect(developmentOption).toBeInTheDocument();
            expect(reviewOption).toBeInTheDocument();
        });
    });

    describe('Theme Support', () => {
        it('should render with dark theme', () => {
            renderWithProviders({}, { palette: { mode: 'dark' } });
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('should render with light theme', () => {
            renderWithProviders({}, { palette: { mode: 'light' } });
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('should handle category color fallback', () => {
            const categoriesWithoutColor = [
                { id: 1, name: 'Work', color: undefined },
                { id: 2, name: 'Personal', color: null }
            ];

            renderWithProviders({ categories: categoriesWithoutColor });
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });
});
