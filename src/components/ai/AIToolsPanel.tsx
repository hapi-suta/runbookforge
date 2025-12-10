'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, BookOpen, HelpCircle, Layers, ClipboardList, Wand2, Languages,
  Video, X, Loader2, ChevronRight, Copy, Check, Download, FileText
} from 'lucide-react';

interface AIToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onContentGenerated?: (content: unknown, type: string) => void;
  initialTopic?: string;
}

type ToolId = 'course_outline' | 'quiz_from_content' | 'flashcards' | 'rubric' | 'improve_content' | 'speaker_notes' | 'translate' | 'video_script';

const TOOLS = [
  { id: 'course_outline' as ToolId, name: 'Course Outline', icon: BookOpen, description: 'Generate full course structure', color: 'from-blue-500 to-indigo-500' },
  { id: 'quiz_from_content' as ToolId, name: 'Quiz Generator', icon: HelpCircle, description: 'Create quizzes from content', color: 'from-purple-500 to-pink-500' },
  { id: 'flashcards' as ToolId, name: 'Flashcards', icon: Layers, description: 'Turn lessons into flashcards', color: 'from-amber-500 to-orange-500' },
  { id: 'rubric' as ToolId, name: 'Rubric Generator', icon: ClipboardList, description: 'Create grading rubrics', color: 'from-emerald-500 to-green-500' },
  { id: 'improve_content' as ToolId, name: 'Content Improver', icon: Wand2, description: 'Make content clearer', color: 'from-rose-500 to-red-500' },
  { id: 'speaker_notes' as ToolId, name: 'Speaker Notes', icon: FileText, description: 'Generate presenter notes', color: 'from-cyan-500 to-blue-500' },
  { id: 'translate' as ToolId, name: 'Translate', icon: Languages, description: 'Translate to other languages', color: 'from-violet-500 to-purple-500' },
  { id: 'video_script' as ToolId, name: 'Video Script', icon: Video, description: 'Generate video scripts', color: 'from-pink-500 to-rose-500' },
];

