import { NextResponse } from 'next/server';

const PROVIDER_CONFIGS = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    headers: (apiKey: string) => ({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    body: (messages: any[], stream: boolean) => ({
      model: 'gpt-4o-mini',
      messages,
      stream,
    }),
  },
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    headers: (apiKey: string) => ({
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    }),
    body: (messages: any[], stream: boolean) => ({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: messages.map((m) => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      })),
      stream,
    }),
  },
  google: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
    }),
    body: (messages: any[], stream: boolean) => ({
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    }),
    getUrlWithKey: (url: string, apiKey: string) => `${url}?key=${apiKey}&alt=sse`,
  },
};

export async function POST(request: Request) {
  try {
    const { provider, apiKey, messages, stream } = await request.json();

    if (!provider || !apiKey || !messages) {
      return NextResponse.json(
        { message: '缺少必要参数' },
        { status: 400 }
      );
    }

    const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
    if (!config) {
      return NextResponse.json(
        { message: '不支持的 AI 服务商' },
        { status: 400 }
      );
    }

    const url = 'getUrlWithKey' in config
      ? config.getUrlWithKey(config.url, apiKey)
      : config.url;

    const response = await fetch(url, {
      method: 'POST',
      headers: config.headers(apiKey),
      body: JSON.stringify(config.body(messages, stream)),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API error:', error);
      return NextResponse.json(
        { message: `AI API 错误: ${response.status}` },
        { status: response.status }
      );
    }

    if (stream) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    const data = await response.json();

    // 标准化响应格式
    let content = '';
    if (provider === 'openai') {
      content = data.choices?.[0]?.message?.content || '';
    } else if (provider === 'anthropic') {
      content = data.content?.[0]?.text || '';
    } else if (provider === 'google') {
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    return NextResponse.json({
      content,
      usage: data.usage,
    });
  } catch (error) {
    console.error('AI route error:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
