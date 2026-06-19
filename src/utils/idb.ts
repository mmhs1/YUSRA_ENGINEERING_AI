import { get, set, update } from 'idb-keyval';

export interface QueuedMessage {
  id: string;
  prompt: string;
  timestamp: number;
}

export const dbQueueMessage = async (msg: QueuedMessage) => {
  await update('offline-queue', (val: QueuedMessage[] = []) => [...val, msg]);
};

export const dbGetQueuedMessages = async (): Promise<QueuedMessage[]> => {
  return (await get('offline-queue')) || [];
};

export const dbClearQueuedMessages = async () => {
  await set('offline-queue', []);
};

export const dbCacheHistory = async (history: any) => {
  await set('chat-history', history);
};

export const dbGetCachedHistory = async () => {
  return (await get('chat-history')) || [];
};
