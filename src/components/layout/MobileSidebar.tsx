'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Menu,
  PenTool,
  Languages,
  Code2,
  Sparkles,
  BookTemplate,
  Mail,
  Settings,
} from 'lucide-react';

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

export function MobileSidebar() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-14 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5" />
            <span>AI 工具箱</span>
          </Link>
        </div>
        <Separator />
        <ScrollArea className="h-[calc(100vh-3.5rem)] px-3 py-4">
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
          <Separator className="my-4" />
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="h-4 w-4" />
              API Key 设置
            </Button>
          </Link>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
