'use client';

import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Copy, Check, Mail } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const emailTypes = [
  { value: 'business', label: '商务邮件' },
  { value: 'application', label: '求职申请' },
  { value: 'follow-up', label: '跟进邮件' },
  { value: 'thank-you', label: '感谢邮件' },
  { value: 'complaint', label: '投诉邮件' },
  { value: 'invitation', label: '邀请邮件' },
];

const tones = [
  { value: 'professional', label: '专业正式' },
  { value: 'friendly', label: '友好亲切' },
  { value: 'formal', label: '非常正式' },
  { value: 'casual', label: '轻松随意' },
];

const lengths = [
  { value: 'short', label: '简短（100字内）' },
  { value: 'medium', label: '适中（200字左右）' },
  { value: 'long', label: '详细（300字以上）' },
];

export default function EmailPage() {
  const [subject, setSubject] = useState('');
  const [recipient, setRecipient] = useState('');
  const [points, setPoints] = useState('');
  const [emailType, setEmailType] = useState('business');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const { isLoading, chat } = useAI();

  const handleGenerate = async () => {
    if (!points.trim()) {
      toast.error('请输入邮件要点');
      return;
    }

    const typeLabel = emailTypes.find((t) => t.value === emailType)?.label || emailType;
    const toneLabel = tones.find((t) => t.value === tone)?.label || tone;
    const lengthLabel = lengths.find((l) => l.value === length)?.label || length;

    const prompt = `请根据以下要点生成一封专业的${typeLabel}。

要求：
- 语气：${toneLabel}
- 长度：${lengthLabel}
- ${subject ? `邮件主题：${subject}` : ''}
- ${recipient ? `收件人：${recipient}` : ''}

请生成完整的邮件内容，包括称呼和结尾。`;

    const result = await chat([
      { role: 'system', content: prompt },
      { role: 'user', content: points },
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
        <Mail className="h-6 w-6" />
        <h1 className="text-2xl font-bold">邮件生成</h1>
      </div>
      <p className="text-muted-foreground">
        根据要点生成专业的邮件内容。
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>邮件信息</CardTitle>
            <CardDescription>填写邮件的基本信息和要点</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>邮件主题（可选）</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="例如：项目进度汇报"
              />
            </div>

            <div className="space-y-2">
              <Label>收件人（可选）</Label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="例如：张经理"
              />
            </div>

            <div className="space-y-2">
              <Label>邮件要点 *</Label>
              <Textarea
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="列出邮件的要点，例如：&#10;- 项目已完成80%&#10;- 需要延期一周&#10;- 请求额外资源支持"
                className="min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label>邮件类型</Label>
                <Select value={emailType} onValueChange={(v) => v && setEmailType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>语气</Label>
                <Select value={tone} onValueChange={(v) => v && setTone(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>长度</Label>
                <Select value={length} onValueChange={(v) => v && setLength(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lengths.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                '生成邮件'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>生成结果</CardTitle>
                <CardDescription>AI 生成的邮件内容</CardDescription>
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
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                生成的邮件将在这里显示
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
