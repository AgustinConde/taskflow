import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import CategoryFormActions from '../CategoryFormActions';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

const theme = createTheme();

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

describe('CategoryFormActions', () => {
    const setupMocks = () => ({
        onSave: vi.fn(),
        onCancel: vi.fn()
    });

    const renderCategoryFormActions = (props = {}) => {
        const mocks = setupMocks();
        const defaultProps = {
            editingCategory: null,
            loading: false,
            ...mocks,
            ...props
        };

        const container = render(
            <TestWrapper>
                <CategoryFormActions {...defaultProps} />
            </TestWrapper>
        ).container;

        return { mocks, container };
    };

    describe('Core Functionality', () => {
        it('should render create button for new category', () => {
            renderCategoryFormActions();

            const createButton = screen.getByRole('button', { name: /createCategory/i });
            expect(createButton).toBeInTheDocument();
            expect(createButton).toHaveTextContent('createCategory');

            const cancelButton = screen.queryByRole('button', { name: /cancel/i });
            expect(cancelButton).not.toBeInTheDocument();
        });

        it('should render update and cancel buttons for editing', () => {
            renderCategoryFormActions({ editingCategory: { id: 1, name: 'Test' } });

            const updateButton = screen.getByRole('button', { name: /updateCategory/i });
            const cancelButton = screen.getByRole('button', { name: /cancel/i });

            expect(updateButton).toBeInTheDocument();
            expect(updateButton).toHaveTextContent('updateCategory');
            expect(cancelButton).toBeInTheDocument();
        });

        it('should handle button clicks correctly', async () => {
            const user = userEvent.setup();
            const { mocks } = renderCategoryFormActions({ editingCategory: { id: 1 } });

            const saveButton = screen.getByRole('button', { name: /updateCategory/i });
            const cancelButton = screen.getByRole('button', { name: /cancel/i });

            await user.click(saveButton);
            expect(mocks.onSave).toHaveBeenCalledTimes(1);

            await user.click(cancelButton);
            expect(mocks.onCancel).toHaveBeenCalledTimes(1);
        });
    });

    describe('Button States & Loading', () => {
        it('should disable buttons when loading', () => {
            renderCategoryFormActions({ loading: true });

            const createButton = screen.getByRole('button', { name: /createCategory/i });
            expect(createButton).toBeDisabled();
        });

        it('should disable both buttons when editing and loading', () => {
            renderCategoryFormActions({
                editingCategory: { id: 1 },
                loading: true
            });

            const updateButton = screen.getByRole('button', { name: /updateCategory/i });
            const cancelButton = screen.getByRole('button', { name: /cancel/i });

            expect(updateButton).toBeDisabled();
            expect(cancelButton).toBeDisabled();
        });

        it('should enable buttons when not loading', () => {
            renderCategoryFormActions({
                editingCategory: { id: 1 },
                loading: false
            });

            const updateButton = screen.getByRole('button', { name: /updateCategory/i });
            const cancelButton = screen.getByRole('button', { name: /cancel/i });

            expect(updateButton).not.toBeDisabled();
            expect(cancelButton).not.toBeDisabled();
        });
    });

    describe('Layout & Interaction', () => {
        it('should render correct icons for different modes', () => {
            const { container } = renderCategoryFormActions();

            const createButton = screen.getByRole('button', { name: /createCategory/i });
            expect(createButton).toBeInTheDocument();

            const buttonWithIcon = container.querySelector('.MuiButton-startIcon');
            expect(buttonWithIcon).toBeInTheDocument();
        });

        it('should render edit icon when editing', () => {
            const { container } = renderCategoryFormActions({ editingCategory: { id: 1 } });

            const updateButton = screen.getByRole('button', { name: /updateCategory/i });
            expect(updateButton).toBeInTheDocument();

            const buttonWithIcon = container.querySelector('.MuiButton-startIcon');
            expect(buttonWithIcon).toBeInTheDocument();
        }); it('should handle multiple interactions without conflicts', async () => {
            const user = userEvent.setup();
            const { mocks } = renderCategoryFormActions({ editingCategory: { id: 1 } });

            const saveButton = screen.getByRole('button', { name: /updateCategory/i });

            await user.click(saveButton);
            await user.click(saveButton);

            expect(mocks.onSave).toHaveBeenCalledTimes(2);
        });

        it('should maintain button layout consistency', () => {
            const { container } = renderCategoryFormActions({ editingCategory: { id: 1 } });

            const buttonContainer = container.querySelector('.MuiBox-root');
            expect(buttonContainer).toBeInTheDocument();

            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(2);
        });
    });
});
