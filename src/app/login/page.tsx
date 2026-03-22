'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSuccess = async (response: any) => {
    try {
      if (!response.credential) throw new Error("No credential");

      const backendRes = await fetch('http://localhost:3001/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential }),
      });

      const { data, success } = await backendRes.json();
      
      if (success) {
        setAuth(data.token, data.user);
        router.push('/');
      }
    } catch (err) {
      console.error('Login failed', err);
      alert('Login flow failed. Check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative">
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-[24px] overflow-hidden backdrop-blur-3xl bg-[#ffffff08] border border-white/10 p-10 ring-1 ring-white/10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 mb-6 flex items-center justify-center">
            <span className="text-white text-xl font-bold font-mono">S</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">Welcome back</h2>
          <p className="text-gray-400 text-sm">Please sign in to continue via Google Identity.</p>
        </div>

        <div className="flex justify-center p-1 bg-white/5 rounded-xl border border-white/5 w-full hover:bg-white/10 transition">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              console.log('Login Error');
              alert('Error with Google Popup');
            }}
            useOneTap
            shape="pill"
            theme="filled_black"
          />
        </div>

        <p className="mt-8 text-center text-xs text-gray-600">
          By continuing, you agree to our Terms of Service and implicitly claim 50 free credits.
        </p>
      </motion.div>
    </div>
  );
}
