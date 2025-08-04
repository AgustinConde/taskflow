import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationProvider, useNotifications } from '../NotificationContext';

const TestComponent = () => {
    const notifications = useNotifications();

    return (
        <div>
            <div data-testid="notifications-available">Notifications available</div>
            <button
                data-testid="show-success"
                onClick={() => notifications.showSuccess('Success message', 5000)}
            >
                Show Success
            </button>
            <button
                data-testid="show-error"
                onClick={() => notifications.showError('Error message', 5000)}
            >
                Show Error
            </button>
            <button
                data-testid="show-warning"
                onClick={() => notifications.showWarning('Warning message', 5000)}
            >
                Show Warning
            </button>
            <button
                data-testid="show-info"
                onClick={() => notifications.showInfo('Info message', 5000)}
            >
                Show Info
            </button>
            <button
                data-testid="show-notification"
                onClick={() => notifications.showNotification('Custom message', 'success', { duration: 3000 })}
            >
                Show Custom
            </button>
            <button
                data-testid="clear-all"
                onClick={() => notifications.clearAll()}
            >
                Clear All
            </button>
        </div>
    );
};

const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
        <NotificationProvider>
            {children}
        </NotificationProvider>
    );
};

describe('NotificationContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should provide notification context without throwing', () => {
        const Wrapper = createWrapper();

        expect(() => {
            render(
                <Wrapper>
                    <TestComponent />
                </Wrapper>
            );
        }).not.toThrow();

        expect(screen.getByTestId('notifications-available')).toBeInTheDocument();
    });

    it('should throw error when used outside provider', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useNotifications must be used within a NotificationProvider');

        consoleSpy.mockRestore();
    });

    it('should provide all notification methods', () => {
        const Wrapper = createWrapper();

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        expect(screen.getByTestId('show-success')).toBeInTheDocument();
        expect(screen.getByTestId('show-error')).toBeInTheDocument();
        expect(screen.getByTestId('show-warning')).toBeInTheDocument();
        expect(screen.getByTestId('show-info')).toBeInTheDocument();
        expect(screen.getByTestId('show-notification')).toBeInTheDocument();
        expect(screen.getByTestId('clear-all')).toBeInTheDocument();
    });

    it('should show success notification', async () => {
        const user = userEvent.setup();
        const Wrapper = createWrapper();

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        await user.click(screen.getByTestId('show-success'));

        await waitFor(() => {
            expect(screen.getByText('Success message')).toBeInTheDocument();
        });

        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
    });

    it('should show error notification', async () => {
        const user = userEvent.setup();
        const Wrapper = createWrapper();

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        await user.click(screen.getByTestId('show-error'));

        await waitFor(() => {
            expect(screen.getByText('Error message')).toBeInTheDocument();
        });

        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
    });

    it('should show warning notification', async () => {
        const user = userEvent.setup();
        const Wrapper = createWrapper();

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        await user.click(screen.getByTestId('show-warning'));

        await waitFor(() => {
            expect(screen.getByText('Warning message')).toBeInTheDocument();
        });

        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
    });

    it('should show info notification', async () => {
        const user = userEvent.setup();
        const Wrapper = createWrapper();

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        await user.click(screen.getByTestId('show-info'));

        await waitFor(() => {
            expect(screen.getByText('Info message')).toBeInTheDocument();
        });

        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
    });

    it('should show custom notification with options', async () => {
        const user = userEvent.setup();
        const Wrapper = createWrapper();

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        await user.click(screen.getByTestId('show-notification'));

        await waitFor(() => {
            expect(screen.getByText('Custom message')).toBeInTheDocument();
        });
    });

    it('should handle multiple notifications', async () => {
        const user = userEvent.setup();
        const Wrapper = createWrapper();

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        await user.click(screen.getByTestId('show-success'));
        await user.click(screen.getByTestId('show-error'));

        await waitFor(() => {
            expect(screen.getByText('Success message')).toBeInTheDocument();
            expect(screen.getByText('Error message')).toBeInTheDocument();
        });
    });

    it('should clear all notifications', async () => {
        const user = userEvent.setup();
        const Wrapper = createWrapper();

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        await user.click(screen.getByTestId('show-success'));

        await waitFor(() => {
            expect(screen.getByText('Success message')).toBeInTheDocument();
        });

        await user.click(screen.getByTestId('clear-all'));

        await waitFor(() => {
            expect(screen.queryByText('Success message')).not.toBeInTheDocument();
        });
    });

    it('should auto-hide notifications after duration', async () => {
        const user = userEvent.setup();
        const Wrapper = createWrapper();

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        await user.click(screen.getByTestId('show-success'));

        await waitFor(() => {
            expect(screen.getByText('Success message')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.queryByText('Success message')).not.toBeInTheDocument();
        }, { timeout: 6000 });
    });

    describe('notification methods functionality', () => {
        it('should call showSuccess without errors', async () => {
            const user = userEvent.setup();
            const Wrapper = createWrapper();

            render(
                <Wrapper>
                    <TestComponent />
                </Wrapper>
            );

            expect(() => {
                user.click(screen.getByTestId('show-success'));
            }).not.toThrow();
        });

        it('should call showError without errors', async () => {
            const user = userEvent.setup();
            const Wrapper = createWrapper();

            render(
                <Wrapper>
                    <TestComponent />
                </Wrapper>
            );

            expect(() => {
                user.click(screen.getByTestId('show-error'));
            }).not.toThrow();
        });

        it('should call showWarning without errors', async () => {
            const user = userEvent.setup();
            const Wrapper = createWrapper();

            render(
                <Wrapper>
                    <TestComponent />
                </Wrapper>
            );

            expect(() => {
                user.click(screen.getByTestId('show-warning'));
            }).not.toThrow();
        });

        it('should call showInfo without errors', async () => {
            const user = userEvent.setup();
            const Wrapper = createWrapper();

            render(
                <Wrapper>
                    <TestComponent />
                </Wrapper>
            );

            expect(() => {
                user.click(screen.getByTestId('show-info'));
            }).not.toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle rapid successive notifications', async () => {
            const user = userEvent.setup();
            const Wrapper = createWrapper();

            render(
                <Wrapper>
                    <TestComponent />
                </Wrapper>
            );

            await user.click(screen.getByTestId('show-success'));
            await user.click(screen.getByTestId('show-error'));
            await user.click(screen.getByTestId('show-warning'));
            await user.click(screen.getByTestId('show-info'));

            await waitFor(() => {
                const alerts = screen.getAllByRole('alert');
                expect(alerts.length).toBeGreaterThan(0);
            });
        });

        it('should handle empty messages gracefully', async () => {
            const Wrapper = createWrapper();

            const EmptyMessageTest = () => {
                const notifications = useNotifications();

                return (
                    <button
                        data-testid="empty-message"
                        onClick={() => notifications.showSuccess('')}
                    >
                        Empty Message
                    </button>
                );
            };

            render(
                <Wrapper>
                    <EmptyMessageTest />
                </Wrapper>
            );

            const user = userEvent.setup();

            expect(() => {
                user.click(screen.getByTestId('empty-message'));
            }).not.toThrow();
        });
    });
});
