import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSendMessage, useAIAssistantStatus } from '../useAIAssistant';
import { aiAssistantService } from '../../services/aiAssistantService';

vi.mock('../../services/aiAssistantService', () => ({
    aiAssistantService: {
        sendMessage: vi.fn(),
        getStatus: vi.fn()
    }
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        {children}
    </QueryClientProvider>
);

describe('useAIAssistant', () => {
    it('sends message', async () => {
        vi.mocked(aiAssistantService.sendMessage).mockResolvedValue({ message: 'response' } as any);
        const { result } = renderHook(() => useSendMessage(), { wrapper });
        result.current.mutate({ message: 'test' } as any);
        await waitFor(() => expect(aiAssistantService.sendMessage).toHaveBeenCalledWith({ message: 'test' }));
    });

    it('handles send error', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.mocked(aiAssistantService.sendMessage).mockRejectedValue(new Error('fail'));
        const { result } = renderHook(() => useSendMessage(), { wrapper });
        result.current.mutate({ message: 'test' } as any);
        await waitFor(() => expect(consoleError).toHaveBeenCalled());
        consoleError.mockRestore();
    });

    it('gets status', async () => {
        vi.mocked(aiAssistantService.getStatus).mockResolvedValue({ available: true } as any);
        const { result } = renderHook(() => useAIAssistantStatus(), { wrapper });
        await waitFor(() => expect(result.current.data).toEqual({ available: true }));
    });
});
