import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Fab,
    Drawer,
    Paper,
    Typography,
    TextField,
    IconButton,
    Avatar,
    Chip,
    Alert,
    CircularProgress,
    Tooltip,
    Divider
} from '@mui/material';
import {
    SmartToy as AIIcon,
    Send as SendIcon,
    Close as CloseIcon,
    Person as PersonIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useSendMessage, useAIAssistantStatus } from '../../hooks/useAIAssistant';
import type { ChatUIMessage } from '../../types/AIAssistant';

const AIAssistantChat: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatUIMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const sendMessageMutation = useSendMessage();
    const { data: statusData, isLoading: statusLoading } = useAIAssistantStatus();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage: ChatUIMessage = {
                id: 'welcome',
                role: 'assistant',
                content: t('aiAssistant.welcome', '¡Hola! Soy tu asistente de TaskFlow. ¿En qué puedo ayudarte hoy? Puedo sugerirte tareas, ayudarte a organizar tu día, o darte consejos sobre productividad.'),
                timestamp: new Date().toISOString(),
                isWelcome: true
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, messages.length, t]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || sendMessageMutation.isPending) return;

        const userMessage: ChatUIMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: inputMessage.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        const loadingMessage: ChatUIMessage = {
            id: `loading-${Date.now()}`,
            role: 'assistant',
            content: '...',
            timestamp: new Date().toISOString(),
            isLoading: true
        };
        setMessages(prev => [...prev, loadingMessage]);

        try {
            const response = await sendMessageMutation.mutateAsync({
                message: userMessage.content,
                conversationHistory: messages
                    .filter(m => !m.isLoading && !m.isWelcome)
                    .map(m => ({
                        role: m.role,
                        content: m.content,
                        timestamp: m.timestamp
                    })),
                includeTaskContext: true,
                includeCategoryContext: true,
                includeAchievementContext: false,
                language: i18n.language === 'en' ? 'en' : 'es'
            });

            setMessages(prev => {
                const withoutLoading = prev.filter(m => !m.isLoading);
                const assistantMessage: ChatUIMessage = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: response.message,
                    timestamp: response.timestamp
                };
                return [...withoutLoading, assistantMessage];
            });
        } catch (error) {
            setMessages(prev => {
                const withoutLoading = prev.filter(m => !m.isLoading);
                const errorMessage: ChatUIMessage = {
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: t('aiAssistant.error', 'Sorry, an error occurred.'),
                    timestamp: new Date().toISOString(),
                    error: true
                };
                return [...withoutLoading, errorMessage];
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const isAIAvailable = statusData?.available ?? false;

    return (
        <>
            {/* Floating Action Button */}
            <Tooltip title={t('aiAssistant.open', 'Open AI Assistant')}>
                <Fab
                    color="primary"
                    aria-label="ai assistant"
                    onClick={() => setIsOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1000,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        }
                    }}
                >
                    <AIIcon />
                </Fab>
            </Tooltip>

            {/* Chat Drawer */}
            <Drawer
                anchor="right"
                open={isOpen}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        sx: {
                            width: { xs: '100%', sm: 400, md: 450 },
                            maxWidth: '100vw'
                        }
                    }
                }}
            >
                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.default'
                    }}
                >
                    {/* Header */}
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2,
                            borderRadius: 0,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <AIIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {t('aiAssistant.title', 'TaskFlow Assistant')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {statusLoading ? (
                                            <CircularProgress size={12} sx={{ color: 'white' }} />
                                        ) : (
                                            <Chip
                                                label={isAIAvailable ? t('aiAssistant.online', 'Online') : t('aiAssistant.offline', 'Offline')}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    bgcolor: isAIAvailable ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)',
                                                    color: 'white'
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                            <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Paper>

                    {/* Status Alert */}
                    {!isAIAvailable && !statusLoading && (
                        <Alert
                            severity="warning"
                            icon={<InfoIcon />}
                            sx={{ m: 2, borderRadius: 2 }}
                        >
                            {t('aiAssistant.notAvailable', 'AI Assistant is not available. Please make sure Ollama is running.')}
                        </Alert>
                    )}

                    {/* Messages Area */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        {messages.map((message) => (
                            <Box
                                key={message.id}
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    alignItems: 'flex-start',
                                    flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                                }}
                            >
                                <Avatar
                                    src={message.role === 'user' ? user?.avatarUrl : undefined}
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {message.role === 'user' ? (
                                        user?.avatarUrl ? null : <PersonIcon fontSize="small" />
                                    ) : (
                                        <AIIcon fontSize="small" />
                                    )}
                                </Avatar>
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 1.5,
                                        maxWidth: '75%',
                                        bgcolor: message.error
                                            ? 'error.light'
                                            : message.role === 'user'
                                                ? 'primary.main'
                                                : 'background.paper',
                                        color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                                        borderRadius: 2,
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {message.isLoading ? (
                                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                            <CircularProgress size={16} />
                                            <Typography variant="body2">
                                                {t('aiAssistant.thinking', 'Thinking...')}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {message.content}
                                        </Typography>
                                    )}
                                </Paper>
                            </Box>
                        ))}
                        <div ref={messagesEndRef} />
                    </Box>

                    <Divider />

                    {/* Input Area */}
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                            <TextField
                                fullWidth
                                multiline
                                maxRows={3}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('aiAssistant.inputPlaceholder', 'Type your message...')}
                                disabled={!isAIAvailable || sendMessageMutation.isPending}
                                variant="outlined"
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || !isAIAvailable || sendMessageMutation.isPending}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'primary.dark'
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: 'action.disabledBackground'
                                    }
                                }}
                            >
                                {sendMessageMutation.isPending ? (
                                    <CircularProgress size={24} sx={{ color: 'white' }} />
                                ) : (
                                    <SendIcon />
                                )}
                            </IconButton>
                        </Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}
                        >
                            {t('aiAssistant.disclaimer', 'AI responses are generated and may not always be accurate')}
                        </Typography>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};

export default AIAssistantChat;
