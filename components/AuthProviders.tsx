import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebook, FaAmazon } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthProvider';
import type { Provider } from '@supabase/auth-js';

const PROVIDERS: { id: Provider; label: string; icon: React.ReactNode }[] = [
  { id: 'google', label: 'Google', icon: <FcGoogle size={22} /> },
  { id: 'apple', label: 'Apple', icon: <FaApple size={22} className="text-black dark:text-white" /> },
  { id: 'facebook', label: 'Facebook', icon: <FaFacebook size={22} className="text-blue-600" /> },
];

export default function AuthProviders({ redirect }: { redirect?: string }) {
  const { user } = useAuth();

  const handleLogin = async (provider: Provider) => {
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login?redirect=${encodeURIComponent(redirect || '/')}` : undefined } });
  };

  if (user) return null;

  return (
    <div>
      <div className="mb-6 text-center text-gray-700 dark:text-gray-200 text-lg font-medium">
        or continue with
      </div>
      <div className="flex flex-col gap-2 items-center justify-center">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleLogin(p.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm w-40 justify-center"
            style={{ fontSize: '0.95rem' }}
          >
            {p.icon}
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
