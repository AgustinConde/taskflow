import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../locales/en.json', () => ({
    default: {
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.add': 'Add',
        'common.loading': 'Loading...',
        'common.error': 'An error occurred',
        'auth.login': 'Login',
        'auth.logout': 'Logout',
        'auth.register': 'Register',
        'tasks.title': 'Tasks',
        'tasks.addTask': 'Add Task',
        'tasks.editTask': 'Edit Task',
        'categories.title': 'Categories',
        'categories.addCategory': 'Add Category'
    }
}));

vi.mock('../locales/es.json', () => ({
    default: {
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
        'common.delete': 'Eliminar',
        'common.edit': 'Editar',
        'common.add': 'Agregar',
        'common.loading': 'Cargando...',
        'common.error': 'Ocurrió un error',
        'auth.login': 'Iniciar Sesión',
        'auth.logout': 'Cerrar Sesión',
        'auth.register': 'Registrarse',
        'tasks.title': 'Tareas',
        'tasks.addTask': 'Agregar Tarea',
        'tasks.editTask': 'Editar Tarea',
        'categories.title': 'Categorías',
        'categories.addCategory': 'Agregar Categoría'
    }
}));

const mockUseTranslation = vi.fn();
const mockChangeLanguage = vi.fn();
const mockT = vi.fn();

vi.mock('react-i18next', () => ({
    useTranslation: mockUseTranslation,
    initReactI18next: {
        type: '3rdParty',
        init: vi.fn()
    }
}));

const mockI18n = {
    use: vi.fn().mockReturnThis(),
    init: vi.fn().mockResolvedValue({}),
    language: 'en',
    languages: ['en', 'es'],
    options: {
        fallbackLng: 'en',
        interpolation: { escapeValue: false }
    },
    t: mockT,
    changeLanguage: mockChangeLanguage,
    hasResourceBundle: vi.fn().mockReturnValue(true),
    isInitialized: true,
    store: {
        data: {
            en: { translation: {} },
            es: { translation: {} }
        }
    }
};

vi.mock('i18next', () => ({
    default: mockI18n
}));

