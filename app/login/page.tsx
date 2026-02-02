"use client";
import AuthProviders from "@/components/AuthProviders";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const { session } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/mydesigns';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<'login'|'signup'>('login');

  useEffect(() => {
    if (session) {
      router.replace(redirect);
    }
  }, [session, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (mode === 'login') {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) setError(loginError.message);
    } else {
      const { error: signupError } = await supabase.auth.signUp({ email, password });
      if (signupError) setError(signupError.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <form className="mb-8" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
          <div className="flex gap-2 mb-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors"
            >
              {loading ? (mode === 'login' ? 'Logging in...' : 'Signing up...') : (mode === 'login' ? 'Login' : 'Sign Up')}
            </button>
            {/* <button
              type="button"
              className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-100 font-semibold shadow hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'Switch to Sign Up' : 'Switch to Login'}
            </button> */}
          </div>
        </form>
        {/* We might add social login options here in the future. */}
        {/* <AuthProviders redirect={redirect} /> */}
      </div>
    </div>
  );
}
