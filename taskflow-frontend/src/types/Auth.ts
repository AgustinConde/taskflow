export interface User {
    id: number;
    username: string;
    email: string;
    createdAt: string;
    lastLoginAt?: string;
    avatarUrl?: string;
}

export interface UserProfileFormData extends Partial<User> {
    password?: string;
    avatarFile?: File | null;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    username: string;
    email: string;
    expiresAt: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: LoginRequest) => Promise<boolean>;
    register: (data: RegisterRequest) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}
