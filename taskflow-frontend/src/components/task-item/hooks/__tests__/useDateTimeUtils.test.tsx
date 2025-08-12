import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDateTimeUtils } from '../useDateTimeUtils';

describe('useDateTimeUtils', () => {
    const setupMocks = () => {
        const { result } = renderHook(() => useDateTimeUtils());
        return result.current;
    };

    describe('Core DateTime Conversion', () => {
        it('should convert UTC string to local input format', () => {
            const utils = setupMocks();
            const utcString = '2024-01-01T10:30:00Z';

            const result = utils.toLocalInputDateTime(utcString);

            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

            const expectedDate = new Date(utcString);
            const year = expectedDate.getFullYear();
            const month = String(expectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(expectedDate.getDate()).padStart(2, '0');
            const hour = String(expectedDate.getHours()).padStart(2, '0');
            const minute = String(expectedDate.getMinutes()).padStart(2, '0');
            const expected = `${year}-${month}-${day}T${hour}:${minute}`;

            expect(result).toBe(expected);
        });

        it('should convert local datetime to UTC ISO string', () => {
            const utils = setupMocks();
            const localString = '2024-01-01T10:30';

            const result = utils.localDateTimeToUTCISOString(localString);

            expect(result).toBe(new Date(localString).toISOString());
        });
    });

    describe('Edge Cases & Error Handling', () => {
        it('should return empty string for empty UTC input', () => {
            const utils = setupMocks();

            const result = utils.toLocalInputDateTime('');

            expect(result).toBe('');
        });

        it('should return null for empty local input', () => {
            const utils = setupMocks();

            const result = utils.localDateTimeToUTCISOString('');

            expect(result).toBeNull();
        });

        it('should handle different date formats correctly', () => {
            const utils = setupMocks();
            const testCases = [
                '2024-12-31T23:59:59Z',
                '2024-01-01T00:00:00.000Z',
                '2024-06-15T12:30:45Z'
            ];

            testCases.forEach(utcString => {
                const result = utils.toLocalInputDateTime(utcString);
                expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
            });
        });
    });

    describe('Utilities Integration', () => {
        it('should provide both conversion functions', () => {
            const utils = setupMocks();

            expect(typeof utils.toLocalInputDateTime).toBe('function');
            expect(typeof utils.localDateTimeToUTCISOString).toBe('function');
        });

        it('should handle round-trip conversion accurately', () => {
            const utils = setupMocks();
            const originalLocal = '2024-01-01T15:30';

            const utc = utils.localDateTimeToUTCISOString(originalLocal);
            const backToLocal = utils.toLocalInputDateTime(utc!);

            expect(backToLocal).toBe(originalLocal);
        });
    });
});
