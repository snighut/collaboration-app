'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, X } from 'lucide-react';
import { sendChatMessage } from '../app/actions/chat';

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

    try {
      // Prepare messages for server action
      const conversationHistory = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: userMessage.content }
      ];

      const result = await sendChatMessage(conversationHistory);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.content,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling chat action:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
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
          isExpanded ? 'w-96' : 'w-0'
        }`}
      >
        {/* Chat Header */}
        {isExpanded && (
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              AI Assistant
            </h2>
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
                {messages.map((message) => (
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

        {/* Input Area */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                rows={3}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                disabled={isLoading}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Press Enter to send, Shift+Enter for new line
                </p>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`fixed top-1/2 -translate-y-1/2 z-50 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white p-3 rounded-l-xl shadow-lg transition-all duration-300 group ${
          isExpanded ? 'right-96' : 'right-0'
        }`}
        aria-label={isExpanded ? 'Collapse AI chat' : 'Open AI chat'}
        title={isExpanded ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        {isExpanded ? (
          <X size={24} className="group-hover:scale-110 transition-transform" />
        ) : (
          <div className="relative">
            <Bot size={24} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          </div>
        )}
      </button>
    </>
  );
};

export default ChatSidebar;
