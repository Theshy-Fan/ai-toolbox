'use client';

import { useState, useEffect, useCallback } from 'react';
import { get, put, remove, STORES } from '@/lib/storage';

export function useStorage<T>(storeName: string, key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const stored = await get<T>(storeName, key);
        if (stored !== undefined) {
          setValue(stored);
        }
      } catch (error) {
        console.error('Failed to load from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [storeName, key]);

  const setStoredValue = useCallback(
    async (newValue: T | ((prev: T) => T)) => {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      try {
        await put(storeName, { key, value: valueToStore });
      } catch (error) {
        console.error('Failed to save to storage:', error);
      }
    },
    [storeName, key, value]
  );

  const removeValue = useCallback(async () => {
    setValue(initialValue);
    try {
      await remove(storeName, key);
    } catch (error) {
      console.error('Failed to remove from storage:', error);
    }
  }, [storeName, key, initialValue]);

  return { value, setValue: setStoredValue, removeValue, isLoading };
}
