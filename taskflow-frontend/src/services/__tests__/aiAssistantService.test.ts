import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiAssistantService } from '../aiAssistantService';
import { authService } from '../authService';

vi.mock('../authService', () => ({
    authService: { getToken: vi.fn() }
}));

const mockFetch = (data: any, ok = true, status = 200) =>
    vi.fn().mockResolvedValue({ ok, status, json: vi.fn().mockResolvedValue(data) });

describe('aiAssistantService', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    describe('sendMessage', () => {
        it('sends message successfully with auth', async () => {
            vi.mocked(authService.getToken).mockReturnValue('token');
            global.fetch = mockFetch({ response: 'AI response' });
            const result = await aiAssistantService.sendMessage({ message: 'test' });
            expect(result).toEqual({ response: 'AI response' });
        });

        it('sends message without auth token', async () => {
            vi.mocked(authService.getToken).mockReturnValue(null);
            global.fetch = mockFetch({ response: 'AI response' });
            await aiAssistantService.sendMessage({ message: 'test' });
            const headers = (global.fetch as any).mock.calls[0][1].headers;
            expect(headers.Authorization).toBeUndefined();
        });

        it('throws on 401', async () => {
            vi.mocked(authService.getToken).mockReturnValue('token');
            global.fetch = mockFetch({}, false, 401);
            await expect(aiAssistantService.sendMessage({ message: 'test' }))
                .rejects.toThrow('Unauthorized - Please log in');
        });

        it('throws on 503', async () => {
            vi.mocked(authService.getToken).mockReturnValue('token');
            global.fetch = mockFetch({}, false, 503);
            await expect(aiAssistantService.sendMessage({ message: 'test' }))
                .rejects.toThrow('AI Assistant is not available');
        });

        it('throws on other errors', async () => {
            vi.mocked(authService.getToken).mockReturnValue('token');
            global.fetch = mockFetch({}, false, 500);
            await expect(aiAssistantService.sendMessage({ message: 'test' }))
                .rejects.toThrow('Failed to send message to AI Assistant');
        });
    });

    describe('getStatus', () => {
        it('gets status successfully', async () => {
            vi.mocked(authService.getToken).mockReturnValue('token');
            global.fetch = mockFetch({ isAvailable: true });
            const result = await aiAssistantService.getStatus();
            expect(result).toEqual({ isAvailable: true });
        });

        it('throws on failed status fetch', async () => {
            vi.mocked(authService.getToken).mockReturnValue('token');
            global.fetch = mockFetch({}, false);
            await expect(aiAssistantService.getStatus()).rejects.toThrow('Failed to get AI Assistant status');
        });
    });
});
