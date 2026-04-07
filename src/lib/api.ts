import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

/**
 * A tiny wrapper around native fetch that automatically injects the auth token.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Default to JSON if not explicitly passed
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 402) {
    throw new Error('Payment Required: You are out of credits!');
  }
  
  if (response.status === 401) {
    useAuthStore.getState().logout();
    throw new Error('Unauthorized. Please log in again.');
  }

  return response;
}
