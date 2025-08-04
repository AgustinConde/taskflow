import { faker } from '@faker-js/faker';
import type { Task } from '../../types/Task';

export const createMockTask = (overrides?: Partial<Task>): Task => ({
    id: faker.number.int({ min: 1, max: 1000 }),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    isCompleted: faker.datatype.boolean(),
    dueDate: faker.date.future().toISOString(),
    categoryId: faker.number.int({ min: 1, max: 5 }),
    createdAt: faker.date.past().toISOString(),
    categoryName: faker.lorem.word(),
    ...overrides
});

export const mockTasks: Task[] = [
    createMockTask({
        id: 1,
        title: 'Test Task 1',
        description: 'First test task',
        isCompleted: false,
        categoryId: 1,
        categoryName: 'Work'
    }),
    createMockTask({
        id: 2,
        title: 'Test Task 2',
        description: 'Second test task',
        isCompleted: true,
        categoryId: 2,
        categoryName: 'Personal'
    }),
    ...Array.from({ length: 8 }, (_, index) => createMockTask({ id: index + 3 }))
];
