import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAppLanguage } from '../useAppLanguage';


const mockChangeLanguage = vi.fn((lang: string) => {
    mockI18n.language = lang;
});
const mockI18n = { language: 'en', changeLanguage: mockChangeLanguage };

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ i18n: mockI18n })
}));

describe('useAppLanguage', () => {
    beforeEach(() => {
        window.localStorage.clear();
        mockI18n.language = 'en';
        mockChangeLanguage.mockReset();
    });

    afterEach(() => {
        window.localStorage.clear();
        mockI18n.language = 'en';
        mockChangeLanguage.mockReset();
    });

    describe('initialization', () => {
        it('calls changeLanguage if localStorage is valid', async () => {
            window.localStorage.setItem('selectedLanguage', 'es');
            renderHook(() => useAppLanguage());
            await waitFor(() => {
                expect(mockChangeLanguage).toHaveBeenCalledWith('es');
            }, { timeout: 1000 });
        });

        it('does not call changeLanguage if localStorage is invalid', async () => {
            window.localStorage.setItem('selectedLanguage', 'fr');
            renderHook(() => useAppLanguage());
            await waitFor(() => {
                expect(mockChangeLanguage).not.toHaveBeenCalled();
            }, { timeout: 1000 });
        });

        it('does not call changeLanguage if localStorage is missing', async () => {
            window.localStorage.removeItem('selectedLanguage');
            renderHook(() => useAppLanguage());
            await waitFor(() => {
                expect(mockChangeLanguage).not.toHaveBeenCalled();
            }, { timeout: 1000 });
        });
    });
    describe('handleLanguageChange', () => {
        it('toggles language and persists to localStorage', async () => {
            window.localStorage.setItem('selectedLanguage', 'en');
            const { result } = renderHook(() => useAppLanguage());
            act(() => {
                result.current.handleLanguageChange();
            });
            await waitFor(() => {
                expect(mockChangeLanguage).toHaveBeenCalledWith('es');
            }, { timeout: 1000 });
            expect(window.localStorage.getItem('selectedLanguage')).toBe('es');
        });

        it('toggles back to en and persists', async () => {
            window.localStorage.setItem('selectedLanguage', 'es');
            mockI18n.language = 'es';
            const { result } = renderHook(() => useAppLanguage());
            act(() => {
                result.current.handleLanguageChange();
            });
            await waitFor(() => {
                expect(mockChangeLanguage).toHaveBeenCalledWith('en');
            }, { timeout: 1000 });
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
