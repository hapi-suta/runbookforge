'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Wrench, ClipboardCheck, FolderOpen, Briefcase, 
  ChevronDown, ChevronRight, Loader2, CheckCircle, Circle, Play, FileText,
  Presentation, HelpCircle, Target, ClipboardList, MessageSquare, Video, Link as LinkIcon,
  ExternalLink, Clock, Award, X, Eye, AlertCircle
} from 'lucide-react';
import PresentationViewer, { PresentationData, SlideData } from '@/components/PresentationViewer';

const SECTION_ICONS: Record<string, React.ElementType> = {
  learn: BookOpen, practice: Wrench, assess: ClipboardCheck, resources: FolderOpen, career: Briefcase
};

const SECTION_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', gradient: 'from-amber-500 to-orange-500' },
  teal: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30', gradient: 'from-teal-500 to-emerald-500' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', gradient: 'from-purple-500 to-pink-500' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', gradient: 'from-blue-500 to-indigo-500' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-green-500' },
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeContent, setActiveContent] = useState<Content | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewingPresentation, setViewingPresentation] = useState<PresentationData | null>(null);

  useEffect(() => {
    // Get token from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const isPreview = urlParams.get('preview') === 'true';
    const storedToken = localStorage.getItem(`training_token_${code}`);
    const accessToken = urlToken || storedToken;
    
    if (isPreview) {
      // Preview mode for instructors
      setIsPreviewMode(true);
      fetchPreview();
    } else if (accessToken) {
      setToken(accessToken);
      if (urlToken) {
        localStorage.setItem(`training_token_${code}`, urlToken);
        // Clean URL
        window.history.replaceState({}, '', `/training/${code}`);
      }
      fetchTraining(accessToken);
    } else {
      // No token - show enrollment form
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
          setExpandedSections(new Set(trainingData.batch.sections.map((s: Section) => s.id)));
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
      // Refresh data
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
        <Loader2 size={48} className="text-purple-400 animate-spin" />
      </div>
    );
  }

  // Self-registration form
  if (!data && !isPreviewMode) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Join Training</h1>
            <p className="text-slate-400">Enter your email to access this training</p>
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
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Name (optional)</label>
              <input
                type="text"
                value={enrollName}
                onChange={(e) => setEnrollName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={!enrollEmail.trim() || enrolling}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {enrolling ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Access Training'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white py-4 px-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Eye size={20} />
              </div>
              <div>
                <h3 className="font-bold">Preview Mode</h3>
                <p className="text-white/80 text-sm hidden sm:block">This is how students will see your training. You can test quizzes and view all content.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-white/20 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={14} />
                Progress not saved in preview
              </div>
              <button 
                onClick={() => window.close()}
                className="px-4 py-2 bg-white text-orange-600 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors shadow-md"
              >
                Exit Preview
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{data.batch.title}</h1>
                <p className="text-xs text-slate-400">{data.enrollment.student_email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">Progress</p>
                <p className="text-lg font-bold text-white">{progress.percentage}%</p>
              </div>
              <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" style={{ width: `${progress.percentage}%` }} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {data.batch.description && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 mb-8">{data.batch.description}</motion.p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <Award className="mx-auto text-purple-400 mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{progress.completed}</p>
            <p className="text-xs text-slate-400">Completed</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <Clock className="mx-auto text-amber-400 mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{progress.total - progress.completed}</p>
            <p className="text-xs text-slate-400">Remaining</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <CheckCircle className="mx-auto text-emerald-400 mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{progress.percentage}%</p>
            <p className="text-xs text-slate-400">Complete</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {data.batch.sections.sort((a, b) => a.sort_order - b.sort_order).map((section) => {
            const Icon = SECTION_ICONS[section.section_key] || FolderOpen;
            const colors = SECTION_COLORS[section.color] || SECTION_COLORS.blue;
            const sectionContent = getContentForSection(section.id);
            const isExpanded = expandedSections.has(section.id);
            const completedInSection = sectionContent.filter(c => getProgress(c.id)?.status === 'completed').length;

            return (
              <motion.div key={section.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`bg-slate-800/30 border rounded-xl overflow-hidden ${colors.border}`}>
                <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colors.gradient} flex items-center justify-center`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-white text-lg">{section.title}</h3>
                      <p className="text-sm text-slate-500">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">{completedInSection}/{sectionContent.length}</span>
                    {isExpanded ? <ChevronDown className="text-slate-400" size={20} /> : <ChevronRight className="text-slate-400" size={20} />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2">
                        {sectionContent.length === 0 ? (
                          <p className="text-center py-8 text-slate-500">No content available yet</p>
                        ) : (
                          sectionContent.map((content) => {
                            const ContentIcon = CONTENT_ICONS[content.content_type] || FileText;
                            const contentProgress = getProgress(content.id);
                            const isCompleted = contentProgress?.status === 'completed';

                            return (
                              <button
                                key={content.id}
                                onClick={() => openContent(content)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                  isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900/50 border-slate-700 hover:border-purple-500/50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {isCompleted ? (
                                    <CheckCircle className="text-emerald-400" size={20} />
                                  ) : (
                                    <Circle className="text-slate-500" size={20} />
                                  )}
                                  <ContentIcon size={18} className={isCompleted ? 'text-emerald-400' : 'text-slate-400'} />
                                  <span className={isCompleted ? 'text-emerald-300' : 'text-white'}>{content.title}</span>
                                  <span className="text-xs text-slate-500 capitalize">{content.content_type.replace('_', ' ')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {content.estimated_minutes && (
                                    <span className="text-xs text-slate-500">{content.estimated_minutes} min</span>
                                  )}
                                  <Play size={16} className="text-purple-400" />
                                </div>
                              </button>
                            );
                          })
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div>
                  <h2 className="text-lg font-bold text-white">{activeContent.title}</h2>
                  <p className="text-sm text-slate-400 capitalize">{activeContent.content_type.replace('_', ' ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* View Presentation Button for presentation content */}
                  {activeContent.content_type === 'presentation' && activeContent.content_data && (
                    <button
                      onClick={() => {
                        const data = activeContent.content_data as { title?: string; slides?: SlideData[] };
                        setViewingPresentation({
                          title: data.title || activeContent.title,
                          slides: data.slides || []
                        });
                      }}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 text-sm font-medium"
                    >
                      <Play size={16} /> View Full Presentation
                    </button>
                  )}
                  <button onClick={() => setActiveContent(null)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeContent.external_url ? (
                  <div className="text-center py-8">
                    <ExternalLink size={48} className="mx-auto text-purple-400 mb-4" />
                    <p className="text-slate-400 mb-4">This content is hosted externally</p>
                    <a href={activeContent.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                      Open Content <ExternalLink size={16} />
                    </a>
                  </div>
                ) : activeContent.content_data ? (
                  <div>
                    {activeContent.content_type === 'quiz' && (activeContent.content_data as { questions?: Question[] }).questions && (
                      <QuizViewer questions={(activeContent.content_data as { questions: Question[] }).questions} />
                    )}
                    {activeContent.content_type === 'tutorial' && (
                      <div className="prose prose-invert max-w-none">
                        <h3>{(activeContent.content_data as { title?: string }).title}</h3>
                        {((activeContent.content_data as { sections?: Array<{ title: string; content: string }> }).sections || []).map((sec, i) => (
                          <div key={i}>
                            <h4>{sec.title}</h4>
                            <p className="whitespace-pre-wrap">{sec.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeContent.content_type === 'presentation' && (
                      <div className="text-center py-8">
                        <Presentation size={48} className="mx-auto text-blue-400 mb-4" />
                        <p className="text-slate-300 mb-2 font-medium">AI-Generated Presentation</p>
                        <p className="text-slate-400 mb-4">
                          {((activeContent.content_data as { slides?: SlideData[] }).slides || []).length} slides ready to view
                        </p>
                        <button
                          onClick={() => {
                            const data = activeContent.content_data as { title?: string; slides?: SlideData[] };
                            setViewingPresentation({
                              title: data.title || activeContent.title,
                              slides: data.slides || []
                            });
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/25"
                        >
                          <Play size={18} /> Start Presentation
                        </button>
                      </div>
                    )}
                    {activeContent.content_type === 'assignment' && (
                      <AssignmentViewer data={activeContent.content_data as AssignmentData} />
                    )}
                    {activeContent.content_type === 'challenge' && (
                      <ChallengeViewer data={activeContent.content_data as ChallengeData} />
                    )}
                    {activeContent.content_type === 'interview_prep' && (
                      <InterviewPrepViewer data={activeContent.content_data as InterviewPrepData} />
                    )}
                    {activeContent.content_type === 'runbook' && (
                      <RunbookViewer data={activeContent.content_data as RunbookData} />
                    )}
                    {!['quiz', 'tutorial', 'presentation', 'assignment', 'challenge', 'interview_prep', 'runbook'].includes(activeContent.content_type) && (
                      <pre className="text-sm text-slate-400 whitespace-pre-wrap bg-slate-800/50 p-4 rounded-xl">{JSON.stringify(activeContent.content_data, null, 2)}</pre>
                    )}
                  </div>
                ) : activeContent.documents ? (
                  // Linked Document (Presentation from Documents)
                  <div>
                    {activeContent.documents.metadata?.slides ? (
                      <div className="text-center py-8">
                        <Presentation size={48} className="mx-auto text-blue-400 mb-4" />
                        <p className="text-slate-300 mb-2 font-medium">{activeContent.documents.title}</p>
                        <p className="text-slate-400 mb-4">
                          {activeContent.documents.metadata.slides.length} slides
                        </p>
                        <button
                          onClick={() => {
                            setViewingPresentation({
                              title: activeContent.documents!.title,
                              slides: activeContent.documents!.metadata?.slides || []
                            });
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/25"
                        >
                          <Play size={18} /> View Presentation
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText size={48} className="mx-auto text-purple-400 mb-4" />
                        <p className="text-slate-300 font-medium">{activeContent.documents.title}</p>
                        <p className="text-slate-400 mt-2">Linked document</p>
                      </div>
                    )}
                  </div>
                ) : activeContent.runbooks ? (
                  // Linked Runbook
                  <div className="space-y-6">
                    <div className="bg-teal-500/10 rounded-xl p-5 border border-teal-500/30">
                      <h3 className="text-teal-400 font-semibold mb-2">{activeContent.runbooks.title}</h3>
                      <p className="text-slate-400 text-sm">Linked Runbook</p>
                    </div>
                    {activeContent.runbooks.sections && activeContent.runbooks.sections.length > 0 && (
                      <div className="space-y-4">
                        {activeContent.runbooks.sections.map((section, i) => (
                          <div key={i} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                            <h4 className="text-white font-semibold mb-3">{section.title}</h4>
                            <div className="prose prose-invert prose-sm max-w-none">
                              <p className="whitespace-pre-wrap text-slate-300">{section.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">Content coming soon</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-4 border-t border-slate-700">
                <button onClick={() => setActiveContent(null)} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Close</button>
                <button onClick={completeContent} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2">
                  <CheckCircle size={18} /> Mark Complete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Presentation Viewer */}
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
              initialFullscreen={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Quiz Viewer Component
interface Question {
  question_type: string;
  question: string;
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
}

function QuizViewer({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (qIndex: number, answer: string) => {
    if (submitted) return;
    const q = questions[qIndex];
    if (q.question_type === 'multi_select') {
      const current = (answers[qIndex] as string[]) || [];
      if (current.includes(answer)) {
        setAnswers({ ...answers, [qIndex]: current.filter(a => a !== answer) });
      } else {
        setAnswers({ ...answers, [qIndex]: [...current, answer] });
      }
    } else {
      setAnswers({ ...answers, [qIndex]: answer });
    }
  };

  const checkAnswer = (qIndex: number) => {
    const q = questions[qIndex];
    const userAnswer = answers[qIndex];
    if (q.question_type === 'multi_select') {
      const correct = Array.isArray(q.correct_answer) ? q.correct_answer : [];
      const user = Array.isArray(userAnswer) ? userAnswer : [];
      return correct.length === user.length && correct.every(a => user.includes(a));
    }
    return String(userAnswer).toLowerCase() === String(q.correct_answer).toLowerCase();
  };

  const score = submitted ? questions.filter((_, i) => checkAnswer(i)).length : 0;

  return (
    <div className="space-y-6">
      {questions.map((q, i) => (
        <div key={i} className={`p-4 rounded-xl border ${submitted ? (checkAnswer(i) ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-red-500/50 bg-red-500/10') : 'border-slate-700 bg-slate-800/50'}`}>
          <p className="font-medium text-white mb-3">{i + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options?.map((opt, oi) => {
              const isSelected = q.question_type === 'multi_select' 
                ? ((answers[i] as string[]) || []).includes(opt)
                : answers[i] === opt;
              const isCorrect = q.question_type === 'multi_select'
                ? (Array.isArray(q.correct_answer) ? q.correct_answer : []).includes(opt)
                : q.correct_answer === opt;

              return (
                <button
                  key={oi}
                  onClick={() => handleAnswer(i, opt)}
                  disabled={submitted}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    submitted
                      ? isCorrect ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' : isSelected ? 'border-red-500 bg-red-500/20 text-red-300' : 'border-slate-600 text-slate-400'
                      : isSelected ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-slate-600 hover:border-slate-500 text-slate-300'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <p className="mt-3 text-sm text-slate-400 italic">{q.explanation}</p>
          )}
        </div>
      ))}

      {!submitted ? (
        <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < questions.length} className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50">
          Submit Quiz
        </button>
      ) : (
        <div className="text-center py-4">
          <p className="text-2xl font-bold text-white">{score}/{questions.length}</p>
          <p className="text-slate-400">Score: {Math.round((score / questions.length) * 100)}%</p>
        </div>
      )}
    </div>
  );
}

// Assignment Viewer Component
interface AssignmentData {
  title: string;
  description?: string;
  instructions?: string;
  requirements?: string[];
  deliverables?: string[];
  rubric?: Array<{ criterion: string; points: number; description: string }>;
  hints?: string[];
  bonus_challenges?: string[];
  estimated_minutes?: number;
}

function AssignmentViewer({ data }: { data: AssignmentData }) {
  const [showHints, setShowHints] = useState(false);
  
  return (
    <div className="space-y-6">
      {data.description && (
        <p className="text-slate-300">{data.description}</p>
      )}
      
      {data.instructions && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <ClipboardList size={18} className="text-purple-400" /> Instructions
          </h4>
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-slate-300">{data.instructions}</p>
          </div>
        </div>
      )}
      
      {data.requirements && data.requirements.length > 0 && (
        <div className="bg-blue-500/10 rounded-xl p-5 border border-blue-500/30">
          <h4 className="text-blue-400 font-semibold mb-3">Requirements</h4>
          <ul className="space-y-2">
            {data.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300">
                <CheckCircle size={16} className="text-blue-400 mt-0.5 shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {data.deliverables && data.deliverables.length > 0 && (
        <div className="bg-emerald-500/10 rounded-xl p-5 border border-emerald-500/30">
          <h4 className="text-emerald-400 font-semibold mb-3">What to Submit</h4>
          <ul className="space-y-2">
            {data.deliverables.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300">
                <Target size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {data.rubric && data.rubric.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h4 className="text-white font-semibold mb-3">Grading Rubric</h4>
          <div className="space-y-3">
            {data.rubric.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-4 p-3 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{item.criterion}</p>
                  <p className="text-sm text-slate-400">{item.description}</p>
                </div>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold shrink-0">
                  {item.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {data.hints && data.hints.length > 0 && (
        <div>
          <button
            onClick={() => setShowHints(!showHints)}
            className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-2"
          >
            <HelpCircle size={16} />
            {showHints ? 'Hide Hints' : 'Show Hints'}
          </button>
          {showHints && (
            <div className="mt-3 bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
              <ul className="space-y-2">
                {data.hints.map((hint, i) => (
                  <li key={i} className="text-sm text-amber-300">💡 {hint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {data.bonus_challenges && data.bonus_challenges.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-5 border border-purple-500/30">
          <h4 className="text-purple-400 font-semibold mb-3">⭐ Bonus Challenges</h4>
          <ul className="space-y-2">
            {data.bonus_challenges.map((item, i) => (
              <li key={i} className="text-slate-300">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Challenge Viewer Component
interface ChallengeData {
  title: string;
  description?: string;
  scenario?: string;
  objectives?: string[];
  constraints?: string[];
  starter_code?: string;
  test_cases?: Array<{ input: string; expected_output: string; explanation?: string }>;
  hints?: string[];
  solution_approach?: string;
  estimated_minutes?: number;
}

function ChallengeViewer({ data }: { data: ChallengeData }) {
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  
  return (
    <div className="space-y-6">
      {data.scenario && (
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl p-5 border border-red-500/30">
          <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
            <Target size={18} /> Scenario
          </h4>
          <p className="text-slate-300">{data.scenario}</p>
        </div>
      )}
      
      {data.objectives && data.objectives.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h4 className="text-white font-semibold mb-3">Objectives</h4>
          <ul className="space-y-2">
            {data.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300">
                <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm shrink-0">{i + 1}</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {data.constraints && data.constraints.length > 0 && (
        <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/30">
          <h4 className="text-amber-400 font-semibold mb-3">Constraints & Rules</h4>
          <ul className="space-y-2">
            {data.constraints.map((c, i) => (
              <li key={i} className="text-slate-300">⚠️ {c}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.starter_code && (
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-700">
          <h4 className="text-white font-semibold mb-3">Starter Code</h4>
          <pre className="text-sm text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap">{data.starter_code}</pre>
        </div>
      )}
      
      {data.test_cases && data.test_cases.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h4 className="text-white font-semibold mb-3">Test Cases</h4>
          <div className="space-y-3">
            {data.test_cases.map((tc, i) => (
              <div key={i} className="p-3 bg-slate-900/50 rounded-lg font-mono text-sm">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <span className="text-slate-500">Input:</span>
                    <p className="text-blue-400">{tc.input}</p>
                  </div>
                  <div className="flex-1">
                    <span className="text-slate-500">Expected:</span>
                    <p className="text-emerald-400">{tc.expected_output}</p>
                  </div>
                </div>
                {tc.explanation && <p className="text-slate-400 mt-2 text-xs">{tc.explanation}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {data.hints && data.hints.length > 0 && (
        <button
          onClick={() => setShowHints(!showHints)}
          className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-2"
        >
          <HelpCircle size={16} />
          {showHints ? 'Hide Hints' : `Show Hints (${data.hints.length})`}
        </button>
      )}
      {showHints && data.hints && (
        <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
          {data.hints.map((hint, i) => (
            <p key={i} className="text-sm text-amber-300 mb-2">💡 Hint {i + 1}: {hint}</p>
          ))}
        </div>
      )}
      
      {data.solution_approach && (
        <div>
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2"
          >
            {showSolution ? '🔒 Hide Solution' : '🔓 Show Solution Approach'}
          </button>
          {showSolution && (
            <div className="mt-3 bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
              <p className="text-slate-300">{data.solution_approach}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Interview Prep Viewer Component
interface InterviewPrepData {
  title: string;
  description?: string;
  questions?: Array<{
    question: string;
    category: string;
    difficulty: string;
    key_points?: string[];
    sample_answer?: string;
    follow_ups?: string[];
  }>;
  tips?: string[];
  common_mistakes?: string[];
  estimated_minutes?: number;
}

function InterviewPrepViewer({ data }: { data: InterviewPrepData }) {
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  
  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/20 text-emerald-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };
  
  return (
    <div className="space-y-6">
      {data.description && (
        <p className="text-slate-300">{data.description}</p>
      )}
      
      {data.tips && data.tips.length > 0 && (
        <div className="bg-emerald-500/10 rounded-xl p-5 border border-emerald-500/30">
          <h4 className="text-emerald-400 font-semibold mb-3">💡 Interview Tips</h4>
          <ul className="space-y-2">
            {data.tips.map((tip, i) => (
              <li key={i} className="text-slate-300 text-sm">• {tip}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.questions && data.questions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-white font-semibold">Practice Questions ({data.questions.length})</h4>
          {data.questions.map((q, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{q.question}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400">{q.category}</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                  </div>
                </div>
                <ChevronDown size={20} className={`text-slate-400 transition-transform ${expandedQ === i ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedQ === i && (
                <div className="p-4 border-t border-slate-700 space-y-4">
                  {q.key_points && q.key_points.length > 0 && (
                    <div>
                      <h5 className="text-sm text-slate-400 mb-2">What interviewers look for:</h5>
                      <ul className="space-y-1">
                        {q.key_points.map((point, j) => (
                          <li key={j} className="text-sm text-emerald-400 flex items-start gap-2">
                            <CheckCircle size={14} className="mt-0.5 shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {q.sample_answer && (
                    <div>
                      <h5 className="text-sm text-slate-400 mb-2">Sample Answer:</h5>
                      <p className="text-sm text-slate-300 bg-slate-900/50 rounded-lg p-3">{q.sample_answer}</p>
                    </div>
                  )}
                  
                  {q.follow_ups && q.follow_ups.length > 0 && (
                    <div>
                      <h5 className="text-sm text-slate-400 mb-2">Possible Follow-up Questions:</h5>
                      <ul className="space-y-1">
                        {q.follow_ups.map((fu, j) => (
                          <li key={j} className="text-sm text-amber-400">→ {fu}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {data.common_mistakes && data.common_mistakes.length > 0 && (
        <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/30">
          <h4 className="text-red-400 font-semibold mb-3">⚠️ Common Mistakes to Avoid</h4>
          <ul className="space-y-2">
            {data.common_mistakes.map((mistake, i) => (
              <li key={i} className="text-slate-300 text-sm">• {mistake}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Runbook Viewer Component
interface RunbookData {
  title: string;
  description?: string;
  prerequisites?: string[];
  steps?: Array<{
    title: string;
    description?: string;
    instructions?: string;
    commands?: string[];
    expected_output?: string;
    troubleshooting?: string;
  }>;
  verification?: string;
  rollback?: string;
  estimated_minutes?: number;
}

function RunbookViewer({ data }: { data: RunbookData }) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  const toggleStep = (index: number) => {
    const newSet = new Set(completedSteps);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setCompletedSteps(newSet);
  };
  
  return (
    <div className="space-y-6">
      {data.description && (
        <p className="text-slate-300">{data.description}</p>
      )}
      
      {data.prerequisites && data.prerequisites.length > 0 && (
        <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/30">
          <h4 className="text-amber-400 font-semibold mb-3">Prerequisites</h4>
          <ul className="space-y-2">
            {data.prerequisites.map((prereq, i) => (
              <li key={i} className="text-slate-300 text-sm">• {prereq}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.steps && data.steps.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-semibold">Steps ({completedSteps.size}/{data.steps.length} completed)</h4>
            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${(completedSteps.size / data.steps.length) * 100}%` }}
              />
            </div>
          </div>
          
          {data.steps.map((step, i) => (
            <div 
              key={i} 
              className={`rounded-xl border overflow-hidden transition-all ${
                completedSteps.has(i) 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStep(i)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      completedSteps.has(i)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {completedSteps.has(i) ? <CheckCircle size={18} /> : <span>{i + 1}</span>}
                  </button>
                  <div className="flex-1">
                    <h5 className="text-white font-medium">{step.title}</h5>
                    {step.description && <p className="text-sm text-slate-400 mt-1">{step.description}</p>}
                  </div>
                </div>
                
                {step.instructions && (
                  <div className="mt-4 pl-11">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{step.instructions}</p>
                  </div>
                )}
                
                {step.commands && step.commands.length > 0 && (
                  <div className="mt-4 pl-11">
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm">
                      {step.commands.map((cmd, j) => (
                        <div key={j} className="text-emerald-400">$ {cmd}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {step.expected_output && (
                  <div className="mt-3 pl-11">
                    <p className="text-xs text-slate-500 mb-1">Expected output:</p>
                    <p className="text-sm text-slate-400 bg-slate-900/50 rounded p-2 font-mono">{step.expected_output}</p>
                  </div>
                )}
                
                {step.troubleshooting && (
                  <div className="mt-3 pl-11">
                    <p className="text-xs text-amber-500 mb-1">If something goes wrong:</p>
                    <p className="text-sm text-amber-400/80">{step.troubleshooting}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {data.verification && (
        <div className="bg-emerald-500/10 rounded-xl p-5 border border-emerald-500/30">
          <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
            <CheckCircle size={18} /> Verification
          </h4>
          <p className="text-slate-300 text-sm">{data.verification}</p>
        </div>
      )}
      
      {data.rollback && (
        <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/30">
          <h4 className="text-red-400 font-semibold mb-3">🔙 Rollback Procedure</h4>
          <p className="text-slate-300 text-sm">{data.rollback}</p>
        </div>
      )}
    </div>
  );
}
