'use client';

import { useState, useCallback } from 'react';
import { useApiKeyStore } from '@/stores/apiKeyStore';
import { AIClient } from '@/lib/ai/client';
import type { AIProvider } from '@/types';
import { toast } from 'sonner';

interface UseAIOptions {
  provider?: AIProvider;
}

export function useAI(options: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const { apiKeys, getDecryptedKey } = useApiKeyStore();

  const getClient = useCallback(async (): Promise<AIClient | null> => {
    if (options.provider) {
      const key = apiKeys.find((k) => k.provider === options.provider);
      if (!key) {
        toast.error(`请先在设置页面添加 ${options.provider} 的 API Key`);
        return null;
      }
      const decryptedKey = await getDecryptedKey(key.id);
      if (!decryptedKey) {
        toast.error('无法解密 API Key');
        return null;
      }
      return new AIClient(options.provider, decryptedKey);
    }

    // 没有指定 provider，自动选择第一个可用的 Key
    const availableKey = apiKeys[0];
    if (!availableKey) {
      toast.error('请先在设置页面添加 API Key');
      return null;
    }

    const decryptedKey = await getDecryptedKey(availableKey.id);
    if (!decryptedKey) {
      toast.error('无法解密 API Key');
      return null;
    }

    return new AIClient(availableKey.provider, decryptedKey);
  }, [apiKeys, getDecryptedKey, options.provider]);

  const chat = useCallback(
    async (messages: { role: string; content: string }[]): Promise<string | null> => {
      const client = await getClient();
      if (!client) return null;

      setIsLoading(true);
      try {
        const response = await client.chat({ provider: options.provider || 'openai', messages });
        return response.content;
      } catch (error) {
        console.error('AI chat error:', error);
        toast.error('AI 请求失败');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getClient, options.provider]
  );

  const chatStream = useCallback(
    async (
      messages: { role: string; content: string }[],
      onToken?: (token: string) => void
    ): Promise<string | null> => {
      const client = await getClient();
      if (!client) return null;

      setIsLoading(true);
      setStreamingText('');

      return new Promise((resolve) => {
        client.chatStream(
          { provider: options.provider || 'openai', messages, stream: true },
          {
            onToken: (token) => {
              setStreamingText((prev) => prev + token);
              onToken?.(token);
            },
            onComplete: (fullText) => {
              setIsLoading(false);
              setStreamingText('');
              resolve(fullText);
            },
            onError: (error) => {
              console.error('AI stream error:', error);
              toast.error('AI 请求失败');
              setIsLoading(false);
              setStreamingText('');
              resolve(null);
            },
          }
        );
      });
    },
    [getClient, options.provider]
  );

  return {
    isLoading,
    streamingText,
    chat,
    chatStream,
  };
}
