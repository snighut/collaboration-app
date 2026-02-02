import React, { useState } from 'react';
import { ThemeToggleButton } from './ThemeToggleButton';
import { useRouter } from 'next/navigation';
import { UserCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabaseClient';

export default function ProfileSignInMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, session, loading } = useAuth();

  const handleMenuClick = (path: string) => {
    setOpen(false);
    // Get current path with query string for redirect
    const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  if (loading) {
    return (
      <div className="flex items-center px-4 py-2 min-w-[64px] justify-center">
        <span className="text-gray-400 text-lg">...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="relative flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">DARK MODE</span>
          <ThemeToggleButton />
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="true"
          aria-expanded={open}
          style={{ marginRight: 50 }}
        >
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.full_name || 'User'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <UserCircle size={32} className="w-8 h-8 text-white bg-gray-700 rounded-full" />
          )}
        </button>
        {open && (
          <div className="absolute right-0 top-12 w-32 bg-white/100 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg shadow-lg z-50">
            <button
              className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
              onClick={() => {
                setOpen(false);
                router.push('/account');
              }}
            >
              Account
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 dark:hover:bg-slate-700"
              onClick={async () => {
                setOpen(false);
                await supabase.auth.signOut();
                router.refresh && router.refresh();
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">DARK MODE</span>
        <ThemeToggleButton />
      </div>
      <button
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        onClick={() => { setOpen((v) => !v); handleMenuClick('/login'); }}
        aria-haspopup="true"
        aria-expanded={open}
        style={{ marginRight: 70 }}
      >
        <UserCircle size={22} />
        <span>Sign In</span>
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-32 bg-white/100 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg shadow-lg z-50">
          {/* <button
            className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 dark:hover:bg-slate-700"
            onClick={() => handleMenuClick('/login')}
          >
            Sign In
          </button> */}
          {/* <button
            className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 dark:hover:bg-slate-700"
            onClick={() => handleMenuClick('/login')}
          >
            Sign Up
          </button> */}
        </div>
      )}
    </div>
  );
}