export default function AIToolsPanel({ isOpen, onClose, onContentGenerated, initialTopic = '' }: AIToolsPanelProps) {
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [copied, setCopied] = useState(false);

  // Form states for different tools
  const [topic, setTopic] = useState(initialTopic);
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('intermediate');
  const [duration, setDuration] = useState('4 weeks');
  const [questionCount, setQuestionCount] = useState(10);
  const [flashcardCount, setFlashcardCount] = useState(20);
  const [maxPoints, setMaxPoints] = useState(100);
  const [criteria, setCriteria] = useState(4);
  const [instruction, setInstruction] = useState('make it clearer and add examples');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [videoDuration, setVideoDuration] = useState('10 minutes');

  const handleGenerate = async () => {
    if (!selectedTool) return;
    setIsGenerating(true);
    setResult(null);

    try {
      let params: Record<string, unknown> = { action: selectedTool };

      switch (selectedTool) {
        case 'course_outline':
          params = { ...params, topic, targetAudience, duration };
          break;
        case 'quiz_from_content':
          params = { ...params, content, questionCount, difficulty: targetAudience };
          break;
        case 'flashcards':
          params = { ...params, topic, content, count: flashcardCount };
          break;
        case 'rubric':
          params = { ...params, assignment: topic, maxPoints, criteria };
          break;
        case 'improve_content':
          params = { ...params, content, instruction };
          break;
        case 'speaker_notes':
          params = { ...params, slides: JSON.parse(content || '[]') };
          break;
        case 'translate':
          params = { ...params, content, targetLanguage };
          break;
        case 'video_script':
          params = { ...params, topic, duration: videoDuration };
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
        if (onContentGenerated) {
          onContentGenerated(data.result, selectedTool);
        }
      } else {
        setResult({ error: data.error || 'Generation failed' });
      }
    } catch (e) {
      console.error(e);
      setResult({ error: 'Failed to generate' });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = () => {
    const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTool}-${Date.now()}.json`;
    a.click();
  };

  const renderToolForm = () => {
    switch (selectedTool) {
      case 'course_outline':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Course Topic *</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., PostgreSQL Database Administration"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="1 week">1 Week</option>
                  <option value="2 weeks">2 Weeks</option>
                  <option value="4 weeks">4 Weeks</option>
                  <option value="8 weeks">8 Weeks</option>
                  <option value="12 weeks">12 Weeks</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'quiz_from_content':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Content to Quiz *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the content you want to create a quiz from..."
                rows={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Questions</label>
                <input
                  type="number"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  min={5}
                  max={30}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'flashcards':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Topic *</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., SQL Commands"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Source Content (optional)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste content to base flashcards on..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Number of Cards: {flashcardCount}</label>
              <input
                type="range"
                value={flashcardCount}
                onChange={(e) => setFlashcardCount(parseInt(e.target.value))}
                min={10}
                max={50}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'rubric':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Assignment Description *</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Describe the assignment..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Total Points</label>
                <input
                  type="number"
                  value={maxPoints}
                  onChange={(e) => setMaxPoints(parseInt(e.target.value))}
                  min={10}
                  max={1000}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Criteria Count</label>
                <input
                  type="number"
                  value={criteria}
                  onChange={(e) => setCriteria(parseInt(e.target.value))}
                  min={2}
                  max={10}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>
          </div>
        );

      case 'improve_content':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Content to Improve *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste content to improve..."
                rows={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Instruction</label>
              <select
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
              >
                <option value="make it clearer and add examples">Make clearer with examples</option>
                <option value="simplify for beginners">Simplify for beginners</option>
                <option value="make it more technical and detailed">More technical detail</option>
                <option value="fix grammar and improve flow">Fix grammar & flow</option>
                <option value="make it shorter and more concise">Make more concise</option>
                <option value="add more structure with headers and bullets">Add structure</option>
              </select>
            </div>
          </div>
        );

      case 'speaker_notes':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Slides (JSON) *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder='[{"title": "Slide 1", "content": "Bullet points..."}, ...]'
                rows={8}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none font-mono text-sm"
              />
            </div>
            <p className="text-xs text-slate-500">Paste your slides as JSON array. Each slide should have title and content.</p>
          </div>
        );

      case 'translate':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Content to Translate *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste content to translate..."
                rows={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Language</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
              >
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Chinese">Chinese (Simplified)</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
                <option value="Arabic">Arabic</option>
                <option value="Hindi">Hindi</option>
                <option value="Russian">Russian</option>
              </select>
            </div>
          </div>
        );

      case 'video_script':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Video Topic *</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Introduction to Database Indexing"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
              <select
                value={videoDuration}
                onChange={(e) => setVideoDuration(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
              >
                <option value="5 minutes">5 minutes</option>
                <option value="10 minutes">10 minutes</option>
                <option value="15 minutes">15 minutes</option>
                <option value="20 minutes">20 minutes</option>
                <option value="30 minutes">30 minutes</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">AI Tools for Instructors</h2>
                  <p className="text-sm text-slate-400">Generate content with AI assistance</p>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex h-[calc(90vh-80px)]">
              {/* Tool Selection */}
              <div className="w-64 border-r border-slate-800 p-4 overflow-y-auto">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Select Tool</p>
                <div className="space-y-2">
                  {TOOLS.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => { setSelectedTool(tool.id); setResult(null); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                        selectedTool === tool.id
                          ? 'bg-slate-800 border border-slate-700'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                        <tool.icon size={16} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{tool.name}</p>
                        <p className="text-xs text-slate-500 truncate">{tool.description}</p>
                      </div>
                      {selectedTool === tool.id && <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tool Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {selectedTool ? (
                  <>
                    <div className="flex-1 overflow-y-auto p-6">
                      {!result ? (
                        <>
                          <h3 className="text-lg font-semibold text-white mb-4">
                            {TOOLS.find(t => t.id === selectedTool)?.name}
                          </h3>
                          {renderToolForm()}
                        </>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Generated Content</h3>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-sm text-slate-300 hover:text-white"
                              >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied!' : 'Copy'}
                              </button>
                              <button
                                onClick={downloadResult}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-sm text-slate-300 hover:text-white"
                              >
                                <Download size={14} />
                                Download
                              </button>
                            </div>
                          </div>
                          <pre className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 overflow-x-auto text-sm text-slate-300 whitespace-pre-wrap">
                            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                      {result ? (
                        <button
                          onClick={() => setResult(null)}
                          className="px-4 py-2 text-slate-400 hover:text-white"
                        >
                          ← Generate New
                        </button>
                      ) : (
                        <div />
                      )}
                      {!result && (
                        <motion.button
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl disabled:opacity-50"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles size={18} />
                              Generate
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles size={48} className="mx-auto text-slate-600 mb-4" />
                      <p className="text-slate-400">Select a tool from the left to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

