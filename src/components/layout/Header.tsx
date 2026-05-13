'use client';

import { MobileSidebar } from './MobileSidebar';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      <MobileSidebar />
      <div className="flex-1">
        {title && <h1 className="text-lg font-semibold">{title}</h1>}
      </div>
      <ThemeToggle />
    </header>
  );
}
