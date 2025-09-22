export class OfflineStorage {
    private db: IDBDatabase | null = null;
    private readonly dbName = 'TaskFlowOffline';
    private readonly version = 1;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains('tasks')) {
                    const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
                    tasksStore.createIndex('categoryId', 'categoryId', { unique: false });
                    tasksStore.createIndex('isCompleted', 'isCompleted', { unique: false });
                    tasksStore.createIndex('dueDate', 'dueDate', { unique: false });
                }

                if (!db.objectStoreNames.contains('categories')) {
                    db.createObjectStore('categories', { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains('pendingChanges')) {
                    const pendingStore = db.createObjectStore('pendingChanges', { autoIncrement: true });
                    pendingStore.createIndex('type', 'type', { unique: false });
                    pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains('metadata')) {
                    db.createObjectStore('metadata', { keyPath: 'key' });
                }
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

    async getAll<T>(storeName: string): Promise<T[]> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async put<T>(storeName: string, data: T): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async delete(storeName: string, key: any): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async clear(storeName: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async getTasks(): Promise<any[]> {
        return this.getAll('tasks');
    }

    async saveTask(task: any): Promise<void> {
        await this.put('tasks', task);
    }

    async deleteTask(taskId: number): Promise<void> {
        await this.delete('tasks', taskId);
    }

    async getCategories(): Promise<any[]> {
        return this.getAll('categories');
    }

    async saveCategory(category: any): Promise<void> {
        await this.put('categories', category);
    }

    async deleteCategory(categoryId: number): Promise<void> {
        await this.delete('categories', categoryId);
    }

    async addPendingChange(change: {
        type: 'CREATE' | 'UPDATE' | 'DELETE';
        entity: 'task' | 'category';
        data: any;
        entityId?: number;
    }): Promise<void> {
        const pendingChange = {
            ...change,
            timestamp: Date.now()
        };

        await this.put('pendingChanges', pendingChange);
    }

    async getPendingChanges(): Promise<any[]> {
        return this.getAll('pendingChanges');
    }

    async clearPendingChanges(): Promise<void> {
        await this.clear('pendingChanges');
    }

    async setLastSync(timestamp: number): Promise<void> {
        await this.put('metadata', { key: 'lastSync', value: timestamp });
    }

    async getLastSync(): Promise<number | null> {
        const result = await this.get('metadata', 'lastSync');
        return result ? (result as any).value : null;
    }

    async setOfflineMode(enabled: boolean): Promise<void> {
        await this.put('metadata', { key: 'offlineMode', value: enabled });
    }

    async isOfflineMode(): Promise<boolean> {
        const result = await this.get('metadata', 'offlineMode');
        return result ? (result as any).value : false;
    }
}

export const offlineStorage = new OfflineStorage();