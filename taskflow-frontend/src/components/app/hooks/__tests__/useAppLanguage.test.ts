import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppLanguage } from '../useAppLanguage';

const mockChangeLanguage = vi.fn((lang: string) => {
    mockI18n.language = lang;
    localStorage.setItem('selectedLanguage', lang);
});
const mockI18n = { language: 'en', changeLanguage: mockChangeLanguage };

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ i18n: mockI18n })
}));

describe('useAppLanguage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockI18n.language = 'en';
        mockChangeLanguage.mockReset();
        localStorage.clear();
    });

    it('should return current language', () => {
        const { result } = renderHook(() => useAppLanguage());
        expect(result.current.currentLanguage).toBe('en');
    });

    it('should change language and update localStorage', () => {
        const { result } = renderHook(() => useAppLanguage());
        act(() => {
            result.current.handleLanguageChange();
        });
        expect(mockChangeLanguage).toHaveBeenCalledWith('es');
        expect(mockI18n.language).toBe('es');
        expect(localStorage.getItem('selectedLanguage')).toBe('es');
    });

    it('should toggle language from es to en', () => {
        mockI18n.language = 'es';
        const { result } = renderHook(() => useAppLanguage());
        act(() => {
            result.current.handleLanguageChange();
        });
        expect(mockChangeLanguage).toHaveBeenCalledWith('en');
        expect(mockI18n.language).toBe('en');
        expect(localStorage.getItem('selectedLanguage')).toBe('en');
    });

    it('should set language from localStorage on mount (en)', () => {
        localStorage.setItem('selectedLanguage', 'en');
        mockI18n.language = 'es';
        act(() => {
            renderHook(() => useAppLanguage());
        });
        expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });

    it('should set language from localStorage on mount (es)', () => {
        localStorage.setItem('selectedLanguage', 'es');
        mockI18n.language = 'en';
        act(() => {
            renderHook(() => useAppLanguage());
        });
        expect(mockChangeLanguage).toHaveBeenCalledWith('es');
    });

    it('should not change language if localStorage value is invalid', () => {
        localStorage.setItem('selectedLanguage', 'fr');
        renderHook(() => useAppLanguage());
        expect(mockChangeLanguage).not.toHaveBeenCalled();
    });
});
