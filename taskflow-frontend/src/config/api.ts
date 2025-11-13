// API Configuration
const ROOT_URL = import.meta.env.VITE_ROOT_URL || 'http://localhost:5149';

export const API_BASE_URL = `${ROOT_URL}/api`;

// API Endpoints
export const API_ENDPOINTS = {
    auth: {
        login: `${API_BASE_URL}/auth/login`,
        register: `${API_BASE_URL}/auth/register`,
        logout: `${API_BASE_URL}/auth/logout`,
        me: `${API_BASE_URL}/auth/me`,
        validate: `${API_BASE_URL}/auth/validate`,
        forgotPassword: `${API_BASE_URL}/auth/forgot`,
        resetPassword: `${API_BASE_URL}/auth/reset`,
        confirmEmail: `${API_BASE_URL}/auth/confirm`,
        resendConfirmation: `${API_BASE_URL}/auth/resend-confirmation`,
    },
    tasks: {
        base: `${API_BASE_URL}/tasks`,
        byId: (id: string | number) => `${API_BASE_URL}/tasks/${id}`,
    },
    categories: {
        base: `${API_BASE_URL}/categories`,
        byId: (id: string | number) => `${API_BASE_URL}/categories/${id}`,
    },
    achievements: {
        base: `${API_BASE_URL}/achievements`,
        progress: `${API_BASE_URL}/achievements/progress`,
        trackEvent: `${API_BASE_URL}/achievements/events`,
        notifications: `${API_BASE_URL}/achievements/notifications`,
        stats: `${API_BASE_URL}/achievements/stats`,
        initialize: `${API_BASE_URL}/achievements/initialize`,
    },
    aiAssistant: {
        chat: `${API_BASE_URL}/ai-assistant/chat`,
        status: `${API_BASE_URL}/ai-assistant/status`,
    },
    users: {
        profile: `${API_BASE_URL}/users/profile`,
        photo: `${API_BASE_URL}/users/photo`,
        settings: `${API_BASE_URL}/users/settings`,
    },
} as const;

// Root URL for non-API resources (like avatar images)
export { ROOT_URL };
