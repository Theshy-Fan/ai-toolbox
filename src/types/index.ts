export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface ApiKey {
  id: string;
  provider: AIProvider;
  name: string;
  key: string;
  isValid: boolean;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  tool: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: 'writing' | 'translation' | 'code' | 'learning';
  content: string;
  variables: string[];
  isCustom: boolean;
}

export interface AIRequest {
  provider: AIProvider;
  messages: { role: string; content: string }[];
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}
