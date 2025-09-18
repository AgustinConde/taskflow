import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/Category';
import { authService } from './authService';
import { API_ENDPOINTS } from '../config/api';

const API_URL = API_ENDPOINTS.categories.base;

class CategoryService {
    private getAuthHeaders(): Record<string, string> {
        const token = authService.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    async getCategories(): Promise<Category[]> {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }

        return response.json();
    }

    async createCategory(categoryData: CreateCategoryRequest): Promise<Category> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
            throw new Error(`Failed to create category: ${response.statusText}`);
        }

        return response.json();
    }

    async updateCategory(id: number, categoryData: UpdateCategoryRequest): Promise<Category> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
            throw new Error(`Failed to update category: ${response.statusText}`);
        }

        return this.getCategoryById(id);
    }

    async deleteCategory(id: number): Promise<void> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to delete category: ${response.statusText}`);
        }
    }

    async getCategoryById(id: number): Promise<Category> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch category: ${response.statusText}`);
        }

        return response.json();
    }
}

export const categoryService = new CategoryService();
