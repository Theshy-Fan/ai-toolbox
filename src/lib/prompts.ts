import type { PromptTemplate } from '@/types';

export const defaultTemplates: PromptTemplate[] = [
  // 写作类
  {
    id: 'polish-default',
    name: '文本润色',
    category: 'writing',
    content: '请润色以下文本，使其更加专业和流畅。保持原意，但提升表达质量。',
    variables: ['text'],
    isCustom: false,
  },
  {
    id: 'polish-formal',
    name: '正式文体润色',
    category: 'writing',
    content: '请将以下文本润色为正式的商务文体。使用专业术语，保持逻辑清晰，语气得体。',
    variables: ['text'],
    isCustom: false,
  },
  {
    id: 'polish-academic',
    name: '学术论文润色',
    category: 'writing',
    content: '请润色以下学术文本。保持学术严谨性，使用规范的学术表达，确保逻辑连贯。',
    variables: ['text'],
    isCustom: false,
  },
  {
    id: 'email-generate',
    name: '邮件生成',
    category: 'writing',
    content: '根据以下要点，生成一封专业的邮件。语气{{tone}}，长度{{length}}。',
    variables: ['points', 'tone', 'length'],
    isCustom: false,
  },

  // 翻译类
  {
    id: 'translate-zh-en',
    name: '中译英',
    category: 'translation',
    content: '请将以下中文文本翻译成英文。保持专业术语准确，语言自然流畅。',
    variables: ['text'],
    isCustom: false,
  },
  {
    id: 'translate-en-zh',
    name: '英译中',
    category: 'translation',
    content: '请将以下英文文本翻译成中文。保持专业术语准确，语言自然流畅。',
    variables: ['text'],
    isCustom: false,
  },
  {
    id: 'translate-literary',
    name: '文学翻译',
    category: 'translation',
    content: '请将以下文本进行文学性翻译。注重意境传达，使用优美的目标语言表达。',
    variables: ['text', 'target_language'],
    isCustom: false,
  },

  // 代码类
  {
    id: 'code-explain',
    name: '代码解释',
    category: 'code',
    content: '请解释以下代码的功能和逻辑。使用中文，适合初中级开发者理解。',
    variables: ['code', 'language'],
    isCustom: false,
  },
  {
    id: 'code-review',
    name: '代码审查',
    category: 'code',
    content: '请审查以下代码，指出潜在问题、改进建议和最佳实践。',
    variables: ['code', 'language'],
    isCustom: false,
  },
  {
    id: 'code-generate',
    name: '代码生成',
    category: 'code',
    content: '根据以下需求，生成可运行的代码。使用{{language}}，包含必要的注释。',
    variables: ['requirement', 'language'],
    isCustom: false,
  },
  {
    id: 'code-refactor',
    name: '代码重构',
    category: 'code',
    content: '请重构以下代码，提高可读性和可维护性，保持功能不变。',
    variables: ['code', 'language'],
    isCustom: false,
  },

  // 学习类
  {
    id: 'concept-explain',
    name: '概念解释',
    category: 'learning',
    content: '请用简单易懂的方式解释{{concept}}这个概念。适合初学者理解，可以举例子说明。',
    variables: ['concept'],
    isCustom: false,
  },
  {
    id: 'summarize',
    name: '内容总结',
    category: 'learning',
    content: '请总结以下内容的要点，用简洁的bullet points列出。',
    variables: ['text'],
    isCustom: false,
  },
  {
    id: 'quiz-generate',
    name: '生成练习题',
    category: 'learning',
    content: '根据以下内容，生成5道练习题（含答案）。难度{{difficulty}}。',
    variables: ['content', 'difficulty'],
    isCustom: false,
  },
];

export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return defaultTemplates.filter((t) => t.category === category);
}

export function getTemplateById(id: string): PromptTemplate | undefined {
  return defaultTemplates.find((t) => t.id === id);
}

export function fillTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  return result;
}
