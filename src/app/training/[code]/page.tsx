'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Wrench, ClipboardCheck, FolderOpen, Briefcase, 
  ChevronDown, ChevronRight, Loader2, CheckCircle, Circle, Play, FileText,
  Presentation, HelpCircle, Target, ClipboardList, MessageSquare, Video, Link as LinkIcon,
  ExternalLink, Clock, X, Eye, AlertCircle, Trophy, Folder, RotateCcw, 
  ChevronLeft, Maximize2, Minimize2, Copy, Check, Terminal
} from 'lucide-react';
import PresentationViewer, { PresentationData, SlideData } from '@/components/PresentationViewer';
import AITutorChat from '@/components/ai/AITutorChat';
import StudentAIActions from '@/components/ai/StudentAIActions';
import CertificateGenerator from '@/components/ai/CertificateGenerator';

const SECTION_ICONS: Record<string, React.ElementType> = {
  learn: BookOpen, labs: Terminal, practice: Wrench, assess: ClipboardCheck, resources: FolderOpen, career: Briefcase
};

const SECTION_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  amber: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30', gradient: 'from-amber-500 to-orange-500' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/30', gradient: 'from-orange-500 to-red-500' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-400', border: 'border-teal-500/30', gradient: 'from-teal-500 to-emerald-500' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30', gradient: 'from-purple-500 to-pink-500' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', gradient: 'from-blue-500 to-indigo-500' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-green-500' },
};

