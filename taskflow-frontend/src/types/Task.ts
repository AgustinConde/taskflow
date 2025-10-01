import type { TaskLocation } from './Location';

export interface Task {
    id: number;
    title: string;
    description?: string;
    isCompleted: boolean;
    createdAt: string;
    dueDate?: string | null;
    categoryId?: number | null;
    categoryName?: string;
    location?: TaskLocation | null;
}

export interface CreateTaskRequest {
    title: string;
    description?: string;
    dueDate?: string | null;
    categoryId?: number | null;
    categoryName?: string;
    location?: TaskLocation | null;
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    isCompleted?: boolean;
    dueDate?: string | null;
    categoryId?: number | null;
    categoryName?: string;
    location?: TaskLocation | null;
}