import { describe, it, expect } from 'vitest';
import { calculateUserLevel, USER_LEVELS } from '../Achievement';

describe('Achievement types', () => {
    describe('calculateUserLevel', () => {
        it('should return level 1 for 0 points', () => {
            const result = calculateUserLevel(0);

            expect(result.level).toBe(1);
            expect(result.titleKey).toBe('achievementsDashboard.beginner');
            expect(result.experiencePoints).toBe(0);
            expect(result.nextLevelPoints).toBe(100);
            expect(result.progress).toBe(0);
        });

        it('should return level 2 for 150 points', () => {
            const result = calculateUserLevel(150);

            expect(result.level).toBe(2);
            expect(result.titleKey).toBe('achievementsDashboard.organized');
            expect(result.experiencePoints).toBe(50); // 150 - 100
            expect(result.nextLevelPoints).toBe(200); // 300 - 100
            expect(result.progress).toBe(25); // (50 / 200) * 100
        });

        it('should return max level for very high points', () => {
            const result = calculateUserLevel(5000);

            expect(result.level).toBe(8);
            expect(result.titleKey).toBe('achievementsDashboard.legend');
            expect(result.experiencePoints).toBe(2000); // 5000 - 3000
            expect(result.nextLevelPoints).toBe(0); // No next level
            expect(result.progress).toBe(100); // Max progress
        });

        it('should handle exact level boundary points', () => {
            const result = calculateUserLevel(300); // Exactly level 3

            expect(result.level).toBe(3);
            expect(result.titleKey).toBe('achievementsDashboard.productive');
            expect(result.experiencePoints).toBe(0); // 300 - 300
            expect(result.nextLevelPoints).toBe(300); // 600 - 300
            expect(result.progress).toBe(0);
        });

        it('should handle negative points (fallback to USER_LEVELS[0])', () => {
            const result = calculateUserLevel(-10);

            expect(result.level).toBe(1);
            expect(result.titleKey).toBe('achievementsDashboard.beginner');
            expect(result.experiencePoints).toBe(-10); // -10 - 0
            expect(result.nextLevelPoints).toBe(100);
        });

        it('should handle points that exactly match max level threshold', () => {
            const result = calculateUserLevel(3000); // Exactly max level

            expect(result.level).toBe(8);
            expect(result.titleKey).toBe('achievementsDashboard.legend');
            expect(result.experiencePoints).toBe(0); // 3000 - 3000
            expect(result.nextLevelPoints).toBe(0); // No next level
            expect(result.progress).toBe(100);
        });

        it('should handle intermediate levels correctly', () => {
            const result = calculateUserLevel(800); // Level 4 range (600-1000)

            expect(result.level).toBe(4);
            expect(result.titleKey).toBe('achievementsDashboard.efficient');
            expect(result.experiencePoints).toBe(200); // 800 - 600
            expect(result.nextLevelPoints).toBe(400); // 1000 - 600
            expect(result.progress).toBe(50); // (200 / 400) * 100
        });
    });

    describe('USER_LEVELS constants', () => {
        it('should have correct structure for USER_LEVELS', () => {
            expect(USER_LEVELS).toHaveLength(8);
            expect(USER_LEVELS[0]).toEqual({
                level: 1,
                minPoints: 0,
                titleKey: 'achievementsDashboard.beginner'
            });
            expect(USER_LEVELS[7]).toEqual({
                level: 8,
                minPoints: 3000,
                titleKey: 'achievementsDashboard.legend'
            });
        });

        it('should have levels in ascending order', () => {
            for (let i = 1; i < USER_LEVELS.length; i++) {
                expect(USER_LEVELS[i].minPoints).toBeGreaterThan(USER_LEVELS[i - 1].minPoints);
                expect(USER_LEVELS[i].level).toBe(USER_LEVELS[i - 1].level + 1);
            }
        });
    });
});