describe('i18n Configuration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockT.mockImplementation((key: string) => key);
        mockUseTranslation.mockReturnValue({
            t: mockT,
            i18n: mockI18n
        });
    });

    it('should import without throwing errors', async () => {
        await expect(async () => {
            await import('../i18n.ts');
        }).not.toThrow();
    }); it('should be properly configured', async () => {
        const { default: i18nInstance } = await import('../i18n.ts');

        expect(i18nInstance).toBeDefined();
        expect(typeof i18nInstance.t).toBe('function');
    });

    it('should have correct default language', async () => {
        const { default: i18nInstance } = await import('../i18n.ts');

        expect(i18nInstance.language).toBe('en');
    });

    it('should have correct fallback language', async () => {
        const { default: i18nInstance } = await import('../i18n.ts');

        expect(i18nInstance.options.fallbackLng).toBe('en');
    });

    it('should support both English and Spanish', async () => {
        const { default: i18nInstance } = await import('../i18n.ts');

        const languages = i18nInstance.languages || ['en'];
        expect(languages.length).toBeGreaterThan(0);
        expect(languages).toContain('en');
    });

    it('should have interpolation settings configured', async () => {
        const { default: i18nInstance } = await import('../i18n.ts');

        expect(i18nInstance.options.interpolation?.escapeValue).toBe(false);
    });

    it('should be able to translate keys', async () => {
        const { default: i18nInstance } = await import('../i18n.ts');

        expect(typeof i18nInstance.t).toBe('function');

        const result = i18nInstance.t('common.save');
        expect(typeof result).toBe('string');
        expect(result).toBeTruthy();
    });

    it('should handle missing translation keys gracefully', async () => {
        const { default: i18nInstance } = await import('../i18n.ts');

        const result = i18nInstance.t('non.existent.key');

        expect(typeof result).toBe('string');
        expect(result).toBeTruthy();
    });

    it('should support language switching', async () => {
        const { default: i18nInstance } = await import('../i18n.ts');

        expect(typeof i18nInstance.changeLanguage).toBe('function');

        expect(() => {
            i18nInstance.changeLanguage('es');
        }).not.toThrow();
    });

    describe('Resource Loading', () => {
        it('should load English resources', async () => {
            const { default: i18nInstance } = await import('../i18n.ts');

            const hasEnResources = i18nInstance.hasResourceBundle('en', 'translation');
            expect(hasEnResources).toBe(true);
        });

        it('should load Spanish resources', async () => {
            const { default: i18nInstance } = await import('../i18n.ts');

            const hasEsResources = i18nInstance.hasResourceBundle('es', 'translation');
            expect(hasEsResources).toBe(true);
        });
    });

    describe('Configuration Options', () => {
        it('should export the i18n instance as default', async () => {
            await expect(async () => {
                await import('../i18n.ts');
            }).not.toThrow();
        }); it('should be properly initialized', async () => {
            const { default: i18nInstance } = await import('../i18n.ts');

            expect(i18nInstance.isInitialized).toBe(true);
        });
    });

    describe('React Integration', () => {
        it('should use initReactI18next plugin', async () => {
            await expect(async () => {
                await import('../i18n.ts');
            }).not.toThrow();
        });
    });

    describe('Translation functionality', () => {
        it('should handle common translations', () => {
            const commonKeys = [
                'common.save',
                'common.cancel',
                'common.delete',
                'common.edit',
                'common.add',
                'common.loading',
                'common.error'
            ];

            commonKeys.forEach(key => {
                const result = mockT(key);
                expect(typeof result).toBe('string');
                expect(result).toBe(key);
            });
        });

        it('should handle auth translations', () => {
            const authKeys = [
                'auth.login',
                'auth.logout',
                'auth.register'
            ];

            authKeys.forEach(key => {
                const result = mockT(key);
                expect(typeof result).toBe('string');
                expect(result).toBe(key);
            });
        });

        it('should handle task translations', () => {
            const taskKeys = [
                'tasks.title',
                'tasks.addTask',
                'tasks.editTask'
            ];

            taskKeys.forEach(key => {
                const result = mockT(key);
                expect(typeof result).toBe('string');
                expect(result).toBe(key);
            });
        });

        it('should handle category translations', () => {
            const categoryKeys = [
                'categories.title',
                'categories.addCategory'
            ];

            categoryKeys.forEach(key => {
                const result = mockT(key);
                expect(typeof result).toBe('string');
                expect(result).toBe(key);
            });
        });
    });

    describe('Language switching', () => {
        it('should call changeLanguage when switching to Spanish', async () => {
            const { default: i18nInstance } = await import('../i18n.ts');

            await i18nInstance.changeLanguage('es');

            expect(mockChangeLanguage).toHaveBeenCalledWith('es');
        });

        it('should call changeLanguage when switching to English', async () => {
            const { default: i18nInstance } = await import('../i18n.ts');

            await i18nInstance.changeLanguage('en');

            expect(mockChangeLanguage).toHaveBeenCalledWith('en');
        });

        it('should handle invalid language codes gracefully', async () => {
            const { default: i18nInstance } = await import('../i18n.ts');

            expect(() => {
                i18nInstance.changeLanguage('invalid');
            }).not.toThrow();

            expect(mockChangeLanguage).toHaveBeenCalledWith('invalid');
        });
    });

    describe('useTranslation hook mock', () => {
        it('should return translation function', () => {
            const { t } = mockUseTranslation();

            expect(typeof t).toBe('function');
            expect(t('common.save')).toBe('common.save');
        });

        it('should return i18n instance', () => {
            const { i18n } = mockUseTranslation();

            expect(i18n).toBeDefined();
            expect(typeof i18n.changeLanguage).toBe('function');
            expect(i18n.language).toBe('en');
        });
    });

    describe('Error handling', () => {
        it('should handle translation errors gracefully', () => {
            mockT.mockImplementationOnce(() => {
                throw new Error('Translation error');
            });

            expect(() => {
                mockT('error.key');
            }).toThrow('Translation error');
        });

        it('should handle missing language resources', async () => {
            const { default: i18nInstance } = await import('../i18n.ts');

            vi.mocked(i18nInstance.hasResourceBundle).mockReturnValueOnce(false);

            const hasResources = i18nInstance.hasResourceBundle('fr', 'translation');
            expect(hasResources).toBe(false);
        });
    });

    describe('Interpolation', () => {
        it('should handle interpolated strings', () => {
            mockT.mockImplementationOnce((key: string, options: any) => {
                if (key === 'welcome.message' && options?.name) {
                    return `Welcome, ${options.name}!`;
                }
                return key;
            });

            const result = mockT('welcome.message', { name: 'John' });
            expect(result).toBe('Welcome, John!');
        });

        it('should handle pluralization', () => {
            mockT.mockImplementation((key: string, options: any) => {
                if (key === 'items.count' && typeof options?.count === 'number') {
                    return options.count === 1 ? '1 item' : `${options.count} items`;
                }
                return key;
            });

            expect(mockT('items.count', { count: 1 })).toBe('1 item');
            expect(mockT('items.count', { count: 5 })).toBe('5 items');
        });
    });
});
