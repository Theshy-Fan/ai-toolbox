import { create } from 'zustand';
import type { ApiKey, AIProvider } from '@/types';
import { getAll, put, remove, STORES, encrypt, decrypt } from '@/lib/storage';

const MASTER_KEY = 'aitoolbox-master-key';

interface ApiKeyState {
  apiKeys: ApiKey[];
  isLoading: boolean;
  loadKeys: () => Promise<void>;
  addKey: (provider: AIProvider, name: string, key: string) => Promise<void>;
  removeKey: (id: string) => Promise<void>;
  validateKey: (id: string) => Promise<boolean>;
  getDecryptedKey: (id: string) => Promise<string | null>;
}

export const useApiKeyStore = create<ApiKeyState>((set, get) => ({
  apiKeys: [],
  isLoading: false,

  loadKeys: async () => {
    set({ isLoading: true });
    try {
      const keys = await getAll<ApiKey>(STORES.API_KEYS);
      set({ apiKeys: keys, isLoading: false });
    } catch (error) {
      console.error('Failed to load API keys:', error);
      set({ isLoading: false });
    }
  },

  addKey: async (provider: AIProvider, name: string, key: string) => {
    const encryptedKey = await encrypt(key, MASTER_KEY);
    const newKey: ApiKey = {
      id: crypto.randomUUID(),
      provider,
      name,
      key: encryptedKey,
      isValid: false,
      createdAt: Date.now(),
    };

    await put(STORES.API_KEYS, newKey);
    set((state) => ({ apiKeys: [...state.apiKeys, newKey] }));
  },

  removeKey: async (id: string) => {
    await remove(STORES.API_KEYS, id);
    set((state) => ({ apiKeys: state.apiKeys.filter((k) => k.id !== id) }));
  },

  validateKey: async (id: string) => {
    const key = get().apiKeys.find((k) => k.id === id);
    if (!key) return false;

    try {
      const decryptedKey = await decrypt(key.key, MASTER_KEY);
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: key.provider, key: decryptedKey }),
      });

      const { valid } = await response.json();
      const updatedKey = { ...key, isValid: valid };
      await put(STORES.API_KEYS, updatedKey);

      set((state) => ({
        apiKeys: state.apiKeys.map((k) => (k.id === id ? updatedKey : k)),
      }));

      return valid;
    } catch (error) {
      console.error('Failed to validate key:', error);
      return false;
    }
  },

  getDecryptedKey: async (id: string) => {
    const key = get().apiKeys.find((k) => k.id === id);
    if (!key) return null;

    try {
      return await decrypt(key.key, MASTER_KEY);
    } catch (error) {
      console.error('Failed to decrypt key:', error);
      return null;
    }
  },
}));
