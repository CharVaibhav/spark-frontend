'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { apiFetch } from '@/lib/api';
import { ArrowUp, Plus, Lock, LogIn, Zap, ChevronRight, X, Lightbulb, LogOut, Menu } from 'lucide-react';
import MagneticButton from '@/components/MagneticButton';

interface Message {
  role: 'user' | 'agent';
  content: string;
  streaming?: boolean;
}

const FRAMEWORKS = [
  'Running Moat Test...',
  'Applying Porter\'s Five Forces...',
  'Blue Ocean Scan...',
  'Red Team Active...',
  'Mapping Unit Economics...',
  'McKinsey 3 Horizons...',
  'Jobs-to-be-Done Analysis...',
  'Calculating CAC / LTV...',
  'Synthesising Verdict...',
];

function ThinkTankLoader() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % FRAMEWORKS.length);
        setVisible(true);
      }, 300);
    }, 1800);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div className="flex flex-col gap-4 py-1">
      {/* 3D Spinner */}
      <div className="spark-spinner" />
      {/* Cycling framework label */}
      <AnimatePresence mode="wait">
        {visible && (
          <motion.p
            key={index}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.25 }}
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9AB17A]"
          >
            {FRAMEWORKS[index]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Inline formatter: **bold**, *italic* ─────────────────────────
function renderInline(text: string, key?: number): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+?\*\*|\*[^*]+?\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const raw = m[0];
    if (raw.startsWith('**')) {
      parts.push(<strong key={`${key}-${m.index}`} className="font-bold text-[#79AE6F]">{raw.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={`${key}-${m.index}`} className="italic text-[#79AE6F]/80 not-italic">{raw.slice(1, -1)}</em>);
    }
    last = m.index + raw.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ── Block Markdown Renderer ───────────────────────────────────────
function AgentMarkdown({ content }: { content: string }) {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];

  let numBuf: { n: string; text: string }[] = [];
  let bulBuf: string[] = [];

  const flushNum = (key: string) => {
    if (!numBuf.length) return;
    nodes.push(
      <ol key={key} className="space-y-2 my-3">
        {numBuf.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#79AE6F]/10 border border-[#79AE6F]/20 flex items-center justify-center text-[9px] font-bold text-[#79AE6F] mt-0.5">
              {item.n}
            </span>
            <span className="text-[#79AE6F] text-sm leading-relaxed">{renderInline(item.text, idx)}</span>
          </li>
        ))}
      </ol>
    );
    numBuf = [];
  };

  const flushBul = (key: string) => {
    if (!bulBuf.length) return;
    nodes.push(
      <ul key={key} className="space-y-1.5 my-2 pl-1">
        {bulBuf.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#9AB17A] mt-[6px]" />
            <span className="text-[#79AE6F] text-sm leading-relaxed">{renderInline(item, idx)}</span>
          </li>
        ))}
      </ul>
    );
    bulBuf = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed === '---') {
      flushNum(`fn${i}`); flushBul(`fb${i}`);
      nodes.push(<hr key={i} className="border-[#79AE6F]/12 my-5" />);
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushNum(`fn${i}`); flushBul(`fb${i}`);
      nodes.push(
        <h3 key={i} className="text-[#79AE6F] text-[11px] font-extrabold uppercase tracking-[0.2em] mt-6 mb-2 pb-1.5 border-b border-[#79AE6F]/10">
          {renderInline(trimmed.slice(4), i)}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('#### ')) {
      flushNum(`fn${i}`); flushBul(`fb${i}`);
      nodes.push(
        <h4 key={i} className="text-[#79AE6F] text-[11px] font-bold uppercase tracking-widest mt-4 mb-1.5 opacity-80">
          {renderInline(trimmed.slice(5), i)}
        </h4>
      );
      return;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      flushBul(`fb${i}`);
      numBuf.push({ n: numMatch[1], text: numMatch[2] });
      return;
    }

    const bulMatch = trimmed.match(/^[*\-•]\s+(.+)$/);
    if (bulMatch) {
      flushNum(`fn${i}`);
      bulBuf.push(bulMatch[1]);
      return;
    }

    if (!trimmed) {
      flushNum(`fn${i}`); flushBul(`fb${i}`);
      return;
    }

    flushNum(`fn${i}`); flushBul(`fb${i}`);
    nodes.push(
      <p key={i} className="text-[#79AE6F] text-sm leading-relaxed my-1.5">
        {renderInline(trimmed, i)}
      </p>
    );
  });

  flushNum('end-n'); flushBul('end-b');

  return <div className="space-y-0">{nodes}</div>;
}

