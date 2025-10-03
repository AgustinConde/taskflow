export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface ChatRequest {
    message: string;
    conversationHistory?: ChatMessage[];
    includeTaskContext?: boolean;
    includeCategoryContext?: boolean;
    includeAchievementContext?: boolean;
    language?: string;
}

export interface ChatResponse {
    message: string;
    timestamp: string;
    isRestricted: boolean;
    suggestedAction?: string | null;
    actionData?: any;
}

export interface AIAssistantStatus {
    available: boolean;
    provider: string;
    message: string;
}

export interface ChatUIMessage extends ChatMessage {
    id: string;
    isLoading?: boolean;
    error?: boolean;
    isWelcome?: boolean; // Flag for welcome message to exclude from history
}
