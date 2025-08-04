import React from 'react';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import type { RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import { NotificationProvider } from '../../contexts/NotificationContext';
import i18n from './i18n-test.js';

const theme = createTheme();

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    queryClient?: QueryClient;
}

const AllTheProviders = ({
    children,
    queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    })
}: {
    children: React.ReactNode;
    queryClient?: QueryClient;
}) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <I18nextProvider i18n={i18n}>
                    <NotificationProvider>
                        {children}
                    </NotificationProvider>
                </I18nextProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

const customRender = (
    ui: ReactElement,
    options?: CustomRenderOptions
) => {
    const { queryClient, ...renderOptions } = options || {};

    return render(ui, {
        wrapper: ({ children }) => (
            <AllTheProviders queryClient={queryClient}>
                {children}
            </AllTheProviders>
        ),
        ...renderOptions,
    });
};

export * from '@testing-library/react';
export { customRender as render };
