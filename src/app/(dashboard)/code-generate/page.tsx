'use client';

import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Copy, Check, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML/CSS' },
  { value: 'react', label: 'React' },
];

export default function CodeGeneratePage() {
  const [requirement, setRequirement] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const { isLoading, chat } = useAI();

  const handleGenerate = async () => {
    if (!requirement.trim()) {
      toast.error('请输入代码需求');
      return;
    }

    const lang = languages.find((l) => l.value === language);
    const prompt = `根据以下需求，生成可运行的代码。使用${lang?.label || language}，包含必要的注释。输出格式：先给出代码，然后简要说明代码的功能和使用方法。`;

    const result = await chat([
      { role: 'system', content: prompt },
      { role: 'user', content: requirement },
    ]);

    if (result) {
      setOutput(result);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('已复制到剪贴板');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6" />
        <h1 className="text-2xl font-bold">代码生成</h1>
      </div>
      <p className="text-muted-foreground">
        描述您的需求，AI 帮助您生成代码。
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>需求描述</CardTitle>
            <CardDescription>描述您想要生成的代码功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="例如：创建一个函数，实现数组去重功能..."
              className="min-h-[200px]"
            />
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                '生成代码'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>生成结果</CardTitle>
                <CardDescription>AI 生成的代码</CardDescription>
              </div>
              {output && (
                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {output ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                生成的代码将在这里显示
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
