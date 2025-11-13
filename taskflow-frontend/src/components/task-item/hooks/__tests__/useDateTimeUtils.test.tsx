import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDateTimeUtils } from '../useDateTimeUtils';

describe('useDateTimeUtils', () => {
    const { result } = renderHook(() => useDateTimeUtils());
    const utils = result.current;

    it('converts UTC to local format', () => {
        const result = utils.toLocalInputDateTime('2024-01-01T10:30:00Z');
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it('converts local to UTC ISO', () => {
        const result = utils.localDateTimeToUTCISOString('2024-01-01T10:30');
        expect(result).toBe(new Date('2024-01-01T10:30').toISOString());
    });

    it('handles empty strings', () => {
        expect(utils.toLocalInputDateTime('')).toBe('');
        expect(utils.localDateTimeToUTCISOString('')).toBeNull();
    });

    it('handles invalid date', () => {
        expect(utils.localDateTimeToUTCISOString('invalid')).toBeNull();
    });
});
