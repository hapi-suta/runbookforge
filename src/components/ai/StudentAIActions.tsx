'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Lightbulb, HelpCircle, FileText, BookOpen, Code, Target,
  X, Loader2, ChevronRight, Copy, Check, RotateCcw
} from 'lucide-react';

interface StudentAIActionsProps {
  contentTitle?: string;
  contentText?: string;
  topic?: string;
  onClose?: () => void;
}

type ActionType = 'explain_simple' | 'quiz_me' | 'summarize' | 'study_guide' | 'explain_code' | 'flashcards';

const ACTIONS = [
  { id: 'explain_simple' as ActionType, name: 'Explain Simply', icon: Lightbulb, description: 'Explain like I\'m a beginner', color: 'from-amber-500 to-orange-500' },
  { id: 'quiz_me' as ActionType, name: 'Quiz Me', icon: HelpCircle, description: 'Test my understanding', color: 'from-purple-500 to-pink-500' },
  { id: 'summarize' as ActionType, name: 'Summarize', icon: FileText, description: 'Get key points', color: 'from-blue-500 to-indigo-500' },
  { id: 'study_guide' as ActionType, name: 'Study Guide', icon: BookOpen, description: 'Create a study guide', color: 'from-emerald-500 to-green-500' },
  { id: 'explain_code' as ActionType, name: 'Explain Code', icon: Code, description: 'Explain code snippets', color: 'from-cyan-500 to-blue-500' },
  { id: 'flashcards' as ActionType, name: 'Flashcards', icon: Target, description: 'Generate flashcards', color: 'from-rose-500 to-red-500' },
];

