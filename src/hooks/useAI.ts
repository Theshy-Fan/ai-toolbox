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
    const provider = options.provider || 'openai';
    const key = apiKeys.find((k) => k.provider === provider && k.isValid);

    if (!key) {
      toast.error(`请先设置 ${provider} 的 API Key`);
      return null;
    }

    const decryptedKey = await getDecryptedKey(key.id);
    if (!decryptedKey) {
      toast.error('无法解密 API Key');
      return null;
    }

    return new AIClient(provider, decryptedKey);
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
