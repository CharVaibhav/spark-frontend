'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import TextType from '@/components/TextType';

const ROTATING_WORDS = ["Logan Roy?", "ruthless?", "unbeatable?", "in the 1%?"];

function DecryptText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%#!$';

  useEffect(() => {
    let iteration = 0;
    let interval: NodeJS.Timeout;

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayText(text.split('').map((char, index) => {
          if (index < iteration) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join(''));

        if (iteration >= text.length) clearInterval(interval);
        iteration += 1/6;
      }, 40);
    }, 800);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text]);

  return <span>{displayText}</span>;
}

function RotatingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-[9vw] md:text-[5vw] lg:text-[4.5vw] leading-[1.1] font-bold tracking-tight text-[#79AE6F] uppercase">
      Want to be<br />
      <div className="relative h-[1.2em] overflow-hidden mt-1">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={index}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 text-[#9AB17A] italic"
          >
            {ROTATING_WORDS[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MarqueeTicker({ strings, reverse = false, speed = 20 }: { strings: string[], reverse?: boolean, speed?: number }) {
  return (
    <div className="flex overflow-hidden whitespace-nowrap select-none group py-2">
      <motion.div
        animate={{ x: reverse ? [0, -100 + "%"] : [-100 + "%", 0] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex gap-8 items-center"
      >
        {[...strings, ...strings].map((s, i) => (
          <span key={i} className="text-[#9AB17A]/80 text-[clamp(0.75rem,2vw,1.25rem)] font-black uppercase tracking-[0.2em] italic">
            {s}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [idea, setIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    router.push(`/chat?prompt=${encodeURIComponent(idea)}`);
  };

  const prompts = [
    {
      no: '01',
      prompt: `We're Zepto (https://zeptnow.com). Zomato (Blinkit) and Swiggy (Instamart) have 10x our cash. Can a 10-minute delivery startup actually survive a price war in India?`,
    },
    {
      no: '02',
      prompt: `We're Pocket FM (https://www.pocketfm.com). We have massive traffic, but 65% of listeners drop off after the 3rd free episode. How do we fix the content-activation loop?`,
    },
    {
      no: '03',
      prompt: `We've onboarded 10 million merchants on Khatabook (https://khatabook.com). They love the free ledger, but 0.1% are paying for premium features. How do we monetize the Indian SMB?`,
    },
  ];

  return (
    <div className="relative min-h-screen selection:bg-[#79AE6F]/20 selection:text-[#79AE6F]">
      {/* Grid Pattern Layer */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-40 md:opacity-100" />

      {/* Logo / Nav */}
      <main className="relative z-10 w-full flex flex-col">
        {/* Fold 1: The Boardroom */}
        <div className="relative grid md:grid-cols-[1.2fr_1fr] min-h-screen lg:min-h-0">
          {/* Nav within first section */}
          <nav className="absolute top-0 left-0 w-full p-6 sm:p-8 md:p-12 z-50 flex justify-between items-center">
            <div className="flex items-center gap-4 sm:gap-8">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.push('/')}
                className="text-[#79AE6F] text-xl sm:text-2xl font-bold tracking-tighter flex items-center gap-2"
              >
                <svg width="24" height="24" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8">
                  <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M185.01 152.663C194.797 136.865 200 118.629 200 100C200 73.4783 189.464 48.043 170.711 29.2893C151.957 10.5357 126.522 0 100 0C80.2219 0 60.8879 5.8649 44.443 16.853C27.9981 27.8412 15.1809 43.459 7.61209 61.7317C0.0433283 80.0043 -1.93701 100.111 1.92152 119.509C5.78004 138.907 15.3041 156.725 29.2894 170.711C43.2746 184.696 61.0929 194.22 80.491 198.079C99.8891 201.937 119.996 199.957 138.268 192.388C156.541 184.819 172.159 172.002 183.147 155.557C183.771 154.622 184.379 153.678 184.971 152.726L185 152.73C185.003 152.707 185.006 152.685 185.01 152.663ZM101.665 12.0157C88.8446 36.5404 79.7023 41.4265 72.9097 45.0001C66.8397 48.2301 62.8397 50.3601 56.8497 76.3201C51.4416 99.7552 36.1602 116.929 15.2424 123.667C17.7332 132.587 21.6298 141.106 26.8307 148.89C27.1222 149.326 27.4173 149.76 27.7161 150.19C34.6053 134.198 54.2918 120.176 83.24 111.27C100.73 105.88 100.1 97.0001 97 77.4301C95.76 69.5801 94.36 60.6701 95 51.5701C95.62 42.8301 99.7 33.5701 106.19 26.1801C110.378 21.4059 115.454 17.5185 121.244 14.6027C114.864 13.0156 108.298 12.1412 101.665 12.0157ZM50.9496 173.062C45.9352 169.696 41.2795 165.821 37.0571 161.5C38.4048 143.815 63.3682 129.937 86.78 122.73C114.97 114.06 111.74 93.5601 108.89 75.5601C107.69 67.9901 106.45 60.1601 107 52.4301C108.332 33.6201 126.393 23.6891 139.215 21.2205C142.543 22.8774 145.776 24.7496 148.89 26.8307C149.314 27.114 149.736 27.4008 150.154 27.6911C140.822 34.8518 127.266 50.1433 128 78.12C128.209 86.1941 130.796 93.8589 133.534 101.972L133.54 101.99L133.541 101.993C139.38 119.332 145.419 137.261 130.74 164.08C123.963 176.498 118.061 181.389 109.389 187.498C105.448 187.921 101.491 188.076 97.5471 187.966C107.136 179.143 118.334 166.219 117.12 154.81C116.65 150.46 114.36 144.5 105.41 140.52C96.4598 136.54 87.6798 136.41 79.2998 140.13C65.0908 146.45 55.6978 162.715 50.9496 173.062ZM140 77.84C139.318 52.1114 153.137 39.8993 159.863 35.4982C166.446 41.6084 172.061 48.6956 176.505 56.5147C167.724 61.3208 158 70.7443 158 85.9999C158 96.7899 162.45 106.33 166.8 115.54C171.278 125.146 175.542 134.296 175.55 145.124C171.85 151.319 167.382 157.068 162.225 162.225C154.096 170.354 144.496 176.771 133.995 181.169C136.418 178.021 138.815 174.344 141.26 169.88C158.413 138.563 150.959 116.277 144.969 98.367L144.91 98.19C142.36 90.64 140.16 84.12 140 77.84ZM183.043 129.119C181.155 122.796 178.462 116.998 175.917 111.519L175.82 111.31C171.8 102.71 168 94.5799 168 85.9999C168 74.8109 175.322 68.5959 180.948 65.4834C181.067 65.7628 181.185 66.043 181.301 66.3239C187.962 82.4038 189.705 100.098 186.309 117.168C185.499 121.24 184.406 125.232 183.043 129.119ZM61.3781 179.072C63.0001 179.864 64.6493 180.608 66.3239 181.301C71.1912 183.318 76.2065 184.883 81.3075 185.992C92.2937 177.372 105.991 163.364 105.21 156.08L105.209 156.074C105.129 155.34 104.918 153.415 100.56 151.48C94.7698 148.91 89.4198 148.78 84.1998 151.1C73.6855 155.763 65.6231 169.568 61.3781 179.072ZM12.8005 111.842C29.1805 106.149 40.7803 92.6015 45.1497 73.6501C51.9997 43.8801 57.9997 39.3501 67.2697 34.4401C72.3615 31.7499 78.4328 28.498 87.4881 12.907C68.7849 15.612 51.3233 24.2845 37.8039 37.8038C21.3064 54.3013 12.0265 76.6691 12 100C12 103.976 12.2694 107.932 12.8005 111.842Z" 
                    fill="currentColor"
                  />
                </svg>
                SPARK.
              </motion.button>
              
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => router.push('/login')}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-[#79AE6F] text-[#79AE6F] font-black text-[10px] sm:text-xs uppercase tracking-[0.1em] hover:bg-[#79AE6F] hover:text-[#FBE8CE] transition-all duration-300 active:scale-95"
              >
                Login
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-[#79AE6F] text-[#79AE6F] font-black text-[10px] sm:text-xs uppercase tracking-[0.1em] hover:bg-[#79AE6F] hover:text-[#FBE8CE] transition-all duration-300 active:scale-95 text-nowrap"
              >
                Sign Up
              </button>
            </div>
          </nav>
          {/* Left: Bold Statement */}
          <section className="flex flex-col justify-center p-6 sm:p-8 md:p-24 lg:p-32 border-b md:border-b-0 md:border-r border-[#0000000a] pt-32 md:pt-24">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ willChange: 'transform, opacity' }}
              >
                <h1 className="text-[10vw] md:text-[6vw] lg:text-[5.5vw] leading-[0.95] font-black tracking-tighter text-[#79AE6F] mb-6 uppercase">
                  <TextType 
                    text="The 1%" 
                    typingSpeed={40}
                    loop={false}
                    showCursor={false}
                    className="inline"
                  />
                  <br />
                  <TextType 
                    text="Boardroom." 
                    typingSpeed={40}
                    initialDelay={800}
                    loop={false}
                    showCursor={false}
                    className="inline"
                  />
                </h1>

                <p className="text-[#9AB17A] text-lg font-medium max-w-sm leading-relaxed mb-10">
                  1% mental models. McKinsey logic. Buffett&apos;s moats. No sugarcoating, just raw directive.
                </p>

                <div className="flex items-center gap-2 text-[#79AE6F] text-sm font-bold uppercase tracking-widest">
                  <div className="w-8 h-[1px] bg-[#79AE6F]" />
                  Directives Only.
                </div>
              </motion.div>
            </div>
          </section>

          {/* Right: Prompt Cards */}
          <section className="flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:p-24 bg-white/10 backdrop-blur-[2px]">
            <AnimatePresence mode="wait">
              <motion.div
                key="input-form"
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg mx-auto"
              >
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Discovery header */}
                  <div className="mb-6">
                    <p className="text-[#79AE6F] text-base font-semibold leading-snug">Pick a scenario.</p>
                    <p className="text-[#9AB17A] text-sm font-normal mt-1">See how the agent thinks.</p>
                  </div>

                  {/* Prompt Cards */}
                  <div className="space-y-3">
                    {prompts.map(({ no, prompt }) => (
                      <button
                        key={no}
                        type="button"
                        onClick={() => setIdea(prompt)}
                        className={`w-full text-left flex items-start gap-4 px-5 py-4 rounded-2xl border transition-all duration-300 ${idea === prompt
                            ? 'border-[#79AE6F]/60 bg-[#79AE6F]/[0.06]'
                            : 'border-[#79AE6F]/15 bg-white/20 hover:border-[#79AE6F]/35 hover:bg-[#79AE6F]/[0.03]'
                          }`}
                      >
                        <span className="text-[10px] font-bold text-[#9AB17A]/50 mt-[3px] flex-shrink-0 tabular-nums tracking-widest">
                          {no}
                        </span>
                        <span className={`text-sm font-medium leading-relaxed italic transition-colors duration-300 ${idea === prompt ? 'text-[#79AE6F]' : 'text-[#9AB17A]'
                          }`}>
                          "{prompt}"
                        </span>
                        {idea === prompt && (
                          <span className="ml-auto flex-shrink-0 mt-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#79AE6F]" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Hidden sync */}
                  <textarea value={idea} onChange={(e) => setIdea(e.target.value)} className="sr-only" aria-hidden readOnly />

                  {/* CTA Row */}
                  <div className="flex items-center justify-between pt-3">
                    <p className={`text-xs transition-all duration-300 ${idea.trim() ? 'text-[#9AB17A] opacity-100' : 'opacity-0'}`}>
                      Selected — ready to run
                    </p>
                    <button
                      type="submit"
                      disabled={!idea.trim()}
                      className="flex items-center gap-2 text-sm font-bold text-[#79AE6F] border border-[#79AE6F]/30 px-6 py-2.5 rounded-full transition-all duration-300 hover:bg-[#79AE6F] hover:text-[#FBE8CE] hover:border-[#79AE6F] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Run this →
                    </button>
                  </div>
                </form>
              </motion.div>
            </AnimatePresence>
          </section>
        </div>

        {/* Fold 2: Logan Roy */}
        <div className="grid md:grid-cols-[1.2fr_1fr] border-t border-[#79AE6F]/10 relative overflow-hidden">
          {/* Left: Logan Roy Image */}
          <section className="flex flex-col justify-center items-center p-6 sm:p-8 md:p-24 lg:p-32 border-r border-[#79AE6F]/10 relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
              style={{ willChange: 'transform, opacity' }}
              className="relative w-full max-w-[28rem] aspect-[3/4]"
            >
              <Image
                src="/loganroy.svg"
                alt="Logan Roy Art"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain mix-blend-multiply opacity-85 hover:opacity-100 transition-opacity duration-700 pointer-events-none md:pointer-events-auto"
                style={{
                  WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
                  maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)'
                }}
              />
            </motion.div>
          </section>

          {/* Right: Rotating Text */}
          <section className="flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:p-24 bg-white/10 backdrop-blur-[2px] border-t md:border-t-0 border-[#79AE6F]/10">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: 'transform, opacity' }}
            >
              <RotatingText />
              <p className="text-[#9AB17A] text-base md:text-lg font-medium max-w-sm leading-relaxed mt-4 sm:mt-8 mb-10">
                The boardroom doesn&apos;t care. It wants leverage. Step inside and let the agent gut your strategy.
              </p>

              <button
                onClick={() => router.push('/chat')}
                className="flex items-center gap-2 text-sm font-bold text-[#79AE6F] border border-[#79AE6F]/30 px-6 py-2.5 rounded-full transition-all duration-300 hover:bg-[#79AE6F] hover:text-[#FBE8CE] hover:border-[#79AE6F] hover:scale-105 active:scale-95 w-fit"
              >
                Run my replica →
              </button>
            </motion.div>
          </section>
        </div>

        {/* Fold 3: Kendall Roy */}
        <div className="grid md:grid-cols-[1.1fr_1fr] border-t border-[#79AE6F]/10 relative overflow-hidden bg-[#79AE6F]/[0.02]">
          {/* Tickers - Full Width */}
          <div className="absolute top-8 md:top-24 left-0 w-[200%] pointer-events-none z-0 opacity-40 md:opacity-100">
            <MarqueeTicker speed={50} strings={["SYNERGY", "PIVOT", "OPTICS", "LEVERAGE", "DISRUPT", "ALIGNMENT", "VIBE-CHECK"]} />
          </div>

          <div className="absolute bottom-8 md:bottom-24 left-0 w-[200%] pointer-events-none z-0 opacity-40 md:opacity-100">
            <MarqueeTicker reverse speed={35} strings={["HYPER-GROWTH", "ECOSYSTEM", "UNIT ECONOMICS", "GO-TO-MARKET", "TECHNO-GATSBY"]} />
          </div>

          {/* Left: Tickers & Text */}
          <section className="flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:p-24 border-r border-[#79AE6F]/10 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: 'transform, opacity' }}
              className="relative"
            >
              <h2 className="text-[10.5vw] sm:text-[9vw] md:text-[5.5vw] leading-[0.9] font-black tracking-tighter text-[#79AE6F] uppercase mb-6 drop-shadow-sm pt-24 md:pt-0">
                The Number <br />
                One Boy.
              </h2>
              <p className="text-[#79AE6F] text-base md:text-lg font-medium max-w-sm leading-relaxed mb-10 opacity-90">
                Legacy is dead. Scale or be scavenged. Let the Number One Boy gut your strategy.
              </p>
              
              <button
                onClick={() => router.push('/chat')}
                className="flex items-center gap-2 text-sm font-bold text-[#FBE8CE] bg-[#79AE6F] px-8 py-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg shadow-[#79AE6F]/20 mb-8 md:mb-0"
              >
                Let&apos;s make some noise →
              </button>
            </motion.div>
          </section>

          {/* Right: Kendall SVG */}
          <section className="flex flex-col justify-center items-center p-6 sm:p-8 md:p-24 relative overflow-hidden border-t md:border-t-0 border-[#79AE6F]/10">
             <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: 'transform, opacity' }}
              className="relative w-full max-w-[24rem] md:max-w-[30rem] aspect-[3/4]"
            >
              <Image 
                src="/kendalroy.svg" 
                alt="Kendall Roy Art" 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain mix-blend-multiply opacity-80 hover:opacity-100 transition-all duration-700"
                style={{
                  WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
                  maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)'
                }}
              />
            </motion.div>
          </section>
        </div>
        {/* Final CTA: The CEO Mandate */}
        <div className="py-24 md:py-32 flex flex-col items-center justify-center text-center px-8 border-t border-[#79AE6F]/10 bg-[#79AE6F]/[0.02]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <h2 className="text-[8vw] md:text-[4vw] font-black tracking-tight text-[#79AE6F] uppercase mb-6 leading-tight">
              CEO's don&apos;t wait. <br />
              Why should you?
            </h2>
            <p className="text-[#9AB17A] text-lg md:text-xl font-semibold max-w-lg mb-10 leading-relaxed uppercase tracking-wide">
              The boardroom is open. Take action now or watch your market share get scavenged. 
            </p>
            
            <button
              onClick={() => router.push('/chat')}
              className="group relative flex items-center gap-4 text-xl font-black text-[#FBE8CE] bg-[#79AE6F] px-12 py-5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl shadow-[#79AE6F]/20"
            >
              TAKE ACTION NOW
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </button>
            
            <div className="mt-12 text-[10px] font-black text-[#9AB17A]/40 uppercase tracking-[0.5em] italic">
              Strategic Council — Final Directive
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
