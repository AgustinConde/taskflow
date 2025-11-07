import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/Auth';
import { API_ENDPOINTS, ROOT_URL } from '../config/api';

class AuthService {
    async resendConfirmationEmail(email: string): Promise<void> {
        const response = await fetch(API_ENDPOINTS.auth.resendConfirmation, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to resend confirmation email');
        }
    }

    async forgotPassword(email: string): Promise<void> {
        const response = await fetch(API_ENDPOINTS.auth.forgotPassword, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send reset email');
        }
    }
    private getAuthHeaders(): HeadersInit {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    getToken(): string | null {
        return localStorage.getItem('taskflow_token');
    }

    setToken(token: string): void {
        localStorage.setItem('taskflow_token', token);
    }

    removeToken(): void {
        localStorage.removeItem('taskflow_token');
    }

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await fetch(API_ENDPOINTS.auth.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const error = await response.json();
            if (error.message === 'auth.login.emailNotConfirmed') {
                throw { code: 'emailNotConfirmed', email: credentials.username, message: error.message };
            }
            throw new Error(error.message || 'Login failed');
        }

        const authResponse: AuthResponse = await response.json();
        if (authResponse.avatarUrl && authResponse.avatarUrl.startsWith('/uploads/')) {
            authResponse.avatarUrl = `${ROOT_URL}${authResponse.avatarUrl}`;
            authResponse.avatarUrl = `${authResponse.avatarUrl}?t=${Date.now()}`;
        }
        this.setToken(authResponse.token);
        return authResponse;
    }

    async register(data: RegisterRequest): Promise<boolean> {

        const response = await fetch(API_ENDPOINTS.auth.register, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });


        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        return true;
    }

    async getCurrentUser(): Promise<User> {
        const response = await fetch(API_ENDPOINTS.auth.me, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to get user data');
        }

        const user: User = await response.json();
        if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/')) {
            user.avatarUrl = `${ROOT_URL}${user.avatarUrl}`;
            user.avatarUrl = `${user.avatarUrl}?t=${Date.now()}`;
        }
        return user;
    }

    async validateToken(): Promise<boolean> {
        try {
            const response = await fetch(API_ENDPOINTS.auth.validate, {
                headers: this.getAuthHeaders()
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    logout(): void {
        this.removeToken();
    }

    isTokenExpired(): boolean {
        const token = this.getToken();
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch {
            return true;
        }
    }

    async getUserSettings(): Promise<{ autoDeleteCompletedTasks: boolean }> {
        const response = await fetch(API_ENDPOINTS.users.settings, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to get user settings');
        }

        return await response.json();
    }

    async updateUserSettings(settings: { autoDeleteCompletedTasks?: boolean }): Promise<void> {
        const response = await fetch(API_ENDPOINTS.users.settings, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(settings)
        });

        if (!response.ok) {
            throw new Error('Failed to update user settings');
        }
    }
}

export const authService = new AuthService();
