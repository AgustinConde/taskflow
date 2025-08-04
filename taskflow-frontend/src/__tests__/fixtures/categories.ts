import { faker } from '@faker-js/faker';
import type { Category } from '../../types/Category';

export const createMockCategory = (overrides?: Partial<Category>): Category => ({
    id: faker.number.int({ min: 1, max: 100 }),
    name: faker.lorem.word(),
    color: faker.color.rgb(),
    description: faker.lorem.sentence(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    userId: 1,
    ...overrides
}); export const mockCategories: Category[] = [
    createMockCategory({ id: 1, name: 'Work', color: '#3B82F6' }),
    createMockCategory({ id: 2, name: 'Personal', color: '#10B981' }),
    createMockCategory({ id: 3, name: 'Shopping', color: '#F59E0B' }),
    createMockCategory({ id: 4, name: 'Health', color: '#EF4444' }),
    createMockCategory({ id: 5, name: 'Learning', color: '#8B5CF6' }),
];
