import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppLanguage } from '../useAppLanguage';

const mockChangeLanguage = vi.fn();
const mockI18n = { language: 'en', changeLanguage: mockChangeLanguage };

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ i18n: mockI18n })
}));

function setLocalStorage(key: string, value: string) {
    window.localStorage.setItem(key, value);
}

function clearLocalStorage() {
    window.localStorage.clear();
}

describe('useAppLanguage', () => {
    beforeEach(() => {
        clearLocalStorage();
        mockI18n.language = 'en';
        mockChangeLanguage.mockReset();
    });

    describe('initialization', () => {
        it('sets language from localStorage if valid', () => {
            setLocalStorage('selectedLanguage', 'es');
            renderHook(() => useAppLanguage());
            expect(mockChangeLanguage).toHaveBeenCalledWith('es');
        });
        it('does not set language if localStorage is invalid', () => {
            setLocalStorage('selectedLanguage', 'fr');
            renderHook(() => useAppLanguage());
            expect(mockChangeLanguage).not.toHaveBeenCalled();
        });
        it('does not set language if localStorage is missing', () => {
            renderHook(() => useAppLanguage());
            expect(mockChangeLanguage).not.toHaveBeenCalled();
        });
    });

    describe('handleLanguageChange', () => {
        it('toggles language and persists to localStorage', () => {
            const { result } = renderHook(() => useAppLanguage());
            act(() => {
                result.current.handleLanguageChange();
            });
            expect(mockChangeLanguage).toHaveBeenCalledWith('es');
            expect(window.localStorage.getItem('selectedLanguage')).toBe('es');
        });
        it('toggles back to en and persists', () => {
            mockI18n.language = 'es';
            const { result } = renderHook(() => useAppLanguage());
            act(() => {
                result.current.handleLanguageChange();
            });
            expect(mockChangeLanguage).toHaveBeenCalledWith('en');
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
