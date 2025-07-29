export interface Category {
    id: number;
    name: string;
    color: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
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
