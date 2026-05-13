import { NextResponse } from 'next/server';

interface ProviderValidator {
  url: string | ((key: string) => string);
  headers: (key: string) => Record<string, string>;
  method?: string;
  body?: string;
}

const VALIDATORS: Record<string, ProviderValidator> = {
  openai: {
    url: 'https://api.openai.com/v1/models',
    headers: (key: string) => ({ Authorization: `Bearer ${key}` }),
  },
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    headers: (key: string) => ({
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    }),
    method: 'POST',
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'test' }],
    }),
  },
  google: {
    url: (key: string) =>
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
    headers: () => ({}),
  },
  deepseek: {
    url: 'https://api.deepseek.com/v1/models',
    headers: (key: string) => ({ Authorization: `Bearer ${key}` }),
  },
  kimi: {
    url: 'https://api.moonshot.cn/v1/models',
    headers: (key: string) => ({ Authorization: `Bearer ${key}` }),
  },
  qwen: {
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/models',
    headers: (key: string) => ({ Authorization: `Bearer ${key}` }),
  },
  zhipu: {
    url: 'https://open.bigmodel.cn/api/paas/v4/models',
    headers: (key: string) => ({ Authorization: `Bearer ${key}` }),
  },
  moonshot: {
    url: 'https://api.moonshot.cn/v1/models',
    headers: (key: string) => ({ Authorization: `Bearer ${key}` }),
  },
  baidu: {
    url: 'https://qianfan.baidubce.com/v2/models',
    headers: (key: string) => ({ Authorization: `Bearer ${key}` }),
  },
  bytedance: {
    url: 'https://ark.cn-beijing.volces.com/api/v3/models',
    headers: (key: string) => ({ Authorization: `Bearer ${key}` }),
  },
  mistral: {
    url: 'https://api.mistral.ai/v1/models',
    headers: (key: string) => ({ Authorization: `Bearer ${key}` }),
  },
  grok: {
    url: 'https://api.x.ai/v1/models',
    headers: (key: string) => ({ Authorization: `Bearer ${key}` }),
  },
  yi: {
    url: 'https://api.lingyiwanwu.com/v1/models',
    headers: (key: string) => ({ Authorization: `Bearer ${key}` }),
  },
  minimax: {
    url: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
    headers: (key: string) => ({ Authorization: `Bearer ${key}` }),
    method: 'POST',
    body: JSON.stringify({
      model: 'MiniMax-Text-01',
      messages: [{ role: 'user', content: 'test' }],
    }),
  },
};

export async function POST(request: Request) {
  try {
    const { provider, key } = await request.json();

    if (!provider || !key) {
      return NextResponse.json(
        { valid: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    const validator = VALIDATORS[provider];
    if (!validator) {
      return NextResponse.json(
        { valid: false, message: '不支持的服务商' },
        { status: 400 }
      );
    }

    const url = typeof validator.url === 'function' ? validator.url(key) : validator.url;

    const response = await fetch(url, {
      method: validator.method || 'GET',
      headers: validator.headers(key),
      body: validator.body,
    });

    return NextResponse.json({ valid: response.ok || response.status !== 401 });
  } catch (error) {
    console.error('Validate key error:', error);
    return NextResponse.json({ valid: false });
  }
}
