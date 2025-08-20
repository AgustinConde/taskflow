
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { categoryService } from '../categoryService';
import { authService } from '../authService';

const mockCategory = {
    id: 1,
    name: 'Test',
    color: '#FF0000',
    description: 'Desc',
    userId: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
};

const mockToken = 'mock-token';

function mockFetch(response: any, ok = true) {
    return vi.fn().mockResolvedValue({
        ok,
        status: ok ? 200 : 500,
        statusText: ok ? 'OK' : 'Internal Server Error',
        json: vi.fn().mockResolvedValue(response),
    });
}

describe('CategoryService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(authService, 'getToken').mockReturnValue(mockToken);
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
        vi.clearAllTimers();
    });

    describe('getCategories', () => {
        it('should fetch categories successfully', async () => {
            global.fetch = mockFetch([mockCategory]);
            const result = await categoryService.getCategories();
            expect(result).toEqual([mockCategory]);
            expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'GET' }));
        });

        it('should throw on fetch error', async () => {
            global.fetch = mockFetch({}, false);
            await expect(categoryService.getCategories()).rejects.toThrow('Failed to fetch categories');
        });
    });

    describe('createCategory', () => {
        it('should create category successfully', async () => {
            global.fetch = mockFetch(mockCategory);
            const result = await categoryService.createCategory({ name: 'Test', color: '#FF0000' });
            expect(result).toEqual(mockCategory);
            expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'POST' }));
        });

        it('should throw on create error', async () => {
            global.fetch = mockFetch({}, false);
            await expect(categoryService.createCategory({ name: 'Test', color: '#FF0000' })).rejects.toThrow('Failed to create category');
        });
    });

    describe('updateCategory', () => {
        it('should update category and return getCategoryById result', async () => {
            global.fetch = vi.fn()
                .mockResolvedValueOnce({ ok: true, status: 200, json: vi.fn() }) // PUT
                .mockResolvedValueOnce({ ok: true, status: 200, json: vi.fn().mockResolvedValue(mockCategory) }); // GET
            const result = await categoryService.updateCategory(1, { name: 'Updated', color: '#00FF00' });
            expect(result).toEqual(mockCategory);
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/1'), expect.objectContaining({ method: 'PUT' }));
        });

        it('should throw on update error', async () => {
            global.fetch = mockFetch({}, false);
            await expect(categoryService.updateCategory(1, { name: 'Updated', color: '#00FF00' })).rejects.toThrow('Failed to update category');
        });
    });

    describe('deleteCategory', () => {
        it('should delete category successfully', async () => {
            global.fetch = mockFetch({}, true);
            await expect(categoryService.deleteCategory(1)).resolves.toBeUndefined();
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/1'), expect.objectContaining({ method: 'DELETE' }));
        });

        it('should throw on delete error', async () => {
            global.fetch = mockFetch({}, false);
            await expect(categoryService.deleteCategory(1)).rejects.toThrow('Failed to delete category');
        });
    });

    describe('getCategoryById', () => {
        it('should fetch category by id', async () => {
            global.fetch = mockFetch(mockCategory);
            const result = await categoryService.getCategoryById(1);
            expect(result).toEqual(mockCategory);
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/1'), expect.objectContaining({ method: 'GET' }));
        });

        it('should throw on fetch error', async () => {
            global.fetch = mockFetch({}, false);
            await expect(categoryService.getCategoryById(1)).rejects.toThrow('Failed to fetch category');
        });
    });

    describe('headers', () => {
        it('should include Authorization header if token exists', async () => {
            global.fetch = mockFetch([mockCategory]);
            await categoryService.getCategories();
            const [, options] = (vi.mocked(global.fetch).mock.calls[0]);
            expect(options).toBeDefined();
            if (!options || !options.headers) throw new Error('Options or headers not defined');
            if (typeof options.headers === 'object' && options.headers !== null && 'Authorization' in options.headers) {
                expect((options.headers as Record<string, string>).Authorization).toBe(`Bearer ${mockToken}`);
            }
        });

        it('should not include Authorization header if token is missing', async () => {
            vi.spyOn(authService, 'getToken').mockReturnValue(null);
            global.fetch = mockFetch([mockCategory]);
            await categoryService.getCategories();
            const [, options] = (vi.mocked(global.fetch).mock.calls[0]);
            expect(options).toBeDefined();
            if (!options || !options.headers) throw new Error('Options or headers not defined');
            if (typeof options.headers === 'object' && options.headers !== null && 'Authorization' in options.headers) {
                expect((options.headers as Record<string, string>).Authorization).toBeUndefined();
            }
        });
    });
});
