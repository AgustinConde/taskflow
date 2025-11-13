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

    it('loads saved language', async () => {
        localStorage.setItem('selectedLanguage', 'es');
        renderHook(() => useAppLanguage());
        await new Promise(r => setTimeout(r, 100));
        expect(mockI18n.changeLanguage).toHaveBeenCalledWith('es');
    });
    it('toggles language', () => {
        const { result } = renderHook(() => useAppLanguage());
        act(() => result.current.handleLanguageChange());
        expect(mockI18n.changeLanguage).toHaveBeenCalledWith('es');
    });

    it('skips change when same language', () => {
        const { result } = renderHook(() => useAppLanguage());
        mockI18n.changeLanguage.mockClear();
        act(() => result.current.setLanguage('en'));
        expect(mockI18n.changeLanguage).not.toHaveBeenCalled();
    });


});
