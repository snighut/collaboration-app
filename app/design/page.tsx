'use client'

import React, { useEffect, Suspense, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { List, Sparkles, Loader2 } from 'lucide-react';
import CanvasTool from '../../components/CanvasTool';
import ChatSidebar from '../../components/ChatSidebar';
import { useAuth } from '@/components/AuthProvider';
import Auth from '@/components/Auth';
import ProfileSignInMenu from '@/components/ProfileSignInMenu';
import MenuIcon from '../../components/MenuIcon';
import AppMobileMenu from '../../components/AppMobileMenu';
import { toast } from 'sonner';
import { createDesign } from '../actions/createDesign';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { useTheme } from '../../components/ThemeProvider';

function DesignPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designId = searchParams.get('id');
  const { session } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { toggleTheme } = useTheme();

  const handleSave = async () => {
    if (!session) {
      toast.error("Please sign in to save your design.");
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/design';
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    startTransition(async () => {
      // In a real app, you'd get the canvas content from the CanvasTool component
      const designData = {
        id: designId === "new" ? undefined : designId,
        name: "My amazing design", // You might want a way to name designs
        content: JSON.stringify({}), // This would be the canvas data
      };

      const formData = new FormData();
      Object.entries(designData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });

      try {
        const result = await createDesign(formData);
        if (result.id) {
          toast.success("Design saved successfully!");
          if (designId === "new") {
            router.push(`/design?id=${result.id}`);
          }
        } else {
          toast.error(result.error || "Failed to save design.");
        }
      } catch (error) {
        console.error(error);
        toast.error("An unexpected error occurred.");
      }
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[99] flex flex-col bg-white dark:bg-slate-900">
        <ChatSidebar />
        <header className="h-16 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-8 bg-white dark:bg-slate-800 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => router.push('/mydesigns')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-0"
              title="Click here to see your creations"
            >
              <List size={22} />
              <span className="font-medium hidden xs:inline">My Creations</span>
            </button>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100 truncate">
              <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
              <span className="truncate">{designId === 'new' ? 'New Creation' : 'Edit Creation'}</span>
            </h2>
          </div>
          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-2">
            <ProfileSignInMenu />
          </div>
          {/* Mobile actions: only menu button */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              className="ml-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors focus:outline-none"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <span className="sr-only">Open menu</span>
              <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
          </div>
        </header>
        {/* MobileMenu overlay */}
        <AppMobileMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onThemeToggle={() => { 
            toggleTheme(); 
            setMenuOpen(false); }}
          onHome={() => { setMenuOpen(false); router.push('/mydesigns'); }}
          onSignOut={async () => {
            setMenuOpen(false);
            if (user) {
              const { supabase } = await import('../../lib/supabaseClient');
              await supabase.auth.signOut();
              router.refresh && router.refresh();
            } else {
              router.push('/login');
            }
          }}
        />
        <div className="flex-1 overflow-hidden">
          <CanvasTool designId={designId} />
        </div>
      </div>
    </>
  );
}

export default function DesignPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading design...</p>
        </div>
      </div>
    }>
      <DesignPageContent />
    </Suspense>
  );
}
