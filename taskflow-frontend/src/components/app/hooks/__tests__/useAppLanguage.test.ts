import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAppLanguage } from '../useAppLanguage';



import type { Mock } from 'vitest';
interface MockI18n {
    language: string;
    changeLanguage: Mock;
}
const mockI18n: MockI18n = {
    language: 'en',
    changeLanguage: vi.fn(function (this: MockI18n, lang: string) {
        this.language = lang;
        window.dispatchEvent(new Event('i18n-language-changed'));
    }) as Mock
};

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ i18n: mockI18n })
}));

describe('useAppLanguage', () => {

    beforeEach(() => {
        window.localStorage.clear();
        mockI18n.language = 'en';
        mockI18n.changeLanguage.mockClear();
        vi.clearAllTimers();
    });

    afterEach(() => {
        window.localStorage.clear();
        mockI18n.language = 'en';
        mockI18n.changeLanguage.mockClear();
        vi.clearAllTimers();
    });

    describe('initialization', () => {
        it('calls changeLanguage if localStorage is valid', async () => {
            window.localStorage.setItem('selectedLanguage', 'es');
            renderHook(() => useAppLanguage());
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(mockI18n.changeLanguage).toHaveBeenCalledWith('es');
        });

        it('does not call changeLanguage if localStorage is invalid', async () => {
            window.localStorage.setItem('selectedLanguage', 'fr');
            renderHook(() => useAppLanguage());
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(mockI18n.changeLanguage).not.toHaveBeenCalled();
        });

        it('does not call changeLanguage if localStorage is missing', async () => {
            window.localStorage.removeItem('selectedLanguage');
            renderHook(() => useAppLanguage());
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(mockI18n.changeLanguage).not.toHaveBeenCalled();
        });
    });
    describe('handleLanguageChange', () => {
        it('toggles language and persists to localStorage', async () => {
            window.localStorage.setItem('selectedLanguage', 'en');
            const { result } = renderHook(() => useAppLanguage());
            act(() => {
                result.current.handleLanguageChange();
            });
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(mockI18n.changeLanguage).toHaveBeenCalledWith('es');
            expect(window.localStorage.getItem('selectedLanguage')).toBe('es');
        });

        it('toggles back to en and persists', async () => {
            window.localStorage.setItem('selectedLanguage', 'es');
            mockI18n.language = 'es';
            const { result } = renderHook(() => useAppLanguage());
            act(() => {
                result.current.handleLanguageChange();
            });
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(mockI18n.changeLanguage).toHaveBeenCalledWith('en');
            expect(window.localStorage.getItem('selectedLanguage')).toBe('en');
        });
    });

    describe('currentLanguage', () => {
        it('returns current i18n language', () => {
            mockI18n.language = 'es';
            const { result } = renderHook(() => useAppLanguage());
            expect(result.current.currentLanguage).toBe('es');
        });
    });
});
