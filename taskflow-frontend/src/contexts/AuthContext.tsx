import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthContextType, User, LoginRequest, RegisterRequest } from '../types/Auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const savedToken = authService.getToken();

            if (savedToken && !authService.isTokenExpired()) {
                try {
                    const isValid = await authService.validateToken();
                    if (isValid) {
                        const userData = await authService.getCurrentUser();
                        setUser(userData);
                        setToken(savedToken);
                    } else {
                        authService.removeToken();
                    }
                } catch (error) {
                    console.error('Auth initialization error:', error);
                    authService.removeToken();
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (credentials: LoginRequest): Promise<boolean> => {
        try {
            const authResponse = await authService.login(credentials);
            const userData = await authService.getCurrentUser();

            setUser(userData);
            setToken(authResponse.token);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const register = async (data: RegisterRequest): Promise<boolean> => {
        try {
            console.log('Attempting registration with:', { username: data.username, email: data.email });
            const authResponse = await authService.register(data);
            console.log('Registration successful:', authResponse);
            const userData = await authService.getCurrentUser();

            setUser(userData);
            setToken(authResponse.token);
            return true;
        } catch (error) {
            console.error('Registration error details:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
            }
            return false;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setToken(null);
    };

    const value: AuthContextType = {
        user,
        setUser,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
