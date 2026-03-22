'use client';
import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { apiFetch } from '../lib/api';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, token, updateCredits } = useAuthStore();
  
  const [idea, setIdea] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamData, setStreamData] = useState<string>("");
  const [finalStrategy, setFinalStrategy] = useState<any>(null);
  const [errorLine, setErrorLine] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return router.push('/login');
    if (!idea.trim()) return;

    setIsStreaming(true);
    setStreamData("");
    setFinalStrategy(null);
    setErrorLine(null);

    try {
      // 1. Initiate Validation Run
      const postRes = await apiFetch('/spark/validate', {
        method: 'POST',
        body: JSON.stringify({ idea }),
      });
      
      const { data } = await postRes.json();
      const runId = data.runId;

      // Optimistically deduct credits locally
      updateCredits(user!.available_credits - 15);

      // 2. Open Server-Sent Events (SSE) Stream
      const sseSource = await fetch(`http://localhost:3001/api/spark/events/${runId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!sseSource.body) throw new Error("No SSE body");

      const reader = sseSource.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsStreaming(false);
          break;
        }

        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const payloadStr = line.replace('data: ', '').trim();
            if(!payloadStr) continue;

            try {
              const payload = JSON.parse(payloadStr);

              if (payload.chunk) {
                // Stream text chunk
                setStreamData((prev) => prev + payload.chunk);
              } else if (payload.strategy) {
                // Final strategy ready
                setFinalStrategy(payload.strategy);
                setIsStreaming(false);
              } else if (payload.error) {
                setErrorLine(payload.error);
                setIsStreaming(false);
                updateCredits(user!.available_credits); // refund locally
              }
            } catch {
              // Ignore heartbeat/ping JSON errors
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorLine(err.message);
      setIsStreaming(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col items-center justify-center overflow-x-hidden pt-20 pb-24">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Navbar: Credits Indicator */}
      {user && (
        <div className="absolute top-6 right-8 flex items-center space-x-4 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md z-50 shadow-xl">
          <span className="text-sm font-medium text-gray-300">{user.name}</span>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-sm font-bold text-yellow-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-current" /> {user.available_credits}
          </span>
        </div>
      )}

      <main className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">
        
        {/* Badge / Pill */}
        {!finalStrategy && !streamData && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md shadow-2xl"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-zinc-300 tracking-wide">Spark Developer Agent v2.0</span>
          </motion.div>
        )}

        {/* Hero Headline */}
        {!finalStrategy && !streamData && (
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 text-center"
          >
            Bring your ideas to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              brilliant reality.
            </span>
          </motion.h1>
        )}

        {/* Subtitle */}
        {!finalStrategy && !streamData && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-zinc-400 mb-12 text-center max-w-2xl leading-relaxed"
          >
            Describe your platform. We instantly generate deep market validation, technical architecture, and a strategic blueprint.
          </motion.p>
        )}

        {/* Error Boundary */}
        {errorLine && (
           <motion.div 
             initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
             className="w-full mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm backdrop-blur-md"
           >
             ❌ {errorLine}
           </motion.div>
        )}

        {/* Input Area */}
        {(!finalStrategy && !streamData) || isStreaming ? (
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative group shadow-2xl rounded-3xl"
          >
            {/* Subtle glow behind the input box */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-3xl blur-xl transition-opacity duration-700 ${isStreaming ? 'opacity-100 animate-pulse' : 'opacity-0 group-focus-within:opacity-100'}`} />
            
            <div className="relative bg-zinc-900/70 backdrop-blur-2xl border border-zinc-800 focus-within:border-zinc-700 rounded-3xl overflow-hidden transition-all duration-300">
              <textarea 
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                disabled={isStreaming}
                placeholder={!token ? "Sign in to generate a strategy..." : "I want to build a platform that..."}
                className="w-full h-44 bg-transparent text-zinc-100 placeholder-zinc-500 p-6 md:p-8 outline-none resize-none text-xl leading-relaxed font-light disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if(idea.trim()) handleSubmit(e);
                  }
                }}
              />
              
              {/* Input Footer */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                
                {/* Credits */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/50 border border-zinc-800/80 text-xs text-zinc-400 backdrop-blur-md">
                  <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">15 Credits</span>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={isStreaming || !idea.trim()}
                  className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded-full font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isStreaming ? (
                    <span className="animate-pulse">Analyzing...</span>
                  ) : (
                    <>
                      Generate
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.form>
        ) : null}

        {/* Streaming Canvas */}
        {streamData && !finalStrategy && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mt-8 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 font-mono text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed shadow-2xl relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse" />
             {streamData}
             <span className="inline-block w-2 h-4 ml-1 bg-white animate-pulse" />
          </motion.div>
        )}

        {/* Structured Output (Strategy) */}
        {finalStrategy && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full mt-10"
          >
            <div className="bg-zinc-900/60 border border-white/10 rounded-[32px] overflow-hidden p-8 md:p-12 backdrop-blur-2xl shadow-2xl">
              <div className="mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {finalStrategy.productName}
                </h2>
                <p className="text-xl text-zinc-400">Target: {finalStrategy.targetUser}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white border-b border-white/10 pb-3 flex items-center gap-2">
                    <span className="text-xl">🎯</span> Market Gap
                  </h3>
                  <p className="text-zinc-300 leading-relaxed font-light">{finalStrategy.marketGap}</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white border-b border-white/10 pb-3 flex items-center gap-2">
                    <span className="text-xl">⚠️</span> Biggest Risk
                  </h3>
                  <p className="text-red-300/90 leading-relaxed font-light">{finalStrategy.riskFactor}</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-emerald-400 border-b border-white/10 pb-3 flex items-center gap-2">
                    <span className="text-xl">✅</span> Do in V1
                  </h3>
                  <ul className="space-y-3">
                     {finalStrategy.coreFeatures.map((f: string, i: number) => (
                       <li key={i} className="text-zinc-300 flex items-start text-sm md:text-base font-light">
                         <span className="mr-3 text-emerald-500 font-bold">✓</span> <span className="pt-[2px]">{f}</span>
                       </li>
                     ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-zinc-500 border-b border-white/10 pb-3 flex items-center gap-2">
                    <span className="text-xl">🚫</span> NOT doing
                  </h3>
                  <ul className="space-y-3">
                     {finalStrategy.notDoing.map((f: string, i: number) => (
                       <li key={i} className="text-zinc-500 line-through decoration-zinc-700 flex items-start text-sm md:text-base font-light">
                         <span className="pt-[2px]">{f}</span>
                       </li>
                     ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Primary Success Metric</span>
                <span className="text-lg font-semibold text-white bg-white/5 border border-white/10 px-5 py-2 rounded-full shadow-inner">{finalStrategy.successMetric}</span>
              </div>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}
