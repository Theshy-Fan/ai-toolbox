'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultTemplates, fillTemplate } from '@/lib/prompts';
import { PromptTemplateCard } from '@/components/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BookTemplate, Plus, Search } from 'lucide-react';
import type { PromptTemplate } from '@/types';
import { toast } from 'sonner';

const categories = [
  { value: 'all', label: '全部' },
  { value: 'writing', label: '写作' },
  { value: 'translation', label: '翻译' },
  { value: 'code', label: '代码' },
  { value: 'learning', label: '学习' },
];

export default function PromptsPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<PromptTemplate[]>(defaultTemplates);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'writing' as const,
    content: '',
    variables: '',
  });

  useEffect(() => {
    // 加载用户自定义模板
    const customTemplates = localStorage.getItem('customTemplates');
    if (customTemplates) {
      setTemplates([...defaultTemplates, ...JSON.parse(customTemplates)]);
    }
  }, []);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.includes(search) || t.content.includes(search);
    const matchesCategory = category === 'all' || t.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: PromptTemplate) => {
    // 根据模板分类导航到对应的工具页面
    const routes: Record<string, string> = {
      writing: '/polish',
      translation: '/translate',
      code: '/code-explain',
      learning: '/polish',
    };

    const route = routes[template.category] || '/polish';
    router.push(route);
    toast.success(`已选择模板：${template.name}`);
  };

  const handleAddTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      toast.error('请填写模板名称和内容');
      return;
    }

    const variables = newTemplate.variables
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    const template: PromptTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name,
      category: newTemplate.category,
      content: newTemplate.content,
      variables,
      isCustom: true,
    };

    const updatedTemplates = [...templates, template];
    setTemplates(updatedTemplates);

    // 保存到 localStorage
    const customTemplates = updatedTemplates.filter((t) => t.isCustom);
    localStorage.setItem('customTemplates', JSON.stringify(customTemplates));

    setNewTemplate({ name: '', category: 'writing', content: '', variables: '' });
    setIsDialogOpen(false);
    toast.success('模板已添加');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookTemplate className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Prompt 模板库</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" />
            添加模板
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加自定义模板</DialogTitle>
              <DialogDescription>创建一个自定义的 Prompt 模板</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>模板名称</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="例如：代码审查"
                />
              </div>
              <div className="space-y-2">
                <Label>分类</Label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                >
                  {categories.filter((c) => c.value !== 'all').map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Prompt 内容</Label>
                <Textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="输入 Prompt 模板内容..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>变量（用逗号分隔）</Label>
                <Input
                  value={newTemplate.variables}
                  onChange={(e) => setNewTemplate({ ...newTemplate, variables: e.target.value })}
                  placeholder="例如：code, language"
                />
              </div>
              <Button onClick={handleAddTemplate} className="w-full">
                添加模板
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-muted-foreground">
        内置高质量提示词模板，支持自定义添加。
      </p>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索模板..."
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList>
          {categories.map((c) => (
            <TabsTrigger key={c.value} value={c.value}>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={category} className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredTemplates.map((template) => (
              <PromptTemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
              />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              没有找到匹配的模板
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
