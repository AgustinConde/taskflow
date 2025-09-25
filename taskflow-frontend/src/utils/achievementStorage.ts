import type {
    Achievement,
    AchievementProgress,
    AchievementEvent
} from '../types/Achievement';

export class AchievementStorage {
    private db: IDBDatabase | null = null;
    private readonly dbName = 'TaskFlowAchievements';
    private readonly version = 2;
    private currentUserId: string | null = null;

    setUserId(userId: string | null): void {
        this.currentUserId = userId;
    }


    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Failed to open IndexedDB database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (db.objectStoreNames.contains('achievements')) {
                    db.deleteObjectStore('achievements');
                }
                if (db.objectStoreNames.contains('progress')) {
                    db.deleteObjectStore('progress');
                }
                if (db.objectStoreNames.contains('events')) {
                    db.deleteObjectStore('events');
                }

                const achievementsStore = db.createObjectStore('achievements', { keyPath: 'id' });
                achievementsStore.createIndex('category', 'category', { unique: false });

                const progressStore = db.createObjectStore('progress', { keyPath: ['userId', 'achievementId'] });
                progressStore.createIndex('userId', 'userId', { unique: false });
                progressStore.createIndex('achievementId', 'achievementId', { unique: false });
                progressStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });

                const eventsStore = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
                eventsStore.createIndex('userId', 'userId', { unique: false });
                eventsStore.createIndex('type', 'type', { unique: false });
                eventsStore.createIndex('timestamp', 'timestamp', { unique: false });
                eventsStore.createIndex('userId_type', ['userId', 'type'], { unique: false });
            };
        });
    }

    async get<T>(storeName: string, key: any): Promise<T | undefined> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    private async getAll<T>(storeName: string): Promise<T[]> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    private async put<T>(storeName: string, data: T): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async getAchievements(): Promise<Achievement[]> {
        return this.getAll<Achievement>('achievements');
    }

    async initializeDefaultAchievements(achievements: Achievement[]): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction(['achievements'], 'readwrite');
        const store = transaction.objectStore('achievements');

        for (const achievement of achievements) {
            await new Promise<void>((resolve, reject) => {
                const request = store.put(achievement);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve();
            });
        }
    }

    async getProgress(): Promise<AchievementProgress[]> {
        if (!this.currentUserId) return [];

        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['progress'], 'readonly');
            const store = transaction.objectStore('progress');
            const index = store.index('userId');
            const request = index.getAll(this.currentUserId);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async updateProgress(progress: AchievementProgress): Promise<void> {
        if (!this.currentUserId) throw new Error('User ID not set');

        const progressWithUser = {
            ...progress,
            userId: this.currentUserId
        };
        return this.put('progress', progressWithUser);
    }

    async addEvent(event: AchievementEvent): Promise<void> {
        if (!this.currentUserId) throw new Error('User ID not set');
        if (!this.db) throw new Error('Database not initialized');

        const eventWithUser = {
            ...event,
            userId: this.currentUserId
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['events'], 'readwrite');
            const store = transaction.objectStore('events');
            const request = store.add(eventWithUser);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async getEvents(limit?: number): Promise<AchievementEvent[]> {
        if (!this.currentUserId) return [];
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['events'], 'readonly');
            const store = transaction.objectStore('events');
            const index = store.index('userId');

            const request = index.getAll(this.currentUserId);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                let events = request.result as AchievementEvent[];
                events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                if (limit) {
                    events = events.slice(0, limit);
                }

                resolve(events);
            };
        });
    }

    async clearAll(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction(['achievements', 'progress', 'events'], 'readwrite');

        await Promise.all([
            new Promise<void>((resolve, reject) => {
                const request = transaction.objectStore('achievements').clear();
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve();
            }),
            new Promise<void>((resolve, reject) => {
                const request = transaction.objectStore('progress').clear();
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve();
            }),
            new Promise<void>((resolve, reject) => {
                const request = transaction.objectStore('events').clear();
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve();
            })
        ]);
    }
}

export const achievementStorage = new AchievementStorage();