function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, updateCredits, logout } = useAuthStore();
  const { activeThreadId, setActiveThread, threads, setThreads, addThread } = useChatStore();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [advisoryExpanded, setAdvisoryExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const processedPromptRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (token) {
      apiFetch('/chat/threads', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setThreads(data.data);
          }
        })
        .catch(console.error);
    }
  }, [token, setThreads]);

  useEffect(() => {
    const prompt = searchParams.get('prompt');
    let timeoutId: NodeJS.Timeout;

    if (prompt && !processedPromptRef.current) {
      processedPromptRef.current = true;
      setInput(prompt);
      timeoutId = setTimeout(() => {
        handleSend(prompt);
      }, 400);
    }
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadThreadMessages = async (threadId: string) => {
    try {
      const res = await apiFetch(`/chat/threads/${threadId}/messages`);
      const data = await res.json();
      if (data.success) {
        const mapped: Message[] = data.data.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'agent' : 'user',
          content: m.content,
        }));
        setMessages(mapped);
      }
    } catch (err) { console.error('Failed to load messages', err); }
  };

  const handleSend = async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim();
    if (!text || isStreaming) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsStreaming(true);

    if (!token) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: `This is what the Senior Partner would analyse.\n\nTo unlock the full strategic teardown — your Economic Moat, Red Team critique, and actionable directives — sign in to continue. It takes 10 seconds.`,
          streaming: false,
        }]);
        setIsStreaming(false);
      }, 800);
      return;
    }

    if (user && user.available_credits < 2) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: `You've exhausted your free allocation of 20 credits.\n\nTo continue your strategic deep-dives, please upgrade your account or contact the Senior Partner directly on LinkedIn:\nhttps://www.linkedin.com/in/vaibhav-jakkula/`,
          streaming: false,
        }]);
        setIsStreaming(false);
      }, 500);
      return;
    }

    setMessages(prev => [...prev, { role: 'agent', content: '', streaming: true }]);

    try {
      let currentThreadId = activeThreadId;

      if (!currentThreadId) {
        const threadRes = await apiFetch('/chat/thread', { method: 'POST' });
        const threadData = await threadRes.json();
        if (threadData.success) {
          currentThreadId = threadData.data.threadId;
          setActiveThread(currentThreadId);
          addThread({
            thread_id: currentThreadId!,
            user_id: user!.id,
            created_at: new Date().toISOString(),
            title: text.substring(0, 30) + '...',
          });
        }
      }

      if (!currentThreadId) throw new Error('Failed to create thread');

      const postRes = await apiFetch('/chat/message', {
        method: 'POST',
        body: JSON.stringify({ message: text, threadId: currentThreadId }),
      });
      const resJson = await postRes.json();
      if (!postRes.ok) throw new Error(resJson.error || 'Failed to send message');

      const jobId = resJson.data.jobId;
      updateCredits(user!.available_credits - 2);

      const sseSource = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/events/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!sseSource.body) throw new Error('No SSE body');
      const reader = sseSource.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const payloadStr = line.replace('data: ', '').trim();
            if (!payloadStr) continue;
            try {
              const payload = JSON.parse(payloadStr);
              if (payload.chunk) {
                buffer += payload.chunk;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'agent', content: buffer, streaming: true };
                  return updated;
                });
              } else if (payload.type === 'chat_done') {
                setIsStreaming(false);
              } else if (payload.error) {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'agent', content: `⚠ ${payload.error}`, streaming: false };
                  return updated;
                });
                setIsStreaming(false);
              }
            } catch { /* ignore */ }
          }
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.streaming) {
          updated[updated.length - 1] = { ...updated[updated.length - 1], streaming: false };
        }
        return updated;
      });
      setIsStreaming(false);

    } catch (err: any) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'agent', content: `⚠ ${err.message}`, streaming: false };
        return updated;
      });
      setIsStreaming(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FBE8CE]">

      {/* Mobile Sidebar Overlay Backdrop */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* ── LEFT SIDEBAR (Spring Loaded) ── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative z-10'} flex-shrink-0 flex flex-col border-r border-[#79AE6F]/10 overflow-hidden bg-[#FBE8CE] w-[280px]`}
          >
            <div className="flex flex-col h-full p-4">
              <div className="flex items-center justify-between mb-8 px-2 pt-2">
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-[#79AE6F] font-bold tracking-tighter text-lg">
                  <div className="w-5 h-5 bg-[#79AE6F] rounded-full" />
                  SPARK.
                </button>
                <button onClick={() => setSidebarOpen(false)} className="text-[#9AB17A] hover:text-[#79AE6F] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => { setMessages([]); setInput(''); setActiveThread(null); }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-[#79AE6F]/20 text-[#79AE6F] text-sm font-semibold hover:bg-[#79AE6F]/5 transition-all mb-6"
              >
                <Plus className="w-4 h-4" />
                New Session
              </button>

              <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                {!token ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3 px-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#79AE6F]/10 border border-[#79AE6F]/20 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-[#9AB17A]" />
                    </div>
                    <p className="text-[#9AB17A] text-xs font-medium text-center leading-relaxed">
                      Sign in to access<br />your session history
                    </p>
                    <button
                      onClick={() => router.push('/login')}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#79AE6F] border border-[#79AE6F]/30 px-4 py-2 rounded-full hover:bg-[#79AE6F] hover:text-[#FBE8CE] transition-all"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Sign In
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AB17A]/60 px-3 mb-3">Recent Sessions</p>
                    {threads.map(t => (
                      <button
                        key={t.thread_id}
                        onClick={() => { setActiveThread(t.thread_id); loadThreadMessages(t.thread_id); }}
                        className={`w-full text-left px-3 py-3 rounded-xl transition-all group ${activeThreadId === t.thread_id ? 'bg-[#79AE6F]/10' : 'hover:bg-[#79AE6F]/5'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[#79AE6F] text-xs font-semibold truncate">{t.title || 'New Session'}</p>
                          </div>
                          <ChevronRight className="w-3 h-3 text-[#9AB17A]/40 flex-shrink-0 mt-0.5 group-hover:text-[#79AE6F] transition-colors" />
                        </div>
                        <p className="text-[#9AB17A]/40 text-[9px] mt-1">{new Date(t.created_at).toLocaleDateString()}</p>
                      </button>
                    ))}
                  </>
                )}
              </div>

              {user && (
                <div className="mt-auto pt-4 space-y-2 border-t border-[#79AE6F]/10">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#79AE6F]/5 border border-[#79AE6F]/10">
                    <Zap className="w-3.5 h-3.5 fill-[#79AE6F] text-[#79AE6F]" />
                    <span className="text-xs font-bold text-[#79AE6F]">{user.available_credits} Credits</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-transparent text-[#9AB17A] text-xs font-bold uppercase tracking-widest hover:text-[#79AE6F] hover:bg-[#79AE6F]/5 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#79AE6F]/10 bg-[#FBE8CE]/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 text-[#79AE6F] font-bold tracking-tighter text-sm sm:text-base hover:opacity-70 transition-opacity mr-1 sm:mr-2"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#79AE6F]/10 border border-[#79AE6F]/20 mr-1">
                  <Menu className="w-4 h-4" />
                </div>
                SPARK.
              </button>
            )}
            <div className="h-4 w-[1px] bg-[#79AE6F]/15" />
            <p className="text-[#9AB17A] text-xs font-medium tracking-widest uppercase">Strategic Council</p>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[#79AE6F] text-xs font-bold">{user.name}</p>
                  <p className="text-[#9AB17A] text-[10px]">{user.email}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#79AE6F] flex items-center justify-center text-[#FBE8CE] text-xs font-bold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full border border-[#79AE6F]/15 hover:bg-[#79AE6F]/10 text-[#79AE6F] transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 text-xs font-bold text-[#79AE6F] border border-[#79AE6F]/25 px-4 py-2 rounded-full hover:bg-[#79AE6F] hover:text-[#FBE8CE] transition-all"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
          )}
        </div>

        {/* ── STRATEGIC ADVICE PANEL (Hover or Click to Expand) ── */}
        <div className="absolute top-20 right-4 sm:right-8 z-20 pointer-events-none">
          <motion.div
            initial={{ width: 44, height: 44, opacity: 0 }}
            animate={{ 
              opacity: 1,
              width: advisoryExpanded ? (isMobile ? 260 : 280) : 44,
              height: advisoryExpanded ? 'auto' : 44
            }}
            onMouseEnter={() => !isMobile && setAdvisoryExpanded(true)}
            onMouseLeave={() => !isMobile && setAdvisoryExpanded(false)}
            onClick={() => isMobile && setAdvisoryExpanded(!advisoryExpanded)}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white/40 backdrop-blur-md border border-[#79AE6F]/20 rounded-2xl shadow-sm pointer-events-auto overflow-hidden group cursor-help"
          >
            <div className={`${isMobile ? 'w-[260px]' : 'w-[280px]'}`}>
              <div className="h-11 w-11 flex items-center justify-center">
                <Lightbulb className={`w-4 h-4 text-[#79AE6F] transition-all duration-300 ${advisoryExpanded ? 'fill-[#79AE6F]/20' : 'fill-none'}`} />
              </div>
              <div className={`px-5 pb-5 transition-opacity duration-300 ${advisoryExpanded ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#79AE6F]">Boardroom Advisory</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="text-[10px] font-bold text-[#9AB17A]/50 mt-1">01</span>
                    <p className="text-[11px] text-[#79AE6F]/90 leading-relaxed font-medium">
                      <strong className="text-[#79AE6F] font-extrabold">Context is Leverage.</strong> Introduce your company and mission to sharpen the critique.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[10px] font-bold text-[#9AB17A]/50 mt-1">02</span>
                    <p className="text-[11px] text-[#79AE6F]/90 leading-relaxed font-medium">
                      <strong className="text-[#79AE6F] font-extrabold">Provide a URL.</strong> Giving the agent your website allows it to scan your actual positioning.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[10px] font-bold text-[#9AB17A]/50 mt-1">03</span>
                    <p className="text-[11px] text-[#79AE6F]/90 leading-relaxed font-medium">
                      <strong className="text-[#79AE6F] font-extrabold">Be Brutally Honest.</strong> State your real bottlenecks.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-8 pb-24">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="text-center max-w-md"
              >
                <div className="w-14 h-14 rounded-3xl bg-[#79AE6F]/10 border border-[#79AE6F]/20 flex items-center justify-center mx-auto mb-6">
                  <div className="w-6 h-6 bg-[#79AE6F] rounded-full" />
                </div>
                <h2 className="text-[#79AE6F] text-2xl font-bold tracking-tight mb-3">The Partner is in.</h2>
                <p className="text-[#9AB17A] text-sm leading-relaxed">
                  State your strategic challenge. The agent will apply McKinsey logic, Blue Ocean frameworks, and Buffett's Moat theory.
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
              {messages.map((msg, i) => {
                const followUpRegex = /\n(?=###\s+\d+\.\s+The (?:Partner's|Partners)\s+Follow-?up)/i;
                const parts = msg.content.split(followUpRegex);
                const mainBody = parts[0];
                const followUp = parts.length > 1 ? parts.slice(1).join('\n') : null;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: msg.role === 'agent' ? 0.2 : 0 }}
                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'agent' && (
                       <div className="w-7 h-7 rounded-full bg-[#79AE6F] flex-shrink-0 flex items-center justify-center mt-0.5">
                         <div className="w-3 h-3 bg-[#FBE8CE] rounded-full" />
                       </div>
                    )}
                    <div className={`flex flex-col gap-2 sm:gap-3 max-w-[95%] sm:max-w-[90%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                      <div className={`${msg.role === 'user' ? 'bg-[#79AE6F] text-[#FBE8CE] rounded-tr-md' : 'bg-white/50 border border-[#79AE6F]/15 rounded-tl-md'} px-4 sm:px-6 py-4 sm:py-5 rounded-3xl backdrop-blur-sm min-w-[140px] sm:min-w-[220px]`}>
                        {msg.role === 'agent' && <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AB17A]/60 mb-3">Senior Partner</div>}
                        {msg.streaming && !msg.content ? (
                          <ThinkTankLoader />
                        ) : (
                          <div className={`${msg.role === 'user' ? 'text-[#FBE8CE]' : 'text-[#79AE6F]'} text-sm leading-relaxed font-medium`}>
                            {msg.role === 'agent' ? <AgentMarkdown content={mainBody} /> : msg.content}
                            {msg.streaming && msg.content && !followUp && <span className="inline-block w-1.5 h-4 ml-1 bg-[#79AE6F] animate-pulse align-middle rounded-sm" />}
                          </div>
                        )}
                      </div>
                      {followUp && !msg.streaming && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.15 }}
                          className="bg-[#79AE6F]/[0.07] border border-[#79AE6F]/25 px-6 py-5 rounded-3xl rounded-tl-md backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-4 h-4 rounded-full border-2 border-[#79AE6F]/50 flex items-center justify-center">
                              <span className="text-[8px] font-black text-[#79AE6F]">?</span>
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#79AE6F]/70">Partner's Follow-up</div>
                          </div>
                          <AgentMarkdown content={followUp} />
                        </motion.div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                       <div className="w-7 h-7 rounded-full bg-[#9AB17A]/20 border border-[#79AE6F]/20 flex-shrink-0 flex items-center justify-center text-[#79AE6F] text-[10px] font-bold mt-0.5">
                         {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                       </div>
                    )}
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-[#79AE6F]/10 bg-[#FBE8CE]/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <motion.div 
               animate={{ scale: isFocused ? 1.015 : 1 }}
               transition={{ type: 'spring', stiffness: 300, damping: 20 }}
               className={`relative flex items-end gap-3 bg-white/40 border rounded-3xl px-5 py-3.5 transition-all duration-300 shadow-sm ${isFocused ? 'border-[#79AE6F]/50 ring-1 ring-[#79AE6F]/10' : 'border-[#79AE6F]/20'}`}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isStreaming}
                placeholder={token ? "State your strategic challenge..." : "Sign in to engage the agent..."}
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-sm text-[#79AE6F] placeholder-[#9AB17A]/50 leading-relaxed max-h-40 disabled:opacity-50 py-0.5"
              />
              <MagneticButton disabled={isStreaming || !input.trim()}>
                <button
                  onClick={() => handleSend()}
                  disabled={isStreaming || !input.trim()}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-[#79AE6F] border border-[#79AE6F] flex items-center justify-center text-[#FBE8CE] transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </MagneticButton>
            </motion.div>
            <p className="text-center text-[#9AB17A]/50 text-[10px] mt-2.5 tracking-wide">
              {token ? `${user?.available_credits ?? 0} credits remaining · 2 per message` : 'Sign in to preserve your session history'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageInner />
    </Suspense>
  );
}
