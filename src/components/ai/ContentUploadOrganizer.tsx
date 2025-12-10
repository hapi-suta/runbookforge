'use client'

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Sparkles, Copy, Check, ChevronDown, ChevronRight,
  Folder, BookOpen, HelpCircle, ClipboardList, Target, Loader2, X,
  Wand2, Eye, Save, RefreshCw
} from 'lucide-react';
import { CONTENT_CREATION_PROMPTS } from '@/lib/ai-prompts';

interface ContentUploadOrganizerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrganizedContent?: (structure: OrganizedStructure) => void;
  batchId?: string;
}

interface OrganizedStructure {
  title: string;
  description: string;
  modules: Array<{
    title: string;
    description: string;
    content_items: Array<{
      title: string;
      type: string;
      description: string;
      content?: string;
    }>;
  }>;
}

export default function ContentUploadOrganizer({
  isOpen,
  onClose,
  onOrganizedContent,
  batchId
}: ContentUploadOrganizerProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'prompts'>('upload');
  const [pastedContent, setPastedContent] = useState('');
  const [courseTopic, setCourseTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [organizedResult, setOrganizedResult] = useState<OrganizedStructure | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));

  // Prompt Generator State
  const [selectedPromptType, setSelectedPromptType] = useState<'course_outline' | 'lesson_content' | 'quiz_generator' | 'lab_exercise'>('course_outline');
  const [promptTopic, setPromptTopic] = useState('');
  const [promptModule, setPromptModule] = useState('');
  const [promptAudience, setPromptAudience] = useState('Intermediate developers');
  const [quizCount, setQuizCount] = useState(10);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const toggleModule = (idx: number) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setExpandedModules(newSet);
  };

  const processContent = async () => {
    if (!pastedContent.trim() || !courseTopic.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'organize_content',
          content: pastedContent,
          topic: courseTopic,
          audience: targetAudience
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizedResult(data.result);
      }
    } catch (e) {
      console.error('Failed to process content:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPromptText = () => {
    switch (selectedPromptType) {
      case 'course_outline':
        return CONTENT_CREATION_PROMPTS.course_outline(promptTopic || 'PostgreSQL Administration', promptAudience);
      case 'lesson_content':
        return CONTENT_CREATION_PROMPTS.lesson_content(promptTopic || 'PostgreSQL', promptModule || 'Performance Tuning');
      case 'quiz_generator':
        return CONTENT_CREATION_PROMPTS.quiz_generator(promptTopic || 'PostgreSQL Indexes', quizCount);
      case 'lab_exercise':
        return CONTENT_CREATION_PROMPTS.lab_exercise(promptTopic || 'PostgreSQL Backup and Recovery');
      default:
        return '';
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(getPromptText());
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleSaveStructure = () => {
    if (organizedResult) {
      onOrganizedContent?.(organizedResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Wand2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Content Organizer</h2>
              <p className="text-sm text-slate-400">Upload content or generate prompts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 py-3 border-b border-slate-700/50 shrink-0">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-amber-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Upload size={16} /> Upload & Organize
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'prompts'
                ? 'bg-amber-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Copy size={16} /> Prompt Generator
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'upload' ? (
            <div className="space-y-6">
              {!organizedResult ? (
                <>
                  {/* Upload Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Course Topic *</label>
                        <input
                          type="text"
                          value={courseTopic}
                          onChange={(e) => setCourseTopic(e.target.value)}
                          placeholder="e.g., PostgreSQL Administration"
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience</label>
                        <input
                          type="text"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          placeholder="e.g., Intermediate DBAs"
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Paste Your Content *
                      </label>
                      <textarea
                        value={pastedContent}
                        onChange={(e) => setPastedContent(e.target.value)}
                        placeholder="Paste your course content, documentation, or notes here. The AI will analyze and organize it into structured modules and lessons..."
                        rows={12}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Tip: Include headings, bullet points, and clear sections for better organization
                      </p>
                    </div>

                    <motion.button
                      onClick={processContent}
                      disabled={!pastedContent.trim() || !courseTopic.trim() || isProcessing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={20} className="animate-spin" /> Analyzing Content...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} /> Organize with AI
                        </>
                      )}
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  {/* Organized Result */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{organizedResult.title}</h3>
                        <p className="text-sm text-slate-400">{organizedResult.description}</p>
                      </div>
                      <button
                        onClick={() => setOrganizedResult(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700"
                      >
                        <RefreshCw size={16} /> Start Over
                      </button>
                    </div>

                    <div className="space-y-3">
                      {organizedResult.modules.map((module, idx) => (
                        <div key={idx} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                          <button
                            onClick={() => toggleModule(idx)}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-800/80 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <Folder size={16} className="text-amber-400" />
                              </div>
                              <div className="text-left">
                                <h4 className="font-medium text-white">{module.title}</h4>
                                <p className="text-xs text-slate-500">{module.content_items.length} items</p>
                              </div>
                            </div>
                            {expandedModules.has(idx) ? (
                              <ChevronDown size={20} className="text-slate-400" />
                            ) : (
                              <ChevronRight size={20} className="text-slate-400" />
                            )}
                          </button>

                          <AnimatePresence>
                            {expandedModules.has(idx) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 space-y-2">
                                  {module.description && (
                                    <p className="text-sm text-slate-400 mb-3">{module.description}</p>
                                  )}
                                  {module.content_items.map((item, itemIdx) => {
                                    const Icon = item.type === 'quiz' ? HelpCircle :
                                                 item.type === 'assignment' ? ClipboardList :
                                                 item.type === 'challenge' ? Target :
                                                 BookOpen;
                                    return (
                                      <div key={itemIdx} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                                        <Icon size={16} className="text-slate-400 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm text-white truncate">{item.title}</p>
                                          <p className="text-xs text-slate-500 capitalize">{item.type}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Prompt Generator Tab */
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Prompt Type</label>
                  <select
                    value={selectedPromptType}
                    onChange={(e) => setSelectedPromptType(e.target.value as typeof selectedPromptType)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="course_outline">📚 Course Outline Generator</option>
                    <option value="lesson_content">📝 Lesson Content Generator</option>
                    <option value="quiz_generator">❓ Quiz Generator</option>
                    <option value="lab_exercise">🔬 Lab Exercise Generator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Topic *</label>
                  <input
                    type="text"
                    value={promptTopic}
                    onChange={(e) => setPromptTopic(e.target.value)}
                    placeholder="e.g., PostgreSQL Performance Tuning"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                  />
                </div>
              </div>

              {selectedPromptType === 'lesson_content' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Module Name</label>
                  <input
                    type="text"
                    value={promptModule}
                    onChange={(e) => setPromptModule(e.target.value)}
                    placeholder="e.g., Query Optimization"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                  />
                </div>
              )}

              {selectedPromptType === 'course_outline' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience</label>
                  <input
                    type="text"
                    value={promptAudience}
                    onChange={(e) => setPromptAudience(e.target.value)}
                    placeholder="e.g., Intermediate DBAs"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                  />
                </div>
              )}

              {selectedPromptType === 'quiz_generator' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Number of Questions</label>
                  <input
                    type="number"
                    value={quizCount}
                    onChange={(e) => setQuizCount(parseInt(e.target.value) || 10)}
                    min={5}
                    max={50}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              )}

              {/* Generated Prompt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">Generated Prompt</label>
                  <motion.button
                    onClick={copyPrompt}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-emerald-500/25"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check size={16} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} /> Copy Prompt
                      </>
                    )}
                  </motion.button>
                </div>
                <div className="relative">
                  <pre className="w-full h-[300px] px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 text-sm overflow-auto whitespace-pre-wrap font-mono">
                    {getPromptText()}
                  </pre>
                </div>
              </div>

              {/* Usage Instructions */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <h4 className="font-medium text-amber-400 mb-2">💡 How to Use</h4>
                <ol className="text-sm text-slate-300 space-y-2">
                  <li>1. Click "Copy Prompt" to copy the generated prompt</li>
                  <li>2. Open ChatGPT, Claude, or any AI assistant</li>
                  <li>3. Paste the prompt and let AI generate your content</li>
                  <li>4. Copy the AI response and paste it in "Upload & Organize" tab</li>
                  <li>5. AI will structure it into your Training Center</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'upload' && organizedResult && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700/50 shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-700/50 text-white rounded-xl hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleSaveStructure}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25"
            >
              <Save size={18} /> Import Structure
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

