'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Eye, Code, Edit3, RotateCcw, Save, ChevronLeft, ChevronRight,
  CheckCircle, Copy, Check, Sparkles, AlertCircle
} from 'lucide-react';

interface AIPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Record<string, unknown> | null;
  contentType: string;
  onSave: (content: Record<string, unknown>) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  title?: string;
}

export default function AIPreviewModal({
  isOpen,
  onClose,
  content,
  contentType,
  onSave,
  onRegenerate,
  isRegenerating = false,
  title = 'Preview Generated Content'
}: AIPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');
  const [editedContent, setEditedContent] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (content) {
      setEditedContent(JSON.stringify(content, null, 2));
      setJsonError(null);
    }
  }, [content]);

  const handleJsonChange = (value: string) => {
    setEditedContent(value);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (e) {
      setJsonError('Invalid JSON format');
    }
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(editedContent);
      onSave(parsed);
    } catch {
      setJsonError('Cannot save: Invalid JSON');
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !content) return null;

  return (
    <AnimatePresence>
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
          className="w-full max-w-5xl max-h-[90vh] bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-sm text-slate-400 capitalize">{contentType.replace('_', ' ')}</p>
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
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Eye size={16} /> Preview
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'json'
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Code size={16} /> Edit JSON
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'preview' ? (
              <ContentPreview content={content} contentType={contentType} />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">Edit the JSON directly to customize the content</p>
                  <button
                    onClick={copyJson}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                {jsonError && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    <AlertCircle size={16} />
                    {jsonError}
                  </div>
                )}
                <textarea
                  value={editedContent}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className="w-full h-[400px] px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 font-mono text-sm resize-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none"
                  spellCheck={false}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-slate-700/50 shrink-0">
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
            >
              <RotateCcw size={18} className={isRegenerating ? 'animate-spin' : ''} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-700/50 text-white rounded-xl hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleSave}
                disabled={!!jsonError}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} /> Save Content
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Content Preview Component
function ContentPreview({ content, contentType }: { content: Record<string, unknown>; contentType: string }) {
  switch (contentType) {
    case 'presentation':
      return <PresentationPreview content={content} />;
    case 'quiz':
      return <QuizPreview content={content} />;
    case 'tutorial':
      return <TutorialPreview content={content} />;
    case 'flashcards':
      return <FlashcardsPreview content={content} />;
    case 'assignment':
      return <AssignmentPreview content={content} />;
    case 'challenge':
      return <ChallengePreview content={content} />;
    case 'interview_prep':
      return <InterviewPrepPreview content={content} />;
    case 'runbook':
      return <RunbookPreview content={content} />;
    default:
      return <GenericPreview content={content} />;
  }
}

// Presentation Preview
function PresentationPreview({ content }: { content: Record<string, unknown> }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const data = content as { title?: string; slides?: Array<{ title: string; items?: Array<{ title?: string; description?: string }> }> };
  const slides = data.slides || [];

  if (slides.length === 0) {
    return <div className="text-center py-12 text-slate-500">No slides generated</div>;
  }

  const slide = slides[currentSlide];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 min-h-[300px] border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-6">{slide.title}</h2>
        {slide.items && (
          <ul className="space-y-3">
            {slide.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0" />
                <div>
                  {item.title && <span className="font-medium text-white">{item.title}: </span>}
                  <span>{item.description || item.title}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} /> Previous
        </button>
        <span className="text-slate-400">Slide {currentSlide + 1} of {slides.length}</span>
        <button
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {slides.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all ${
              idx === currentSlide
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {idx + 1}. {s.title?.slice(0, 15)}...
          </button>
        ))}
      </div>
    </div>
  );
}

