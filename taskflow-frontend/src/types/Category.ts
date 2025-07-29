export interface Category {
    id: number;
    name: string;
    color: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    userId: number;
}

export interface CreateCategoryRequest {
    name: string;
    color: string;
    description?: string;
}

export interface UpdateCategoryRequest {
    name?: string;
    color?: string;
    description?: string;
}
