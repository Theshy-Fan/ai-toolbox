'use client';

import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Copy, Check, Languages, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const directions = [
  { value: 'zh-en', label: '中 → 英', source: 'zh', target: 'en' },
  { value: 'en-zh', label: '英 → 中', source: 'en', target: 'zh' },
];

const styles = [
  { value: 'standard', label: '标准翻译' },
  { value: 'literary', label: '文学翻译' },
  { value: 'technical', label: '技术翻译' },
  { value: 'casual', label: '口语翻译' },
];

export default function TranslatePage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [direction, setDirection] = useState('zh-en');
  const [style, setStyle] = useState('standard');
  const [copied, setCopied] = useState(false);
  const { isLoading, chat } = useAI();

  const handleTranslate = async () => {
    if (!input.trim()) {
      toast.error('请输入需要翻译的文本');
      return;
    }

    const dir = directions.find((d) => d.value === direction);
    const stylePrompt = styles.find((s) => s.value === style);

    const prompt = `请将以下文本翻译成${dir?.target === 'zh' ? '中文' : '英文'}。翻译风格：${stylePrompt?.label}。保持专业术语准确，语言自然流畅。`;

    const result = await chat([
      { role: 'system', content: prompt },
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

  const swapTexts = () => {
    setInput(output);
    setOutput('');
    const newDir = direction === 'zh-en' ? 'en-zh' : 'zh-en';
    setDirection(newDir);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <Languages className="h-6 w-6" />
        <h1 className="text-2xl font-bold">翻译工具</h1>
      </div>
      <p className="text-muted-foreground">
        中英文互译，支持多种翻译风格。
      </p>

      <div className="flex items-center gap-4">
        <Select value={direction} onValueChange={(v) => v && setDirection(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {directions.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={style} onValueChange={(v) => v && setStyle(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {styles.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={swapTexts}>
          交换
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>原文</CardTitle>
            <CardDescription>输入需要翻译的文本</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请输入需要翻译的文本..."
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>译文</CardTitle>
                <CardDescription>翻译结果</CardDescription>
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
              <div className="whitespace-pre-wrap">{output}</div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                翻译结果将在这里显示
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleTranslate} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              翻译中...
            </>
          ) : (
            <>
              开始翻译
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
