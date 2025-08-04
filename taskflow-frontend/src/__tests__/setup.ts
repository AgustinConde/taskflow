import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';
import { resetTestData } from './mocks/handlers';

vi.mock('@mui/icons-material', () => ({
    Add: () => 'AddIcon',
    Edit: () => 'EditIcon',
    Delete: () => 'DeleteIcon',
    Close: () => 'CloseIcon',
    CheckCircle: () => 'CheckCircleIcon',
    Error: () => 'ErrorIcon',
    Warning: () => 'WarningIcon',
    Info: () => 'InfoIcon',
}));

vi.mock('@mui/material/styles', async () => {
    const actual = await vi.importActual('@mui/material/styles');
    return {
        ...actual,
        createTheme: vi.fn(() => ({})),
        ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    };
});

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });

    if (process.platform === 'win32') {
        process.env.UV_THREADPOOL_SIZE = '4';
    }
});

afterEach(() => {
    cleanup();
    server.resetHandlers();
    vi.clearAllMocks();
    resetTestData();
});

afterAll(() => {
    server.close();
});
