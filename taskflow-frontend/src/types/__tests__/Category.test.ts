import { describe, it, expect } from 'vitest';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../Category';

describe('Category Types', () => {
    describe('Category interface', () => {
        it('should have correct structure', () => {
            const mockCategory: Category = {
                id: 1,
                name: 'Work',
                color: '#FF5733',
                description: 'Work related tasks',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
                userId: 1
            };

            expect(typeof mockCategory.id).toBe('number');
            expect(typeof mockCategory.name).toBe('string');
            expect(typeof mockCategory.color).toBe('string');
            expect(typeof mockCategory.description).toBe('string');
            expect(typeof mockCategory.createdAt).toBe('string');
            expect(typeof mockCategory.updatedAt).toBe('string');
            expect(typeof mockCategory.userId).toBe('number');
        });

        it('should allow optional description', () => {
            const mockCategory: Category = {
                id: 1,
                name: 'Personal',
                color: '#33FF57',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
                userId: 1
            };

            expect(mockCategory.description).toBeUndefined();
            expect(mockCategory.name).toBe('Personal');
            expect(mockCategory.color).toBe('#33FF57');
        });

        it('should enforce required fields', () => {
            const mockCategory: Category = {
                id: 1,
                name: 'Test Category',
                color: '#123456',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
                userId: 1
            };

            expect(mockCategory.id).toBeDefined();
            expect(mockCategory.name).toBeDefined();
            expect(mockCategory.color).toBeDefined();
            expect(mockCategory.createdAt).toBeDefined();
            expect(mockCategory.updatedAt).toBeDefined();
            expect(mockCategory.userId).toBeDefined();
        });

        it('should support color hex values', () => {
            const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000'];

            colors.forEach(color => {
                const category: Category = {
                    id: 1,
                    name: 'Test',
                    color: color,
                    createdAt: '2025-01-01T00:00:00Z',
                    updatedAt: '2025-01-01T00:00:00Z',
                    userId: 1
                };

                expect(category.color).toBe(color);
                expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
            });
        });
    });

    describe('CreateCategoryRequest interface', () => {
        it('should have correct structure', () => {
            const mockRequest: CreateCategoryRequest = {
                name: 'New Category',
                color: '#FF5733',
                description: 'A new category for testing'
            };

            expect(typeof mockRequest.name).toBe('string');
            expect(typeof mockRequest.color).toBe('string');
            expect(typeof mockRequest.description).toBe('string');
        });

        it('should allow optional description', () => {
            const mockRequest: CreateCategoryRequest = {
                name: 'Simple Category',
                color: '#FF5733'
            };

            expect(mockRequest.description).toBeUndefined();
            expect(mockRequest.name).toBe('Simple Category');
            expect(mockRequest.color).toBe('#FF5733');
        });

        it('should enforce required fields', () => {
            const mockRequest: CreateCategoryRequest = {
                name: 'Required Fields Test',
                color: '#123456'
            };

            expect(mockRequest.name).toBeDefined();
            expect(mockRequest.color).toBeDefined();
        });

        it('should be compatible with Category creation', () => {
            const createRequest: CreateCategoryRequest = {
                name: 'Test Category',
                color: '#FF5733',
                description: 'Test description'
            };

            const categoryData: Partial<Category> = {
                ...createRequest,
                id: 1,
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
                userId: 1
            };

            expect(categoryData.name).toBe(createRequest.name);
            expect(categoryData.color).toBe(createRequest.color);
            expect(categoryData.description).toBe(createRequest.description);
        });
    });

    describe('UpdateCategoryRequest interface', () => {
        it('should have correct structure with all fields', () => {
            const mockRequest: UpdateCategoryRequest = {
                name: 'Updated Category',
                color: '#00FF00',
                description: 'Updated description'
            };

            expect(typeof mockRequest.name).toBe('string');
            expect(typeof mockRequest.color).toBe('string');
            expect(typeof mockRequest.description).toBe('string');
        });

        it('should allow all fields to be optional', () => {
            const mockRequest: UpdateCategoryRequest = {
            };

            expect(mockRequest.name).toBeUndefined();
            expect(mockRequest.color).toBeUndefined();
            expect(mockRequest.description).toBeUndefined();
        });

        it('should allow partial updates', () => {
            const nameOnlyUpdate: UpdateCategoryRequest = {
                name: 'New Name Only'
            };

            const colorOnlyUpdate: UpdateCategoryRequest = {
                color: '#NEWCOLOR'
            };

            const descriptionOnlyUpdate: UpdateCategoryRequest = {
                description: 'New description only'
            };

            expect(nameOnlyUpdate.name).toBe('New Name Only');
            expect(nameOnlyUpdate.color).toBeUndefined();
            expect(nameOnlyUpdate.description).toBeUndefined();

            expect(colorOnlyUpdate.name).toBeUndefined();
            expect(colorOnlyUpdate.color).toBe('#NEWCOLOR');
            expect(colorOnlyUpdate.description).toBeUndefined();

            expect(descriptionOnlyUpdate.name).toBeUndefined();
            expect(descriptionOnlyUpdate.color).toBeUndefined();
            expect(descriptionOnlyUpdate.description).toBe('New description only');
        });

        it('should be compatible with Category updates', () => {
            const existingCategory: Category = {
                id: 1,
                name: 'Original Name',
                color: '#ORIGINAL',
                description: 'Original description',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
                userId: 1
            };

            const updateRequest: UpdateCategoryRequest = {
                name: 'Updated Name',
                color: '#UPDATED'
            };

            const updatedCategory: Category = {
                ...existingCategory,
                ...updateRequest,
                updatedAt: '2025-01-01T12:00:00Z'
            };

            expect(updatedCategory.name).toBe(updateRequest.name);
            expect(updatedCategory.color).toBe(updateRequest.color);
            expect(updatedCategory.description).toBe(existingCategory.description);
            expect(updatedCategory.id).toBe(existingCategory.id);
            expect(updatedCategory.userId).toBe(existingCategory.userId);
        });
    });

    describe('Type compatibility and relationships', () => {
        it('should ensure CreateCategoryRequest can extend to Category', () => {
            const createRequest: CreateCategoryRequest = {
                name: 'Test Category',
                color: '#FF5733',
                description: 'Test description'
            };

            const category: Category = {
                ...createRequest,
                id: 1,
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
                userId: 1
            };

            expect(category.name).toBe(createRequest.name);
            expect(category.color).toBe(createRequest.color);
            expect(category.description).toBe(createRequest.description);
        });

        it('should ensure UpdateCategoryRequest can partially update Category', () => {
            const original: Category = {
                id: 1,
                name: 'Original',
                color: '#ORIGINAL',
                description: 'Original desc',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
                userId: 1
            };

            const update: UpdateCategoryRequest = {
                name: 'Updated Name'
            };

            const result: Category = {
                ...original,
                ...update,
                updatedAt: '2025-01-01T12:00:00Z'
            };

            expect(result.name).toBe(update.name);
            expect(result.color).toBe(original.color);
            expect(result.description).toBe(original.description);
        });

        it('should handle undefined description in all types', () => {
            const categoryWithoutDesc: Category = {
                id: 1,
                name: 'No Description',
                color: '#NODESC',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
                userId: 1
            };

            const createWithoutDesc: CreateCategoryRequest = {
                name: 'No Description Create',
                color: '#NODESC'
            };

            const updateWithoutDesc: UpdateCategoryRequest = {
                name: 'No Description Update'
            };

            expect(categoryWithoutDesc.description).toBeUndefined();
            expect(createWithoutDesc.description).toBeUndefined();
            expect(updateWithoutDesc.description).toBeUndefined();
        });
    });

    describe('Edge cases and validation scenarios', () => {
        it('should handle empty strings appropriately', () => {
            const categoryWithEmptyName: Category = {
                id: 1,
                name: '',
                color: '#EMPTY',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
                userId: 1
            };

            expect(typeof categoryWithEmptyName.name).toBe('string');
            expect(categoryWithEmptyName.name).toBe('');
        });

        it('should handle special characters in names', () => {
            const specialChars = ['Category with spaces', 'Category-with-dashes', 'Category_with_underscores', 'Category with émojis 🏷️'];

            specialChars.forEach(name => {
                const category: Category = {
                    id: 1,
                    name: name,
                    color: '#SPECIAL',
                    createdAt: '2025-01-01T00:00:00Z',
                    updatedAt: '2025-01-01T00:00:00Z',
                    userId: 1
                };

                expect(category.name).toBe(name);
            });
        });

        it('should handle large user IDs', () => {
            const largeUserId = 999999999;

            const category: Category = {
                id: 1,
                name: 'Large User ID Test',
                color: '#LARGE',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
                userId: largeUserId
            };

            expect(category.userId).toBe(largeUserId);
            expect(typeof category.userId).toBe('number');
        });
    });
});
