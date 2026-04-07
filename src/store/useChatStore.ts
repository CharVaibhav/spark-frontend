import { create } from 'zustand';

export interface ChatSession {
  thread_id: string;
  user_id: string;
  run_id?: string;
  title?: string;
  created_at: string;
}

interface ChatState {
  activeThreadId: string | null;
  threads: ChatSession[];
  
  setActiveThread: (id: string | null) => void;
  setThreads: (threads: ChatSession[]) => void;
  addThread: (thread: ChatSession) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeThreadId: null,
  threads: [],
  
  setActiveThread: (id) => set({ activeThreadId: id }),
  setThreads: (threads) => set({ threads }),
  addThread: (thread) => set((state) => ({ threads: [thread, ...state.threads] })),
}));
