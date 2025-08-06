import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AuthTabs from '../AuthTabs';

// Mocks
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));
vi.mock('@mui/icons-material', () => ({
    Login: () => <div data-testid="LoginIcon" />,
    PersonAdd: () => <div data-testid="PersonAddIcon" />
}));

// Test helpers
const createProps = (overrides = {}) => ({
    activeTab: 0,
    onTabChange: vi.fn(),
    ...overrides
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={createTheme()}>
        {children}
    </ThemeProvider>
);

const renderAuthTabs = (props = {}) => {
    const finalProps = createProps(props);
    return {
        ...render(
            <TestWrapper>
                <AuthTabs {...finalProps} />
            </TestWrapper>
        ),
        props: finalProps
    };
};

// Test data
const tabData = [
    { name: 'login', icon: 'LoginIcon', index: 0 },
    { name: 'register', icon: 'PersonAddIcon', index: 1 }
];

describe('AuthTabs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering and Content', () => {
        it('should render both tabs with icons and correct styling', () => {
            renderAuthTabs();

            expect(screen.getByRole('tablist')).toBeInTheDocument();
            expect(screen.getByRole('tablist')).toHaveClass('MuiTabs-centered');

            tabData.forEach(({ name, icon }) => {
                const tab = screen.getByRole('tab', { name });
                expect(tab).toBeInTheDocument();
                expect(tab.querySelector(`[data-testid="${icon}"]`)).toBeInTheDocument();
                expect(screen.getByText(name)).toBeInTheDocument();
            });
        });

        it('should have proper layout and visual styling', () => {
            renderAuthTabs();

            const container = screen.getByRole('tablist').closest('.MuiBox-root');
            const loginTab = screen.getByRole('tab', { name: 'login' });

            expect(container).toHaveStyle({ marginBottom: '24px' });
            expect(loginTab).toHaveStyle({ fontWeight: 600, minHeight: '48px' });
        });
    });

    describe('Tab Selection and State', () => {
        it.each([
            { activeTab: 0, selectedTab: 'login', unselectedTab: 'register' },
            { activeTab: 1, selectedTab: 'register', unselectedTab: 'login' }
        ])('should show correct selection for activeTab $activeTab', ({ activeTab, selectedTab, unselectedTab }) => {
            renderAuthTabs({ activeTab });

            expect(screen.getByRole('tab', { name: selectedTab })).toHaveAttribute('aria-selected', 'true');
            expect(screen.getByRole('tab', { name: unselectedTab })).toHaveAttribute('aria-selected', 'false');
        });

        it('should maintain state across re-renders', () => {
            const { rerender } = renderAuthTabs({ activeTab: 0 });

            expect(screen.getByRole('tab', { name: 'login' })).toHaveAttribute('aria-selected', 'true');

            rerender(
                <TestWrapper>
                    <AuthTabs {...createProps({ activeTab: 0 })} />
                </TestWrapper>
            );

            expect(screen.getByRole('tab', { name: 'login' })).toHaveAttribute('aria-selected', 'true');
        });
    });

    describe('User Interactions', () => {
        it.each(tabData)('should call onTabChange when $name tab is clicked', async ({ name, index }) => {
            const { props } = renderAuthTabs({ activeTab: index === 0 ? 1 : 0 }); // Start with opposite tab

            const tab = screen.getByRole('tab', { name });
            await userEvent.click(tab);

            expect(props.onTabChange).toHaveBeenCalled();
        });

        it('should pass correct parameters to onTabChange', async () => {
            const { props } = renderAuthTabs({ activeTab: 0 });

            const registerTab = screen.getByRole('tab', { name: 'register' });
            await userEvent.click(registerTab);

            expect(props.onTabChange).toHaveBeenCalledWith(expect.any(Object), 1);
        });

        it('should handle rapid clicking', async () => {
            const { props } = renderAuthTabs();

            const registerTab = screen.getByRole('tab', { name: 'register' });

            await userEvent.click(registerTab);
            await userEvent.click(registerTab);
            await userEvent.click(registerTab);

            expect(props.onTabChange).toHaveBeenCalledTimes(3);
        });

        it('should work with keyboard navigation (click simulation)', async () => {
            const { props } = renderAuthTabs();

            const registerTab = screen.getByRole('tab', { name: 'register' });
            await userEvent.click(registerTab);

            expect(props.onTabChange).toHaveBeenCalledWith(expect.any(Object), 1);
        });
    });

    describe('Accessibility', () => {
        it('should have proper accessibility attributes', () => {
            renderAuthTabs();

            expect(screen.getByRole('tablist')).toBeInTheDocument();

            tabData.forEach(({ name }) => {
                const tab = screen.getByRole('tab', { name });
                expect(tab).toHaveAttribute('tabindex');
                expect(tab).toHaveAttribute('aria-selected');
            });
        });

        it('should meet touch target size requirements', () => {
            renderAuthTabs();

            tabData.forEach(({ name }) => {
                const tab = screen.getByRole('tab', { name });
                expect(tab).toHaveStyle({ minHeight: '48px' });
            });
        });
    });

    describe('State Transitions', () => {
        it('should update selection when activeTab prop changes', () => {
            const { rerender } = renderAuthTabs({ activeTab: 0 });

            expect(screen.getByRole('tab', { name: 'login' })).toHaveAttribute('aria-selected', 'true');
            expect(screen.getByRole('tab', { name: 'register' })).toHaveAttribute('aria-selected', 'false');

            rerender(
                <TestWrapper>
                    <AuthTabs {...createProps({ activeTab: 1 })} />
                </TestWrapper>
            );

            expect(screen.getByRole('tab', { name: 'login' })).toHaveAttribute('aria-selected', 'false');
            expect(screen.getByRole('tab', { name: 'register' })).toHaveAttribute('aria-selected', 'true');
        });

        it('should handle clicking on already selected tab', async () => {
            const { props } = renderAuthTabs({ activeTab: 1 });

            const registerTab = screen.getByRole('tab', { name: 'register' });
            await userEvent.click(registerTab);

            const loginTab = screen.getByRole('tab', { name: 'login' });
            await userEvent.click(loginTab);

            expect(props.onTabChange).toHaveBeenCalled();
        });
    });
});
