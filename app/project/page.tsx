'use client'

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import CanvasTool from '../../components/CanvasTool';

export default function ProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');

  // TODO: If projectId !== 'new', load existing project data and populate canvas
  useEffect(() => {
    if (projectId && projectId !== 'new') {
      // Load existing project data here when API is ready
      console.log('Loading project:', projectId);
    }
  }, [projectId]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-slate-900">
      <div className="h-16 border-b border-gray-200 dark:border-slate-700 flex items-center px-8 bg-white dark:bg-slate-800 shrink-0">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
        <h2 className="ml-4 text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
          {projectId === 'new' ? 'New Collaboration Canvas' : 'Edit Project'}
        </h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <CanvasTool />
      </div>
    </div>
  );
}
