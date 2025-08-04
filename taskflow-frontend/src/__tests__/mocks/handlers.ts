import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../../config/api';
import { mockTasks } from '../fixtures/tasks';
import { mockCategories } from '../fixtures/categories';
import { mockUsers } from '../fixtures/users';
import type { Task } from '../../types/Task';
import type { Category, CreateCategoryRequest } from '../../types/Category';

const testCategories = new Map<number, Category>();

export const resetTestData = () => {
    testCategories.clear();
    mockCategories.forEach(category => {
        testCategories.set(category.id, { ...category });
    });
};

resetTestData();

export const handlers = [
    // Auth endpoints
    http.post(`${API_BASE_URL}/auth/login`, () => {
        return HttpResponse.json({
            user: mockUsers[0],
            token: 'mock-jwt-token'
        });
    }),

    http.post(`${API_BASE_URL}/auth/register`, () => {
        return HttpResponse.json({
            user: mockUsers[0],
            token: 'mock-jwt-token'
        });
    }),

    // Tasks endpoints
    http.get(`${API_BASE_URL}/tasks`, () => {
        return HttpResponse.json(mockTasks);
    }),

    http.post(`${API_BASE_URL}/tasks`, async ({ request }) => {
        const newTask = await request.json() as Partial<Task>;
        return HttpResponse.json({
            id: Date.now(),
            title: newTask.title || 'New Task',
            description: newTask.description,
            isCompleted: false,
            createdAt: new Date().toISOString(),
            dueDate: newTask.dueDate,
            categoryId: newTask.categoryId,
            categoryName: newTask.categoryName
        });
    }),

    http.put(`${API_BASE_URL}/tasks/:id`, async ({ params, request }) => {
        const updatedTask = await request.json() as Partial<Task>;
        return HttpResponse.json({
            id: Number(params.id),
            title: updatedTask.title || 'Updated Task',
            description: updatedTask.description,
            isCompleted: updatedTask.isCompleted || false,
            createdAt: new Date().toISOString(),
            dueDate: updatedTask.dueDate,
            categoryId: updatedTask.categoryId,
            categoryName: updatedTask.categoryName
        });
    }),

    http.delete(`${API_BASE_URL}/tasks/:id`, () => {
        return HttpResponse.json({ success: true });
    }),

    // Categories endpoints
    http.get(`${API_BASE_URL}/categories`, () => {
        return HttpResponse.json(Array.from(testCategories.values()));
    }),

    http.get(`${API_BASE_URL}/categories/:id`, ({ params }) => {
        const category = testCategories.get(Number(params.id));
        if (!category) {
            return HttpResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        return HttpResponse.json(category);
    }),

    http.post(`${API_BASE_URL}/categories`, async ({ request }) => {
        const newCategory = await request.json() as CreateCategoryRequest;
        const category: Category = {
            id: Date.now(),
            name: newCategory.name,
            color: newCategory.color,
            description: newCategory.description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 1
        };
        testCategories.set(category.id, category);
        return HttpResponse.json(category);
    }),

    http.put(`${API_BASE_URL}/categories/:id`, async ({ params, request }) => {
        const categoryId = Number(params.id);
        const updates = await request.json() as Partial<Category>;
        const existingCategory = testCategories.get(categoryId);

        if (!existingCategory) {
            return HttpResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const updatedCategory: Category = {
            ...existingCategory,
            ...updates,
            id: categoryId,
            updatedAt: new Date().toISOString()
        };

        testCategories.set(categoryId, updatedCategory);

        return HttpResponse.json(updatedCategory);
    }),

    http.delete(`${API_BASE_URL}/categories/:id`, ({ params }) => {
        const categoryId = Number(params.id);
        testCategories.delete(categoryId);
        return HttpResponse.json({ success: true });
    }),
];
