'use client'

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  FileText,
  Presentation,
  Link as LinkIcon,
  ExternalLink,
  Clock,
  Loader2,
  AlertCircle,
  Play,
  User,
  X
} from 'lucide-react';

interface Content {
  id: string;
  title: string;
  content_type: string;
  document_id?: string;
  runbook_id?: string;
  external_url?: string;
  sort_order: number;
  estimated_duration?: number;
  is_required: boolean;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  sort_order: number;
  training_content: Content[];
}

interface TrainingData {
  enrollment: {
    id: string;
    student_name?: string;
    student_email: string;
    enrolled_at: string;
  };
  batch: {
    id: string;
    title: string;
    description?: string;
    settings: Record<string, unknown>;
  };
  modules: Module[];
  progress: Record<string, { status: string; completed_at?: string }>;
}

export default function StudentPortalPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  
  const [data, setData] = useState<TrainingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [viewingContent, setViewingContent] = useState<Content | null>(null);

  useEffect(() => {
    fetchTrainingData();
  }, [code]);

  const fetchTrainingData = async () => {
    try {
      const response = await fetch(`/api/training/access/${code}`);
      if (response.ok) {
        const trainingData = await response.json();
        setData(trainingData);
        // Expand all modules by default
        setExpandedModules(new Set(trainingData.modules?.map((m: Module) => m.id) || []));
      } else {
        const err = await response.json();
        setError(err.error || 'Unable to access training');
      }
    } catch (err) {
      setError('Failed to load training content');
    } finally {
      setIsLoading(false);
    }
  };

  const markComplete = async (contentId: string) => {
    try {
      await fetch(`/api/training/access/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, status: 'completed' })
      });
      
      // Update local state
      setData(prev => prev ? {
        ...prev,
        progress: {
          ...prev.progress,
          [contentId]: { status: 'completed', completed_at: new Date().toISOString() }
        }
      } : null);
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'document': return <Presentation size={18} className="text-amber-400" />;
      case 'runbook': return <FileText size={18} className="text-teal-400" />;
      case 'external_link': return <LinkIcon size={18} className="text-blue-400" />;
      default: return <FileText size={18} />;
    }
  };

  const openContent = (content: Content) => {
    if (content.content_type === 'external_link' && content.external_url) {
      window.open(content.external_url, '_blank');
      markComplete(content.id);
    } else if (content.document_id) {
      // Open document viewer
      setViewingContent(content);
      markComplete(content.id);
    } else if (content.runbook_id) {
      // Open runbook viewer
      setViewingContent(content);
      markComplete(content.id);
    }
  };

  const getProgress = () => {
    if (!data) return { completed: 0, total: 0 };
    const allContent = data.modules.flatMap(m => m.training_content);
    const completed = allContent.filter(c => data.progress[c.id]?.status === 'completed').length;
    return { completed, total: allContent.length };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading training content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <p className="text-sm text-slate-500">
            If you believe this is an error, please contact your instructor.
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const progress = getProgress();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-purple-400" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-white">{data.batch.title}</h1>
                <p className="text-sm text-slate-500">Training Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-slate-400">{data.enrollment.student_email}</p>
                <p className="text-xs text-slate-500">
                  {progress.completed} of {progress.total} completed
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                <User size={20} className="text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Progress</span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-medium text-white">
              {progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {data.batch.description && (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 mb-8">
            <p className="text-slate-300">{data.batch.description}</p>
          </div>
        )}

        {/* Modules */}
        <div className="space-y-4">
          {data.modules.map((module, mIndex) => {
            const moduleContent = module.training_content || [];
            const moduleCompleted = moduleContent.filter(c => data.progress[c.id]?.status === 'completed').length;
            const isExpanded = expandedModules.has(module.id);
            
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: mIndex * 0.1 }}
                className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden"
              >
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-5 flex items-center gap-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    moduleCompleted === moduleContent.length && moduleContent.length > 0
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {moduleCompleted === moduleContent.length && moduleContent.length > 0 ? (
                      <CheckCircle size={20} />
                    ) : (
                      <BookOpen size={20} />
                    )}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h2 className="font-semibold text-white">{module.title}</h2>
                    {module.description && (
                      <p className="text-sm text-slate-400 mt-0.5">{module.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">
                      {moduleCompleted}/{moduleContent.length} completed
                    </span>
                    {isExpanded ? (
                      <ChevronDown size={20} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={20} className="text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Module Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-800"
                    >
                      <div className="p-4 space-y-2">
                        {moduleContent.map((content, cIndex) => {
                          const isCompleted = data.progress[content.id]?.status === 'completed';
                          
                          return (
                            <motion.button
                              key={content.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: cIndex * 0.05 }}
                              onClick={() => openContent(content)}
                              className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg flex items-center gap-4 transition-colors group"
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-500 text-white'
                                  : 'border-2 border-slate-600'
                              }`}>
                                {isCompleted && <CheckCircle size={14} />}
                              </div>
                              
                              {getContentIcon(content.content_type)}
                              
                              <span className={`flex-1 text-left ${isCompleted ? 'text-slate-400' : 'text-white'}`}>
                                {content.title}
                              </span>
                              
                              {content.estimated_duration && (
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Clock size={12} />
                                  {content.estimated_duration} min
                                </span>
                              )}
                              
                              {content.content_type === 'external_link' ? (
                                <ExternalLink size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                              ) : (
                                <Play size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                              )}
                            </motion.button>
                          );
                        })}
                        
                        {moduleContent.length === 0 && (
                          <p className="text-center text-slate-500 py-4">
                            No content in this module yet.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {data.modules.length === 0 && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
              <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No content available yet</h3>
              <p className="text-slate-400">
                Your instructor hasn&apos;t published any modules yet. Check back later!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Content Viewer Modal */}
      <AnimatePresence>
        {viewingContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setViewingContent(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Viewer Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h2 className="font-semibold text-white">{viewingContent.title}</h2>
                <button
                  onClick={() => setViewingContent(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Viewer Content */}
              <div className="flex-1 overflow-auto">
                {viewingContent.document_id && (
                  <iframe
                    src={`/view/presentation?id=${viewingContent.document_id}&embed=true`}
                    className="w-full h-[70vh]"
                  />
                )}
                {viewingContent.runbook_id && (
                  <iframe
                    src={`/view/runbook/${viewingContent.runbook_id}?embed=true`}
                    className="w-full h-[70vh]"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-slate-500">
            Powered by <span className="text-purple-400 font-medium">RunbookForge</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
