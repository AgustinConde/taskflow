import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '../NotificationContext';
import { describe, it, expect, vi } from 'vitest';

function ProviderWrapper({ children, ...props }: any) {
    return <NotificationProvider {...props}>{children}</NotificationProvider>;
}

function TestComponent({ onNotify }: { onNotify?: (ctx: any) => void }) {
    const ctx = useNotifications();
    React.useEffect(() => {
        if (onNotify) onNotify(ctx);
    }, [onNotify, ctx]);
    return null;
}

describe('NotificationContext', () => {
    describe('custom type branch', () => {
        it('renders fallback color for unknown type', () => {
            let ctx: any;
            render(
                <ProviderWrapper maxNotifications={1}>
                    <TestComponent onNotify={c => { ctx = c; }} />
                </ProviderWrapper>
            );
            act(() => {
                ctx.showNotification('Custom', 'custom');
            });
            const alert = screen.getByText('Custom').closest('.MuiAlert-root');
            expect(alert).toHaveStyle('background-color: rgb(107, 114, 128)');
        });
    });
    describe('useNotifications', () => {
        it('throws error if used outside provider', () => {
            const errorSpy = vi.fn();
            function ErrorComponent() {
                try {
                    useNotifications();
                } catch (e: any) {
                    errorSpy(e.message);
                }
                return null;
            }
            render(<ErrorComponent />);
            expect(errorSpy).toHaveBeenCalledWith('useNotifications must be used within a NotificationProvider');
        });
        it('returns context inside provider', () => {
            let ctx: any;
            render(
                <ProviderWrapper>
                    <TestComponent onNotify={c => { ctx = c; }} />
                </ProviderWrapper>
            );
            expect(typeof ctx.showNotification).toBe('function');
            expect(typeof ctx.showSuccess).toBe('function');
            expect(typeof ctx.showError).toBe('function');
            expect(typeof ctx.showWarning).toBe('function');
            expect(typeof ctx.showInfo).toBe('function');
            expect(typeof ctx.hideNotification).toBe('function');
            expect(typeof ctx.clearAll).toBe('function');
        });
    });

    describe('showNotification', () => {
        it('shows notification and auto-removes after duration', async () => {
            let ctx: any;
            render(
                <ProviderWrapper defaultDuration={100}>
                    <TestComponent onNotify={c => { ctx = c; }} />
                </ProviderWrapper>
            );
            act(() => {
                ctx.showNotification('Test message', 'success');
            });
            expect(screen.getByText('Test message')).toBeInTheDocument();
            await waitFor(() => {
                expect(screen.queryByText('Test message')).not.toBeInTheDocument();
            }, { timeout: 500 });
        });
        it('shows notification and persists if persist=true', async () => {
            let ctx: any;
            render(
                <ProviderWrapper defaultDuration={100}>
                    <TestComponent onNotify={c => { ctx = c; }} />
                </ProviderWrapper>
            );
            let id: string;
            act(() => {
                id = ctx.showNotification('Persistent', 'info', { persist: true });
            });
            expect(screen.getByText('Persistent')).toBeInTheDocument();
            await act(async () => {
                await new Promise(res => setTimeout(res, 200));
            });
            expect(screen.getByText('Persistent')).toBeInTheDocument();
            act(() => {
                ctx.hideNotification(id);
            });
            await waitFor(() => {
                expect(screen.queryByText('Persistent')).not.toBeInTheDocument();
            });
        });
        it('limits notifications to maxNotifications', () => {
            let ctx: any;
            render(
                <ProviderWrapper maxNotifications={2}>
                    <TestComponent onNotify={c => { ctx = c; }} />
                </ProviderWrapper>
            );
            act(() => {
                ctx.showNotification('One');
                ctx.showNotification('Two');
                ctx.showNotification('Three');
            });
            expect(screen.queryByText('One')).not.toBeInTheDocument();
            expect(screen.getByText('Two')).toBeInTheDocument();
            expect(screen.getByText('Three')).toBeInTheDocument();
        });
    });

    describe('showSuccess/showError/showWarning/showInfo', () => {
        it('shows correct type and color for each', () => {
            let ctx: any;
            render(
                <ProviderWrapper maxNotifications={4}>
                    <TestComponent onNotify={c => { ctx = c; }} />
                </ProviderWrapper>
            );
            act(() => {
                ctx.showSuccess('Success');
                ctx.showError('Error');
                ctx.showWarning('Warning');
                ctx.showInfo('Info');
            });
            expect(screen.getByText('Success')).toBeInTheDocument();
            expect(screen.getByText('Error')).toBeInTheDocument();
            expect(screen.getByText('Warning')).toBeInTheDocument();
            expect(screen.getByText('Info')).toBeInTheDocument();
        });
    });

    describe('clearAll', () => {
        it('removes all notifications', () => {
            let ctx: any;
            render(
                <ProviderWrapper>
                    <TestComponent onNotify={c => { ctx = c; }} />
                </ProviderWrapper>
            );
            act(() => {
                ctx.showNotification('A');
                ctx.showNotification('B');
                ctx.clearAll();
            });
            expect(screen.queryByText('A')).not.toBeInTheDocument();
            expect(screen.queryByText('B')).not.toBeInTheDocument();
        });
    });

    describe('position styles', () => {
        it('applies correct position style', () => {
            render(
                <ProviderWrapper position="bottom-center">
                    <TestComponent />
                </ProviderWrapper>
            );
            const box = screen.getByTestId('notification-box');
            expect(box).toHaveStyle({ bottom: '24px', left: '50%' });
        });
    });
});