const CONTENT_ICONS: Record<string, React.ElementType> = {
  presentation: Presentation, runbook: FileText, tutorial: BookOpen, quiz: HelpCircle,
  assignment: ClipboardList, challenge: Target, interview_prep: MessageSquare, recording: Video, 
  external_link: LinkIcon, lab: Terminal
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

interface ModuleNode extends Module {
  children: ModuleNode[];
}

// ============================================================
// SPLIT PANE COMPONENT
// ============================================================

function SplitPane({ 
  left, 
  right, 
  showRight,
  defaultSplit = 45 
}: { 
  left: React.ReactNode; 
  right: React.ReactNode; 
  showRight: boolean;
  defaultSplit?: number;
}) {
  const [splitPosition, setSplitPosition] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPosition(Math.min(70, Math.max(30, newPosition)));
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex h-full select-none">
      {/* Left Pane - Course Content */}
      <div 
        className="overflow-hidden transition-all duration-300"
        style={{ width: showRight ? `${splitPosition}%` : '100%' }}
      >
        {left}
      </div>

      {/* Divider */}
      {showRight && (
        <div
          onMouseDown={handleMouseDown}
          className={`w-1.5 bg-slate-700 hover:bg-teal-500 cursor-col-resize flex items-center justify-center transition-colors shrink-0 ${
            isDragging ? 'bg-teal-500' : ''
          }`}
        >
          <div className="w-0.5 h-12 bg-slate-500 rounded-full" />
        </div>
      )}

      {/* Right Pane - Content Viewer */}
      <AnimatePresence>
        {showRight && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: `${100 - splitPosition}%`, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {right}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// CONTENT VIEWER PANEL
// ============================================================

interface ContentViewerPanelProps {
  content: Content;
  onClose: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}

function ContentViewerPanel({ content, onClose, onComplete, isCompleted }: ContentViewerPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);
  const ContentIcon = CONTENT_ICONS[content.content_type] || FileText;

  // Get slides if presentation
  const slides = content.content_type === 'presentation' && content.content_data
    ? ((content.content_data as { slides?: SlideData[] }).slides || [])
    : [];

  // Keyboard navigation for presentations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (content.content_type === 'presentation' && slides.length > 0) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setCurrentSlide(prev => Math.max(0, prev - 1));
        } else if (e.key === 'Escape') {
          if (isFullscreen) setIsFullscreen(false);
          else onClose();
        } else if (e.key === 'f') {
          setIsFullscreen(!isFullscreen);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content.content_type, slides.length, isFullscreen, onClose]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const panelContent = (
    <div className={`flex flex-col h-full bg-slate-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            content.content_type === 'presentation' ? 'bg-blue-500/20 text-blue-400' :
            content.content_type === 'recording' ? 'bg-rose-500/20 text-rose-400' :
            content.content_type === 'quiz' ? 'bg-purple-500/20 text-purple-400' :
            content.content_type === 'tutorial' ? 'bg-amber-500/20 text-amber-400' :
            content.content_type === 'runbook' ? 'bg-teal-500/20 text-teal-400' :
            'bg-slate-700/50 text-slate-400'
          }`}>
            <ContentIcon size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{content.title}</h3>
            <p className="text-xs text-slate-400 capitalize">{content.content_type.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* PRESENTATION */}
        {content.content_type === 'presentation' && slides.length > 0 ? (
          <div className="h-full flex flex-col">
            {/* Slide Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">{slides[currentSlide]?.title}</h2>
                  {slides[currentSlide]?.items && (
                    <ul className="space-y-3">
                      {slides[currentSlide].items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-300">
                          <span className="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0" />
                          <div>
                            {item.title && <span className="font-medium text-white">{item.title}: </span>}
                            <span>{item.description || item.title}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slide Navigation */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/50 shrink-0">
              <button
                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                disabled={currentSlide === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} /> Previous
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">
                  Slide {currentSlide + 1} of {slides.length}
                </span>
                <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
                    style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                  />
                </div>
              </div>
              
              <button
                onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                disabled={currentSlide === slides.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-600 hover:to-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>

            {/* Slide Thumbnails */}
            <div className="flex gap-2 px-6 py-3 border-t border-slate-800 overflow-x-auto shrink-0">
              {slides.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                    idx === currentSlide
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}. {slide.title?.slice(0, 20)}...
                </button>
              ))}
            </div>
          </div>
        ) : 
        
        /* QUIZ */
        content.content_type === 'quiz' && content.content_data ? (
          <div className="p-6">
            <QuizViewer data={content.content_data as Record<string, unknown>} />
          </div>
        ) : 
        
        /* TUTORIAL */
        content.content_type === 'tutorial' && content.content_data ? (
          <div className="p-6">
            <TutorialViewer data={content.content_data as Record<string, unknown>} onCopy={copyToClipboard} copied={copied} />
          </div>
        ) :
        
        /* RUNBOOK */
        content.content_type === 'runbook' && content.runbooks ? (
          <div className="p-6">
            <RunbookViewer runbook={content.runbooks} onCopy={copyToClipboard} copied={copied} />
          </div>
        ) :
        
        /* EXTERNAL LINK */
        content.external_url ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <ExternalLink size={64} className="text-cyan-400 mb-4" />
            <p className="text-slate-300 mb-6 text-center">This content is hosted externally</p>
            <a
              href={content.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-colors font-medium"
            >
              <ExternalLink size={18} />
              Open External Link
            </a>
          </div>
        ) :
        
        /* RECORDING */
        content.content_type === 'recording' && content.content_data ? (
          <div className="p-6">
            <RecordingViewer data={content.content_data as Record<string, unknown>} />
          </div>
        ) :
        
        /* GENERIC JSON DATA */
        content.content_data ? (
          <div className="p-6">
            <pre className="text-sm text-slate-400 whitespace-pre-wrap bg-slate-800/50 p-4 rounded-xl overflow-x-auto">
              {JSON.stringify(content.content_data, null, 2)}
            </pre>
          </div>
        ) :
        
        /* EMPTY STATE */
        (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <FileText size={64} className="text-slate-600 mb-4" />
            <p className="text-slate-400">Content coming soon</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 bg-slate-800/50 shrink-0">
        <button
          onClick={onClose}
          className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
        >
          Close
        </button>
        <motion.button
          onClick={onComplete}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
            isCompleted 
              ? 'bg-slate-700 text-slate-400'
              : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25'
          }`}
        >
          <CheckCircle size={18} />
          {isCompleted ? 'Completed' : 'Mark as Complete'}
        </motion.button>
      </div>
    </div>
  );

  return panelContent;
}

// ============================================================
// CONTENT TYPE VIEWERS
// ============================================================

function QuizViewer({ data }: { data: Record<string, unknown> }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  
  const questions = (data.questions || []) as Array<{
    question: string;
    type?: string;
    options?: string[];
    correct_answer: string;
    explanation?: string;
  }>;

  const handleAnswer = (questionIdx: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIdx]: answer }));
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const correctCount = questions.filter((q, idx) => answers[idx] === q.correct_answer).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">{(data.title as string) || 'Quiz'}</h3>
        <span className="text-sm text-slate-400">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      {/* Progress */}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      {questions[currentQuestion] && (
        <div className="bg-slate-800/50 rounded-xl p-6">
          <p className="text-lg text-white mb-4">
            <span className="text-purple-400 font-bold">Q{currentQuestion + 1}.</span> {questions[currentQuestion].question}
          </p>
          
          {questions[currentQuestion].options && (
            <div className="space-y-2">
              {questions[currentQuestion].options.map((option, idx) => {
                const isSelected = answers[currentQuestion] === option;
                const isCorrect = option === questions[currentQuestion].correct_answer;
                
                return (
                  <button
                    key={idx}
                    onClick={() => !showResults && handleAnswer(currentQuestion, option)}
                    disabled={showResults}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      showResults
                        ? isCorrect
                          ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                          : isSelected
                          ? 'bg-red-500/20 border border-red-500/50 text-red-300'
                          : 'bg-slate-700/50 text-slate-400'
                        : isSelected
                        ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {option}
                    {showResults && isCorrect && <CheckCircle size={16} className="inline ml-2 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          )}
          
          {showResults && questions[currentQuestion].explanation && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">💡 {questions[currentQuestion].explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-40"
        >
          <ChevronLeft size={18} /> Previous
        </button>
        
        {currentQuestion === questions.length - 1 ? (
          !showResults ? (
            <button
              onClick={checkAnswers}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium"
            >
              Submit Answers
            </button>
          ) : (
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                Score: {correctCount}/{questions.length}
              </p>
              <p className="text-sm text-slate-400">
                {Math.round((correctCount / questions.length) * 100)}% correct
              </p>
            </div>
          )
        ) : (
          <button
            onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium"
          >
            Next <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function TutorialViewer({ data, onCopy, copied }: { data: Record<string, unknown>; onCopy: (text: string) => void; copied: boolean }) {
  const sections = (data.sections || []) as Array<{
    title: string;
    content: string;
    code_example?: string;
    expected_output?: string;
  }>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">{String(data.title || 'Tutorial')}</h3>
        {data.description ? <p className="text-slate-400 mt-2">{String(data.description)}</p> : null}
      </div>

      {sections.map((section, idx) => (
        <div key={idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="font-semibold text-white mb-3">{section.title}</h4>
          <p className="text-slate-300 mb-4">{section.content}</p>
          
          {section.code_example && (
            <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-800">
                <span className="text-xs text-slate-400 font-mono">Code</span>
                <button
                  onClick={() => onCopy(section.code_example!)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-emerald-400 text-sm overflow-x-auto">
                {section.code_example}
              </pre>
            </div>
          )}
          
          {section.expected_output && (
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Expected Output:</p>
              <p className="text-sm text-slate-400 font-mono">{section.expected_output}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RunbookViewer({ runbook, onCopy, copied }: { runbook: LinkedRunbook; onCopy: (text: string) => void; copied: boolean }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">{runbook.title}</h3>
      
      {runbook.sections?.map((section, idx) => (
        <div key={idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {idx + 1}
            </div>
            <h4 className="font-semibold text-white pt-1">{section.title}</h4>
          </div>
          <div 
            className="text-slate-300 prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </div>
      ))}
    </div>
  );
}

function RecordingViewer({ data }: { data: Record<string, unknown> }) {
  const url = data.url as string;
  
  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Video size={64} className="text-slate-600 mb-4" />
        <p className="text-slate-400">No recording available</p>
      </div>
    );
  }

  // Handle YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.includes('youtu.be') 
      ? url.split('/').pop() 
      : new URL(url).searchParams.get('v');
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Handle Vimeo
  if (url.includes('vimeo.com')) {
    const videoId = url.split('/').pop();
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Handle direct video
  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black">
      <video src={url} controls className="w-full h-full" />
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

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
  const [showAITools, setShowAITools] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollName, setEnrollName] = useState('');
  const [enrolling, setEnrolling] = useState(false);

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
          setExpandedSections(new Set(trainingData.batch.sections.map((s: Section) => s.id)));
        }
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
        if (trainingData.batch.sections?.length > 0) {
          setExpandedSections(new Set(trainingData.batch.sections.map((s: Section) => s.id)));
        }
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

  const buildModuleTree = (sectionId: string): ModuleNode[] => {
    if (!data?.modules) return [];
    const sectionModules = data.modules.filter(m => m.section_id === sectionId);
    
    const buildTree = (parentId: string | null): ModuleNode[] => {
      return sectionModules
        .filter(m => m.parent_id === parentId)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(module => ({ ...module, children: buildTree(module.id) }));
    };
    
    return buildTree(null);
  };

  const getAllSectionContent = (sectionId: string): Content[] => {
    if (!data?.modules) return [];
    return data.modules.filter(m => m.section_id === sectionId).flatMap(m => m.training_content || []);
  };

  const getModuleContentCount = (module: ModuleNode): number => {
    const directContent = module.training_content?.length || 0;
    const childContent = module.children.reduce((acc, child) => acc + getModuleContentCount(child), 0);
    return directContent + childContent;
  };

  const getModuleCompletionCount = (module: ModuleNode): { completed: number; total: number } => {
    const directContent = module.training_content || [];
    const directCompleted = directContent.filter(c => getProgress(c.id)?.status === 'completed').length;
    
    const childCounts = module.children.reduce((acc, child) => {
      const childCount = getModuleCompletionCount(child);
      return { completed: acc.completed + childCount.completed, total: acc.total + childCount.total };
    }, { completed: 0, total: 0 });
    
    return { completed: directCompleted + childCounts.completed, total: directContent.length + childCounts.total };
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
    } catch (e) { console.error(e); }
  };

  const openContent = (content: Content) => {
    // For lab content, redirect to the lab page
    if (content.content_type === 'lab') {
      window.location.href = `/training/${code}/lab/${content.id}`;
      return;
    }
    setActiveContent(content);
    if (!isPreviewMode) markProgress(content.id, 'in_progress');
  };

  const completeContent = () => {
    if (activeContent) {
      if (!isPreviewMode) markProgress(activeContent.id, 'completed');
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
      amber: 'from-amber-500 to-orange-500', teal: 'from-teal-500 to-emerald-500',
      purple: 'from-purple-500 to-violet-500', blue: 'from-blue-500 to-indigo-500',
      pink: 'from-pink-500 to-rose-500', slate: 'from-slate-500 to-slate-600',
    };
    const gradient = moduleColors[module.color || 'slate'] || moduleColors.slate;

    return (
      <div key={module.id} className={depth > 0 ? 'ml-6' : ''}>
        <button
          onClick={() => toggleModule(module.id)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
            isExpanded ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-800/40 hover:bg-slate-800/60'
          } ${depth > 0 ? 'mt-2' : ''}`}
        >
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} className="text-slate-400">
            <ChevronRight size={16} />
          </motion.div>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
            <Folder size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white text-sm truncate">{module.title}</span>
              {isCompleted && <CheckCircle size={14} className="text-emerald-400 shrink-0" />}
            </div>
          </div>
          {contentCount > 0 && (
            <span className={`text-xs ${isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
              {completion.completed}/{completion.total}
            </span>
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (hasContent || hasChildren) && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className={`mt-1 ${depth > 0 ? '' : 'ml-6'} border-l-2 border-slate-700/50 pl-4`}>
                {module.training_content && module.training_content.length > 0 && (
                  <div className="space-y-1 py-2">
                    {module.training_content.map((content, idx) => {
                      const ContentIcon = CONTENT_ICONS[content.content_type] || FileText;
                      const progressItem = getProgress(content.id);
                      const isContentCompleted = progressItem?.status === 'completed';
                      const isInProgress = progressItem?.status === 'in_progress';
                      const isActive = activeContent?.id === content.id;

                      return (
                        <motion.button
                          key={content.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          onClick={() => openContent(content)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left group ${
                            isActive 
                              ? 'bg-teal-500/20 border border-teal-500/50' 
                              : 'hover:bg-slate-800/50'
                          }`}
                        >
                          {isContentCompleted ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                              <CheckCircle size={12} className="text-white" />
                            </div>
                          ) : isInProgress ? (
                            <div className="w-5 h-5 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-600 shrink-0 group-hover:border-slate-500" />
                          )}

                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            content.content_type === 'lab' ? 'bg-orange-500/20 text-orange-400' :
                            content.content_type === 'presentation' ? 'bg-blue-500/10 text-blue-400' :
                            content.content_type === 'recording' ? 'bg-rose-500/10 text-rose-400' :
                            content.content_type === 'quiz' ? 'bg-purple-500/10 text-purple-400' :
                            content.content_type === 'tutorial' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-slate-700/50 text-slate-400'
                          }`}>
                            <ContentIcon size={14} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className={`text-sm ${isContentCompleted ? 'text-slate-400' : 'text-white'}`}>
                              {content.title}
                            </span>
                            {content.content_type === 'lab' && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                                Interactive Lab
                              </span>
                            )}
                          </div>

                          {content.content_type === 'lab' ? (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <Terminal size={12} />
                              Launch
                            </div>
                          ) : (
                            <div className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <Play size={12} className="text-teal-400" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
                {module.children.length > 0 && (
                  <div className="py-2 space-y-2">{module.children.map(child => renderModule(child, depth + 1))}</div>
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

  if (!data && !isPreviewMode) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
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
              <input type="email" value={enrollEmail} onChange={(e) => setEnrollEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Name (optional)</label>
              <input type="text" value={enrollName} onChange={(e) => setEnrollName(e.target.value)} placeholder="Your name" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            {error && error !== 'Enter your email to access this training' && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} />{error}
              </div>
            )}
            <motion.button type="submit" disabled={!enrollEmail.trim() || enrolling} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-teal-500/25">
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
    <div className="h-screen flex flex-col bg-[#0a0f1a] overflow-hidden">
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye size={18} />
              <span className="font-semibold text-sm">Preview Mode</span>
              <span className="text-white/80 text-xs hidden sm:inline">- This is how students see your training</span>
            </div>
            <button onClick={() => window.close()} className="px-3 py-1 bg-white text-orange-600 rounded-lg text-xs font-semibold hover:bg-white/90">Exit Preview</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white truncate">{data.batch.title}</h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-400">{progress.completed}/{progress.total} completed</span>
                <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" style={{ width: `${progress.percentage}%` }} />
                </div>
                <span className="text-teal-400 font-medium">{progress.percentage}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {progress.percentage === 100 && (
              <button onClick={() => setShowCertificate(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-amber-500/25">
                <Trophy size={16} /> Certificate
              </button>
            )}
            <button onClick={() => setShowAITools(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/30">
              <HelpCircle size={18} />
              <span className="hidden sm:inline text-sm font-medium">AI Tools</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Split View */}
      <div className="flex-1 overflow-hidden">
        <SplitPane
          showRight={activeContent !== null}
          left={
            /* LEFT PANE - Course Content */
            <div className="h-full overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                {data.batch.sections.sort((a, b) => a.sort_order - b.sort_order).map((section, sectionIndex) => {
                  const Icon = SECTION_ICONS[section.section_key] || FolderOpen;
                  const colors = SECTION_COLORS[section.color] || SECTION_COLORS.blue;
                  const moduleTree = buildModuleTree(section.id);
                  const sectionContent = getAllSectionContent(section.id);
                  const sectionCompleted = sectionContent.filter(c => getProgress(c.id)?.status === 'completed').length;
                  const isExpanded = expandedSections.has(section.id);
                  const isSectionComplete = sectionContent.length > 0 && sectionCompleted === sectionContent.length;

                  return (
                    <motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: sectionIndex * 0.1 }} className={`bg-slate-900 border rounded-xl overflow-hidden ${isSectionComplete ? 'border-emerald-500/30' : 'border-slate-800'}`}>
                      <button onClick={() => toggleSection(section.id)} className="w-full flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors text-left">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                          <Icon size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{section.title}</h3>
                            {isSectionComplete && <CheckCircle size={16} className="text-emerald-400" />}
                          </div>
                          <p className="text-xs text-slate-400 truncate">{section.description}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {sectionContent.length > 0 && (
                            <span className={`text-sm font-medium ${isSectionComplete ? 'text-emerald-400' : colors.text}`}>{sectionCompleted}/{sectionContent.length}</span>
                          )}
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-slate-400"><ChevronDown size={18} /></motion.div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="border-t border-slate-800 p-3">
                              {moduleTree.length > 0 ? (
                                <div className="space-y-2">{moduleTree.map(module => renderModule(module, 0))}</div>
                              ) : (
                                <div className="py-8 text-center"><FolderOpen size={28} className="mx-auto text-slate-600 mb-2" /><p className="text-slate-500 text-sm">No chapters available yet</p></div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          }
          right={
            /* RIGHT PANE - Content Viewer */
            activeContent && (
              <ContentViewerPanel
                content={activeContent}
                onClose={() => setActiveContent(null)}
                onComplete={completeContent}
                isCompleted={getProgress(activeContent.id)?.status === 'completed'}
              />
            )
          }
        />
      </div>

      {/* AI Study Tools Modal */}
      <AnimatePresence>
        {showAITools && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAITools(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
              <StudentAIActions topic={data.batch.title} onClose={() => setShowAITools(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate Modal */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCertificate(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
              <CertificateGenerator studentName={data.enrollment.student_name || data.enrollment.student_email} courseName={data.batch.title} completionDate={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Tutor Floating Chat */}
      {!isPreviewMode && (
        <AITutorChat courseName={data.batch.title} courseContext={`Course: ${data.batch.title}\nDescription: ${data.batch.description || 'N/A'}\nSections: ${data.batch.sections.map(s => s.title).join(', ')}`} isFloating={true} />
      )}
    </div>
  );
}
