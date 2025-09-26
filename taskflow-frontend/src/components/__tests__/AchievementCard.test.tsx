import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AchievementCard } from '../achievements/AchievementCard';
import { TestProviders } from '../../__tests__/utils/testProviders';

vi.mock('@mui/icons-material', () => ({
    EmojiEvents: () => <div data-testid="emoji-events-icon">🏆</div>,
    Star: () => <div data-testid="star-icon">⭐</div>,
    TrendingUp: () => <div data-testid="trending-up-icon">📈</div>,
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
});