'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Wrench, ClipboardCheck, FolderOpen, Briefcase, 
  ChevronDown, ChevronRight, Loader2, CheckCircle, Circle, Play, FileText,
  Presentation, HelpCircle, Target, ClipboardList, MessageSquare, Video, Link as LinkIcon,
  ExternalLink, Clock, X, Eye, AlertCircle, Trophy, Folder, RotateCcw
} from 'lucide-react';
import PresentationViewer, { PresentationData, SlideData } from '@/components/PresentationViewer';

const SECTION_ICONS: Record<string, React.ElementType> = {
  learn: BookOpen, practice: Wrench, assess: ClipboardCheck, resources: FolderOpen, career: Briefcase
};

const SECTION_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  amber: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30', gradient: 'from-amber-500 to-orange-500' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-400', border: 'border-teal-500/30', gradient: 'from-teal-500 to-emerald-500' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30', gradient: 'from-purple-500 to-pink-500' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', gradient: 'from-blue-500 to-indigo-500' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-green-500' },
};

const CONTENT_ICONS: Record<string, React.ElementType> = {
  presentation: Presentation, runbook: FileText, tutorial: BookOpen, quiz: HelpCircle,
  assignment: ClipboardList, challenge: Target, interview_prep: MessageSquare, recording: Video, external_link: LinkIcon
};

interface Section { id: string; section_key: string; title: string; description: string; icon: string; color: string; sort_order: number; }
interface LinkedDocument { id: string; title: string; metadata?: { slides?: SlideData[] } }
interface LinkedRunbook { id: string; title: string; sections?: Array<{ title: string; content: string }> }
interface Content { 
  id: string; 
  title: string; 
  content_type: string; 
  document_id?: string; 
  runbook_id?: string; 
  external_url?: string; 
  content_data?: Record<string, unknown>; 
  estimated_minutes?: number;
  documents?: LinkedDocument;
  runbooks?: LinkedRunbook;
}
interface Module { 
  id: string; 
  section_id?: string; 
  parent_id?: string | null;
  title: string; 
  description?: string;
  is_folder?: boolean;
  color?: string;
  sort_order: number;
  training_content: Content[]; 
}
interface Progress { content_id: string; status: string; completed_at?: string; }

interface TrainingData {
  enrollment: { id: string; student_email: string; student_name?: string; };
  batch: { id: string; title: string; description?: string; sections: Section[]; };
  modules: Module[];
  progress: Progress[];
}

// Recursive module tree node
interface ModuleNode extends Module {
  children: ModuleNode[];
}

