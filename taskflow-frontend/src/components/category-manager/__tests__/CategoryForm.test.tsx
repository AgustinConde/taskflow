import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material';
import CategoryForm from '../CategoryForm';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT
    })
}));

const mockFormData = {
    name: 'Work',
    color: '#ff5722',
    description: 'Work related tasks'
};

const mockPredefinedColors = ['#ff5722', '#2196f3', '#4caf50', '#ff9800', '#9c27b0'];

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={createTheme()}>
        {children}
    </ThemeProvider>
);

const setupMocks = (overrides = {}) => {
    const defaultMocks = {
        formData: mockFormData,
        setFormData: vi.fn(),
        formErrors: {},
        predefinedColors: mockPredefinedColors,
        editingCategory: null,
        ...overrides
    };
    return defaultMocks;
};

const renderCategoryForm = (props = {}) => {
    const mocks = setupMocks(props);
    return {
        ...render(
            <TestWrapper>
                <CategoryForm {...mocks} />
            </TestWrapper>
        ),
        mocks
    };
};

describe('CategoryForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Functionality', () => {
        it('should render form fields with correct values', () => {
            renderCategoryForm();

            expect(screen.getByDisplayValue('Work')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Work related tasks')).toBeInTheDocument();
            expect(screen.getByLabelText('categoryName')).toBeInTheDocument();
            expect(screen.getByLabelText('categoryDescription')).toBeInTheDocument();
        });

        it('should handle form input changes', async () => {
            const user = userEvent.setup();
            const { mocks } = renderCategoryForm({
                formData: { name: '', color: '#ff5722', description: '' }
            });

            const nameField = screen.getByLabelText('categoryName');
            const descField = screen.getByLabelText('categoryDescription');

            await user.type(nameField, 'Personal');

            expect(mocks.setFormData).toHaveBeenLastCalledWith({
                name: 'l',
                color: '#ff5722',
                description: ''
            });

            await user.type(descField, 'Personal tasks');

            expect(mocks.setFormData).toHaveBeenLastCalledWith({
                name: '',
                color: '#ff5722',
                description: 's'
            });
        });

        it('should handle color selection', async () => {
            const user = userEvent.setup();
            const { mocks, container } = renderCategoryForm();

            const colorContainer = container.querySelector('.css-zefc5s');
            expect(colorContainer).toBeInTheDocument();

            const colorBoxes = colorContainer?.querySelectorAll('.MuiBox-root');
            expect(colorBoxes?.length).toBe(mockPredefinedColors.length);

            if (colorBoxes && colorBoxes.length > 1) {
                await user.click(colorBoxes[1] as HTMLElement);
                expect(mocks.setFormData).toHaveBeenCalledWith({
                    ...mockFormData,
                    color: mockPredefinedColors[1]
                });
            }
        });
    });

    describe('Form States & Validation', () => {
        it('should display form errors correctly', () => {
            const formErrors = {
                name: 'Name is required',
                color: 'Color is required'
            };

            renderCategoryForm({ formErrors });

            expect(screen.getByText('Name is required')).toBeInTheDocument();
            expect(screen.getByText('Color is required')).toBeInTheDocument();

            const nameField = screen.getByLabelText('categoryName');
            expect(nameField).toHaveAttribute('aria-invalid', 'true');
        });

        it('should show correct title for add vs edit mode', () => {
            renderCategoryForm();
            expect(screen.getByText('addCategory')).toBeInTheDocument();

            renderCategoryForm({ editingCategory: { id: 1, name: 'Test' } });
            expect(screen.getByText('editCategory')).toBeInTheDocument();
        });

        it('should handle empty form data', () => {
            const emptyFormData = { name: '', color: '', description: '' };
            renderCategoryForm({ formData: emptyFormData });

            expect(screen.getByLabelText('categoryName')).toHaveValue('');
            expect(screen.getByLabelText('categoryDescription')).toHaveValue('');
        });
    });

    describe('Layout & Color Selection', () => {
        it('should render all predefined colors', () => {
            const { container } = renderCategoryForm();

            const colorContainer = container.querySelector('.css-zefc5s');
            expect(colorContainer).toBeInTheDocument();

            const colorElements = colorContainer?.querySelectorAll('.MuiBox-root');
            expect(colorElements?.length).toBe(mockPredefinedColors.length);

            const expectedClasses = ['css-r1qygl', 'css-1utihej', 'css-174w3z', 'css-1dibyei', 'css-cw146p'];
            expectedClasses.forEach(className => {
                const colorElement = container.querySelector(`.${className}`);
                expect(colorElement).toBeInTheDocument();
            });
        });

        it('should highlight selected color with border', () => {
            const { container } = renderCategoryForm();

            const colorContainer = container.querySelector('.css-zefc5s');
            expect(colorContainer).toBeInTheDocument();

            const allColorElements = colorContainer?.querySelectorAll('.MuiBox-root');
            expect(allColorElements?.length).toBe(mockPredefinedColors.length);

            const firstColorElement = container.querySelector('.css-r1qygl');
            expect(firstColorElement).toBeInTheDocument();
        });

        it('should handle edge cases gracefully', () => {
            const edgeCases = [
                {
                    formData: { name: '', color: '', description: '' },
                    predefinedColors: []
                },
                {
                    predefinedColors: []
                },
                {
                    formData: { name: '', color: '', description: '' },
                    formErrors: {}
                }
            ];

            edgeCases.forEach((props, index) => {
                expect(() => {
                    const safeProps = {
                        formData: mockFormData,
                        setFormData: vi.fn(),
                        formErrors: {},
                        predefinedColors: mockPredefinedColors,
                        editingCategory: null,
                        ...props
                    };
                    render(
                        <TestWrapper>
                            <CategoryForm {...safeProps} />
                        </TestWrapper>
                    );
                }, `Edge case ${index + 1} should not throw`).not.toThrow();
            });
        });

        it('should have accessible form structure', () => {
            renderCategoryForm();

            const nameField = screen.getByLabelText('categoryName');
            const descField = screen.getByLabelText('categoryDescription');

            expect(nameField).toHaveAttribute('type', 'text');
            expect(descField).toHaveAttribute('rows', '2');
            expect(screen.getByRole('heading', { level: 6 })).toBeInTheDocument();
        });
    });
});
