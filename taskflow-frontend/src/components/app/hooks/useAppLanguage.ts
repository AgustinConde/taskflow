import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useAppLanguage = () => {
    const { i18n } = useTranslation();

    useEffect(() => {
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
            i18n.changeLanguage(savedLanguage);
        }
    }, [i18n]);

    const setLanguage = useCallback((language: 'en' | 'es') => {
        if (i18n.language === language) {
            return;
        }

        i18n.changeLanguage(language);
        localStorage.setItem('selectedLanguage', language);
    }, [i18n]);

    const handleLanguageChange = useCallback(() => {
        const newLanguage = i18n.language === 'en' ? 'es' : 'en';
        setLanguage(newLanguage);
    }, [i18n, setLanguage]);

    return {
        currentLanguage: i18n.language,
        handleLanguageChange,
        setLanguage
    };
};