export default function StudentAIActions({ contentTitle, contentText, topic, onClose }: StudentAIActionsProps) {
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [copied, setCopied] = useState(false);

  // Quiz Me state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Additional inputs
  const [customTopic, setCustomTopic] = useState(topic || contentTitle || '');
  const [customContent, setCustomContent] = useState(contentText || '');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [codeToExplain, setCodeToExplain] = useState('');

  const handleAction = async () => {
    if (!selectedAction) return;
    setIsLoading(true);
    setResult(null);
    setShowQuizResults(false);
    setQuizAnswers({});

    try {
      let params: Record<string, unknown> = { action: selectedAction };

      switch (selectedAction) {
        case 'explain_simple':
          params = { ...params, concept: customTopic, level: difficulty === 'beginner' ? 'eli5' : 'beginner' };
          break;
        case 'quiz_me':
          params = { ...params, topic: customTopic, difficulty, count: 5 };
          break;
        case 'summarize':
          params = { ...params, content: customContent || `Topic: ${customTopic}`, length: 'medium' };
          break;
        case 'study_guide':
          params = { ...params, topic: customTopic, content: customContent };
          break;
        case 'explain_code':
          params = { ...params, code: codeToExplain };
          break;
        case 'flashcards':
          params = { ...params, topic: customTopic, content: customContent, count: 10 };
          break;
      }

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.result);
      } else {
        setResult({ error: data.error || 'Something went wrong' });
      }
    } catch (e) {
      console.error(e);
      setResult({ error: 'Failed to process request' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderActionInput = () => {
    switch (selectedAction) {
      case 'explain_simple':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">What do you want explained?</label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g., Database indexing, REST APIs, etc."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Explanation level</label>
              <div className="flex gap-2">
                {['eli5', 'beginner'].map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      difficulty === level
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {level === 'eli5' ? 'Like I\'m 5' : 'Beginner'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'quiz_me':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Topic to quiz on</label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g., PostgreSQL basics"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
              <div className="flex gap-2">
                {['beginner', 'intermediate', 'advanced'].map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                      difficulty === level
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'summarize':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Content to summarize</label>
            <textarea
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              placeholder="Paste the content you want summarized..."
              rows={6}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none"
            />
          </div>
        );

      case 'study_guide':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g., Chapter 3: Database Security"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Content (optional)</label>
              <textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Paste lesson content to base the study guide on..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none"
              />
            </div>
          </div>
        );

      case 'explain_code':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Code to explain</label>
            <textarea
              value={codeToExplain}
              onChange={(e) => setCodeToExplain(e.target.value)}
              placeholder="Paste code here..."
              rows={8}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none font-mono text-sm"
            />
          </div>
        );

      case 'flashcards':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g., SQL Commands"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Source content (optional)</label>
              <textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Paste lesson content..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResult = () => {
    if (!result) return null;
    
    if (typeof result === 'object' && 'error' in (result as Record<string, unknown>)) {
      return (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {(result as { error: string }).error}
        </div>
      );
    }

    // Quiz Me result with interactive questions
    if (selectedAction === 'quiz_me' && typeof result === 'object' && 'questions' in (result as Record<string, unknown>)) {
      const quizData = result as { topic: string; questions: Array<{ question: string; type: string; options?: string[]; correct_answer: string; explanation: string; hint?: string }> };
      
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-white">Quiz: {quizData.topic}</h3>
          
          {quizData.questions.map((q, idx) => {
            const isAnswered = quizAnswers[idx] !== undefined;
            const isCorrect = isAnswered && quizAnswers[idx] === q.correct_answer;
            
            return (
              <div key={idx} className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-sm text-slate-300 mb-3">
                  <span className="text-purple-400 font-medium">Q{idx + 1}.</span> {q.question}
                </p>
                
                {q.options && (
                  <div className="space-y-2 mb-3">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => !showQuizResults && setQuizAnswers(prev => ({ ...prev, [idx]: opt }))}
                        disabled={showQuizResults}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                          showQuizResults
                            ? opt === q.correct_answer
                              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                              : quizAnswers[idx] === opt
                                ? 'bg-red-500/20 border border-red-500/50 text-red-300'
                                : 'bg-slate-700/50 text-slate-400'
                            : quizAnswers[idx] === opt
                              ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                
                {showQuizResults && (
                  <div className={`p-3 rounded-lg text-sm ${isCorrect ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                    {isCorrect ? '✓ Correct!' : `✗ The correct answer is: ${q.correct_answer}`}
                    <p className="mt-1 text-slate-400">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
          
          {!showQuizResults && (
            <motion.button
              onClick={() => setShowQuizResults(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl"
            >
              Check Answers
            </motion.button>
          )}
          
          {showQuizResults && (
            <div className="text-center">
              <p className="text-lg font-semibold text-white mb-2">
                Score: {Object.entries(quizAnswers).filter(([idx, ans]) => 
                  quizData.questions[parseInt(idx)]?.correct_answer === ans
                ).length}/{quizData.questions.length}
              </p>
              <button
                onClick={() => { setResult(null); setQuizAnswers({}); setShowQuizResults(false); }}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Try another quiz
              </button>
            </div>
          )}
        </div>
      );
    }

    // Flashcards result
    if (selectedAction === 'flashcards' && typeof result === 'object' && 'cards' in (result as Record<string, unknown>)) {
      const flashcardsData = result as { title: string; cards: Array<{ front: string; back: string; category?: string; difficulty?: string }> };
      
      return <FlashcardViewer cards={flashcardsData.cards} title={flashcardsData.title} />;
    }

    // Study Guide result
    if (selectedAction === 'study_guide' && typeof result === 'object' && 'key_concepts' in (result as Record<string, unknown>)) {
      const guideData = result as { 
        title: string; 
        summary: string; 
        key_concepts: Array<{ concept: string; definition: string; importance: string; example: string }>;
        practice_questions?: Array<{ question: string; answer: string }>;
        exam_tips?: string[];
      };
      
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-white text-lg">{guideData.title}</h3>
          <p className="text-slate-400">{guideData.summary}</p>
          
          <div className="space-y-3">
            <h4 className="font-medium text-emerald-400">Key Concepts</h4>
            {guideData.key_concepts.map((concept, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-xl p-4">
                <p className="font-medium text-white">{concept.concept}</p>
                <p className="text-sm text-slate-300 mt-1">{concept.definition}</p>
                {concept.example && (
                  <p className="text-sm text-slate-500 mt-2 italic">Example: {concept.example}</p>
                )}
              </div>
            ))}
          </div>
          
          {guideData.exam_tips && guideData.exam_tips.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <h4 className="font-medium text-amber-400 mb-2">💡 Exam Tips</h4>
              <ul className="space-y-1">
                {guideData.exam_tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-slate-300">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    // Text results (explain, summarize, code explanation)
    if (typeof result === 'string') {
      return (
        <div className="prose prose-invert max-w-none">
          <div className="bg-slate-800/50 rounded-xl p-4 whitespace-pre-wrap text-slate-300 text-sm">
            {result}
          </div>
        </div>
      );
    }

    // Default JSON display
    return (
      <pre className="bg-slate-800/50 rounded-xl p-4 overflow-x-auto text-sm text-slate-300 whitespace-pre-wrap">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Learning Tools</h3>
            <p className="text-xs text-slate-400">Enhance your learning with AI</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {!selectedAction ? (
          // Action Selection
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ACTIONS.map(action => (
              <button
                key={action.id}
                onClick={() => setSelectedAction(action.id)}
                className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon size={20} className="text-white" />
                </div>
                <span className="text-sm font-medium text-white">{action.name}</span>
                <span className="text-xs text-slate-500 text-center">{action.description}</span>
              </button>
            ))}
          </div>
        ) : !result ? (
          // Action Input Form
          <div>
            <button
              onClick={() => setSelectedAction(null)}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4"
            >
              <ChevronRight size={16} className="rotate-180" />
              Back to tools
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              {(() => {
                const action = ACTIONS.find(a => a.id === selectedAction);
                if (!action) return null;
                return (
                  <>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                      <action.icon size={18} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-white">{action.name}</h3>
                  </>
                );
              })()}
            </div>

            {renderActionInput()}

            <motion.button
              onClick={handleAction}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate
                </>
              )}
            </motion.button>
          </div>
        ) : (
          // Results
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => { setResult(null); setSelectedAction(null); }}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
              >
                <RotateCcw size={14} />
                Try another
              </button>
              <button
                onClick={copyResult}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            {renderResult()}
          </div>
        )}
      </div>
    </div>
  );
}

// Flashcard Viewer Component
function FlashcardViewer({ cards, title }: { cards: Array<{ front: string; back: string; category?: string; difficulty?: string }>; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());

  const card = cards[currentIndex];
  
  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(prev => (prev + 1) % cards.length), 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length), 150);
  };

  const markKnown = () => {
    setKnownCards(prev => new Set(prev).add(currentIndex));
    nextCard();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">{title}</h3>
        <span className="text-sm text-slate-400">
          {currentIndex + 1}/{cards.length} • {knownCards.size} known
        </span>
      </div>

      {/* Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative h-48 cursor-pointer perspective-1000"
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-6 flex items-center justify-center backface-hidden ${isFlipped ? 'invisible' : ''}`}>
            <p className="text-lg text-white text-center">{card.front}</p>
          </div>
          
          {/* Back */}
          <div 
            className={`absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 flex items-center justify-center ${!isFlipped ? 'invisible' : ''}`}
            style={{ transform: 'rotateY(180deg)' }}
          >
            <p className="text-lg text-white text-center">{card.back}</p>
          </div>
        </motion.div>
      </div>

      <p className="text-center text-xs text-slate-500">Tap card to flip</p>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevCard}
          className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white"
        >
          Previous
        </button>
        
        <button
          onClick={markKnown}
          className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30"
        >
          ✓ Know it
        </button>
        
        <button
          onClick={nextCard}
          className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white"
        >
          Next
        </button>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
          style={{ width: `${(knownCards.size / cards.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

