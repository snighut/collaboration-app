'use client'

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import CanvasTool from '../../components/CanvasTool';

function DesignPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designId = searchParams.get('id');

  // TODO: If designId !== 'new', load existing design data and populate canvas
  useEffect(() => {
    if (designId && designId !== 'new') {
      // Load existing design data here when API is ready
      console.log('Loading design:', designId);
    }
  }, [designId]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-slate-900">
      <div className="h-16 border-b border-gray-200 dark:border-slate-700 flex items-center px-8 bg-white dark:bg-slate-800 shrink-0">
        <button
          onClick={() => router.push('/mydesigns')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">My Designs</span>
        </button>
        <h2 className="ml-4 text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
          {designId === 'new' ? 'New Collaboration Design Canvas' : 'Edit Design'}
        </h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <CanvasTool />
      </div>
    </div>
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
