'use client';

import React, { useState, useRef } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getUploadUrl,
  triggerProcessing,
  getJobStatus,
} from '../app/actions/ingestion';
import { useAuth } from './AuthProvider';

export default function PDFUploadButton({ userId }: { userId?: string }) {
  const { session } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate SHA256 hash
  async function calculateHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  }

  // Poll job status
  async function pollJobStatus(jobId: string) {
    const pollInterval = setInterval(async () => {
      try {
        const statusData = await getJobStatus(jobId);
        setProgress(statusData.progress || 0);
        setStatus(statusData.status);

        if (statusData.status === 'completed') {
          clearInterval(pollInterval);
          toast.success(
            `PDF processed! ${statusData.result?.processedChunks || 0} chunks stored.`,
          );
          setUploading(false);
          setProgress(0);
          setStatus('');
        } else if (statusData.status === 'failed') {
          clearInterval(pollInterval);
          toast.error(
            `Processing failed: ${statusData.failedReason || 'Unknown error'}`,
          );
          setUploading(false);
          setProgress(0);
          setStatus('');
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 2000);

    // Timeout after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (uploading) {
        toast.error('Processing timeout. File may still be processing.');
        setUploading(false);
        setProgress(0);
        setStatus('');
      }
    }, 600000);
  }

  async function handleFileSelect(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const accessToken = session?.access_token;
    if (!accessToken) {
      toast.error('Please sign in to upload PDFs');
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      toast.error('File too large. Maximum size is 50MB.');
      return;
    }

    setUploading(true);
    setProgress(5);
    setStatus('Calculating hash...');

    try {
      // 1. Calculate hash
      const fileHash = await calculateHash(file);
      setProgress(10);

      // 2. Get upload URL
      setStatus('Getting upload URL...');
      const urlData = await getUploadUrl(file.name, fileHash, userId, accessToken);

      if (urlData.skipUpload) {
        if (urlData.status === 'duplicate') {
          toast.info(urlData.message);
          setUploading(false);
          setProgress(0);
          setStatus('');
          return;
        } else if (urlData.status === 'processing') {
          toast.info('File is already being processed. Monitoring progress...');
          pollJobStatus(urlData.jobId);
          return;
        }
      }

      // 3. Upload to R2
      setProgress(20);
      setStatus('Uploading to storage...');

      const uploadResponse = await fetch(urlData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      setProgress(50);

      // 4. Trigger processing
      setStatus('Starting processing...');
      const processData = await triggerProcessing(
        urlData.objectKey,
        file.name,
        fileHash,
        userId,
        accessToken,
      );

      toast.success('Upload complete! Processing started.');
      setProgress(60);
      setStatus('Processing PDF...');

      // 5. Poll for status
      pollJobStatus(processData.jobId);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
      setUploading(false);
      setProgress(0);
      setStatus('');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        title="Upload PDF for RAG ingestion"
      >
        {uploading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span className="hidden sm:inline">
              {status} ({progress}%)
            </span>
            <span className="sm:hidden">{progress}%</span>
          </>
        ) : (
          <>
            <FileText size={18} />
            <span className="hidden sm:inline">Ingest System Design PDF</span>
            <span className="sm:hidden">PDF</span>
          </>
        )}
      </button>

      {uploading && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 min-w-[280px] z-50 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 size={16} className="animate-spin text-blue-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {status}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {progress}% complete
          </p>
        </div>
      )}
    </div>
  );
}
