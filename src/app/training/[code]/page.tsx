'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Wrench, ClipboardCheck, FolderOpen, Briefcase, 
  ChevronDown, ChevronRight, Loader2, CheckCircle, Circle, Play, FileText,
  Presentation, HelpCircle, Target, ClipboardList, MessageSquare, Video, Link as LinkIcon,
  ExternalLink, Clock, Award, X, Eye, AlertCircle, Sparkles, Trophy, Flame,
  ArrowRight, Lock, PlayCircle, Star
} from 'lucide-react';
import PresentationViewer, { PresentationData, SlideData } from '@/components/PresentationViewer';

const SECTION_ICONS: Record<string, React.ElementType> = {
  learn: BookOpen, practice: Wrench, assess: ClipboardCheck, resources: FolderOpen, career: Briefcase
};

const SECTION_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string; lightBg: string }> = {
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', gradient: 'from-amber-500 to-orange-500', lightBg: 'bg-amber-500/5' },
  teal: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30', gradient: 'from-teal-500 to-emerald-500', lightBg: 'bg-teal-500/5' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', gradient: 'from-purple-500 to-pink-500', lightBg: 'bg-purple-500/5' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', gradient: 'from-blue-500 to-indigo-500', lightBg: 'bg-blue-500/5' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-green-500', lightBg: 'bg-emerald-500/5' },
};

const CONTENT_ICONS: Record<string, React.ElementType> = {
  presentation: Presentation, runbook: FileText, tutorial: BookOpen, quiz: HelpCircle,
  assignment: ClipboardList, challenge: Target, interview_prep: MessageSquare, recording: Video, external_link: LinkIcon
};

