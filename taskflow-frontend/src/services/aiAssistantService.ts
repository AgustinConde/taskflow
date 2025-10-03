import type { ChatRequest, ChatResponse, AIAssistantStatus } from '../types/AIAssistant';
import { authService } from './authService';
import { API_ENDPOINTS } from '../config/api';

class AIAssistantService {
    private getAuthHeaders(): HeadersInit {
        const token = authService.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    async sendMessage(request: ChatRequest): Promise<ChatResponse> {
        const response = await fetch(API_ENDPOINTS.aiAssistant.chat, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized - Please log in');
            }
            if (response.status === 503) {
                throw new Error('AI Assistant is not available. Please make sure Ollama is running.');
            }
            throw new Error('Failed to send message to AI Assistant');
        }

        return response.json();
    }

    async getStatus(): Promise<AIAssistantStatus> {
        const response = await fetch(API_ENDPOINTS.aiAssistant.status, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to get AI Assistant status');
        }

        return response.json();
    }
}

export const aiAssistantService = new AIAssistantService();
