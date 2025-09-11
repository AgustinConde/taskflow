import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/Auth';
const ROOT_URL = import.meta.env.VITE_ROOT_URL;
const API_URL = `${ROOT_URL}/api`;

class AuthService {

    async forgotPassword(email: string): Promise<void> {
        const response = await fetch(`${API_URL}/auth/forgot`, {
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
        const response = await fetch(`${API_URL}/auth/login`, {
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
        }
        this.setToken(authResponse.token);
        return authResponse;
    }

    async register(data: RegisterRequest): Promise<AuthResponse> {
        console.log('AuthService: Sending registration request to:', `${API_URL}/auth/register`);
        console.log('AuthService: Registration data:', { username: data.username, email: data.email });

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        console.log('AuthService: Registration response status:', response.status);

        if (!response.ok) {
            const error = await response.json();
            console.error('AuthService: Registration failed with error:', error);
            throw new Error(error.message || 'Registration failed');
        }

        const authResponse: AuthResponse = await response.json();
        if (authResponse.avatarUrl && authResponse.avatarUrl.startsWith('/uploads/')) {
            authResponse.avatarUrl = `${ROOT_URL}${authResponse.avatarUrl}`;
        }
        this.setToken(authResponse.token);
        return authResponse;
    }

    async getCurrentUser(): Promise<User> {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to get user data');
        }

        const user: User = await response.json();
        if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/')) {
            user.avatarUrl = `${ROOT_URL}${user.avatarUrl}`;
        }
        return user;
    }

    async validateToken(): Promise<boolean> {
        try {
            const response = await fetch(`${API_URL}/auth/validate`, {
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
}

export const authService = new AuthService();
