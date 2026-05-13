import { create } from 'zustand';
import type { ChatMessage, ChatSession } from '@/types';
import { getAll, put, remove, STORES } from '@/lib/storage';

interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  loadSessions: () => Promise<void>;
  createSession: (tool: string, title?: string) => Promise<ChatSession>;
  setCurrentSession: (sessionId: string) => void;
  addMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  clearSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,

  loadSessions: async () => {
    set({ isLoading: true });
    try {
      const sessions = await getAll<ChatSession>(STORES.CHAT_SESSIONS);
      set({
        sessions: sessions.sort((a, b) => b.updatedAt - a.updatedAt),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load sessions:', error);
      set({ isLoading: false });
    }
  },

  createSession: async (tool: string, title?: string) => {
    const session: ChatSession = {
      id: crypto.randomUUID(),
      tool,
      title: title || `${tool} - ${new Date().toLocaleString('zh-CN')}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await put(STORES.CHAT_SESSIONS, session);
    set((state) => ({
      sessions: [session, ...state.sessions],
      currentSession: session,
    }));

    return session;
  },

  setCurrentSession: (sessionId: string) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    set({ currentSession: session || null });
  },

  addMessage: async (sessionId: string, message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const sessions = get().sessions.map((s) => {
      if (s.id === sessionId) {
        const updated = {
          ...s,
          messages: [...s.messages, newMessage],
          updatedAt: Date.now(),
        };
        put(STORES.CHAT_SESSIONS, updated);
        return updated;
      }
      return s;
    });

    const currentSession = sessions.find((s) => s.id === sessionId) || null;
    set({ sessions, currentSession });
  },

  clearSession: async (sessionId: string) => {
    const sessions = get().sessions.map((s) => {
      if (s.id === sessionId) {
        const updated = { ...s, messages: [], updatedAt: Date.now() };
        put(STORES.CHAT_SESSIONS, updated);
        return updated;
      }
      return s;
    });

    const currentSession = sessions.find((s) => s.id === sessionId) || null;
    set({ sessions, currentSession });
  },

  deleteSession: async (sessionId: string) => {
    await remove(STORES.CHAT_SESSIONS, sessionId);
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
    }));
  },
}));
