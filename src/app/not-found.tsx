'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10"
      >
        <h1 className="text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-gray-700 to-black tracking-tighter leading-none mb-0 pt-0">
          404
        </h1>
        <h2 className="text-3xl font-medium tracking-tight mb-6 -mt-10">Signal Lost.</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-10 text-lg">
          The node you are looking for has been disconnected from the primary network. Let's get you back on track.
        </p>
        
        <Link 
          href="/" 
          className="px-8 py-3 bg-white text-black font-medium rounded-full hover:scale-105 transition-transform inline-block"
        >
          Return to Hub
        </Link>
      </motion.div>

      {/* Decorative Grid BG */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
    </div>
  );
}
