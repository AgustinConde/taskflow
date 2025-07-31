import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useAppLanguage = () => {
    const { i18n } = useTranslation();

    useEffect(() => {
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
            i18n.changeLanguage(savedLanguage);
        }
    }, [i18n]);

    const handleLanguageChange = () => {
        const newLanguage = i18n.language === 'en' ? 'es' : 'en';
        i18n.changeLanguage(newLanguage);
        localStorage.setItem('selectedLanguage', newLanguage);
    };

    return {
        currentLanguage: i18n.language,
        handleLanguageChange
    };
};
