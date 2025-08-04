import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../../config/api';
import { mockTasks } from '../fixtures/tasks';
import { mockCategories } from '../fixtures/categories';
import { mockUsers } from '../fixtures/users';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../../types/Task';
import type { Category, CreateCategoryRequest } from '../../types/Category';

const testCategories = new Map<number, Category>();
const testTasks = new Map<number, Task>();

export const resetTestData = () => {
    testCategories.clear();
    testTasks.clear();
    mockCategories.forEach(category => {
        testCategories.set(category.id, { ...category });
    });
    mockTasks.forEach(task => {
        testTasks.set(task.id, { ...task });
    });
};

resetTestData();

export const handlers = [
    // Auth endpoints
    http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
        const credentials = await request.json() as { username: string; password: string };

        if (credentials.username === 'wronguser' || credentials.password === 'wrongpassword') {
            return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        return HttpResponse.json({
            token: 'mock-jwt-token',
            username: credentials.username,
            email: `${credentials.username}@test.com`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });
    }),

    http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
        const userData = await request.json() as { username: string; email: string; password: string };

        if (!userData.username || !userData.email || userData.password.length < 6) {
            return HttpResponse.json({ error: 'Invalid registration data' }, { status: 400 });
        }

        return HttpResponse.json({
            token: 'mock-jwt-token',
            username: userData.username,
            email: userData.email,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });
    }),

    http.get(`${API_BASE_URL}/auth/me`, () => {
        return HttpResponse.json(mockUsers[0]);
    }),

    http.get(`${API_BASE_URL}/auth/validate`, () => {
        return HttpResponse.json({ valid: true });
    }),

    // Tasks endpoints
    http.get(`${API_BASE_URL}/tasks`, () => {
        return HttpResponse.json(Array.from(testTasks.values()));
    }),

    http.get(`${API_BASE_URL}/tasks/:id`, ({ params }) => {
        const task = testTasks.get(Number(params.id));
        if (!task) {
            return HttpResponse.json({ error: 'Task not found' }, { status: 404 });
        }
        return HttpResponse.json(task);
    }),

    http.post(`${API_BASE_URL}/tasks`, async ({ request }) => {
        const newTaskData = await request.json() as CreateTaskRequest;
        const task: Task = {
            id: Date.now(),
            title: newTaskData.title,
            description: newTaskData.description,
            isCompleted: false,
            createdAt: new Date().toISOString(),
            dueDate: newTaskData.dueDate,
            categoryId: newTaskData.categoryId,
            categoryName: newTaskData.categoryName
        };
        testTasks.set(task.id, task);
        return HttpResponse.json(task);
    }),

    http.put(`${API_BASE_URL}/tasks/:id`, async ({ params, request }) => {
        const taskId = Number(params.id);
        const updates = await request.json() as UpdateTaskRequest;
        const existingTask = testTasks.get(taskId);

        if (!existingTask) {
            return HttpResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const updatedTask: Task = {
            ...existingTask,
            ...updates,
            id: taskId
        };

        testTasks.set(taskId, updatedTask);
        return HttpResponse.json(updatedTask);
    }), http.delete(`${API_BASE_URL}/tasks/:id`, ({ params }) => {
        const taskId = Number(params.id);
        const existed = testTasks.has(taskId);
        if (!existed) {
            return HttpResponse.json({ error: 'Task not found' }, { status: 404 });
        }
        testTasks.delete(taskId);
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
