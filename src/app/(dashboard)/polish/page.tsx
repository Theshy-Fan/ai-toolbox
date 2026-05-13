'use client';

import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Copy, Check, PenTool } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const polishStyles = [
  { value: 'default', label: '标准润色' },
  { value: 'formal', label: '正式文体' },
  { value: 'academic', label: '学术风格' },
  { value: 'casual', label: '口语化' },
];

const prompts: Record<string, string> = {
  default: '请润色以下文本，使其更加专业和流畅。保持原意，但提升表达质量。',
  formal: '请将以下文本润色为正式的商务文体。使用专业术语，保持逻辑清晰，语气得体。',
  academic: '请润色以下学术文本。保持学术严谨性，使用规范的学术表达，确保逻辑连贯。',
  casual: '请将以下文本改写为口语化、轻松的风格，适合日常交流使用。',
};

export default function PolishPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [style, setStyle] = useState('default');
  const [copied, setCopied] = useState(false);
  const { isLoading, chat } = useAI();

  const handlePolish = async () => {
    if (!input.trim()) {
      toast.error('请输入需要润色的文本');
      return;
    }

    const result = await chat([
      { role: 'system', content: prompts[style] },
      { role: 'user', content: input },
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
        <PenTool className="h-6 w-6" />
        <h1 className="text-2xl font-bold">文本润色</h1>
      </div>
      <p className="text-muted-foreground">
        使用 AI 帮助您润色文本，提升表达质量。
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>输入文本</CardTitle>
            <CardDescription>粘贴需要润色的文本</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请输入需要润色的文本..."
              className="min-h-[200px]"
            />
            <div className="flex items-center gap-4">
              <Select value={style} onValueChange={(v) => v && setStyle(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {polishStyles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handlePolish} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    润色中...
                  </>
                ) : (
                  '开始润色'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>润色结果</CardTitle>
                <CardDescription>AI 润色后的文本</CardDescription>
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
                润色结果将在这里显示
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
