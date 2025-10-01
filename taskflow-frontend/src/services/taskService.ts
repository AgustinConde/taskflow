import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/Task';
import { authService } from './authService';

const localDateTimeToUTC = (local: string | null | undefined): string | null => {
    if (!local) return null;

    const [datePart, timePart] = local.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    const localDate = new Date(year, month - 1, day, hour, minute);
    return localDate.toISOString();
};

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

    async createTask(task: CreateTaskRequest): Promise<Task> {
        const taskWithUTCDate = {
            ...task,
            dueDate: localDateTimeToUTC(task.dueDate)
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(taskWithUTCDate)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.title || 'Failed to create task');
        }

        return response.json();
    }

    async updateTask(id: number, task: UpdateTaskRequest): Promise<Task> {
        const taskWithUTCDate = {
            ...task,
            dueDate: task.dueDate ? localDateTimeToUTC(task.dueDate) : task.dueDate
        };

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(taskWithUTCDate)
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
