'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, X, Sparkles, ExternalLink } from 'lucide-react';
import { sendChatMessage, askMistral, generateDesign } from '../app/actions/chat';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  designId?: string;
  reasoning?: string[];
  metadata?: {
    componentsCount?: number;
    connectionsCount?: number;
    processingTimeMs?: number;
  };
}

const ChatSidebar: React.FC = () => {
  const router = useRouter();
  const { session } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  // For streaming completion
  const [streamingCompletion, setStreamingCompletion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Streaming chat handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setStreamingCompletion('');

    try {
      // Only send the latest user message as prompt for streaming demo
      const stream = await askMistral(userMessage.content);
      if (!stream) throw new Error('No stream returned');
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let completion = '';
      
      // We keep a buffer for incoming text to handle partial SSE frames
      let buffer = '';

      try {
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          if (value) {
            // Append new chunk to our buffer
            // { stream: true } handles multi-byte characters split across chunks
            buffer += decoder.decode(value, { stream: true });
            
            // SSE standard uses double newlines to separate data packets
            const parts = buffer.split('\n\n');
            
            // The last part might be incomplete, so we keep it in the buffer
            buffer = parts.pop() || '';

            for (const part of parts) {
              const line = part.trim();
                // DEBUG: Log every received line for diagnosis
                console.debug('[SSE Stream Line]', line);
              if (line.startsWith('data: ')) {
                const content = line.replace('data: ', '');
                
                // Only append if it's not the [DONE] signal
                if (content !== '[DONE]') {
                  completion += content;
                  setStreamingCompletion(completion);
                }
              }
            }
          }
          done = streamDone;
        }

      } catch (readError) {
        // If we have completion text, it's just a 'Connection Closed' at the tail end.
        // We log it as a warning instead of a crash.
        console.warn('Stream closed during read, but data was captured.');
      } finally {
        // When you call decoder.decode() without any arguments, the stream option automatically defaults to false. 
        // This is a built-in signal to the decoder that the stream is officially over, 
        // telling it to flush any "dangling" bytes (like half of a multi-byte character) and clear its internal buffer.
        const finalBit = decoder.decode(); 
        
        // Process any remaining data in the final bit/buffer
        const finalFull = buffer + finalBit;
        if (finalFull) {
          const finalParts = finalFull.split('\n\n');
          for (const part of finalParts) {
            const line = part.trim();
            if (line.startsWith('data: ')) {
              const content = line.replace('data: ', '');
              if (content !== '[DONE]') {
                completion += content;
              }
            }
          }
          setStreamingCompletion(completion);
        }
      }

      // Only add the assistant message if we actually got content
      if (completion.trim()) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: completion,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
      setStreamingCompletion('');
    } catch (error) {
      // This catch handles actual failures (backend down, 500 error, etc.)
      console.error('Error calling streaming chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setStreamingCompletion('');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle design generation with AI agent
  const handleGenerateDesign = async () => {
    if (!inputValue.trim() || isLoading || isGeneratingDesign) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGeneratingDesign(true);

    try {
      const accessToken = session?.access_token;
      const result = await generateDesign(userMessage.content, accessToken);

      if (result.success && result.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `🎨 Design generated successfully!\n\n**Design ID:** ${result.data.designId}\n**Name:** ${result.data.name}\n\n**Reasoning Steps:**\n${result.data.reasoning.map((step: string, idx: number) => `${idx + 1}. ${step}`).join('\n')}\n\n**Metadata:**\n- Components: ${result.data.metadata.componentsCount || 0}\n- Connections: ${result.data.metadata.connectionsCount || 0}\n- Processing time: ${result.data.metadata.processingTimeMs || 0}ms`,
          timestamp: new Date(),
          designId: result.data.designId,
          reasoning: result.data.reasoning,
          metadata: result.data.metadata,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `❌ Failed to generate design: ${result.error || 'Unknown error'}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error generating design:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ An error occurred while generating the design. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGeneratingDesign(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* Expandable Sidebar */}
      <div
        className={`fixed top-16 right-0 h-[calc(100vh-64px)] bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 shadow-2xl transition-all duration-300 ease-in-out flex flex-col ${
          isExpanded ? 'w-full md:w-96 z-50' : 'w-0 z-40'
        }`}
      >
        {/* Chat Header - Fixed at top */}
        {isExpanded && (
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                AI Assistant
              </h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Close AI chat"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ask me anything about system designs or generate visual architectures!
            </p>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                This chat interface is powered by a <span className="font-semibold text-blue-600 dark:text-blue-400">Mistral-Nemo LLM</span>, running on my custom, AI-native infrastructure for low-latency, private inference. Have fun and tell me more about your experiences via{' '}
                <a href="mailto:swapnil.nighut@example.com" className="underline hover:text-blue-600 dark:hover:text-blue-400">email</a> or{' '}
                <a href="https://linkedin.com/in/swapnilnighut" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 dark:hover:text-blue-400">LinkedIn</a>!
              </p>
            </div>
          </div>
        )}

        {/* Messages Container */}
        {isExpanded && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center px-4">
                <div>
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                    Start a conversation or generate a system design
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">
                    Try: "Design a microservices architecture for an e-commerce platform"
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, idx) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-blue-600 dark:bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                        {/* If this is the last assistant message and streaming, append streamingCompletion */}
                        {idx === messages.length - 1 && isLoading && streamingCompletion && message.role === 'assistant' && (
                          <span>{streamingCompletion}</span>
                        )}
                      </p>
                      {/* Show "View Design" button if message has a designId */}
                      {message.designId && (
                        <button
                          onClick={() => router.push(`/design?id=${message.designId}`)}
                          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Sparkles size={16} />
                          <span>View Design</span>
                          <ExternalLink size={16} />
                        </button>
                      )}
                      <p
                        className={`text-xs mt-1 ${
                          message.role === 'user'
                            ? 'text-blue-100'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {/* Show streaming completion as a new message if not yet added to messages */}
                {isLoading && streamingCompletion && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100">
                      <p className="text-sm whitespace-pre-wrap break-words">{streamingCompletion}</p>
                    </div>
                  </div>
                )}
                {(isLoading || isGeneratingDesign) && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="text-gray-500 dark:text-gray-400 animate-spin" size={20} />
                      {isGeneratingDesign && (
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Generating design...
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        )}

        {/* Input Area - Fixed at bottom */}
        {isExpanded && (
          <div className="p-3 md:p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question or describe a system design..."
                  rows={2}
                  className="flex-1 px-3 py-2 text-base bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  disabled={isLoading || isGeneratingDesign}
                  style={{ 
                    fontSize: '16px',
                    WebkitTextSizeAdjust: '100%',
                    touchAction: 'manipulation'
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading || isGeneratingDesign}
                  className="flex-1 flex items-center justify-center gap-1 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                  <span>Chat</span>
                </button>
                <button
                  type="button"
                  onClick={handleGenerateDesign}
                  disabled={!inputValue.trim() || isLoading || isGeneratingDesign}
                  className="flex-1 flex items-center justify-center gap-1 px-3 md:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles size={18} />
                  <span>Generate Design</span>
                </button>
              </div>
            </form>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Press Enter for chat • Use "Generate Design" to create visual architecture
            </p>
          </div>
        )}
      </div>

      {/* Toggle Button - Only show when collapsed */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed top-[calc(50%-100px)] right-0 -translate-y-1/2 z-[2000] bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white p-3 shadow-lg transition-all duration-300 group rounded-l-xl"
          aria-label="Open AI chat"
          title="Open AI Assistant"
        >
          <div className="relative">
            <Bot size={24} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          </div>
        </button>
      )}
    </>
  );
};

export default ChatSidebar;
