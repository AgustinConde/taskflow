import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('returns debounced value', () => {
        const { result, rerender } = renderHook(
            ({ val }) => useDebounce(val, 500),
            { initialProps: { val: 'first' } }
        );

        expect(result.current).toBe('first');

        rerender({ val: 'second' });
        expect(result.current).toBe('first');

        act(() => vi.advanceTimersByTime(500));
        expect(result.current).toBe('second');
    });

    it('cleans up on unmount', () => {
        const spy = vi.spyOn(global, 'clearTimeout');
        const { unmount } = renderHook(() => useDebounce('test', 100));
        unmount();
        expect(spy).toHaveBeenCalled();
    });
});
