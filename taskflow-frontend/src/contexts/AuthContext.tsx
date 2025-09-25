import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthContextType, User, LoginRequest, RegisterRequest } from '../types/Auth';
import { authService } from '../services/authService';
import { achievementStorage } from '../utils/achievementStorage';

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
    const queryClient = useQueryClient();



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
                        achievementStorage.setUserId(userData.id.toString());
                    } else {
                        authService.removeToken();
                    }
                } catch (error) {
                    authService.removeToken();
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (credentials: LoginRequest): Promise<boolean | { emailNotConfirmed: true, email: string }> => {
        try {
            const authResponse = await authService.login(credentials);
            const userData = await authService.getCurrentUser();

            setUser(userData);
            setToken(authResponse.token);

            achievementStorage.setUserId(userData.id.toString());

            return true;
        } catch (error: any) {
            if (error && error.code === 'emailNotConfirmed') {
                return { emailNotConfirmed: true, email: credentials.username };
            }
            return false;
        }
    };

    const register = async (data: RegisterRequest): Promise<boolean> => {
        try {
            const success = await authService.register(data);
            if (success) {

                return true;
            }
            return false;
        } catch (error) {
            if (error instanceof Error) {
            }
            return false;
        }
    };

    const logout = () => {
        authService.logout();
        queryClient.clear();
        achievementStorage.setUserId(null);

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