const CONTENT_COLORS: Record<string, { bg: string; text: string }> = {
  presentation: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  runbook: { bg: 'bg-teal-500/10', text: 'text-teal-400' },
  tutorial: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  quiz: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  assignment: { bg: 'bg-pink-500/10', text: 'text-pink-400' },
  challenge: { bg: 'bg-red-500/10', text: 'text-red-400' },
  interview_prep: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  recording: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
  external_link: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
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
interface Module { id: string; section_id?: string; title: string; training_content: Content[]; }
interface Progress { content_id: string; status: string; completed_at?: string; }

interface TrainingData {
  enrollment: { id: string; student_email: string; student_name?: string; };
  batch: { id: string; title: string; description?: string; sections: Section[]; };
  modules: Module[];
  progress: Progress[];
}

export default function StudentPortalPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [data, setData] = useState<TrainingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
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
        if (trainingData.batch.sections?.length > 0) {
          setActiveSection(trainingData.batch.sections[0].id);
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
        if (trainingData.batch.sections?.length > 0) {
          setActiveSection(trainingData.batch.sections[0].id);
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

  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollName, setEnrollName] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  const getContentForSection = (sectionId: string): Content[] => {
    if (!data?.modules) return [];
    return data.modules
      .filter(m => m.section_id === sectionId)
      .flatMap(m => m.training_content || []);
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

  const getSectionProgress = (sectionId: string) => {
    const sectionContent = getContentForSection(sectionId);
    const completed = sectionContent.filter(c => getProgress(c.id)?.status === 'completed').length;
    return { completed, total: sectionContent.length };
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
        const data = await res.json();
        setToken(data.access_token);
        localStorage.setItem(`training_token_${code}`, data.access_token);
        setError(null);
        fetchTraining(data.access_token);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-purple-400 animate-spin mx-auto mb-4" />
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
          className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
              <GraduationCap size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome!</h1>
            <p className="text-slate-400">Enter your email to start learning</p>
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
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Name (optional)</label>
              <input
                type="text"
                value={enrollName}
                onChange={(e) => setEnrollName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            {error && error !== 'Enter your email to access this training' && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <motion.button
              type="submit"
              disabled={!enrollEmail.trim() || enrolling}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            >
              {enrolling ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={18} /> Start Learning</>}
            </motion.button>
          </form>
          
          <p className="text-center text-slate-500 text-xs mt-6">
            Your progress will be saved automatically
          </p>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const progress = calculateProgress();
  const currentSection = data.batch.sections.find(s => s.id === activeSection);
  const currentSectionContent = activeSection ? getContentForSection(activeSection) : [];

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white py-3 px-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
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
      
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-72 bg-slate-900/80 border-r border-slate-800 flex-shrink-0 hidden lg:flex flex-col">
          {/* Course Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-white truncate">{data.batch.title}</h1>
                <p className="text-xs text-slate-400 truncate">{data.enrollment.student_email}</p>
              </div>
            </div>
            
            {/* Progress Card */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Your Progress</span>
                <span className="text-lg font-bold text-white">{progress.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {progress.completed} of {progress.total} completed
              </p>
            </div>
          </div>
          
          {/* Sections Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {data.batch.sections.sort((a, b) => a.sort_order - b.sort_order).map((section) => {
              const Icon = SECTION_ICONS[section.section_key] || FolderOpen;
              const colors = SECTION_COLORS[section.color] || SECTION_COLORS.blue;
              const sectionProgress = getSectionProgress(section.id);
              const isActive = activeSection === section.id;
              const contentCount = getContentForSection(section.id).length;
              
              return (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    isActive 
                      ? `${colors.lightBg} ${colors.border} border` 
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {section.title}
                      </span>
                      {contentCount > 0 && (
                        <span className={`text-xs ${colors.text}`}>
                          {sectionProgress.completed}/{sectionProgress.total}
                        </span>
                      )}
                    </div>
                    {contentCount > 0 && (
                      <div className="w-full h-1 bg-slate-700 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${colors.gradient}`}
                          style={{ width: `${sectionProgress.total > 0 ? (sectionProgress.completed / sectionProgress.total) * 100 : 0}%` }}
                        />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </nav>
          
          {/* Achievement Badge */}
          {progress.percentage >= 100 && (
            <div className="p-4 border-t border-slate-800">
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4 text-center">
                <Trophy className="mx-auto text-amber-400 mb-2" size={28} />
                <p className="text-amber-400 font-semibold text-sm">Course Completed!</p>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <header className="lg:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white truncate max-w-[200px]">{data.batch.title}</h1>
                  <p className="text-xs text-slate-400">{progress.percentage}% complete</p>
                </div>
              </div>
            </div>
            
            {/* Mobile Section Pills */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {data.batch.sections.sort((a, b) => a.sort_order - b.sort_order).map((section) => {
                const colors = SECTION_COLORS[section.color] || SECTION_COLORS.blue;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      isActive 
                        ? `bg-gradient-to-r ${colors.gradient} text-white` 
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {section.title}
                  </button>
                );
              })}
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
            {currentSection && (
              <motion.div
                key={currentSection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Section Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    {(() => {
                      const Icon = SECTION_ICONS[currentSection.section_key] || FolderOpen;
                      const colors = SECTION_COLORS[currentSection.color] || SECTION_COLORS.blue;
                      return (
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                          <Icon size={24} className="text-white" />
                        </div>
                      );
                    })()}
                    <div>
                      <h2 className="text-2xl font-bold text-white">{currentSection.title}</h2>
                      <p className="text-slate-400">{currentSection.description}</p>
                    </div>
                  </div>
                </div>

                {/* Content Grid */}
                {currentSectionContent.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {currentSectionContent.map((content, index) => {
                      const Icon = CONTENT_ICONS[content.content_type] || FileText;
                      const colors = CONTENT_COLORS[content.content_type] || CONTENT_COLORS.external_link;
                      const progressItem = getProgress(content.id);
                      const isCompleted = progressItem?.status === 'completed';
                      const isInProgress = progressItem?.status === 'in_progress';
                      
                      return (
                        <motion.div
                          key={content.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => openContent(content)}
                          className={`
                            relative group cursor-pointer rounded-2xl p-5 border transition-all
                            ${isCompleted 
                              ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50' 
                              : isInProgress
                                ? 'bg-blue-500/5 border-blue-500/30 hover:border-blue-500/50'
                                : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                            }
                          `}
                        >
                          {/* Status Badge */}
                          <div className="absolute top-4 right-4">
                            {isCompleted ? (
                              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                <CheckCircle size={18} className="text-white" />
                              </div>
                            ) : isInProgress ? (
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                                <Play size={14} className="text-blue-400" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-700/50 border border-slate-600 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:border-purple-500/50 transition-all">
                                <Circle size={14} className="text-slate-500 group-hover:text-purple-400" />
                              </div>
                            )}
                          </div>

                          {/* Content Icon */}
                          <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                            <Icon size={24} className={colors.text} />
                          </div>

                          {/* Content Info */}
                          <h3 className="font-semibold text-white mb-1 pr-10 line-clamp-2">{content.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="capitalize">{content.content_type.replace('_', ' ')}</span>
                            {content.estimated_minutes && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {content.estimated_minutes} min
                                </span>
                              </>
                            )}
                          </div>

                          {/* Hover Action */}
                          <div className="mt-4 flex items-center gap-2 text-sm text-slate-400 group-hover:text-white transition-colors">
                            {isCompleted ? (
                              <>
                                <PlayCircle size={16} className="text-emerald-400" />
                                <span>Review</span>
                              </>
                            ) : isInProgress ? (
                              <>
                                <PlayCircle size={16} className="text-blue-400" />
                                <span>Continue</span>
                              </>
                            ) : (
                              <>
                                <PlayCircle size={16} />
                                <span>Start</span>
                              </>
                            )}
                            <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                      <FolderOpen size={36} className="text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No content available yet</h3>
                    <p className="text-slate-400">Check back later for new materials</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>

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
                    const Icon = CONTENT_ICONS[activeContent.content_type] || FileText;
                    const colors = CONTENT_COLORS[activeContent.content_type] || CONTENT_COLORS.external_link;
                    return (
                      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                        <Icon size={20} className={colors.text} />
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
                        const data = activeContent.content_data as { title?: string; slides?: SlideData[] };
                        setViewingPresentation({
                          title: data.title || activeContent.title,
                          slides: data.slides || []
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
