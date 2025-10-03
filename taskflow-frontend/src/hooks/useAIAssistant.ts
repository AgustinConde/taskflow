import { useMutation, useQuery } from '@tanstack/react-query';
import { aiAssistantService } from '../services/aiAssistantService';
import type { ChatRequest, AIAssistantStatus } from '../types/AIAssistant';

export const useSendMessage = () => {
    return useMutation({
        mutationFn: (request: ChatRequest) => aiAssistantService.sendMessage(request),
        onError: (error: Error) => {
            console.error('Error sending message to AI Assistant:', error);
        }
    });
};


export const useAIAssistantStatus = () => {
    return useQuery<AIAssistantStatus>({
        queryKey: ['aiAssistantStatus'],
        queryFn: () => aiAssistantService.getStatus(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false
    });
};
