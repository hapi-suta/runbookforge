'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Loader2, Sparkles, Lightbulb, HelpCircle,
  BookOpen, FileText, Minimize2, Maximize2, RotateCcw
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AITutorChatProps {
  courseContext?: string;
  courseName?: string;
  isFloating?: boolean;
}

const QUICK_ACTIONS = [
  { id: 'explain', label: 'Explain this topic', icon: Lightbulb, prompt: 'Can you explain this concept in simple terms?' },
  { id: 'quiz', label: 'Quiz me', icon: HelpCircle, prompt: 'Quiz me on what I just learned' },
  { id: 'summary', label: 'Summarize', icon: FileText, prompt: 'Can you summarize the key points?' },
  { id: 'example', label: 'Give example', icon: BookOpen, prompt: 'Can you give me a practical example?' },
];

export default function AITutorChat({ courseContext, courseName, isFloating = true }: AITutorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'tutor_chat',
          question: content,
          context: courseContext,
          conversationHistory: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'Sorry, I could not generate a response.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Floating chat button and window
  if (isFloating) {
    return (
      <>
        {/* Floating Button */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center text-white z-40 hover:scale-110 transition-transform"
            >
              <MessageSquare size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`fixed z-50 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden ${
                isMinimized
                  ? 'bottom-6 right-6 w-80'
                  : 'bottom-6 right-6 w-96 h-[600px] max-h-[80vh]'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Tutor</h3>
                    <p className="text-xs text-slate-400">{courseName || 'Ask me anything'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                      title="Clear chat"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-180px)]">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <Sparkles size={40} className="mx-auto text-purple-400 mb-4" />
                        <p className="text-slate-300 mb-2">Hi! I'm your AI tutor.</p>
                        <p className="text-sm text-slate-500 mb-6">Ask me anything about the course content!</p>
                        
                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          {QUICK_ACTIONS.map(action => (
                            <button
                              key={action.id}
                              onClick={() => handleQuickAction(action.prompt)}
                              className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                            >
                              <action.icon size={16} className="text-purple-400 flex-shrink-0" />
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-slate-800 text-slate-200'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800 rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="text-sm">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-slate-800">
                    <form
                      onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <motion.button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-11 h-11 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white disabled:opacity-50"
                      >
                        <Send size={18} />
                      </motion.button>
                    </form>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Embedded chat (non-floating)
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">AI Tutor</h3>
          <p className="text-xs text-slate-400">{courseName || 'Ask me anything'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles size={40} className="mx-auto text-purple-400 mb-4" />
            <p className="text-slate-300 mb-2">Hi! I'm your AI tutor.</p>
            <p className="text-sm text-slate-500 mb-6">Ask me anything about the course!</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                >
                  <action.icon size={16} className="text-purple-400 flex-shrink-0" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-slate-800 text-slate-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white disabled:opacity-50"
          >
            <Send size={18} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}

