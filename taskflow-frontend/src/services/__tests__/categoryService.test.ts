import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../../__tests__/mocks/server';
import { categoryService } from '../categoryService';
import { mockCategories } from '../../__tests__/fixtures/categories';

describe('CategoryService', () => {
    beforeEach(() => {
        server.resetHandlers();
    });

    describe('getCategories', () => {
        it('should fetch categories successfully', async () => {
            const categories = await categoryService.getCategories();

            expect(Array.isArray(categories)).toBe(true);
            expect(categories.length).toBeGreaterThan(0);
            expect(categories[0]).toHaveProperty('id');
            expect(categories[0]).toHaveProperty('name');
            expect(categories[0]).toHaveProperty('color');
        });
    });

    describe('createCategory', () => {
        it('should create a new category', async () => {
            const newCategory = {
                name: 'Test Category',
                color: '#FF0000',
                description: 'Test Description'
            };

            const result = await categoryService.createCategory(newCategory);

            expect(result).toHaveProperty('id');
            expect(result.name).toBe(newCategory.name);
            expect(result.color).toBe(newCategory.color);
            expect(result.description).toBe(newCategory.description);
        });
    });

    describe('updateCategory', () => {
        it('should update an existing category', async () => {
            const categoryId = 1;
            const updates = {
                name: 'Updated Category',
                color: '#00FF00'
            };

            const result = await categoryService.updateCategory(categoryId, updates);

            expect(result).toHaveProperty('id', categoryId);
            expect(result.name).toBe(updates.name);
            expect(result.color).toBe(updates.color);
        });
    });

    describe('deleteCategory', () => {
        it('should delete a category', async () => {
            const categoryId = 1;

            await expect(categoryService.deleteCategory(categoryId)).resolves.not.toThrow();
        });
    });
});
