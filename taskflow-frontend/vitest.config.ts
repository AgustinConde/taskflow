/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.ts'],
        css: false,
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: true,
                maxThreads: 1,
                minThreads: 1,
            },
        },
        testTimeout: 30000,
        hookTimeout: 30000,
        deps: {
            optimizer: {
                web: {
                    include: ['@mui/material', '@mui/icons-material']
                }
            }
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
            cleanOnRerun: true,
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'node_modules/',
                'src/__tests__/',
                '**/*.d.ts',
                '**/*.config.*',
                'dist/',
                'build/',
                'coverage/',
                '**/*.test.*',
                '**/*.spec.*',
                '**/vite/**',
                '**/.vite/**'
            ],
            skipFull: false,
            clean: true,
            all: false,
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80
                },
                'src/components/task-item/TaskEditDialog.tsx': {
                    branches: 90,
                    functions: 80,
                    lines: 99,
                    statements: 99
                }
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});