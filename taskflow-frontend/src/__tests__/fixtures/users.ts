import { faker } from '@faker-js/faker';

export interface MockUser {
    id: number;
    username: string;
    email: string;
}

export const createMockUser = (overrides?: Partial<MockUser>): MockUser => ({
    id: faker.number.int({ min: 1, max: 1000 }),
    username: faker.internet.username(),
    email: faker.internet.email(),
    ...overrides
});

export const mockUsers: MockUser[] = [
    createMockUser({ id: 1, username: 'testuser', email: 'test@example.com' }),
    createMockUser({ id: 2, username: 'john_doe', email: 'john@example.com' }),
];
