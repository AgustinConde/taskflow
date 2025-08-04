import type { Task } from '../types/Task';
import { authService } from './authService';

const API_URL = "http://localhost:5149/api/tasks";

class TaskService {
    private getAuthHeaders(): HeadersInit {
        const token = authService.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    async getTasks(): Promise<Task[]> {
        const response = await fetch(API_URL, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        return response.json();
    }

    async getTask(id: number): Promise<Task> {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch task');
        }

        return response.json();
    }

    async createTask(task: Omit<Task, 'id' | 'createdAt' | 'userId'>): Promise<Task> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.title || 'Failed to create task');
        }

        return response.json();
    }

    async updateTask(id: number, task: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>): Promise<Task> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error('Failed to update task');
        }

        return response.json();
    }

    async getTaskById(id: number): Promise<Task> {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch task');
        }

        return response.json();
    }

    async deleteTask(id: number): Promise<void> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
    }
}

export const taskService = new TaskService();
