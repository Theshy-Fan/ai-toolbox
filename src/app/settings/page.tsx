'use client';

import { useEffect, useState } from 'react';
import { useApiKeyStore } from '@/stores/apiKeyStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { AIProvider } from '@/types';
import { toast } from 'sonner';

const providers = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google' },
];

export default function SettingsPage() {
  const { apiKeys, isLoading, loadKeys, addKey, removeKey, validateKey } = useApiKeyStore();
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [validatingId, setValidatingId] = useState<string | null>(null);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleAdd = async () => {
    if (!name.trim() || !key.trim()) {
      toast.error('请填写名称和 API Key');
      return;
    }

    await addKey(provider, name.trim(), key.trim());
    setName('');
    setKey('');
    toast.success('API Key 已添加');
  };

  const handleValidate = async (id: string) => {
    setValidatingId(id);
    const valid = await validateKey(id);
    setValidatingId(null);

    if (valid) {
      toast.success('API Key 验证成功');
    } else {
      toast.error('API Key 验证失败');
    }
  };

  const handleRemove = async (id: string) => {
    await removeKey(id);
    toast.success('API Key 已删除');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API Key 设置</h1>
        <p className="text-muted-foreground">
          管理您的 AI 服务商 API Key，Key 将加密存储在本地浏览器中。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>添加 API Key</CardTitle>
          <CardDescription>添加一个新的 API Key 到本地存储</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>服务商</Label>
            <Select value={provider} onValueChange={(v) => v && setProvider(v as AIProvider)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>名称</Label>
            <Input
              placeholder="例如：我的 OpenAI Key"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder="sk-..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>

          <Button onClick={handleAdd} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            添加 Key
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>已保存的 API Key</CardTitle>
          <CardDescription>
            {apiKeys.length === 0 ? '暂无保存的 API Key' : `共 ${apiKeys.length} 个`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : apiKeys.length === 0 ? (
            <p className="text-center text-muted-foreground">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{apiKey.name}</span>
                      <Badge variant="outline">{apiKey.provider}</Badge>
                      {apiKey.isValid ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          有效
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="mr-1 h-3 w-3" />
                          未验证
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      添加于 {new Date(apiKey.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleValidate(apiKey.id)}
                      disabled={validatingId === apiKey.id}
                    >
                      {validatingId === apiKey.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        '验证'
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(apiKey.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
