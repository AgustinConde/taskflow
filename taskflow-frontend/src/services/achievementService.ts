import type {
    Achievement,
    AchievementProgress,
    AchievementEvent,
    UserAchievementStats
} from '../types/Achievement';
import { authService } from './authService';
import { API_ENDPOINTS } from '../config/api';

class AchievementService {
    private getAuthHeaders(): HeadersInit {
        const token = authService.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    async getUserProgress(): Promise<AchievementProgress[]> {
        try {
            const response = await fetch(API_ENDPOINTS.achievements.progress, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user achievement progress');
            }

            return response.json();
        } catch (error) {
            console.error('Error fetching user achievement progress:', error);
            return [];
        }
    }

    async updateProgress(progress: AchievementProgress): Promise<void> {
        try {
            const response = await fetch(API_ENDPOINTS.achievements.progress, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(progress)
            });

            if (!response.ok) {
                throw new Error('Failed to update achievement progress');
            }
        } catch (error) {
            console.error('Error updating achievement progress:', error);
            throw error;
        }
    }

    async getUserStats(): Promise<UserAchievementStats | null> {
        try {
            const response = await fetch(API_ENDPOINTS.achievements.stats, {
                headers: this.getAuthHeaders()
            }); if (!response.ok) {
                throw new Error('Failed to fetch user achievement stats');
            }

            return response.json();
        } catch (error) {
            console.error('Error fetching user achievement stats:', error);
            return null;
        }
    }

    async trackEvent(event: AchievementEvent): Promise<void> {
        try {
            const eventDto = {
                Type: event.type,
                Data: event.data ? JSON.stringify(event.data) : null
            };

            const response = await fetch(API_ENDPOINTS.achievements.trackEvent, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(eventDto)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Achievement service error:', response.status, errorText);
                throw new Error(`Failed to track achievement event: ${response.status} ${errorText}`);
            }
        } catch (error) {
            console.error('Error tracking achievement event:', error);
            throw error;
        }
    }

    async initializeUserAchievements(): Promise<void> {
        try {
            const response = await fetch(API_ENDPOINTS.achievements.initialize, {
                method: 'POST',
                headers: this.getAuthHeaders()
            }); if (!response.ok) {
                throw new Error('Failed to initialize user achievements');
            }
        } catch (error) {
            console.error('Error initializing user achievements:', error);
            throw error;
        }
    }

    async getAchievements(): Promise<Achievement[]> {
        try {
            const response = await fetch(API_ENDPOINTS.achievements.base, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch achievements');
            }

            return response.json();
        } catch (error) {
            console.error('Error fetching achievements:', error);
            return [];
        }
    }
}

export const achievementService = new AchievementService();