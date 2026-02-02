import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onThemeToggle: () => void;
  onHome: () => void;
  onSignOut: () => void;
}

export default function AppMobileMenu({ open, onClose, onThemeToggle, onHome, onSignOut }: MobileMenuProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex justify-end">
      <div className="w-64 h-full bg-white dark:bg-slate-900 shadow-lg flex flex-col">
        <button className="self-end p-4 text-gray-500 hover:text-gray-900 dark:hover:text-white" onClick={onClose}>
          ✕
        </button>
        <div className="flex-1 flex flex-col gap-2 px-6">
          <button 
            className="py-2 text-left flex items-center gap-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded" 
            onClick={e => { 
              onThemeToggle();
            }}
          >
            <span className="flex items-center gap-3 w-full">
              <span className="font-medium">Dark Mode</span>
              <span className="ml-auto">
                <span
                  className={`relative inline-block w-12 h-7 align-middle select-none transition duration-200 ease-in`}
                >
                  <input
                    type="checkbox"
                    checked={theme === 'dark'}
                    readOnly
                    className="sr-only"
                  />
                  <span
                    className={`block w-12 h-7 rounded-full transition-colors duration-200 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}
                  ></span>
                  <span
                    className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${theme === 'dark' ? 'translate-x-5' : ''}`}
                  >
                    {theme === 'dark' ? (
                      <Sun size={16} className="text-yellow-400 mx-auto mt-0.5" />
                    ) : (
                      <Moon size={16} className="text-gray-500 mx-auto mt-0.5" />
                    )}
                  </span>
                </span>
              </span>
            </span>
          </button>
          <button className="py-2 text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded" onClick={onHome}>
            Home
          </button>
        </div>
        <div className="px-6 pb-6 mt-auto">
          <button
            className="w-full py-2 text-left text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded font-semibold mb-2"
            onClick={() => {
              onClose();
              router.push('/account');
            }}
          >
            Account
          </button>
          {user ? (
            <button className="w-full py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded font-semibold" onClick={onSignOut}>
              Sign Out
            </button>
          ) : (
            <button className="w-full py-2 text-left text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded font-semibold" onClick={() => { onClose(); router.push('/login'); }}>
              Sign In
            </button>
          )}
        </div>
      </div>
      <div className="flex-1" onClick={onClose}></div>
    </div>
  );
}
