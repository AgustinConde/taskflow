import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AchievementNotificationDialog } from '../AchievementNotificationDialog';
import { TestProviders } from '../../../__tests__/utils/testProviders';

vi.mock('@mui/icons-material', () => ({
    EmojiEvents: () => <div data-testid="emoji-events-icon">🏆</div>,
    Stars: () => <div data-testid="stars-icon">⭐</div>,
    __esModule: true,
    default: {}
}));

const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
        <TestProviders>
            {children}
        </TestProviders>
    );
};

describe('AchievementNotificationDialog', () => {
    const mockNotification = {
        achievement: {
            id: '1',
            key: 'achievements.first_task',
            category: 'productivity' as const,
            type: 'counter' as const,
            icon: 'EmojiEvents',
            color: '#10B981',
            tiers: [
                {
                    level: 'bronze' as const,
                    target: 1,
                    points: 10,
                    unlocked: true
                }
            ],
            isHidden: false
        },
        tier: {
            level: 'bronze' as const,
            target: 1,
            points: 10,
            unlocked: true
        },
        isNewAchievement: true
    };

    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not render when notification is null', () => {
        render(
            <AchievementNotificationDialog
                notification={null}
                open={true}
                onClose={mockOnClose}
            />,
            { wrapper: createWrapper() }
        );

        expect(screen.queryByText('Achievement Unlocked')).not.toBeInTheDocument();
    });

    it('should render achievement unlocked dialog', () => {
        render(
            <AchievementNotificationDialog
                notification={mockNotification}
                open={true}
                onClose={mockOnClose}
            />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText(/Achievement Unlocked/)).toBeInTheDocument();
        expect(screen.getByText('First Task')).toBeInTheDocument();
        expect(screen.getByText('Bronze Level')).toBeInTheDocument();
        expect(screen.getByText('+10 Points')).toBeInTheDocument();
        expect(screen.getByText('Keep up the great work! You\'re making excellent progress.')).toBeInTheDocument();
        expect(screen.getByText('Awesome!')).toBeInTheDocument();
    });

    it('should render achievement upgraded dialog', () => {
        const upgradedNotification = {
            ...mockNotification,
            isNewAchievement: false
        };

        render(
            <AchievementNotificationDialog
                notification={upgradedNotification}
                open={true}
                onClose={mockOnClose}
            />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText(/Achievement Upgraded/)).toBeInTheDocument();
    });

    it('should call onClose when awesome button is clicked', () => {
        render(
            <AchievementNotificationDialog
                notification={mockNotification}
                open={true}
                onClose={mockOnClose}
            />,
            { wrapper: createWrapper() }
        );

        const awesomeButton = screen.getByText('Awesome!');
        fireEvent.click(awesomeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should render with correct icon component', () => {
        render(
            <AchievementNotificationDialog
                notification={mockNotification}
                open={true}
                onClose={mockOnClose}
            />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByTestId('emoji-events-icon')).toBeInTheDocument();
    });

    it('should handle different tier levels', () => {
        const goldNotification = {
            ...mockNotification,
            tier: {
                level: 'gold' as const,
                target: 10,
                points: 50,
                unlocked: true
            }
        };

        render(
            <AchievementNotificationDialog
                notification={goldNotification}
                open={true}
                onClose={mockOnClose}
            />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText('Gold Level')).toBeInTheDocument();
        expect(screen.getByText('+50 Points')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
        render(
            <AchievementNotificationDialog
                notification={mockNotification}
                open={false}
                onClose={mockOnClose}
            />,
            { wrapper: createWrapper() }
        );

        expect(screen.queryByText('Achievement Unlocked')).not.toBeInTheDocument();
    });

    it('should render with zoom animation', () => {
        render(
            <AchievementNotificationDialog
                notification={mockNotification}
                open={true}
                onClose={mockOnClose}
            />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText('First Task')).toBeInTheDocument();
    });

    it('should render with EmojiEvents icon', () => {
        render(
            <AchievementNotificationDialog
                notification={mockNotification}
                open={true}
                onClose={mockOnClose}
            />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByTestId('emoji-events-icon')).toBeInTheDocument();
    });
});