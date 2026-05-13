'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PromptTemplate as PromptTemplateType } from '@/types';

interface PromptTemplateProps {
  template: PromptTemplateType;
  onUse: (template: PromptTemplateType) => void;
}

const categoryLabels: Record<string, string> = {
  writing: '写作',
  translation: '翻译',
  code: '代码',
  learning: '学习',
};

const categoryColors: Record<string, string> = {
  writing: 'bg-blue-500',
  translation: 'bg-green-500',
  code: 'bg-purple-500',
  learning: 'bg-orange-500',
};

export function PromptTemplateCard({ template, onUse }: PromptTemplateProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{template.name}</CardTitle>
          <Badge className={categoryColors[template.category]}>
            {categoryLabels[template.category]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-2 text-sm">
          {template.content}
        </CardDescription>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1">
            {template.variables.map((v) => (
              <Badge key={v} variant="outline" className="text-xs">
                {v}
              </Badge>
            ))}
          </div>
          <Button size="sm" onClick={() => onUse(template)}>
            使用
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
