import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PenTool,
  Languages,
  Code2,
  Sparkles,
  BookTemplate,
  Mail,
  ArrowRight,
} from 'lucide-react';

const tools = [
  {
    name: '文本润色',
    description: 'AI 辅助改写、润色文本，提升表达质量',
    href: '/polish',
    icon: PenTool,
  },
  {
    name: '翻译工具',
    description: '中英文互译，支持多种翻译风格',
    href: '/translate',
    icon: Languages,
  },
  {
    name: '代码解释',
    description: '解释代码片段，帮助理解复杂逻辑',
    href: '/code-explain',
    icon: Code2,
  },
  {
    name: '代码生成',
    description: '根据需求描述生成可运行的代码',
    href: '/code-generate',
    icon: Sparkles,
  },
  {
    name: '邮件生成',
    description: '根据要点生成专业的邮件内容',
    href: '/email',
    icon: Mail,
  },
  {
    name: 'Prompt 模板',
    description: '内置高质量提示词模板，一键使用',
    href: '/prompts',
    icon: BookTemplate,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5" />
          <span>AI 工具箱</span>
        </Link>
      </header>
      <main className="flex-1">
        <section className="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center md:py-24">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            AI 工具箱
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-lg">
            整合多个 AI API 的工具集合，自带 API Key 即可使用。
            专注于具体的 AI 应用场景，而非通用聊天。
          </p>
          <div className="flex gap-4">
            <Link href="/settings">
              <Button>设置 API Key</Button>
            </Link>
            <Link href="/polish">
              <Button variant="outline">开始使用</Button>
            </Link>
          </div>
        </section>
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <h2 className="mb-8 text-center text-2xl font-bold">功能工具</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.href} href={tool.href}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle>{tool.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{tool.description}</CardDescription>
                      <div className="mt-4 flex items-center text-sm text-primary">
                        开始使用
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <p>AI 工具箱 - 整合多个 AI API 的工具集合</p>
      </footer>
    </div>
  );
}
