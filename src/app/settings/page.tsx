'use client';

import { useEffect, useState } from 'react';
import { useApiKeyStore } from '@/stores/apiKeyStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, CheckCircle, XCircle, Loader2, ExternalLink, Copy, Check, BookOpen } from 'lucide-react';
import type { AIProvider } from '@/types';
import { toast } from 'sonner';

const providers = [
  {
    value: 'openai',
    label: 'OpenAI',
    icon: '🤖',
    description: 'GPT-4o、GPT-4、GPT-3.5 等模型',
    getKeyUrl: 'https://platform.openai.com/api-keys',
    pricing: 'https://openai.com/pricing',
    keyFormat: 'sk-...',
    models: ['GPT-4o', 'GPT-4o-mini', 'GPT-4', 'GPT-3.5-turbo'],
    priceInfo: 'GPT-4o: $5/1M tokens, GPT-4o-mini: $0.15/1M tokens',
    steps: [
      '访问 platform.openai.com 并注册/登录',
      '进入 API Keys 页面',
      '点击 "Create new secret key"',
      '复制生成的 Key（只显示一次）',
    ],
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    icon: '🧠',
    description: 'Claude 3.5、Claude 3 等模型',
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
    pricing: 'https://www.anthropic.com/pricing',
    keyFormat: 'sk-ant-...',
    models: ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'Claude 3 Haiku'],
    priceInfo: 'Claude 3.5 Sonnet: $3/1M tokens, Haiku: $0.25/1M tokens',
    steps: [
      '访问 console.anthropic.com 并注册/登录',
      '进入 Settings > API Keys',
      '点击 "Create Key"',
      '复制生成的 Key',
    ],
  },
  {
    value: 'google',
    label: 'Google',
    icon: '✨',
    description: 'Gemini Pro、Gemini Flash 等模型',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
    pricing: 'https://ai.google.dev/pricing',
    keyFormat: 'AIza...',
    models: ['Gemini 2.0 Flash', 'Gemini 1.5 Pro', 'Gemini 1.5 Flash'],
    priceInfo: '有免费额度，超出后按量计费',
    steps: [
      '访问 aistudio.google.com 并登录 Google 账号',
      '点击 "Get API key"',
      '创建新的 API Key 或使用现有项目',
      '复制生成的 Key',
    ],
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    icon: '🔮',
    description: 'DeepSeek Chat、DeepSeek Coder 等模型',
    getKeyUrl: 'https://platform.deepseek.com/api_keys',
    pricing: 'https://platform.deepseek.com/api-docs/pricing',
    keyFormat: 'sk-...',
    models: ['DeepSeek Chat', 'DeepSeek Coder', 'DeepSeek Reasoner'],
    priceInfo: 'DeepSeek Chat: ¥1/1M tokens（超低价格）',
    steps: [
      '访问 platform.deepseek.com 并注册/登录',
      '进入 API Keys 页面',
      '点击 "创建 API Key"',
      '复制生成的 Key（只显示一次）',
    ],
  },
];

export default function SettingsPage() {
  const { apiKeys, isLoading, loadKeys, addKey, removeKey, validateKey } = useApiKeyStore();
  const [provider, setProvider] = useState<AIProvider>('deepseek');
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('add');

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const selectedProvider = providers.find((p) => p.value === provider);

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

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('已复制');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API Key 设置</h1>
        <p className="text-muted-foreground">
          管理您的 AI 服务商 API Key，Key 将加密存储在本地浏览器中。
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add">添加 Key</TabsTrigger>
          <TabsTrigger value="guide">获取指南</TabsTrigger>
          <TabsTrigger value="manage">管理 Key</TabsTrigger>
        </TabsList>

        {/* 添加 Key */}
        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>添加 API Key</CardTitle>
              <CardDescription>选择服务商并输入您的 API Key</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>选择服务商</Label>
                <Select value={provider} onValueChange={(v) => v && setProvider(v as AIProvider)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <span className="flex items-center gap-2">
                          <span>{p.icon}</span>
                          <span>{p.label}</span>
                          <span className="text-muted-foreground">- {p.description}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProvider && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedProvider.icon} {selectedProvider.label}</span>
                    <a
                      href={selectedProvider.getKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      获取 Key <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedProvider.priceInfo}</p>
                  <p className="text-sm text-muted-foreground">
                    Key 格式：<code className="bg-background px-1 rounded">{selectedProvider.keyFormat}</code>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>名称</Label>
                <Input
                  placeholder={`例如：我的 ${selectedProvider?.label} Key`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder={selectedProvider?.keyFormat || 'sk-...'}
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
        </TabsContent>

        {/* 获取指南 */}
        <TabsContent value="guide" className="space-y-4">
          {providers.map((p) => (
            <Card key={p.value}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.icon}</span>
                    <div>
                      <CardTitle>{p.label}</CardTitle>
                      <CardDescription>{p.description}</CardDescription>
                    </div>
                  </div>
                  <a
                    href={p.getKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      前往获取
                    </Button>
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">支持的模型</h4>
                    <div className="flex flex-wrap gap-2">
                      {p.models.map((model) => (
                        <Badge key={model} variant="secondary">{model}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">价格信息</h4>
                    <p className="text-sm text-muted-foreground">{p.priceInfo}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">获取步骤</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    {p.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Key 格式：</span>
                  <code className="bg-muted px-2 py-1 rounded">{p.keyFormat}</code>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                常见问题
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Q: API Key 安全吗？</h4>
                <p className="text-sm text-muted-foreground">
                  是的，您的 API Key 使用 Web Crypto API 加密后存储在浏览器本地的 IndexedDB 中，
                  不会上传到任何服务器。但请勿在公共设备上保存 Key。
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Q: 推荐使用哪个服务商？</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>性价比首选：DeepSeek</strong>，价格极低且支持中文优秀。<br />
                  <strong>综合能力最强：OpenAI GPT-4o</strong>，适合复杂任务。<br />
                  <strong>免费额度：Google Gemini</strong>，有免费使用额度。
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Q: Key 验证失败怎么办？</h4>
                <p className="text-sm text-muted-foreground">
                  请检查：1) Key 是否复制完整；2) Key 是否已过期或被禁用；3) 账户是否有余额。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 管理 Key */}
        <TabsContent value="manage" className="space-y-4">
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
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">暂无保存的 API Key</p>
                  <Button variant="outline" onClick={() => setActiveTab('add')}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加 Key
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((apiKey) => {
                    const providerInfo = providers.find((p) => p.value === apiKey.provider);
                    return (
                      <div
                        key={apiKey.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{providerInfo?.icon}</span>
                            <span className="font-medium">{apiKey.name}</span>
                            <Badge variant="outline">{providerInfo?.label}</Badge>
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
                          <p className="text-sm text-muted-foreground mt-1">
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
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
