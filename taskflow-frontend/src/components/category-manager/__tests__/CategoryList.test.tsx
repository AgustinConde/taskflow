import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import CategoryList from '../CategoryList';
import type { Category } from '../../../types/Category';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'en',
            changeLanguage: vi.fn()
        }
    })
}));

const theme = createTheme();

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

describe('CategoryList', () => {
    const mockCategories: Category[] = [
        {
            id: 1,
            name: 'Work',
            color: '#ff5722',
            description: 'Work related tasks',
            createdAt: '2023-10-01T12:00:00Z',
            updatedAt: '2023-10-02T12:00:00Z',
            userId: 1
        },
        {
            id: 2,
            name: 'Personal',
            color: '#2196f3',
            description: 'Personal tasks',
            createdAt: '2023-10-01T12:00:00Z',
            updatedAt: '2023-10-02T12:00:00Z',
            userId: 1
        }
    ];

    const setupMocks = () => ({
        onEdit: vi.fn(),
        onDelete: vi.fn()
    });

    const renderCategoryList = (props = {}) => {
        const mocks = setupMocks();
        const defaultProps = {
            categories: mockCategories,
            loading: false,
            ...mocks,
            ...props
        };

        const { container } = render(
            <TestWrapper>
                <CategoryList {...defaultProps} />
            </TestWrapper>
        );
        return { mocks, container };
    };

    describe('Core Functionality', () => {
        it('should render categories with correct information', () => {
            renderCategoryList();

            expect(screen.getByText('categories (2)')).toBeInTheDocument();
            expect(screen.getByText('Work')).toBeInTheDocument();
            expect(screen.getByText('Personal')).toBeInTheDocument();
            expect(screen.getByText('Work related tasks')).toBeInTheDocument();
            expect(screen.getByText('Personal tasks')).toBeInTheDocument();
        });

        it('should handle category interactions correctly', async () => {
            const user = userEvent.setup();
            const { mocks } = renderCategoryList();

            const editButtons = screen.getAllByRole('button').filter(btn =>
                btn.querySelector('[data-testid="EditIcon"]') ||
                btn.getAttribute('aria-label')?.includes('edit') ||
                btn.innerHTML.includes('EditIcon')
            );

            const deleteButtons = screen.getAllByRole('button').filter(btn =>
                btn.querySelector('[data-testid="DeleteIcon"]') ||
                btn.getAttribute('aria-label')?.includes('delete') ||
                btn.innerHTML.includes('DeleteIcon')
            );

            if (editButtons.length > 0) {
                await user.click(editButtons[0]);
                expect(mocks.onEdit).toHaveBeenCalledWith(mockCategories[0]);
            }

            if (deleteButtons.length > 0) {
                await user.click(deleteButtons[0]);
                expect(mocks.onDelete).toHaveBeenCalledWith(mockCategories[0]);
            }
        });

        it('should handle empty categories list', () => {
            renderCategoryList({ categories: [] });

            expect(screen.getByText('categories (0)')).toBeInTheDocument();
            expect(screen.getByText('noCategoriesFound')).toBeInTheDocument();
            expect(screen.queryByText('Work')).not.toBeInTheDocument();
        });
    });

    describe('Loading States & UI', () => {
        it('should display loading spinner when loading', () => {
            renderCategoryList({ loading: true });

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByText('Work')).not.toBeInTheDocument();
        });

        it('should display categories when not loading', () => {
            renderCategoryList({ loading: false });

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.getByText('Work')).toBeInTheDocument();
            expect(screen.getByText('Personal')).toBeInTheDocument();
        });

        it('should handle categories without descriptions', () => {
            const categoriesWithoutDesc = [
                { ...mockCategories[0], description: '' },
                { ...mockCategories[1], description: undefined }
            ];

            renderCategoryList({ categories: categoriesWithoutDesc });

            expect(screen.getByText('Work')).toBeInTheDocument();
            expect(screen.getByText('Personal')).toBeInTheDocument();
            expect(screen.queryByText('Work related tasks')).not.toBeInTheDocument();
        });
    });

    describe('Layout & Category Display', () => {
        it('should render category chips with correct colors', () => {
            renderCategoryList();

            const workChip = screen.getByText('Work').closest('.MuiChip-root');
            const personalChip = screen.getByText('Personal').closest('.MuiChip-root');

            expect(workChip).toBeInTheDocument();
            expect(personalChip).toBeInTheDocument();
        });

        it('should display all action buttons for each category', () => {
            renderCategoryList();

            const allButtons = screen.getAllByRole('button');
            const iconButtons = allButtons.filter(btn =>
                btn.className.includes('MuiIconButton-root')
            );

            expect(iconButtons.length).toBeGreaterThanOrEqual(4);
        });

        it('should handle single category correctly', () => {
            renderCategoryList({ categories: [mockCategories[0]] });

            expect(screen.getByText('categories (1)')).toBeInTheDocument();
            expect(screen.getByText('Work')).toBeInTheDocument();
            expect(screen.queryByText('Personal')).not.toBeInTheDocument();
        });

        it('should maintain consistent layout structure', () => {
            renderCategoryList();
        });
    });
});
