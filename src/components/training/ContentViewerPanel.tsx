'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, BookOpen, Video, HelpCircle, Target, ClipboardList, MessageSquare,
  FileText, Presentation, Link as LinkIcon, ExternalLink, Play, Edit3,
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Maximize2, Minimize2
} from 'lucide-react';
import { useState } from 'react';
import PresentationViewer, { PresentationData, SlideData } from '@/components/PresentationViewer';

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  document_id?: string;
  runbook_id?: string;
  external_url?: string;
  content_data?: Record<string, unknown>;
  sort_order: number;
  estimated_minutes?: number;
}

const CONTENT_TYPE_INFO: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  presentation: { icon: Presentation, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Presentation' },
  runbook: { icon: FileText, color: 'text-teal-400', bg: 'bg-teal-500/10', label: 'Runbook' },
  tutorial: { icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Tutorial' },
  quiz: { icon: HelpCircle, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Quiz' },
  assignment: { icon: ClipboardList, color: 'text-pink-400', bg: 'bg-pink-500/10', label: 'Assignment' },
  challenge: { icon: Target, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Challenge' },
  interview_prep: { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Interview Prep' },
  recording: { icon: Video, color: 'text-rose-400', bg: 'bg-rose-500/10', label: 'Recording' },
  external_link: { icon: LinkIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'External Link' },
};

interface ContentViewerPanelProps {
  content: ContentItem | null;
  onClose: () => void;
  onEdit?: (content: ContentItem) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export default function ContentViewerPanel({ 
  content, 
  onClose, 
  onEdit,
  isFullscreen = false,
  onToggleFullscreen 
}: ContentViewerPanelProps) {
  if (!content) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-700/50">
        <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
          <BookOpen size={32} className="text-slate-600" />
        </div>
        <p className="text-lg font-medium mb-2">Select content to preview</p>
        <p className="text-sm text-slate-600">Click on any item from the left panel</p>
      </div>
    );
  }

  const typeInfo = CONTENT_TYPE_INFO[content.content_type] || CONTENT_TYPE_INFO.external_link;
  const Icon = typeInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`h-full flex flex-col bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/30 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl ${typeInfo.bg} flex items-center justify-center shrink-0`}>
            <Icon size={20} className={typeInfo.color} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{content.title}</h3>
            <p className="text-xs text-slate-500 capitalize">{typeInfo.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(content)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit3 size={18} />
            </button>
          )}
          {content.external_url && (
            <a
              href={content.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={18} />
            </a>
          )}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {content.description && (
          <p className="text-slate-400 mb-6">{content.description}</p>
        )}
        
        <ContentRenderer content={content} />
      </div>
    </motion.div>
  );
}

function ContentRenderer({ content }: { content: ContentItem }) {
  switch (content.content_type) {
    case 'presentation':
      return <PresentationContent content={content} />;
    case 'quiz':
      return <QuizContent content={content} />;
    case 'tutorial':
      return <TutorialContent content={content} />;
    case 'assignment':
      return <AssignmentContent content={content} />;
    case 'challenge':
      return <ChallengeContent content={content} />;
    case 'interview_prep':
      return <InterviewPrepContent content={content} />;
    case 'recording':
      return <RecordingContent content={content} />;
    case 'external_link':
      return <ExternalLinkContent content={content} />;
    case 'runbook':
      return <RunbookContent content={content} />;
    default:
      return <DefaultContent content={content} />;
  }
}

// Presentation Content with embedded viewer
function PresentationContent({ content }: { content: ContentItem }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  if (!content.content_data) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Presentation size={48} className="mx-auto mb-4 opacity-50" />
        <p>No presentation data available</p>
      </div>
    );
  }

  const data = content.content_data as { title?: string; slides?: SlideData[] };
  const slides = data.slides || [];

  if (slides.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Presentation size={48} className="mx-auto mb-4 opacity-50" />
        <p>No slides in this presentation</p>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="space-y-4">
      {/* Slide Display */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 min-h-[300px] border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-6">{slide.title}</h2>
        <ul className="space-y-3">
          {slide.bullets?.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-3 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        {slide.speakerNotes && (
          <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Speaker Notes</p>
            <p className="text-sm text-slate-400">{slide.speakerNotes}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} /> Previous
        </button>
        <span className="text-slate-400 text-sm">
          Slide {currentSlide + 1} of {slides.length}
        </span>
        <button
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <ChevronRight size={18} />
        </button>
      </div>

      {/* Slide Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {slides.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm transition-all ${
              idx === currentSlide 
                ? 'bg-purple-500 text-white' 
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {idx + 1}. {s.title?.slice(0, 20)}{(s.title?.length || 0) > 20 ? '...' : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

// Quiz Content
function QuizContent({ content }: { content: ContentItem }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!content.content_data) {
    return <DefaultContent content={content} />;
  }

  const data = content.content_data as { 
    title?: string; 
    questions?: Array<{ 
      question: string; 
      type: string; 
      options?: string[]; 
      correct_answer: string;
      explanation?: string;
    }> 
  };
  const questions = data.questions || [];

  const handleSubmit = () => setSubmitted(true);
  const handleReset = () => { setAnswers({}); setSubmitted(false); };

  const score = questions.filter((q, idx) => answers[idx] === q.correct_answer).length;

  return (
    <div className="space-y-6">
      {submitted && (
        <div className={`p-4 rounded-xl ${score === questions.length ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-amber-500/20 border border-amber-500/30'}`}>
          <p className="font-semibold text-white">
            Score: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
          </p>
        </div>
      )}

      {questions.map((q, idx) => {
        const isCorrect = answers[idx] === q.correct_answer;
        return (
          <div key={idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <p className="font-medium text-white mb-4">
              <span className="text-purple-400">Q{idx + 1}.</span> {q.question}
            </p>
            
            {q.options && (
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => !submitted && setAnswers(prev => ({ ...prev, [idx]: opt }))}
                    disabled={submitted}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                      submitted
                        ? opt === q.correct_answer
                          ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                          : answers[idx] === opt
                            ? 'bg-red-500/20 border border-red-500/50 text-red-300'
                            : 'bg-slate-700/50 text-slate-400'
                        : answers[idx] === opt
                          ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {submitted && opt === q.correct_answer && <CheckCircle size={16} className="text-emerald-400" />}
                      {submitted && answers[idx] === opt && opt !== q.correct_answer && <XCircle size={16} className="text-red-400" />}
                      {opt}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {submitted && q.explanation && (
              <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
                <p className="text-sm text-slate-400">{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex gap-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold disabled:opacity-50"
          >
            Submit Answers
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="flex-1 py-3 bg-slate-700 rounded-xl text-white font-semibold hover:bg-slate-600"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// Tutorial Content
function TutorialContent({ content }: { content: ContentItem }) {
  if (!content.content_data) return <DefaultContent content={content} />;

  const data = content.content_data as { 
    title?: string; 
    sections?: Array<{ title: string; content: string; code_example?: string }>;
    key_takeaways?: string[];
  };

  return (
    <div className="space-y-6">
      {data.sections?.map((section, idx) => (
        <div key={idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="font-semibold text-white mb-3">{section.title}</h4>
          <p className="text-slate-300 whitespace-pre-wrap">{section.content}</p>
          {section.code_example && (
            <pre className="mt-4 p-4 bg-slate-900 rounded-lg text-sm text-emerald-400 overflow-x-auto font-mono">
              {section.code_example}
            </pre>
          )}
        </div>
      ))}

      {data.key_takeaways && data.key_takeaways.length > 0 && (
        <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/30">
          <h4 className="font-semibold text-amber-400 mb-3">Key Takeaways</h4>
          <ul className="space-y-2">
            {data.key_takeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300">
                <CheckCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Assignment Content
function AssignmentContent({ content }: { content: ContentItem }) {
  if (!content.content_data) return <DefaultContent content={content} />;

  const data = content.content_data as {
    title?: string;
    description?: string;
    objectives?: string[];
    requirements?: string[];
    deliverables?: string[];
    rubric?: Array<{ criteria: string; points: number; description: string }>;
  };

  return (
    <div className="space-y-6">
      {data.description && (
        <p className="text-slate-300">{data.description}</p>
      )}

      {data.objectives && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="font-semibold text-white mb-3">Learning Objectives</h4>
          <ul className="space-y-2">
            {data.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300">
                <Target size={16} className="text-pink-400 mt-0.5 shrink-0" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.requirements && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="font-semibold text-white mb-3">Requirements</h4>
          <ul className="space-y-2">
            {data.requirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-pink-500 mt-2 shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.deliverables && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="font-semibold text-white mb-3">Deliverables</h4>
          <ul className="space-y-2">
            {data.deliverables.map((del, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300">
                <ClipboardList size={16} className="text-pink-400 mt-0.5 shrink-0" />
                <span>{del}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.rubric && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="font-semibold text-white mb-3">Grading Rubric</h4>
          <div className="space-y-3">
            {data.rubric.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-4 p-3 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">{item.criteria}</p>
                  <p className="text-sm text-slate-400">{item.description}</p>
                </div>
                <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-lg text-sm font-medium shrink-0">
                  {item.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Challenge Content
function ChallengeContent({ content }: { content: ContentItem }) {
  if (!content.content_data) return <DefaultContent content={content} />;

  const data = content.content_data as {
    title?: string;
    description?: string;
    difficulty?: string;
    time_limit?: string;
    problem_statement?: string;
    hints?: string[];
    test_cases?: Array<{ input: string; expected_output: string }>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {data.difficulty && (
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
            data.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
            data.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {data.difficulty}
          </span>
        )}
        {data.time_limit && (
          <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm">
            ⏱️ {data.time_limit}
          </span>
        )}
      </div>

      {data.problem_statement && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="font-semibold text-white mb-3">Problem Statement</h4>
          <p className="text-slate-300 whitespace-pre-wrap">{data.problem_statement}</p>
        </div>
      )}

      {data.hints && data.hints.length > 0 && (
        <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/30">
          <h4 className="font-semibold text-amber-400 mb-3">💡 Hints</h4>
          <ul className="space-y-2">
            {data.hints.map((hint, idx) => (
              <li key={idx} className="text-slate-300">• {hint}</li>
            ))}
          </ul>
        </div>
      )}

      {data.test_cases && data.test_cases.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="font-semibold text-white mb-3">Test Cases</h4>
          <div className="space-y-3">
            {data.test_cases.map((tc, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Input</p>
                  <code className="text-sm text-emerald-400">{tc.input}</code>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Expected Output</p>
                  <code className="text-sm text-blue-400">{tc.expected_output}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Interview Prep Content
function InterviewPrepContent({ content }: { content: ContentItem }) {
  const [showAnswers, setShowAnswers] = useState<Set<number>>(new Set());

  if (!content.content_data) return <DefaultContent content={content} />;

  const data = content.content_data as {
    title?: string;
    questions?: Array<{ question: string; category?: string; difficulty?: string; sample_answer: string; tips?: string[] }>;
  };

  const toggleAnswer = (idx: number) => {
    const newSet = new Set(showAnswers);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setShowAnswers(newSet);
  };

  return (
    <div className="space-y-4">
      {data.questions?.map((q, idx) => (
        <div key={idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-start justify-between gap-4 mb-3">
            <p className="font-medium text-white">{q.question}</p>
            <div className="flex items-center gap-2 shrink-0">
              {q.category && (
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                  {q.category}
                </span>
              )}
              {q.difficulty && (
                <span className={`px-2 py-1 rounded text-xs ${
                  q.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                  q.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {q.difficulty}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => toggleAnswer(idx)}
            className="text-sm text-purple-400 hover:text-purple-300 mb-3"
          >
            {showAnswers.has(idx) ? 'Hide Answer ▲' : 'Show Answer ▼'}
          </button>

          <AnimatePresence>
            {showAnswers.has(idx) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-slate-900/50 rounded-lg mb-3">
                  <p className="text-slate-300 whitespace-pre-wrap">{q.sample_answer}</p>
                </div>
                {q.tips && (
                  <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                    <p className="text-xs text-amber-400 font-medium mb-2">💡 Tips</p>
                    <ul className="space-y-1">
                      {q.tips.map((tip, tipIdx) => (
                        <li key={tipIdx} className="text-sm text-slate-300">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// Recording Content
function RecordingContent({ content }: { content: ContentItem }) {
  if (content.external_url) {
    // Check if it's a YouTube URL
    const youtubeMatch = content.external_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return (
        <div className="aspect-video rounded-xl overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Check if it's a Loom URL
    const loomMatch = content.external_url.match(/loom\.com\/share\/([^?]+)/);
    if (loomMatch) {
      return (
        <div className="aspect-video rounded-xl overflow-hidden">
          <iframe
            src={`https://www.loom.com/embed/${loomMatch[1]}`}
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      );
    }

    // Generic video embed
    return (
      <div className="space-y-4">
        <a
          href={content.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 bg-rose-500/10 rounded-xl border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
        >
          <Play size={24} className="text-rose-400" />
          <div>
            <p className="font-medium text-white">Watch Recording</p>
            <p className="text-sm text-slate-400 truncate">{content.external_url}</p>
          </div>
          <ExternalLink size={18} className="text-rose-400 ml-auto" />
        </a>
      </div>
    );
  }

  return (
    <div className="text-center py-12 text-slate-500">
      <Video size={48} className="mx-auto mb-4 opacity-50" />
      <p>No recording URL available</p>
    </div>
  );
}

// External Link Content
function ExternalLinkContent({ content }: { content: ContentItem }) {
  if (!content.external_url) {
    return (
      <div className="text-center py-12 text-slate-500">
        <LinkIcon size={48} className="mx-auto mb-4 opacity-50" />
        <p>No link configured</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <a
        href={content.external_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors group"
      >
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <ExternalLink size={24} className="text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white group-hover:text-cyan-300 transition-colors">Open External Resource</p>
          <p className="text-sm text-slate-400 truncate">{content.external_url}</p>
        </div>
        <ExternalLink size={18} className="text-cyan-400 shrink-0" />
      </a>
    </div>
  );
}

// Runbook Content
function RunbookContent({ content }: { content: ContentItem }) {
  if (!content.content_data && !content.runbook_id) {
    return (
      <div className="text-center py-12 text-slate-500">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p>No runbook linked</p>
      </div>
    );
  }

  // If it has content_data, render it
  if (content.content_data) {
    const data = content.content_data as {
      title?: string;
      steps?: Array<{ title: string; description: string; command?: string; expected_output?: string }>;
    };

    return (
      <div className="space-y-4">
        {data.steps?.map((step, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-semibold text-sm">
                {idx + 1}
              </span>
              <h4 className="font-semibold text-white">{step.title}</h4>
            </div>
            <p className="text-slate-300 mb-3">{step.description}</p>
            {step.command && (
              <pre className="p-3 bg-slate-900 rounded-lg text-sm text-emerald-400 font-mono overflow-x-auto">
                $ {step.command}
              </pre>
            )}
            {step.expected_output && (
              <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Expected Output</p>
                <pre className="text-sm text-slate-400 whitespace-pre-wrap">{step.expected_output}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-12 text-slate-500">
      <FileText size={48} className="mx-auto mb-4 opacity-50" />
      <p>Runbook linked but content not loaded</p>
    </div>
  );
}

// Default/Fallback Content
function DefaultContent({ content }: { content: ContentItem }) {
  return (
    <div className="space-y-4">
      {content.content_data ? (
        <pre className="p-4 bg-slate-800/50 rounded-xl text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono">
          {JSON.stringify(content.content_data, null, 2)}
        </pre>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>No content data available</p>
          <p className="text-sm mt-2">This content item may need to be configured with AI generation or manual entry.</p>
        </div>
      )}
    </div>
  );
}

