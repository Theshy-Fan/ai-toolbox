import type { AIProvider, AIRequest, AIResponse } from '@/types';

interface StreamCallbacks {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export class AIClient {
  private provider: AIProvider;
  private apiKey: string;

  constructor(provider: AIProvider, apiKey: string) {
    this.provider = provider;
    this.apiKey = apiKey;
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: this.provider,
        apiKey: this.apiKey,
        messages: request.messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'AI 请求失败');
    }

    return response.json();
  }

  async chatStream(request: AIRequest, callbacks: StreamCallbacks): Promise<void> {
    callbacks.onStart?.();

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: this.provider,
          apiKey: this.apiKey,
          messages: request.messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'AI 请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content ||
                             parsed.content?.[0]?.text ||
                             '';
              if (content) {
                fullText += content;
                callbacks.onToken?.(content);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      callbacks.onComplete?.(fullText);
    } catch (error) {
      callbacks.onError?.(error as Error);
    }
  }
}
