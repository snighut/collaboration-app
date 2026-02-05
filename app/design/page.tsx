'use client'

import React, { useEffect, Suspense, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { List, Sparkles, Loader2, Pencil } from 'lucide-react';
import CanvasTool from '../../components/CanvasTool';
import ChatSidebar from '../../components/ChatSidebar';
import { useAuth } from '@/components/AuthProvider';
import Auth from '@/components/Auth';
import ProfileSignInMenu from '@/components/ProfileSignInMenu';
import MenuIcon from '../../components/MenuIcon';
import AppMobileMenu from '../../components/AppMobileMenu';
import { toast } from 'sonner';
import { useTheme } from '../../components/ThemeProvider';
import { getDesign, updateDesignTitle } from '../actions/designs';
import { Design } from '@/types';

function DesignPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designId = searchParams.get('id');
  const { session } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { toggleTheme } = useTheme();
  const [design, setDesign] = useState<Design | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (designId && designId !== 'new') {
      const fetchDesign = async () => {
        if (session?.access_token) {
          const { data, error } = await getDesign(designId, session.access_token);
          if (error) {
            toast.error('Failed to load design.');
            console.error(error);
          } else {
            setDesign(data || null);
          }
        }
      };
      fetchDesign();
    }
  }, [designId, session]);

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
            <div
              className="relative group"
              onMouseEnter={() => setShowEditIcon(true)}
              onMouseLeave={() => setShowEditIcon(false)}
              onTouchStart={() => setShowEditIcon(true)}
            >
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100 truncate">
                <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
                {isEditing ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!design || !session?.access_token) return;
                      setIsSaving(true);
                      const newTitle = titleInput.trim();
                      if (!newTitle) {
                        toast.error('Title cannot be empty');
                        setIsSaving(false);
                        return;
                      }
                      const result = await updateDesignTitle(design.id, { name: newTitle }, session.access_token);
                      setIsSaving(false);
                      if (result.success && result.data) {
                        setDesign(result.data);
                        toast.success('Title updated!');
                        setIsEditing(false);
                      } else {
                        toast.error(result.error || 'Failed to update title');
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={titleInput}
                      onChange={e => setTitleInput(e.target.value)}
                      autoFocus
                      disabled={isSaving}
                      className="bg-transparent border-b border-blue-400 text-lg font-bold px-1 outline-none w-40"
                    />
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800"
                      title="Save title"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="ml-1 text-gray-500 hover:text-gray-700"
                      onClick={() => setIsEditing(false)}
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <span className="truncate">
                    {designId === 'new' ? 'New Creation' : design?.name || 'Loading...'}
                  </span>
                )}
                {designId !== 'new' && !isEditing && showEditIcon && (
                  <button
                    className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => {
                      setIsEditing(true);
                      setTitleInput(design?.name || '');
                    }}
                    title="Edit title"
                  >
                    <Pencil size={18} />
                  </button>
                )}
              </h2>
            </div>
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