// Quiz Preview
function QuizPreview({ content }: { content: Record<string, unknown> }) {
  const data = content as { title?: string; questions?: Array<{ question: string; type?: string; options?: string[]; correct_answer: string; explanation?: string }> };
  const questions = data.questions || [];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">{data.title || 'Quiz'}</h3>
      <p className="text-slate-400">{questions.length} questions</p>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {questions.map((q, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <p className="font-medium text-white mb-3">
              <span className="text-purple-400">Q{idx + 1}.</span> {q.question}
            </p>
            {q.options && (
              <div className="space-y-2 mb-3">
                {q.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      opt === q.correct_answer
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-700/50 text-slate-300'
                    }`}
                  >
                    {opt === q.correct_answer && <CheckCircle size={14} className="inline mr-2" />}
                    {opt}
                  </div>
                ))}
              </div>
            )}
            {q.explanation && (
              <p className="text-sm text-slate-500 mt-2">💡 {q.explanation}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Tutorial Preview
function TutorialPreview({ content }: { content: Record<string, unknown> }) {
  const data = content as { title?: string; description?: string; sections?: Array<{ title: string; content: string; code_example?: string }> };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">{data.title || 'Tutorial'}</h3>
      {data.description && <p className="text-slate-400">{data.description}</p>}
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {data.sections?.map((section, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <h4 className="font-semibold text-white mb-3">{section.title}</h4>
            <p className="text-slate-300 mb-3">{section.content}</p>
            {section.code_example && (
              <pre className="p-4 bg-slate-900 rounded-lg text-sm text-emerald-400 overflow-x-auto">
                {section.code_example}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Flashcards Preview
function FlashcardsPreview({ content }: { content: Record<string, unknown> }) {
  const [flipped, setFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const data = content as { title?: string; cards?: Array<{ front: string; back: string }> };
  const cards = data.cards || [];

  if (cards.length === 0) {
    return <div className="text-center py-12 text-slate-500">No flashcards generated</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">{data.title || 'Flashcards'}</h3>
      <p className="text-slate-400">{cards.length} cards</p>

      <div
        onClick={() => setFlipped(!flipped)}
        className="h-48 cursor-pointer perspective-1000"
      >
        <div className={`relative w-full h-full transition-transform duration-300 ${flipped ? 'rotate-y-180' : ''}`}>
          <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 flex items-center justify-center border border-slate-700/50 ${flipped ? 'invisible' : ''}`}>
            <p className="text-lg text-white text-center">{cards[currentCard].front}</p>
          </div>
          <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 flex items-center justify-center border border-purple-500/30 ${!flipped ? 'invisible' : ''}`}>
            <p className="text-lg text-white text-center">{cards[currentCard].back}</p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">Click to flip • Card {currentCard + 1}/{cards.length}</p>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => { setCurrentCard(Math.max(0, currentCard - 1)); setFlipped(false); }}
          disabled={currentCard === 0}
          className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => { setCurrentCard(Math.min(cards.length - 1, currentCard + 1)); setFlipped(false); }}
          disabled={currentCard === cards.length - 1}
          className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Assignment Preview
function AssignmentPreview({ content }: { content: Record<string, unknown> }) {
  const data = content as { title?: string; description?: string; objectives?: string[]; requirements?: string[]; rubric?: Array<{ criteria: string; points: number }> };

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto">
      <h3 className="text-xl font-bold text-white">{data.title || 'Assignment'}</h3>
      {data.description && <p className="text-slate-400">{data.description}</p>}

      {data.objectives && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="font-semibold text-white mb-3">Objectives</h4>
          <ul className="space-y-2">
            {data.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300">
                <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.rubric && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="font-semibold text-white mb-3">Grading Rubric</h4>
          <div className="space-y-2">
            {data.rubric.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-300">{item.criteria}</span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">{item.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Challenge Preview
function ChallengePreview({ content }: { content: Record<string, unknown> }) {
  const data = content as { title?: string; difficulty?: string; problem_statement?: string; hints?: string[] };

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto">
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-bold text-white">{data.title || 'Challenge'}</h3>
        {data.difficulty && (
          <span className={`px-3 py-1 rounded-lg text-sm ${
            data.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
            data.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {data.difficulty}
          </span>
        )}
      </div>

      {data.problem_statement && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="font-semibold text-white mb-3">Problem Statement</h4>
          <p className="text-slate-300 whitespace-pre-wrap">{data.problem_statement}</p>
        </div>
      )}

      {data.hints && (
        <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/30">
          <h4 className="font-semibold text-amber-400 mb-3">💡 Hints</h4>
          <ul className="space-y-2">
            {data.hints.map((hint, idx) => (
              <li key={idx} className="text-slate-300">• {hint}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Interview Prep Preview
function InterviewPrepPreview({ content }: { content: Record<string, unknown> }) {
  const data = content as { title?: string; questions?: Array<{ question: string; sample_answer: string; difficulty?: string }> };

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto">
      <h3 className="text-xl font-bold text-white">{data.title || 'Interview Prep'}</h3>
      <p className="text-slate-400">{data.questions?.length || 0} questions</p>

      <div className="space-y-4">
        {data.questions?.slice(0, 5).map((q, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <p className="font-medium text-white mb-3">{q.question}</p>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <p className="text-sm text-slate-400">{q.sample_answer}</p>
            </div>
          </div>
        ))}
        {(data.questions?.length || 0) > 5 && (
          <p className="text-center text-slate-500">+ {(data.questions?.length || 0) - 5} more questions</p>
        )}
      </div>
    </div>
  );
}

// Runbook Preview
function RunbookPreview({ content }: { content: Record<string, unknown> }) {
  const data = content as { title?: string; steps?: Array<{ title: string; description: string; command?: string }> };

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto">
      <h3 className="text-xl font-bold text-white">{data.title || 'Runbook'}</h3>

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
              <pre className="p-3 bg-slate-900 rounded-lg text-sm text-emerald-400 overflow-x-auto">
                $ {step.command}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Generic Preview (fallback)
function GenericPreview({ content }: { content: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <p className="text-slate-400">Content preview:</p>
      <pre className="p-4 bg-slate-800/50 rounded-xl text-sm text-slate-300 overflow-auto max-h-[400px]">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}

