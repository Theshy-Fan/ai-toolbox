'use client';

import { useEffect } from 'react';
import { useApiKeyStore } from '@/stores/apiKeyStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Key } from 'lucide-react';
import Link from 'next/link';

interface ApiKeyManagerProps {
  provider?: string;
}

export function ApiKeyManager({ provider }: ApiKeyManagerProps) {
  const { apiKeys, isLoading, loadKeys } = useApiKeyStore();

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const validKeys = provider
    ? apiKeys.filter((k) => k.provider === provider && k.isValid)
    : apiKeys.filter((k) => k.isValid);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">加载中...</div>;
  }

  if (validKeys.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed p-3">
        <Key className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          未找到有效的 API Key
        </span>
        <Link href="/settings">
          <Button variant="link" size="sm" className="h-auto p-0">
            去设置
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {validKeys.map((key) => (
        <Badge key={key.id} variant="secondary" className="gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          {key.name}
        </Badge>
      ))}
    </div>
  );
}
