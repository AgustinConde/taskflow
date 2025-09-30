import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const testTheme = createTheme();

i18n.use(initReactI18next).init({
    resources: {
        en: {
            translation: {
                'achievementData.first_task.title': 'First Task',
                'achievementData.first_task.description': 'Complete your first task',
                'achievementsDashboard.productivity': 'Productivity',
                'achievementsDashboard.bronze': 'Bronze',
                'achievementsDashboard.silver': 'Silver',
                'achievementsDashboard.gold': 'Gold',
                'achievementsDashboard.progressTo': 'Progress to {{tier}}',
                'achievementsDashboard.hidden': 'Hidden',
                'achievementNotification.unlocked': 'Achievement Unlocked',
                'achievementNotification.upgraded': 'Achievement Upgraded',
                'achievementNotification.level': 'Level',
                'achievementNotification.points': 'Points',
                'achievementNotification.encouragement': 'Keep up the great work! You\'re making excellent progress.',
                'achievementNotification.awesome': 'Awesome!'
            }
        }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false
    }
});

export const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
        mutations: {
            retry: false,
        },
    },
});

interface TestProvidersProps {
    children: React.ReactNode;
    queryClient?: QueryClient;
}

export const TestProviders: React.FC<TestProvidersProps> = ({
    children,
    queryClient = createTestQueryClient()
}) => (
    <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={testTheme}>
                <CssBaseline />
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </ThemeProvider>
        </I18nextProvider>
    </QueryClientProvider>
);

export const renderWithProviders = (ui: React.ReactElement) => {
    return {
        queryClient: createTestQueryClient(),
        ...ui
    };
};