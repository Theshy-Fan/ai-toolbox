'use client';

import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Copy, Check, Code2 } from 'lucide-react';
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
  { value: 'other', label: '其他' },
];

export default function CodeExplainPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const { isLoading, chat } = useAI();

  const handleExplain = async () => {
    if (!code.trim()) {
      toast.error('请输入需要解释的代码');
      return;
    }

    const lang = languages.find((l) => l.value === language);
    const prompt = `请解释以下代码的功能和逻辑。使用中文，适合初中级开发者理解。代码语言：${lang?.label || language}`;

    const result = await chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `\`\`\`${language}\n${code}\n\`\`\`` },
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
        <Code2 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">代码解释</h1>
      </div>
      <p className="text-muted-foreground">
        粘贴代码片段，AI 帮助您理解代码逻辑。
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>输入代码</CardTitle>
            <CardDescription>粘贴需要解释的代码</CardDescription>
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
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="粘贴代码..."
              className="min-h-[200px] font-mono"
            />
            <Button onClick={handleExplain} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  解释中...
                </>
              ) : (
                '解释代码'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>解释结果</CardTitle>
                <CardDescription>AI 对代码的解释</CardDescription>
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
                解释结果将在这里显示
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
