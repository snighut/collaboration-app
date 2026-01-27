'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, X } from 'lucide-react';
import { sendChatMessage, askMistral } from '../app/actions/chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatSidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      try {
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          if (value) {
            const token = decoder.decode(value, { stream: true });
            completion += token;
            setStreamingCompletion(completion);
          }
          done = streamDone;
        }
      } catch (readError) {
        // If we have completion text, it's just a 'Connection Closed' at the tail end.
        // We log it as a warning instead of a crash.
        console.warn('Stream closed during read, but data was captured.');
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
        className={`fixed top-16 right-0 h-[calc(100vh-64px)] bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 shadow-2xl transition-all duration-300 ease-in-out z-40 flex flex-col ${
          isExpanded ? 'w-full md:w-96' : 'w-0'
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
              Ask me anything about the portfolio or projects
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
                    <Send className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Start a conversation by asking a question below
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
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl px-4 py-3">
                      <Loader2 className="text-gray-500 dark:text-gray-400 animate-spin" size={20} />
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
          <div className="p-3 md:p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 mb-10 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                rows={2}
                className="flex-1 px-3 py-2 text-base bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                disabled={isLoading}
                style={{ 
                  fontSize: '16px',
                  WebkitTextSizeAdjust: '100%',
                  touchAction: 'manipulation'
                }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="flex items-center justify-center gap-1 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 self-end"
              >
                <Send size={18} />
                <span className="hidden md:inline">Send</span>
              </button>
            </form>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 hidden md:block">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        )}
      </div>

      {/* Toggle Button - Only show when collapsed */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed top-1/2 right-0 -translate-y-1/2 z-50 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white p-3 shadow-lg transition-all duration-300 group rounded-l-xl"
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
