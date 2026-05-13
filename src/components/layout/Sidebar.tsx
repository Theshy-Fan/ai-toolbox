'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  PenTool,
  Languages,
  Code2,
  Sparkles,
  BookTemplate,
  Mail,
  Settings,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';

const tools = [
  {
    name: '文本润色',
    href: '/polish',
    icon: PenTool,
  },
  {
    name: '翻译工具',
    href: '/translate',
    icon: Languages,
  },
  {
    name: '代码解释',
    href: '/code-explain',
    icon: Code2,
  },
  {
    name: '代码生成',
    href: '/code-generate',
    icon: Sparkles,
  },
  {
    name: '邮件生成',
    href: '/email',
    icon: Mail,
  },
  {
    name: 'Prompt 模板',
    href: '/prompts',
    icon: BookTemplate,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5" />
          <span>AI 工具箱</span>
        </Link>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = pathname === tool.href;
            return (
              <Link key={tool.href} href={tool.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2',
                    isActive && 'bg-secondary'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tool.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="flex flex-col gap-1 p-3">
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            API Key 设置
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? '浅色模式' : '深色模式'}
        </Button>
      </div>
    </div>
  );
}
