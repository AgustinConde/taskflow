import '@testing-library/jest-dom';
import React from 'react';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';
import { resetTestData } from './mocks/handlers';

type IconProps = {
    children?: React.ReactNode;
    [key: string]: unknown;
};

type IconComponent = React.FC<IconProps>;

const iconCache = new Map<string, IconComponent>();

const getMockedIcon = (name: string): IconComponent => {
    if (!iconCache.has(name)) {
        const Icon: IconComponent = ({ children, ...props }) => {
            const finalProps = { ...props } as Record<string, unknown>;

            if (!('data-testid' in finalProps)) {
                finalProps['data-testid'] = `${name}Icon`;
            }

            return React.createElement('span', finalProps, children ?? `${name}Icon`);
        };
        Icon.displayName = `${name}IconMock`;
        iconCache.set(name, Icon);
    }

    return iconCache.get(name)!;
};

const promiseLikeProps = new Set(['then', 'catch', 'finally']);

const resolveIcon = (prop: PropertyKey) => {
    if (prop === '__esModule') {
        return true;
    }

    if (typeof prop === 'symbol') {
        if (prop === Symbol.toStringTag) {
            return 'Module';
        }

        return undefined;
    }

    if (promiseLikeProps.has(prop as string)) {
        return undefined;
    }

    if (prop === 'default') {
        return getMockedIcon('MuiIcon');
    }

    const iconName = String(prop);
    return getMockedIcon(iconName);
};

const iconProxyHandler: ProxyHandler<Record<string, unknown>> = {
    get: (_target, prop) => {
        return resolveIcon(prop);
    },
    has: (_target, prop) => {
        if (prop === '__esModule') {
            return true;
        }

        if (typeof prop === 'symbol') {
            return prop === Symbol.toStringTag;
        }

        if (promiseLikeProps.has(prop as string)) {
            return false;
        }

        return true;
    },
    getOwnPropertyDescriptor: (_target, prop) => {
        const value = resolveIcon(prop);

        if (value === undefined) {
            return undefined;
        }

        return {
            configurable: true,
            enumerable: true,
            value,
            writable: false
        };
    }
};

vi.mock('@mui/icons-material', () => new Proxy({}, iconProxyHandler));

vi.mock('@mui/icons-material/Add', () => ({ __esModule: true, default: getMockedIcon('Add') }));
vi.mock('@mui/icons-material/Edit', () => ({ __esModule: true, default: getMockedIcon('Edit') }));
vi.mock('@mui/icons-material/Brightness4', () => ({ __esModule: true, default: getMockedIcon('Brightness4') }));
vi.mock('@mui/icons-material/Brightness7', () => ({ __esModule: true, default: getMockedIcon('Brightness7') }));
vi.mock('@mui/icons-material/CalendarMonth', () => ({ __esModule: true, default: getMockedIcon('CalendarMonth') }));
vi.mock('@mui/icons-material/Category', () => ({ __esModule: true, default: getMockedIcon('Category') }));
vi.mock('@mui/icons-material/CheckCircle', () => ({ __esModule: true, default: getMockedIcon('CheckCircle') }));
vi.mock('@mui/icons-material/Checklist', () => ({ __esModule: true, default: getMockedIcon('Checklist') }));
vi.mock('@mui/icons-material/Close', () => ({ __esModule: true, default: getMockedIcon('Close') }));
vi.mock('@mui/icons-material/Clear', () => ({ __esModule: true, default: getMockedIcon('Clear') }));
vi.mock('@mui/icons-material/LocationOn', () => ({ __esModule: true, default: getMockedIcon('LocationOn') }));
vi.mock('@mui/icons-material/MyLocation', () => ({ __esModule: true, default: getMockedIcon('MyLocation') }));
vi.mock('@mui/icons-material/DarkModeTwoTone', () => ({ __esModule: true, default: getMockedIcon('DarkModeTwoTone') }));
vi.mock('@mui/icons-material/Dashboard', () => ({ __esModule: true, default: getMockedIcon('Dashboard') }));
vi.mock('@mui/icons-material/Delete', () => ({ __esModule: true, default: getMockedIcon('Delete') }));
vi.mock('@mui/icons-material/DeleteForever', () => ({ __esModule: true, default: getMockedIcon('DeleteForever') }));
vi.mock('@mui/icons-material/DeleteOutline', () => ({ __esModule: true, default: getMockedIcon('DeleteOutline') }));
vi.mock('@mui/icons-material/EmojiEvents', () => ({ __esModule: true, default: getMockedIcon('EmojiEvents') }));
vi.mock('@mui/icons-material/Error', () => ({ __esModule: true, default: getMockedIcon('Error') }));
vi.mock('@mui/icons-material/Info', () => ({ __esModule: true, default: getMockedIcon('Info') }));
vi.mock('@mui/icons-material/InfoOutlined', () => ({ __esModule: true, default: getMockedIcon('InfoOutlined') }));
vi.mock('@mui/icons-material/LightModeTwoTone', () => ({ __esModule: true, default: getMockedIcon('LightModeTwoTone') }));
vi.mock('@mui/icons-material/Login', () => ({ __esModule: true, default: getMockedIcon('Login') }));
vi.mock('@mui/icons-material/Logout', () => ({ __esModule: true, default: getMockedIcon('Logout') }));
vi.mock('@mui/icons-material/MoreVert', () => ({ __esModule: true, default: getMockedIcon('MoreVert') }));
vi.mock('@mui/icons-material/Person', () => ({ __esModule: true, default: getMockedIcon('Person') }));
vi.mock('@mui/icons-material/PersonAdd', () => ({ __esModule: true, default: getMockedIcon('PersonAdd') }));
vi.mock('@mui/icons-material/Send', () => ({ __esModule: true, default: getMockedIcon('Send') }));
vi.mock('@mui/icons-material/Settings', () => ({ __esModule: true, default: getMockedIcon('Settings') }));
vi.mock('@mui/icons-material/SmartToy', () => ({ __esModule: true, default: getMockedIcon('SmartToy') }));
vi.mock('@mui/icons-material/Task', () => ({ __esModule: true, default: getMockedIcon('Task') }));
vi.mock('@mui/icons-material/Translate', () => ({ __esModule: true, default: getMockedIcon('Translate') }));
vi.mock('@mui/icons-material/Visibility', () => ({ __esModule: true, default: getMockedIcon('Visibility') }));
vi.mock('@mui/icons-material/VisibilityOff', () => ({ __esModule: true, default: getMockedIcon('VisibilityOff') }));
vi.mock('@mui/icons-material/Warning', () => ({ __esModule: true, default: getMockedIcon('Warning') }));
vi.mock('@mui/icons-material/WarningAmber', () => ({ __esModule: true, default: getMockedIcon('WarningAmber') }));

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });

    if (typeof window === 'undefined') {
        // @ts-ignore
        global.window = global;
        // @ts-ignore
        global.localStorage = {
            store: {},
            getItem(key) { return this.store[key] || null; },
            setItem(key, value) { this.store[key] = value.toString(); },
            removeItem(key) { delete this.store[key]; },
            clear() { this.store = {}; }
        };
    }

    if (process.platform === 'win32') {
        process.env.UV_THREADPOOL_SIZE = '4';
    }
});

afterEach(() => {
    cleanup();
    server.resetHandlers();
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
    resetTestData();
});

afterAll(() => {
    server.close();
});
