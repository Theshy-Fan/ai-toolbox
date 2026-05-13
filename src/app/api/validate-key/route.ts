import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { provider, key } = await request.json();

    if (!provider || !key) {
      return NextResponse.json(
        { valid: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    let valid = false;

    switch (provider) {
      case 'openai':
        valid = await validateOpenAI(key);
        break;
      case 'anthropic':
        valid = await validateAnthropic(key);
        break;
      case 'google':
        valid = await validateGoogle(key);
        break;
      case 'deepseek':
        valid = await validateDeepSeek(key);
        break;
      default:
        return NextResponse.json(
          { valid: false, message: '不支持的服务商' },
          { status: 400 }
        );
    }

    return NextResponse.json({ valid });
  } catch (error) {
    console.error('Validate key error:', error);
    return NextResponse.json({ valid: false });
  }
}

async function validateOpenAI(key: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function validateAnthropic(key: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      }),
    });
    return response.status !== 401;
  } catch {
    return false;
  }
}

async function validateGoogle(key: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function validateDeepSeek(key: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.deepseek.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}
