import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIAssistantChat from '../AIAssistantChat';
import * as useAIAssistant from '../../../hooks/useAIAssistant';
import * as AuthContext from '../../../contexts/AuthContext';

vi.mock('../../../hooks/useAIAssistant');
vi.mock('../../../contexts/AuthContext');

describe('AIAssistantChat', () => {
    const mockSendMessage = vi.fn();
    const mockUser = { id: 1, username: 'test', email: 'test@test.com', avatarUrl: null };

    beforeEach(() => {
        vi.clearAllMocks();
        Element.prototype.scrollIntoView = vi.fn();
        vi.mocked(AuthContext.useAuth).mockReturnValue({ user: mockUser } as any);
        vi.mocked(useAIAssistant.useSendMessage).mockReturnValue({
            mutateAsync: mockSendMessage,
            isPending: false
        } as any);
        vi.mocked(useAIAssistant.useAIAssistantStatus).mockReturnValue({
            data: { available: true },
            isLoading: false
        } as any);
    });

    it('renders FAB button', () => {
        render(<AIAssistantChat />);
        expect(screen.getByRole('button', { name: /ai assistant/i })).toBeInTheDocument();
    });

    it('opens chat on FAB click', async () => {
        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));
        await waitFor(() => screen.getByText(/TaskFlow Assistant/i));
    });

    it('shows welcome message when opening', async () => {
        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));
        await waitFor(() => screen.getByText(/Hola/i));
    });

    it('sends message on Enter key', async () => {
        mockSendMessage.mockResolvedValue({ message: 'AI response', timestamp: new Date().toISOString() });
        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));

        const input = await screen.findByPlaceholderText(/Type your message/i);
        await userEvent.type(input, 'Hello{Enter}');

        await waitFor(() => expect(mockSendMessage).toHaveBeenCalled());
    });

    it('sends message on button click', async () => {
        mockSendMessage.mockResolvedValue({ message: 'Response', timestamp: new Date().toISOString() });
        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));

        const input = await screen.findByPlaceholderText(/Type your message/i);
        await userEvent.type(input, 'Test message');

        const buttons = screen.getAllByRole('button');
        const sendButton = buttons.find(b => b.querySelector('[data-testid="SendIcon"]'));
        if (sendButton) await userEvent.click(sendButton);

        await waitFor(() => expect(mockSendMessage).toHaveBeenCalled());
    });

    it('does not send empty message', async () => {
        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));

        const input = await screen.findByPlaceholderText(/Type your message/i);
        await userEvent.type(input, '   {Enter}');

        expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('shows loading indicator while sending', async () => {
        vi.mocked(useAIAssistant.useSendMessage).mockReturnValue({
            mutateAsync: vi.fn(() => new Promise(() => { })),
            isPending: true
        } as any);

        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));

        const input = await screen.findByPlaceholderText(/Type your message/i);
        await userEvent.type(input, 'Test');

        await waitFor(() => screen.getAllByRole('progressbar').length > 0);
    });

    it('sends message with conversation history', async () => {
        mockSendMessage.mockResolvedValue({ message: 'First response', timestamp: new Date().toISOString() });
        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));

        const input = await screen.findByPlaceholderText(/Type your message/i);
        await userEvent.type(input, 'First message{Enter}');
        await waitFor(() => expect(mockSendMessage).toHaveBeenCalled());

        mockSendMessage.mockResolvedValue({ message: 'Second response', timestamp: new Date().toISOString() });
        await userEvent.type(input, 'Second message{Enter}');
        await waitFor(() => {
            const calls = mockSendMessage.mock.calls;
            expect(calls.length).toBeGreaterThan(1);
            expect(calls[1][0].conversationHistory.length).toBeGreaterThan(0);
        });
    });

    it('displays error message on send failure', async () => {
        mockSendMessage.mockRejectedValue(new Error('Network error'));
        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));

        const input = await screen.findByPlaceholderText(/Type your message/i);
        await userEvent.type(input, 'Test{Enter}');

        await waitFor(() => screen.getByText(/error occurred/i));
    });

    it('shows offline status when AI unavailable', async () => {
        vi.mocked(useAIAssistant.useAIAssistantStatus).mockReturnValue({
            data: { available: false },
            isLoading: false
        } as any);

        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));
        await waitFor(() => screen.getByText(/Offline/i));
    });

    it('shows warning when AI not available', async () => {
        vi.mocked(useAIAssistant.useAIAssistantStatus).mockReturnValue({
            data: { available: false },
            isLoading: false
        } as any);

        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));
        await waitFor(() => screen.getByText(/not available/i));
    });

    it('disables input when AI unavailable', async () => {
        vi.mocked(useAIAssistant.useAIAssistantStatus).mockReturnValue({
            data: { available: false },
            isLoading: false
        } as any);

        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));

        const input = await screen.findByPlaceholderText(/Type your message/i);
        expect(input).toBeDisabled();
    });

    it('closes drawer on close button click', async () => {
        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));
        await waitFor(() => screen.getByText(/TaskFlow Assistant/i));

        const closeBtn = screen.getAllByRole('button').find(b => b.querySelector('[data-testid="CloseIcon"]'));
        if (closeBtn) await userEvent.click(closeBtn);

        await waitFor(() => expect(screen.queryByText(/TaskFlow Assistant/i)).not.toBeInTheDocument(), { timeout: 3000 });
    });

    it('does not send on Shift+Enter', async () => {
        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));

        const input = await screen.findByPlaceholderText(/Type your message/i);
        await userEvent.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

        expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('shows user avatar when available', async () => {
        vi.mocked(AuthContext.useAuth).mockReturnValue({
            user: { ...mockUser, avatarUrl: 'https://avatar.url' }
        } as any);

        mockSendMessage.mockResolvedValue({ message: 'Response', timestamp: new Date().toISOString() });
        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));

        const input = await screen.findByPlaceholderText(/Type your message/i);
        await userEvent.type(input, 'Test{Enter}');

        await waitFor(() => {
            const avatars = screen.getAllByRole('img');
            expect(avatars.some(img => img.getAttribute('src') === 'https://avatar.url')).toBe(true);
        });
    });

    it('displays loading status', async () => {
        vi.mocked(useAIAssistant.useAIAssistantStatus).mockReturnValue({
            data: undefined,
            isLoading: true
        } as any);

        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));
        await waitFor(() => screen.getAllByRole('progressbar').length > 0);
    });

    it('sends message with spanish language', async () => {
        const originalLanguage = (global as any).i18n?.language;
        if ((global as any).i18n) (global as any).i18n.language = 'es';

        mockSendMessage.mockResolvedValue({ message: 'Respuesta', timestamp: new Date().toISOString() });
        render(<AIAssistantChat />);
        await userEvent.click(screen.getByRole('button', { name: /ai assistant/i }));

        const input = await screen.findByPlaceholderText(/Type your message/i);
        await userEvent.type(input, 'Hola{Enter}');

        await waitFor(() => expect(mockSendMessage).toHaveBeenCalled());

        if ((global as any).i18n) (global as any).i18n.language = originalLanguage;
    });
});