export default function StudentPortalPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [data, setData] = useState<TrainingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeContent, setActiveContent] = useState<Content | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewingPresentation, setViewingPresentation] = useState<PresentationData | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const isPreview = urlParams.get('preview') === 'true';
    const storedToken = localStorage.getItem(`training_token_${code}`);
    const accessToken = urlToken || storedToken;
    
    if (isPreview) {
      setIsPreviewMode(true);
      fetchPreview();
    } else if (accessToken) {
      setToken(accessToken);
      if (urlToken) {
        localStorage.setItem(`training_token_${code}`, urlToken);
        window.history.replaceState({}, '', `/training/${code}`);
      }
      fetchTraining(accessToken);
    } else {
      setError('Enter your email to access this training');
      setIsLoading(false);
    }
  }, [code]);

  const fetchPreview = async () => {
    try {
      const res = await fetch(`/api/training/access/lookup?code=${code}&preview=true`);
      if (res.ok) {
        const trainingData = await res.json();
        setData(trainingData);
        // Expand all sections by default
        if (trainingData.batch.sections?.length > 0) {
          setExpandedSections(new Set(trainingData.batch.sections.map((s: Section) => s.id)));
        }
        // Expand all root modules by default
        if (trainingData.modules?.length > 0) {
          const rootModules = trainingData.modules.filter((m: Module) => !m.parent_id);
          setExpandedModules(new Set(rootModules.map((m: Module) => m.id)));
        }
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to load preview');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTraining = async (accessToken: string) => {
    try {
      const res = await fetch(`/api/training/access/${accessToken}`);
      if (res.ok) {
        const trainingData = await res.json();
        setData(trainingData);
        // Expand all sections by default
        if (trainingData.batch.sections?.length > 0) {
          setExpandedSections(new Set(trainingData.batch.sections.map((s: Section) => s.id)));
        }
        // Expand all root modules by default
        if (trainingData.modules?.length > 0) {
          const rootModules = trainingData.modules.filter((m: Module) => !m.parent_id);
          setExpandedModules(new Set(rootModules.map((m: Module) => m.id)));
        }
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to load training');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load training');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(sectionId)) newSet.delete(sectionId);
    else newSet.add(sectionId);
    setExpandedSections(newSet);
  };

  const toggleModule = (moduleId: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(moduleId)) newSet.delete(moduleId);
    else newSet.add(moduleId);
    setExpandedModules(newSet);
  };

  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollName, setEnrollName] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  // Build module tree for a section
  const buildModuleTree = (sectionId: string): ModuleNode[] => {
    if (!data?.modules) return [];
    
    const sectionModules = data.modules.filter(m => m.section_id === sectionId);
    
    const buildTree = (parentId: string | null): ModuleNode[] => {
      return sectionModules
        .filter(m => m.parent_id === parentId)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(module => ({
          ...module,
          children: buildTree(module.id)
        }));
    };
    
    return buildTree(null);
  };

  // Get all content for a section (flat)
  const getAllSectionContent = (sectionId: string): Content[] => {
    if (!data?.modules) return [];
    return data.modules
      .filter(m => m.section_id === sectionId)
      .flatMap(m => m.training_content || []);
  };

  // Get module content count recursively
  const getModuleContentCount = (module: ModuleNode): number => {
    const directContent = module.training_content?.length || 0;
    const childContent = module.children.reduce((acc, child) => acc + getModuleContentCount(child), 0);
    return directContent + childContent;
  };

  // Get module completion count recursively
  const getModuleCompletionCount = (module: ModuleNode): { completed: number; total: number } => {
    const directContent = module.training_content || [];
    const directCompleted = directContent.filter(c => getProgress(c.id)?.status === 'completed').length;
    
    const childCounts = module.children.reduce(
      (acc, child) => {
        const childCount = getModuleCompletionCount(child);
        return { completed: acc.completed + childCount.completed, total: acc.total + childCount.total };
      },
      { completed: 0, total: 0 }
    );
    
    return {
      completed: directCompleted + childCounts.completed,
      total: directContent.length + childCounts.total
    };
  };

  const getProgress = (contentId: string): Progress | undefined => {
    return data?.progress.find(p => p.content_id === contentId);
  };

  const markProgress = async (contentId: string, status: 'in_progress' | 'completed') => {
    if (!token || isPreviewMode) return;
    try {
      await fetch(`/api/training/access/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_id: contentId, status })
      });
      fetchTraining(token);
    } catch (e) {
      console.error(e);
    }
  };

  const openContent = (content: Content) => {
    setActiveContent(content);
    if (!isPreviewMode) markProgress(content.id, 'in_progress');
  };

  const completeContent = () => {
    if (activeContent) {
      if (!isPreviewMode) markProgress(activeContent.id, 'completed');
      setActiveContent(null);
    }
  };

  const calculateProgress = () => {
    if (!data) return { completed: 0, total: 0, percentage: 0 };
    const allContent = data.modules.flatMap(m => m.training_content || []);
    const completed = data.progress.filter(p => p.status === 'completed').length;
    const total = allContent.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const handleSelfEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollEmail.trim()) return;
    setEnrolling(true);
    try {
      const res = await fetch('/api/training/access/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email: enrollEmail, name: enrollName })
      });
      if (res.ok) {
        const responseData = await res.json();
        setToken(responseData.access_token);
        localStorage.setItem(`training_token_${code}`, responseData.access_token);
        setError(null);
        fetchTraining(responseData.access_token);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to enroll');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  // Render module recursively
  const renderModule = (module: ModuleNode, depth: number = 0) => {
    const isExpanded = expandedModules.has(module.id);
    const hasContent = (module.training_content?.length || 0) > 0;
    const hasChildren = module.children.length > 0;
    const contentCount = getModuleContentCount(module);
    const completion = getModuleCompletionCount(module);
    const isCompleted = completion.total > 0 && completion.completed === completion.total;

    const moduleColors: Record<string, string> = {
      amber: 'from-amber-500 to-orange-500',
      teal: 'from-teal-500 to-emerald-500',
      purple: 'from-purple-500 to-violet-500',
      blue: 'from-blue-500 to-indigo-500',
      pink: 'from-pink-500 to-rose-500',
      slate: 'from-slate-500 to-slate-600',
    };
    const gradient = moduleColors[module.color || 'slate'] || moduleColors.slate;

    return (
      <div key={module.id} className={depth > 0 ? 'ml-6' : ''}>
        {/* Module/Chapter Header */}
        <button
          onClick={() => toggleModule(module.id)}
          className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left ${
            isExpanded 
              ? 'bg-slate-800/80 border border-slate-700' 
              : 'bg-slate-800/40 hover:bg-slate-800/60'
          } ${depth > 0 ? 'mt-2' : ''}`}
        >
          {/* Expand Icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-400"
          >
            <ChevronRight size={18} />
          </motion.div>

          {/* Folder Icon */}
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
            <Folder size={16} className="text-white" />
          </div>

          {/* Module Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white truncate">{module.title}</span>
              {isCompleted && (
                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
              )}
            </div>
            {module.description && (
              <p className="text-xs text-slate-500 truncate">{module.description}</p>
            )}
          </div>

          {/* Progress */}
          {contentCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className={isCompleted ? 'text-emerald-400' : 'text-slate-400'}>
                {completion.completed}/{completion.total}
              </span>
            </div>
          )}
        </button>

        {/* Module Content - Collapsible */}
        <AnimatePresence>
          {isExpanded && (hasContent || hasChildren) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className={`mt-1 ${depth > 0 ? '' : 'ml-6'} border-l-2 border-slate-700/50 pl-4`}>
                {/* Direct Content Items */}
                {module.training_content && module.training_content.length > 0 && (
                  <div className="space-y-1 py-2">
                    {module.training_content.map((content, idx) => {
                      const ContentIcon = CONTENT_ICONS[content.content_type] || FileText;
                      const progressItem = getProgress(content.id);
                      const isContentCompleted = progressItem?.status === 'completed';
                      const isInProgress = progressItem?.status === 'in_progress';

                      return (
                        <motion.button
                          key={content.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          onClick={() => openContent(content)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors text-left group"
                        >
                          {/* Status */}
                          {isContentCompleted ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                              <CheckCircle size={14} className="text-white" />
                            </div>
                          ) : isInProgress ? (
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center flex-shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center flex-shrink-0 group-hover:border-slate-500">
                              <Circle size={10} className="text-slate-600 group-hover:text-slate-500" />
                            </div>
                          )}

                          {/* Content Icon */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            content.content_type === 'presentation' ? 'bg-blue-500/10 text-blue-400' :
                            content.content_type === 'recording' ? 'bg-rose-500/10 text-rose-400' :
                            content.content_type === 'quiz' ? 'bg-purple-500/10 text-purple-400' :
                            content.content_type === 'assignment' ? 'bg-pink-500/10 text-pink-400' :
                            content.content_type === 'challenge' ? 'bg-red-500/10 text-red-400' :
                            content.content_type === 'runbook' ? 'bg-teal-500/10 text-teal-400' :
                            content.content_type === 'tutorial' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-slate-700/50 text-slate-400'
                          }`}>
                            <ContentIcon size={16} />
                          </div>

                          {/* Content Info */}
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm ${isContentCompleted ? 'text-slate-400' : 'text-white'}`}>
                              {content.title}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="capitalize">{content.content_type.replace('_', ' ')}</span>
                              {content.content_data && <span className="text-purple-400">• AI</span>}
                              {content.estimated_minutes && (
                                <span className="flex items-center gap-1">
                                  • <Clock size={10} /> {content.estimated_minutes}m
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {isContentCompleted ? (
                              <RotateCcw size={14} className="text-slate-400" />
                            ) : (
                              <Play size={14} className="text-teal-400" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Child Modules (Sub-folders) */}
                {module.children.length > 0 && (
                  <div className="py-2 space-y-2">
                    {module.children.map(child => renderModule(child, depth + 1))}
                  </div>
                )}

                {/* Empty State */}
                {!hasContent && !hasChildren && (
                  <div className="py-6 text-center text-slate-500 text-sm">
                    No content yet
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your training...</p>
        </div>
      </div>
    );
  }

  // Self-registration form
  if (!data && !isPreviewMode) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/25">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Access Training</h1>
            <p className="text-slate-400">Enter your email to get started</p>
          </div>
          
          <form onSubmit={handleSelfEnroll} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
              <input
                type="email"
                value={enrollEmail}
                onChange={(e) => setEnrollEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Name (optional)</label>
              <input
                type="text"
                value={enrollName}
                onChange={(e) => setEnrollName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            {error && error !== 'Enter your email to access this training' && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <motion.button
              type="submit"
              disabled={!enrollEmail.trim() || enrolling}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-teal-500/25"
            >
              {enrolling ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Start Learning'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye size={20} />
              <span className="font-semibold">Preview Mode</span>
              <span className="text-white/80 text-sm hidden sm:inline">- This is how students see your training</span>
            </div>
            <button 
              onClick={() => window.close()}
              className="px-4 py-1.5 bg-white text-orange-600 rounded-lg text-sm font-semibold hover:bg-white/90"
            >
              Exit Preview
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <GraduationCap size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{data.batch.title}</h1>
                {data.batch.description && (
                  <p className="text-slate-400 text-sm mt-1 max-w-lg">{data.batch.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Your Progress</span>
              <span className="text-sm font-semibold text-white">{progress.completed}/{progress.total} completed</span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
              />
            </div>
            {progress.percentage === 100 && (
              <div className="flex items-center gap-2 mt-3 text-emerald-400">
                <Trophy size={16} />
                <span className="text-sm font-medium">Congratulations! You've completed this training!</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Course Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {data.batch.sections.sort((a, b) => a.sort_order - b.sort_order).map((section, sectionIndex) => {
            const Icon = SECTION_ICONS[section.section_key] || FolderOpen;
            const colors = SECTION_COLORS[section.color] || SECTION_COLORS.blue;
            const moduleTree = buildModuleTree(section.id);
            const sectionContent = getAllSectionContent(section.id);
            const sectionCompleted = sectionContent.filter(c => getProgress(c.id)?.status === 'completed').length;
            const isExpanded = expandedSections.has(section.id);
            const isSectionComplete = sectionContent.length > 0 && sectionCompleted === sectionContent.length;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className={`bg-slate-900 border rounded-2xl overflow-hidden ${
                  isSectionComplete ? 'border-emerald-500/30' : 'border-slate-800'
                }`}
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                      {isSectionComplete && <CheckCircle size={18} className="text-emerald-400" />}
                    </div>
                    <p className="text-sm text-slate-400">{section.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {sectionContent.length > 0 && (
                      <span className={`text-sm font-medium ${isSectionComplete ? 'text-emerald-400' : colors.text}`}>
                        {sectionCompleted}/{sectionContent.length}
                      </span>
                    )}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-slate-400"
                    >
                      <ChevronDown size={20} />
                    </motion.div>
                  </div>
                </button>

                {/* Section Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-800 p-4">
                        {moduleTree.length > 0 ? (
                          <div className="space-y-3">
                            {moduleTree.map(module => renderModule(module, 0))}
                          </div>
                        ) : (
                          <div className="py-12 text-center">
                            <FolderOpen size={32} className="mx-auto text-slate-600 mb-3" />
                            <p className="text-slate-500">No chapters available yet</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Content Viewer Modal */}
      <AnimatePresence>
        {activeContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveContent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  {(() => {
                    const ContentIcon = CONTENT_ICONS[activeContent.content_type] || FileText;
                    return (
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeContent.content_type === 'presentation' ? 'bg-blue-500/10 text-blue-400' :
                        activeContent.content_type === 'recording' ? 'bg-rose-500/10 text-rose-400' :
                        activeContent.content_type === 'quiz' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-slate-700/50 text-slate-400'
                      }`}>
                        <ContentIcon size={20} />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="font-semibold text-white">{activeContent.title}</h3>
                    <p className="text-xs text-slate-400 capitalize">{activeContent.content_type.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveContent(null)}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {activeContent.external_url ? (
                  <div className="text-center py-8">
                    <ExternalLink size={48} className="mx-auto text-cyan-400 mb-4" />
                    <p className="text-slate-300 mb-4">This content is hosted externally</p>
                    <a
                      href={activeContent.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                      <ExternalLink size={18} />
                      Open Link
                    </a>
                  </div>
                ) : activeContent.content_type === 'presentation' && activeContent.content_data ? (
                  <div className="text-center py-8">
                    <Presentation size={48} className="mx-auto text-blue-400 mb-4" />
                    <p className="text-slate-300 mb-2">AI-Generated Presentation</p>
                    <p className="text-slate-500 mb-4">
                      {((activeContent.content_data as { slides?: SlideData[] }).slides || []).length} slides
                    </p>
                    <button
                      onClick={() => {
                        const contentData = activeContent.content_data as { title?: string; slides?: SlideData[] };
                        setViewingPresentation({
                          title: contentData.title || activeContent.title,
                          slides: contentData.slides || []
                        });
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Play size={18} />
                      View Presentation
                    </button>
                  </div>
                ) : activeContent.content_data ? (
                  <div className="prose prose-invert max-w-none">
                    <pre className="text-sm text-slate-400 whitespace-pre-wrap bg-slate-800/50 p-4 rounded-xl">
                      {JSON.stringify(activeContent.content_data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">Content coming soon</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-800/50">
                <button
                  onClick={() => setActiveContent(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <motion.button
                  onClick={completeContent}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/25"
                >
                  <CheckCircle size={18} />
                  Mark as Complete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Presentation Viewer */}
      <AnimatePresence>
        {viewingPresentation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[60]"
          >
            <PresentationViewer
              presentation={viewingPresentation}
              onClose={() => setViewingPresentation(null)}
              showHeader={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

