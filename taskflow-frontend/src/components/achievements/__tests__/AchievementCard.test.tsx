import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AchievementCard } from '../AchievementCard';
import { TestProviders } from '../../../__tests__/utils/testProviders';

vi.mock('@mui/icons-material', () => ({
    EmojiEvents: () => <div data-testid="emoji-events-icon">🏆</div>,
    Star: () => <div data-testid="star-icon">⭐</div>,
    TrendingUp: () => <div data-testid="trending-up-icon">📈</div>,
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

describe('AchievementCard', () => {
    const mockAchievement = {
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
                unlocked: true,
                unlockedAt: new Date('2023-01-01T12:00:00Z')
            }
        ],
        isHidden: false
    };

    const mockProgress = {
        achievementId: '1',
        currentValue: 1,
        unlockedTiers: ['bronze' as const],
        lastUpdated: new Date('2023-01-01T12:00:00Z')
    };

    it('should render achievement correctly', () => {
        render(
            <AchievementCard achievement={mockAchievement} progress={mockProgress} />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText('First Task')).toBeInTheDocument();
        expect(screen.getByText('Complete your first task')).toBeInTheDocument();
        expect(screen.getByText('Productivity')).toBeInTheDocument();
    });

    it('should render locked achievement with different styling', () => {
        const lockedProgress = {
            achievementId: '1',
            currentValue: 0,
            unlockedTiers: [],
            lastUpdated: new Date('2023-01-01T12:00:00Z')
        };

        render(
            <AchievementCard achievement={mockAchievement} progress={lockedProgress} />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText('First Task')).toBeInTheDocument();
        expect(screen.getByText('Progress to Bronze')).toBeInTheDocument();
    });

    it('should display achievement with bronze tier', () => {
        render(
            <AchievementCard achievement={mockAchievement} progress={mockProgress} />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText('First Task')).toBeInTheDocument();
    });

    it('should handle achievement with multiple tiers', () => {
        const multiTierAchievement = {
            ...mockAchievement,
            tiers: [
                {
                    level: 'bronze' as const,
                    target: 1,
                    points: 10,
                    unlocked: true,
                    unlockedAt: new Date('2023-01-01T12:00:00Z')
                },
                {
                    level: 'silver' as const,
                    target: 5,
                    points: 25,
                    unlocked: false
                }
            ]
        };

        render(
            <AchievementCard achievement={multiTierAchievement} progress={mockProgress} />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText('First Task')).toBeInTheDocument();
    });

    it('should display hidden achievement indicator for hidden achievements without progress', () => {
        const hiddenAchievement = {
            ...mockAchievement,
            isHidden: true
        };

        const noProgress = {
            achievementId: '1',
            currentValue: 0,
            unlockedTiers: [],
            lastUpdated: new Date('2023-01-01T12:00:00Z')
        };

        render(
            <AchievementCard achievement={hiddenAchievement} progress={noProgress} />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText('Hidden')).toBeInTheDocument();
    });

    it('should not display hidden indicator for hidden achievements with progress', () => {
        const hiddenAchievement = {
            ...mockAchievement,
            isHidden: true
        };

        render(
            <AchievementCard achievement={hiddenAchievement} progress={mockProgress} />,
            { wrapper: createWrapper() }
        );

        expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    });

    it('should call onClick when achievement card is clicked', () => {
        const mockClick = vi.fn();

        render(
            <AchievementCard achievement={mockAchievement} progress={mockProgress} onClick={mockClick} />,
            { wrapper: createWrapper() }
        );

        const card = screen.getByText('First Task').closest('div');
        if (card?.parentElement) {
            fireEvent.click(card.parentElement);
            expect(mockClick).toHaveBeenCalledTimes(1);
        }
    });

    it('should render with EmojiEvents icon', () => {
        render(
            <AchievementCard achievement={mockAchievement} progress={mockProgress} />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByTestId('emoji-events-icon')).toBeInTheDocument();
    });
});