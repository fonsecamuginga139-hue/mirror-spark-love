import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'financeflow-offline';
const DB_VERSION = 1;

interface PendingOperation {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  createdAt: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Cache stores
        if (!db.objectStoreNames.contains('transactions')) {
          db.createObjectStore('transactions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cards')) {
          db.createObjectStore('cards', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('goals')) {
          db.createObjectStore('goals', { keyPath: 'id' });
        }
        // Pending sync store
        if (!db.objectStoreNames.contains('pendingSync')) {
          db.createObjectStore('pendingSync', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// Save data to offline cache
export const saveToOfflineCache = async <T extends { id: string }>(
  table: 'transactions' | 'categories' | 'cards' | 'goals',
  data: T[]
): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction(table, 'readwrite');
    const store = tx.objectStore(table);
    
    // Clear existing data
    await store.clear();
    
    // Add new data
    for (const item of data) {
      await store.put(item);
    }
    
    await tx.done;
  } catch (error) {
    console.error(`Error saving ${table} to offline cache:`, error);
  }
};

// Get data from offline cache
export const getFromOfflineCache = async <T>(
  table: 'transactions' | 'categories' | 'cards' | 'goals'
): Promise<T[]> => {
  try {
    const db = await getDB();
    return await db.getAll(table) as T[];
  } catch (error) {
    console.error(`Error getting ${table} from offline cache:`, error);
    return [];
  }
};

// Add pending operation
export const addPendingOperation = async (
  table: string,
  operation: 'insert' | 'update' | 'delete',
  data: any
): Promise<void> => {
  try {
    const db = await getDB();
    const pendingOp: PendingOperation = {
      id: crypto.randomUUID(),
      table,
      operation,
      data,
      createdAt: new Date().toISOString(),
    };
    await db.put('pendingSync', pendingOp);
  } catch (error) {
    console.error('Error adding pending operation:', error);
  }
};

// Get all pending operations
export const getPendingOperations = async (): Promise<PendingOperation[]> => {
  try {
    const db = await getDB();
    return await db.getAll('pendingSync');
  } catch (error) {
    console.error('Error getting pending operations:', error);
    return [];
  }
};

// Remove a pending operation
export const removePendingOperation = async (id: string): Promise<void> => {
  try {
    const db = await getDB();
    await db.delete('pendingSync', id);
  } catch (error) {
    console.error('Error removing pending operation:', error);
  }
};

// Clear all pending operations
export const clearPendingOperations = async (): Promise<void> => {
  try {
    const db = await getDB();
    await db.clear('pendingSync');
  } catch (error) {
    console.error('Error clearing pending operations:', error);
  }
};

// Get pending count
export const getPendingCount = async (): Promise<number> => {
  try {
    const db = await getDB();
    return await db.count('pendingSync');
  } catch (error) {
    console.error('Error getting pending count:', error);
    return 0;
  }
};
