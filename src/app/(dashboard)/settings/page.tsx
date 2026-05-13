'use client';

import { useEffect, useState } from 'react';
import { useApiKeyStore } from '@/stores/apiKeyStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, XCircle, Loader2, ExternalLink, BookOpen } from 'lucide-react';
import type { AIProvider } from '@/types';
import { toast } from 'sonner';

interface ProviderInfo {
  value: AIProvider;
  label: string;
  icon: string;
  description: string;
  getKeyUrl: string;
  keyFormat: string;
  models: string[];
  priceInfo: string;
  steps: string[];
  freeTier?: string;
  apiType: 'openai-compatible' | 'custom';
}

const providers: ProviderInfo[] = [
  {
    value: 'deepseek', label: 'DeepSeek', icon: '🔮',
    description: 'Chat、Reasoner 等',
    getKeyUrl: 'https://platform.deepseek.com/api_keys',
    keyFormat: 'sk-xxxxx',
    models: ['DeepSeek Chat', 'DeepSeek Reasoner'],
    priceInfo: 'Chat ¥1/1M tokens，Reasoner ¥4/1M',
    steps: ['访问 platform.deepseek.com 注册', '进 API Keys 页面', '创建 Key', '复制 Key'],
    freeTier: '新用户送 500 万 tokens',
    apiType: 'openai-compatible',
  },
  {
    value: 'openai', label: 'OpenAI', icon: '🤖',
    description: 'GPT-4o、GPT-4 等',
    getKeyUrl: 'https://platform.openai.com/api-keys',
    keyFormat: 'sk-proj-xxxxx',
    models: ['GPT-4o', 'GPT-4o-mini', 'GPT-4'],
    priceInfo: 'GPT-4o $5/1M tokens，mini $0.15/1M',
    steps: ['访问 platform.openai.com 注册', '进 API Keys', 'Create new secret key', '复制 Key（仅显示一次）'],
    apiType: 'openai-compatible',
  },
  {
    value: 'anthropic', label: 'Anthropic Claude', icon: '🧠',
    description: 'Claude 3.5 Sonnet 等',
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
    keyFormat: 'sk-ant-xxxxx',
    models: ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'Claude 3 Haiku'],
    priceInfo: 'Sonnet $3/1M tokens，Haiku $0.25/1M',
    steps: ['访问 console.anthropic.com', 'Settings → API Keys', 'Create Key', '复制 Key'],
    apiType: 'custom',
  },
  {
    value: 'google', label: 'Google Gemini', icon: '✨',
    description: 'Gemini 2.0 Flash 等',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
    keyFormat: 'AIzaSy...',
    models: ['Gemini 2.0 Flash', 'Gemini 1.5 Pro'],
    priceInfo: '有免费额度',
    steps: ['访问 aistudio.google.com 登录', 'Get API key', '创建 API Key', '复制 Key'],
    freeTier: '免费额度足够日常',
    apiType: 'custom',
  },
  {
    value: 'kimi', label: 'Kimi (月之暗面)', icon: '🌙',
    description: '超长上下文 128K',
    getKeyUrl: 'https://platform.moonshot.cn/console/api-keys',
    keyFormat: 'sk-xxxxx',
    models: ['moonshot-v1-8k', 'v1-32k', 'v1-128k'],
    priceInfo: '¥12/1M tokens',
    steps: ['访问 platform.moonshot.cn', '进 API Keys', '创建密钥', '复制 Key'],
    freeTier: '注册送额度',
    apiType: 'openai-compatible',
  },
  {
    value: 'qwen', label: '通义千问 (阿里)', icon: '☁️',
    description: 'Qwen-Turbo、Plus、Max',
    getKeyUrl: 'https://bailian.console.aliyun.com/#/api-key',
    keyFormat: 'sk-xxxxx',
    models: ['Qwen-Turbo', 'Qwen-Plus', 'Qwen-Max'],
    priceInfo: 'Turbo ¥0.8/1M，Max ¥20/1M',
    steps: ['访问 bailian.console.aliyun.com', '进 API Key 管理', '创建 Key', '复制 Key'],
    freeTier: '新用户有免费额度',
    apiType: 'openai-compatible',
  },
  {
    value: 'zhipu', label: '智谱 GLM', icon: '🧬',
    description: 'GLM-4-Flash 免费',
    getKeyUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
    keyFormat: 'xxxxx.xxxxx',
    models: ['GLM-4-Flash', 'GLM-4-Plus'],
    priceInfo: 'Flash ¥0.1/1M（极低）',
    steps: ['访问 open.bigmodel.cn', '进 API Keys', '创建 Key', '复制 Key'],
    freeTier: 'GLM-4-Flash 免费',
    apiType: 'openai-compatible',
  },
  {
    value: 'moonshot', label: 'Moonshot', icon: '🚀',
    description: '128K 超长上下文',
    getKeyUrl: 'https://platform.moonshot.cn/console/api-keys',
    keyFormat: 'sk-xxxxx',
    models: ['moonshot-v1-8k', 'v1-32k', 'v1-128k'],
    priceInfo: '¥12/1M tokens',
    steps: ['访问 platform.moonshot.cn', '进 API Keys', '创建密钥', '复制 Key'],
    apiType: 'openai-compatible',
  },
  {
    value: 'baidu', label: '百度文心', icon: '🐼',
    description: 'ERNIE-Speed、4.0',
    getKeyUrl: 'https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application',
    keyFormat: 'bce-v3/xxx',
    models: ['ERNIE-Speed', 'ERNIE-Lite', 'ERNIE-4.0'],
    priceInfo: 'Speed ¥0.8/1M，4.0 ¥120/1M',
    steps: ['访问控制台创建应用', '获取 API Key', '授权模型', '复制 Key'],
    freeTier: 'Speed 有免费额度',
    apiType: 'openai-compatible',
  },
  {
    value: 'bytedance', label: '字节豆包', icon: '🎵',
    description: 'Doubao-Pro、Lite',
    getKeyUrl: 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey',
    keyFormat: 'xxxxx...',
    models: ['Doubao-Pro', 'Doubao-Lite'],
    priceInfo: 'Pro ¥0.8/1M，Lite ¥0.3/1M',
    steps: ['访问火山引擎控制台', '进 API Key 管理', '创建 Key', '创建接入点'],
    freeTier: '新用户有免费额度',
    apiType: 'openai-compatible',
  },
  {
    value: 'mistral', label: 'Mistral AI', icon: '🌪️',
    description: '欧洲领先 AI',
    getKeyUrl: 'https://console.mistral.ai/api-keys/',
    keyFormat: 'xxxxx',
    models: ['Mistral Large', 'Small', 'Nemo'],
    priceInfo: 'Small $1/1M，Large $8/1M',
    steps: ['访问 console.mistral.ai', '进 API Keys', '创建 Key', '复制 Key'],
    freeTier: '有免费试用',
    apiType: 'openai-compatible',
  },
  {
    value: 'grok', label: 'Grok (xAI)', icon: '⚡',
    description: 'Elon Musk 的 AI',
    getKeyUrl: 'https://x.ai/api',
    keyFormat: 'xai-xxxxx',
    models: ['Grok-2'],
    priceInfo: 'Grok-2 $5/1M tokens',
    steps: ['访问 x.ai 注册', '进 API 页面', '创建 Key', '复制 Key'],
    apiType: 'openai-compatible',
  },
  {
    value: 'yi', label: '零一万物', icon: '🔢',
    description: 'Yi-Large、Lightning',
    getKeyUrl: 'https://platform.lingyiwanwu.com/apikeys',
    keyFormat: 'xxxxx',
    models: ['Yi-Large', 'Yi-Lightning'],
    priceInfo: 'Lightning ¥1/1M',
    steps: ['访问 platform.lingyiwanwu.com', '进 API Keys', '创建 Key', '复制 Key'],
    apiType: 'openai-compatible',
  },
  {
    value: 'minimax', label: 'MiniMax', icon: '🎯',
    description: 'abab 系列模型',
    getKeyUrl: 'https://platform.minimax.chat/user-center/basic-information/interface-key',
    keyFormat: 'eyJ...',
    models: ['MiniMax-Text-01', 'abab6.5s'],
    priceInfo: '¥1/1M tokens',
    steps: ['访问 platform.minimax.chat', '用户中心 → 接口密钥', '创建密钥', '复制 Key'],
    apiType: 'openai-compatible',
  },
];

