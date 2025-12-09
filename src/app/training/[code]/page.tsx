'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Wrench, ClipboardCheck, FolderOpen, Briefcase, 
  ChevronDown, ChevronRight, Loader2, CheckCircle, Circle, Play, FileText,
  Presentation, HelpCircle, Target, ClipboardList, MessageSquare, Video, Link as LinkIcon,
  ExternalLink, Clock, Award, X
} from 'lucide-react';

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
interface Content { id: string; title: string; content_type: string; document_id?: string; runbook_id?: string; external_url?: string; content_data?: Record<string, unknown>; estimated_minutes?: number; }
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

  useEffect(() => {
    // Get token from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const storedToken = localStorage.getItem(`training_token_${code}`);
    const accessToken = urlToken || storedToken;
    
    if (accessToken) {
      setToken(accessToken);
      if (urlToken) {
        localStorage.setItem(`training_token_${code}`, urlToken);
        // Clean URL
        window.history.replaceState({}, '', `/training/${code}`);
      }
      fetchTraining(accessToken);
    } else {
      setError('No access token provided. Please use the link sent to your email.');
      setIsLoading(false);
    }
  }, [code]);

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
    if (!token) return;
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
    markProgress(content.id, 'in_progress');
  };

  const completeContent = () => {
    if (activeContent) {
      markProgress(activeContent.id, 'completed');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <Loader2 size={48} className="text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 max-w-md text-center">
          <GraduationCap size={48} className="mx-auto text-slate-600 mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
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
                <button onClick={() => setActiveContent(null)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                  <X size={20} />
                </button>
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
                    {!['quiz', 'tutorial'].includes(activeContent.content_type) && (
                      <pre className="text-sm text-slate-400 whitespace-pre-wrap">{JSON.stringify(activeContent.content_data, null, 2)}</pre>
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
