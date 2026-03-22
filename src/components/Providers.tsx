'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';

export function Providers({ children }: { children: React.ReactNode }) {
  // Use a placeholder if not defined in .env yet
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '123-placeholder.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