function getProviderInfo(value: AIProvider): ProviderInfo | undefined {
  return providers.find((p) => p.value === value);
}

export default function SettingsPage() {
  const { apiKeys, isLoading, loadKeys, addKey, removeKey, validateKey } = useApiKeyStore();
  const [provider, setProvider] = useState<AIProvider>('deepseek');
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('add');
  const [search, setSearch] = useState('');

  useEffect(() => { loadKeys(); }, [loadKeys]);

  const selectedProvider = getProviderInfo(provider);

  const handleAdd = async () => {
    if (!name.trim() || !key.trim()) {
      toast.error('请填写名称和 API Key');
      return;
    }
    await addKey(provider, name.trim(), key.trim());
    setName(''); setKey('');
    toast.success('API Key 已添加');
  };

  const handleValidate = async (id: string) => {
    setValidatingId(id);
    const valid = await validateKey(id);
    setValidatingId(null);
    toast[valid ? 'success' : 'error'](valid ? 'API Key 验证成功' : 'API Key 验证失败');
  };

  const handleRemove = async (id: string) => {
    await removeKey(id);
    toast.success('API Key 已删除');
  };

  const filteredProviders = search
    ? providers.filter((p) =>
        p.label.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()))
    : providers;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API Key 设置</h1>
        <p className="text-muted-foreground">支持 14 个 AI 服务商，Key 加密存储在本地。</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add">添加 Key</TabsTrigger>
          <TabsTrigger value="guide">获取指南</TabsTrigger>
          <TabsTrigger value="manage">
            管理 Key{apiKeys.length > 0 && ` (${apiKeys.length})`}
          </TabsTrigger>
        </TabsList>

        {/* ========= 添加 Key ========= */}
        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>添加 API Key</CardTitle>
              <CardDescription>选择服务商并输入 API Key</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="搜索服务商..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search ? (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {filteredProviders.map((p) => (
                    <button
                      key={p.value}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-left ${
                        provider === p.value ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                      }`}
                      onClick={() => { setProvider(p.value); setSearch(''); }}
                    >
                      <span className="text-lg">{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{p.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{p.priceInfo}</div>
                      </div>
                      {p.freeTier && <Badge variant="outline" className="text-xs shrink-0">免费</Badge>}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {providers.map((p) => (
                    <button
                      key={p.value}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center ${
                        provider === p.value ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                      }`}
                      onClick={() => setProvider(p.value)}
                    >
                      <span className="text-xl">{p.icon}</span>
                      <span className="text-xs font-medium leading-tight">{p.label}</span>
                      {p.freeTier && <Badge variant="outline" className="text-[10px] px-1 py-0">免费</Badge>}
                    </button>
                  ))}
                </div>
              )}

              {selectedProvider && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedProvider.icon}</span>
                      <span className="font-medium">{selectedProvider.label}</span>
                      <Badge variant="outline">
                        {selectedProvider.apiType === 'openai-compatible' ? 'OpenAI 兼容' : '独立 API'}
                      </Badge>
                    </div>
                    <a href={selectedProvider.getKeyUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline">
                      获取 Key <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedProvider.models.map((m) => (
                      <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                    ))}
                  </div>
                  <p className="text-sm">{selectedProvider.priceInfo}</p>
                  {selectedProvider.freeTier && (
                    <p className="text-sm text-green-600 dark:text-green-400">{selectedProvider.freeTier}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Key 格式：<code className="bg-background px-1 rounded text-xs">{selectedProvider.keyFormat}</code>
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
                  placeholder={selectedProvider?.keyFormat || '输入 API Key'}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
              </div>

              <Button onClick={handleAdd} className="w-full">
                <Plus className="mr-2 h-4 w-4" />添加 Key
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========= 获取指南 ========= */}
        <TabsContent value="guide" className="space-y-4">
          {providers.map((p) => (
            <Card key={p.value}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.icon}</span>
                    <div>
                      <CardTitle className="text-base">{p.label}</CardTitle>
                      <CardDescription>{p.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.freeTier && (
                      <Badge variant="outline" className="text-green-600 dark:text-green-400">有免费</Badge>
                    )}
                    <a href={p.getKeyUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />前往获取
                      </Button>
                    </a>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h4 className="font-medium mb-1 text-sm">模型</h4>
                    <div className="flex flex-wrap gap-1">
                      {p.models.map((m) => <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-sm">价格</h4>
                    <p className="text-sm text-muted-foreground">{p.priceInfo}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-sm">Key 格式</h4>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{p.keyFormat}</code>
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="font-medium mb-1 text-sm">获取步骤</h4>
                  <ol className="list-decimal list-inside space-y-0.5 text-sm text-muted-foreground">
                    {p.steps.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-5 w-5" />常见问题
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Q: Key 安全吗？</h4>
                <p className="text-sm text-muted-foreground">Web Crypto 加密 + IndexedDB 本地存储，不上传服务器。</p>
              </div>
              <div>
                <h4 className="font-medium">Q: 推荐哪个？</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>性价比：DeepSeek</strong>，¥1/1M。<br />
                  <strong>免费：Google Gemini / 智谱 GLM-4-Flash</strong>。<br />
                  <strong>最强：OpenAI GPT-4o</strong>。
                </p>
              </div>
              <div>
                <h4 className="font-medium">Q: 验证失败？</h4>
                <p className="text-sm text-muted-foreground">检查 Key 完整性、是否过期、账户余�。</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========= 管理 Key ========= */}
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>已保存的 API Key</CardTitle>
              <CardDescription>
                {apiKeys.length === 0 ? '暂无 Key，请到"添加 Key"页面添加' : `共 ${apiKeys.length} 个`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">暂无数据</p>
                  <Button variant="outline" onClick={() => setActiveTab('add')}>
                    <Plus className="mr-2 h-4 w-4" />添加 Key
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((ak) => {
                    const pi = getProviderInfo(ak.provider);
                    return (
                      <div key={ak.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{pi?.icon}</span>
                            <span className="font-medium">{ak.name}</span>
                            <Badge variant="outline">{pi?.label || ak.provider}</Badge>
                            {ak.isValid ? (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="mr-1 h-3 w-3" />已验证
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="mr-1 h-3 w-3" />未验证
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            添加于 {new Date(ak.createdAt).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm"
                            onClick={() => handleValidate(ak.id)}
                            disabled={validatingId === ak.id}>
                            {validatingId === ak.id ? <Loader2 className="h-4 w-4 animate-spin" /> : '验证'}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleRemove(ak.id)}>删除</Button>
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
