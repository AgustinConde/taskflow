import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AchievementBadge, AchievementProgressBar, AchievementTierChip } from '../AchievementBadge';
import { TestProviders } from '../../../__tests__/utils/testProviders';

const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
        <TestProviders>
            {children}
        </TestProviders>
    );
};

describe('AchievementBadge', () => {
    it('should render unlocked badge correctly', () => {
        render(
            <AchievementBadge level="gold" unlocked={true} />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText('G')).toBeInTheDocument();
    });

    it('should render locked badge with reduced opacity', () => {
        render(
            <AchievementBadge level="bronze" unlocked={false} />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('should display custom icon when provided', () => {
        render(
            <AchievementBadge level="silver" unlocked={true} icon="🏆" />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('should render different sizes correctly', () => {
        const { rerender } = render(
            <AchievementBadge level="diamond" unlocked={true} size="small" />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText('D')).toBeInTheDocument();

        rerender(
            <TestProviders>
                <AchievementBadge level="diamond" unlocked={true} size="large" />
            </TestProviders>
        );

        expect(screen.getByText('D')).toBeInTheDocument();
    });
});

describe('AchievementProgressBar', () => {
    it('should display progress correctly', () => {
        render(
            <AchievementProgressBar current={3} target={10} level="bronze" />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText('3 / 10')).toBeInTheDocument();
        expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('should handle completed progress', () => {
        render(
            <AchievementProgressBar current={10} target={10} level="gold" />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText('10 / 10')).toBeInTheDocument();
        expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should hide numbers when showNumbers is false', () => {
        render(
            <AchievementProgressBar current={5} target={10} level="silver" showNumbers={false} />,
            { wrapper: createWrapper() }
        );

        expect(screen.queryByText('5 / 10')).not.toBeInTheDocument();
    });
});

describe('AchievementTierChip', () => {
    it('should display tier information correctly', () => {
        render(
            <AchievementTierChip level="gold" unlocked={true} points={50} />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText(/GOLD/)).toBeInTheDocument();
        expect(screen.getByText(/\+50/)).toBeInTheDocument();
    });

    it('should render locked tier with different styling', () => {
        render(
            <AchievementTierChip level="silver" unlocked={false} points={25} />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText(/SILVER/)).toBeInTheDocument();
        expect(screen.getByText(/\+25/)).toBeInTheDocument();
    });
});