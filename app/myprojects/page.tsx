'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function MyProjects() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 z-50 flex items-center px-8 shadow-sm">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Portfolio</span>
        </button>
        <h1 className="ml-8 text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent uppercase tracking-tight">
          My Projects
        </h1>
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700">
            <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🚀</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Projects Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              This is your projects management area. Content coming soon...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
