'use client'

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getDesigns, deleteDesign } from '../actions/designs';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { useTheme } from '../../components/ThemeProvider';
import MenuIcon from '../../components/MenuIcon';
import AppMobileMenu from '../../components/AppMobileMenu';
import Auth from '@/components/Auth';
import ProfileSignInMenu from '@/components/ProfileSignInMenu';
import ChatSidebar from '@/components/ChatSidebar';
import { toast } from 'sonner';
import { Home, Grid3x3, List, Plus, Loader2, ImageIcon, Edit, Trash2, Calendar, Clock, Eye } from 'lucide-react';
import { useAuth } from '../../components/AuthProvider';
import { Design } from '@/types';

function MyDesigns() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { toggleTheme } = useTheme();
  const router = useRouter();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { session, loading: authLoading } = useAuth();

  // Fetch designs on mount
  useEffect(() => {
    if(authLoading) return;
    loadDesigns();
  }, [authLoading, session?.access_token]);

  const loadDesigns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDesigns(session?.access_token);
      if (response.success) {
        setDesigns(response.data);
      } else {
        // If user is not logged in, simply clear the designs and don't show an error
        if (response.error === 'User not authenticated') {
          setDesigns([]);
        } else {
          setError(response.error || 'Failed to load designs');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return;
    setDeletingId(designId);
    startTransition(async () => {
      const result = await deleteDesign(designId, session?.access_token);
      if (result.success) {
        // Optimistically remove from UI
        setDesigns(prev => prev.filter(p => p.id !== designId));
        toast.success("Design deleted successfully!");
      } else {
        toast.error(result.error || 'Failed to delete design');
      }
      setDeletingId(null);
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <>
      <ChatSidebar />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 z-50 flex items-center justify-between px-4 sm:px-8 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-0"
            title="Click here to load Swapnil's Homepage"
          >
            <Home size={20} />
            <span className="font-medium hidden xs:inline">Home</span>
          </button>
          <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent uppercase tracking-tight truncate">
            My Creations
          </h1>
        </div>
        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-2">
          <ProfileSignInMenu />
          {/* View Toggle */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
              title="Grid View"
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
          <button 
            onClick={() => router.push('/design?id=new')}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>New Design</span>
          </button>
        </div>
        {/* Mobile actions: only menu button and new design */}
        <div className="flex sm:hidden items-center gap-1">
          <button 
            onClick={() => router.push('/design?id=new')}
            className="p-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg transition-colors"
            title="New Design"
          >
            <Plus size={20} />
          </button>
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
          // setMenuOpen(false); 
        }}
        onHome={() => { setMenuOpen(false); router.push('/'); }}
        onSignOut={async () => {
          setMenuOpen(false);
          const { supabase } = await import('../../lib/supabaseClient');
          await supabase.auth.signOut();
          router.refresh && router.refresh();
        }}
      />

      {/* Main Content */}
      <main className="pt-24 px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Stats Bar */}
          <div className="mb-8 flex gap-4">
            <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-xl border border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Designs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{designs.length}</p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading designs...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-20">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md mx-auto">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button 
                  onClick={loadDesigns}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Projects Grid View */}
          {!isLoading && !error && viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {designs.map((design) => (
                <div
                  key={design.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                {/* Thumbnail */}
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 relative overflow-hidden">
                  {design.thumbnail ? (
                    <img
                      src={design.thumbnail}
                      alt={design.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={24} className="text-gray-400 dark:text-gray-600" />
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {isPending && deletingId === design.id ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/design?id=${design.id}`);
                          }}
                          className="p-1.5 bg-white/90 rounded-md hover:bg-white transition-colors"
                          disabled={isPending}
                        >
                          <Eye size={18} className="text-gray-900" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/design?id=${design.id}`);
                          }}
                          className="p-1.5 bg-white/90 rounded-md hover:bg-white transition-colors"
                          disabled={isPending}
                        >
                          <Edit size={18} className="text-gray-900" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDesign(design.id);
                          }}
                          className="p-1.5 bg-white/90 rounded-md hover:bg-white transition-colors"
                          disabled={isPending}
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-2 md:p-3">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                    {design.name}
                  </h3>
                  
                  <div className="space-y-0.5 text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      <span className="truncate">{formatDate(design.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={10} />
                      <span className="truncate">{formatDate(design.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Tags/Status */}
                  {design.data?.status && (
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        design.data.status === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : design.data.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {design.data.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Projects List View */}
          {!isLoading && !error && viewMode === 'list' && (
            <div className="space-y-2">
              {designs.map((design) => (
                <div
                  key={design.id}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 overflow-hidden shrink-0">
                      {design.thumbnail ? (
                        <img
                          src={design.thumbnail}
                          alt={design.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={24} className="text-gray-400 dark:text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                        {design.name}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Created: {formatDate(design.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>Updated: {formatDate(design.updatedAt)}</span>
                        </div>
                        {design.data?.status && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            design.data.status === 'active' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : design.data.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {design.data.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {isPending && deletingId === design.id ? (
                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                      ) : (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/design?id=${design.id}`);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            disabled={isPending}
                          >
                            <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/design?id=${design.id}`);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            disabled={isPending}
                          >
                            <Edit size={16} className="text-gray-600 dark:text-gray-400" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDesign(design.id);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            disabled={isPending}
                          >
                            <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && designs.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus size={32} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                No designs yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first design to get started
              </p>
              <button 
                onClick={() => router.push('/design?id=new')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus size={18} />
                Create Project
              </button>
            </div>
          )}

          {/* Disclaimer Section */}
          {!isLoading && designs.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                  <strong>Note:</strong> The designs shown here are experimental proofs-of-concept generated via a hybrid Gemini and local Ollama AI inference stack. They are for illustrative purposes and do not represent final production-grade reality; active development is ongoing to refine AI agent feedback loops. This is a non-commercial portfolio project created for personal skill-building and architectural research.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    </>
  );
}

export default MyDesigns;
