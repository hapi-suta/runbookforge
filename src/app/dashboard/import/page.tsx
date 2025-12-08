'use client'

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Loader2, 
  FileText, 
  Code, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Table,
  ListChecks,
  Save,
  RefreshCw,
  X,
  Tag,
  Wand2,
  Upload,
  PenTool,
  ChevronDown,
  ChevronUp,
  Trash2,
  GripVertical,
  Plus,
  Presentation,
  Download,
  Folder,
  FolderPlus
} from "lucide-react";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-20 bg-slate-800 rounded-lg animate-pulse" />
});

interface Block {
  id: string;
  type: string;
  title?: string;
  content: string;
  language?: string;
  tags?: string[];
  tableData?: { headers: string[]; rows: string[][] };
  checklist?: { id: string; text: string; checked: boolean }[];
}

interface Section {
  id: string;
  title: string;
  blocks: Block[];
  isCollapsed?: boolean;
}

interface RunbookData {
  title: string;
  description: string;
  sections: Section[];
}

interface Slide {
  title: string;
  layout: string;
  content: string;
  speakerNotes: string;
  visualSuggestion?: string;
}

interface PPTData {
  title: string;
  style: string;
  slideCount: number;
  slides: Slide[];
  pptxBase64?: string;
  author?: string;
  organization?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

const blockIcons: Record<string, any> = {
  step: CheckCircle,
  code: Code,
  warning: AlertTriangle,
  info: Info,
  note: FileText,
  header: FileText,
  table: Table,
  checklist: ListChecks,
};

const blockColors: Record<string, string> = {
  step: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  code: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
  warning: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  info: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  note: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  header: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  table: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  checklist: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
};

const exampleTopics = [
  "PostgreSQL High Availability with Patroni",
  "Kubernetes Pod Debugging",
  "Docker Container Deployment",
  "AWS EC2 Instance Setup",
  "Nginx Load Balancer Configuration",
  "MySQL Backup and Recovery",
];

const pptStyles = [
  { id: 'workshop', name: 'Workshop', desc: 'Hands-on labs and exercises' },
  { id: 'training', name: 'Training', desc: 'Comprehensive learning modules' },
  { id: 'overview', name: 'Overview', desc: 'High-level executive summary' },
  { id: 'technical', name: 'Technical', desc: 'Deep dive with code examples' },
];

export default function AIPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as 'generate' | 'import' | 'ppt' | null;
  const [activeTab, setActiveTab] = useState<'generate' | 'import' | 'ppt'>(initialTab || 'generate');
  
  // Update tab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab') as 'generate' | 'import' | 'ppt' | null;
    if (tab && ['generate', 'import', 'ppt'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // Generate state
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  
  // Import state
  const [importText, setImportText] = useState('');
  
  // PPT state
  const [pptTopic, setPptTopic] = useState('');
  const [pptStyle, setPptStyle] = useState('workshop');
  const [pptSlideCount, setPptSlideCount] = useState(15);
  const [pptContext, setPptContext] = useState('');
  const [pptResult, setPptResult] = useState<PPTData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Shared state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunbookData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?type=document');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          type: 'document',
          color: 'violet'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCategories([...categories, data]);
        setSelectedCategory(data.id);
        setNewCategoryName('');
        setShowNewCategory(false);
      } else {
        alert(data.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create folder. Please try again.');
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, details }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate runbook');
      }

      data.sections = data.sections.map((s: Section) => ({ ...s, isCollapsed: false }));
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate runbook');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      setError('Please enter some text to convert');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: importText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process text');
      }

      data.sections = data.sections.map((s: Section) => ({ ...s, isCollapsed: false }));
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process text');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGeneratePPT = async () => {
    if (!pptTopic.trim()) {
      setError('Please enter a topic for the presentation');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setPptResult(null);

    try {
      const response = await fetch('/api/ai/ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: pptTopic,
          style: pptStyle,
          slideCount: pptSlideCount,
          additionalContext: pptContext,
          generateFile: true,
          organization: 'RunbookForge'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate presentation');
      }

      setPptResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate presentation');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download PPTX file
  const handleDownloadPPTX = () => {
    if (!pptResult?.pptxBase64) return;
    
    // Convert base64 to blob
    const byteCharacters = atob(pptResult.pptxBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pptResult.title.replace(/[^a-z0-9]/gi, '_')}.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSavePPT = async () => {
    if (!pptResult) return;

    setIsSaving(true);
    setError(null);

    try {
      // Save document record to database
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pptResult.title,
          description: `${pptResult.style} presentation with ${pptResult.slideCount} slides`,
          file_type: 'pptx',
          slide_count: pptResult.slideCount,
          category_id: selectedCategory || null,
          metadata: {
            style: pptResult.style,
            slides: pptResult.slides
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save presentation');
      }

      router.push('/dashboard/documents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save presentation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/runbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.title,
          description: result.description,
          sections: result.sections,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save runbook');
      }

      const data = await response.json();
      router.push(`/dashboard/runbooks/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save runbook');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setPptResult(null);
    setError(null);
    setIsEditing(false);
  };

  // Editing functions
  const updateTitle = (title: string) => {
    if (result) setResult({ ...result, title });
  };

  const updateDescription = (description: string) => {
    if (result) setResult({ ...result, description });
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    if (!result) return;
    setResult({
      ...result,
      sections: result.sections.map(s => 
        s.id === sectionId ? { ...s, ...updates } : s
      )
    });
  };

  const updateBlock = (sectionId: string, blockId: string, updates: Partial<Block>) => {
    if (!result) return;
    setResult({
      ...result,
      sections: result.sections.map(s => 
        s.id === sectionId 
          ? { ...s, blocks: s.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b) }
          : s
      )
    });
  };

  const deleteSection = (sectionId: string) => {
    if (!result || result.sections.length <= 1) return;
    setResult({
      ...result,
      sections: result.sections.filter(s => s.id !== sectionId)
    });
  };

  const deleteBlock = (sectionId: string, blockId: string) => {
    if (!result) return;
    setResult({
      ...result,
      sections: result.sections.map(s => 
        s.id === sectionId 
          ? { ...s, blocks: s.blocks.filter(b => b.id !== blockId) }
          : s
      )
    });
  };

  const countStats = () => {
    if (!result) return { sections: 0, steps: 0, codeBlocks: 0 };
    let steps = 0, codeBlocks = 0;
    result.sections.forEach(s => {
      s.blocks.forEach(b => {
        if (b.type === 'step') steps++;
        if (b.type === 'code') codeBlocks++;
      });
    });
    return { sections: result.sections.length, steps, codeBlocks };
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-white mb-1">AI Builder</h1>
        <p className="text-slate-400">Generate runbooks or presentations using AI</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 p-1 bg-slate-900 rounded-xl mb-6"
      >
        <button
          onClick={() => { setActiveTab('generate'); handleReset(); }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'generate'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Wand2 size={18} />
          Generate Runbook
        </button>
        <button
          onClick={() => { setActiveTab('import'); handleReset(); }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'import'
              ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Upload size={18} />
          Import Text
        </button>
        <button
          onClick={() => { setActiveTab('ppt'); handleReset(); }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'ppt'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Presentation size={18} />
          Generate PPT
        </button>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertTriangle size={20} className="text-red-400" />
            <span className="text-red-400">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Tab */}
      {activeTab === 'generate' && !result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              What runbook do you want to create?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., PostgreSQL High Availability Setup with Patroni"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
            
            <div className="mt-3 flex flex-wrap gap-2">
              {exampleTopics.slice(0, 3).map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-slate-300 mt-6 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Any specific requirements, tools, or context..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
            />

            <button
              onClick={handleGenerate}
              disabled={isProcessing || !topic.trim()}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Runbook
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && !result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Paste your existing documentation
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your Confluence page, Google Doc, plain text procedures, or any technical documentation here..."
              rows={12}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none font-mono text-sm"
            />

            <button
              onClick={handleImport}
              disabled={isProcessing || !importText.trim()}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg text-white font-semibold hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Convert to Runbook
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* PPT Tab */}
      {activeTab === 'ppt' && !pptResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Presentation Topic
            </label>
            <input
              type="text"
              value={pptTopic}
              onChange={(e) => setPptTopic(e.target.value)}
              placeholder="e.g., PostgreSQL High Availability Workshop with Patroni"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />

            <label className="block text-sm font-medium text-slate-300 mt-6 mb-3">
              Presentation Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              {pptStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setPptStyle(style.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    pptStyle === style.id
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="font-medium text-white">{style.name}</div>
                  <div className="text-xs mt-1">{style.desc}</div>
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-slate-300 mt-6 mb-2">
              Number of Slides: {pptSlideCount}
            </label>
            <input
              type="range"
              min="8"
              max="100"
              value={pptSlideCount}
              onChange={(e) => setPptSlideCount(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>8 slides</span>
              <span>100 slides</span>
            </div>

            <label className="block text-sm font-medium text-slate-300 mt-6 mb-2">
              Additional Context (optional)
            </label>
            <textarea
              value={pptContext}
              onChange={(e) => setPptContext(e.target.value)}
              placeholder="Any specific topics to cover, audience level, or requirements..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />

            <button
              onClick={handleGeneratePPT}
              disabled={isProcessing || !pptTopic.trim()}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating Presentation...
                </>
              ) : (
                <>
                  <Presentation size={20} />
                  Generate Presentation
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* PPT Result */}
      {pptResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Stats Bar */}
          <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Presentation size={20} className="text-amber-400" />
              <div>
                <p className="text-amber-400 font-medium">Presentation Generated!</p>
                <p className="text-amber-400/70 text-sm">
                  {pptResult.slideCount} slides • {pptResult.style} style
                </p>
              </div>
            </div>
          </div>

          {/* Slides Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-2xl font-bold text-white mb-2">{pptResult.title}</h2>
              <p className="text-slate-400">{pptResult.style.charAt(0).toUpperCase() + pptResult.style.slice(1)} Presentation</p>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {pptResult.slides.map((slide, index) => (
                <div key={index} className="border-b border-slate-800 last:border-0">
                  <div className="flex items-start gap-4 p-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white">{slide.title}</h3>
                        <span className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400">{slide.layout}</span>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">{slide.content}</p>
                      {slide.speakerNotes && (
                        <p className="text-xs text-slate-500 mt-2 italic">Speaker notes: {slide.speakerNotes.substring(0, 100)}...</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Options */}
            <div className="p-6 border-t border-slate-800 space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Save to Folder</label>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">No folder (root)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowNewCategory(!showNewCategory)}
                    className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-600"
                  >
                    <FolderPlus size={20} />
                  </button>
                </div>
              </div>

              {/* New Category Input */}
              <AnimatePresence>
                {showNewCategory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New folder name..."
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={createCategory}
                      disabled={!newCategoryName.trim()}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
                    >
                      Create
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Download PPTX Button */}
                {pptResult.pptxBase64 && (
                  <button
                    onClick={handleDownloadPPTX}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 rounded-lg text-white font-semibold hover:bg-blue-600 transition-all"
                  >
                    <Download size={18} />
                    Download PPTX
                  </button>
                )}
                <button
                  onClick={handleSavePPT}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save to Documents
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-3 bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Runbook Result Preview / Editor */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Stats Bar */}
          <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-400" />
              <div>
                <p className="text-emerald-400 font-medium">Runbook Generated!</p>
                <p className="text-emerald-400/70 text-sm">
                  {countStats().sections} sections • {countStats().steps} steps • {countStats().codeBlocks} code blocks
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isEditing 
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <PenTool size={14} />
              {isEditing ? 'Editing Mode' : 'Edit Before Saving'}
            </button>
          </div>

          {/* Editable Content */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {/* Title & Description */}
            <div className="p-6 border-b border-slate-800">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={result.title}
                    onChange={(e) => updateTitle(e.target.value)}
                    className="w-full text-2xl font-bold bg-transparent text-white focus:outline-none border-b border-slate-700 pb-2"
                  />
                  <textarea
                    value={result.description}
                    onChange={(e) => updateDescription(e.target.value)}
                    className="w-full bg-transparent text-slate-400 focus:outline-none resize-none"
                    rows={2}
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">{result.title}</h2>
                  <p className="text-slate-400">{result.description}</p>
                </>
              )}
            </div>

            {/* Sections */}
            <div className="max-h-[500px] overflow-y-auto">
              {result.sections.map((section, sectionIndex) => (
                <div key={section.id} className="border-b border-slate-800 last:border-0">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 px-6 py-3 bg-slate-800/50">
                    <button
                      onClick={() => updateSection(section.id, { isCollapsed: !section.isCollapsed })}
                      className="text-slate-400 hover:text-white"
                    >
                      {section.isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                    {isEditing ? (
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="flex-1 bg-transparent text-white font-medium focus:outline-none"
                      />
                    ) : (
                      <span className="flex-1 text-white font-medium">{section.title}</span>
                    )}
                    <span className="text-xs text-slate-500">{section.blocks.length} blocks</span>
                    {isEditing && result.sections.length > 1 && (
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Blocks */}
                  <AnimatePresence>
                    {!section.isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 py-4 space-y-3"
                      >
                        {section.blocks.map((block) => {
                          const Icon = blockIcons[block.type] || FileText;
                          const colorClass = blockColors[block.type] || blockColors.note;
                          
                          return (
                            <div key={block.id} className={`p-3 rounded-lg border ${colorClass}`}>
                              <div className="flex items-start gap-2">
                                <Icon size={14} className="mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium capitalize">{block.type}</span>
                                    {block.tags?.map(tag => (
                                      <span key={tag} className="px-1.5 py-0.5 bg-slate-800/50 rounded text-[10px]">{tag}</span>
                                    ))}
                                  </div>
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      {block.title !== undefined && (
                                        <input
                                          type="text"
                                          value={block.title || ''}
                                          onChange={(e) => updateBlock(section.id, block.id, { title: e.target.value })}
                                          placeholder="Title..."
                                          className="w-full bg-slate-800/50 px-2 py-1 rounded text-sm text-white focus:outline-none"
                                        />
                                      )}
                                      {block.type === 'code' ? (
                                        <textarea
                                          value={block.content}
                                          onChange={(e) => updateBlock(section.id, block.id, { content: e.target.value })}
                                          className="w-full bg-slate-900 px-2 py-1 rounded text-xs text-emerald-400 font-mono focus:outline-none resize-none"
                                          rows={4}
                                        />
                                      ) : (
                                        <textarea
                                          value={block.content}
                                          onChange={(e) => updateBlock(section.id, block.id, { content: e.target.value })}
                                          className="w-full bg-slate-800/50 px-2 py-1 rounded text-sm text-slate-300 focus:outline-none resize-none"
                                          rows={2}
                                        />
                                      )}
                                    </div>
                                  ) : (
                                    <>
                                      {block.title && <p className="text-sm font-medium text-white">{block.title}</p>}
                                      <p className={`text-xs ${block.type === 'code' ? 'font-mono text-emerald-400' : ''} line-clamp-3`}>
                                        {block.content}
                                      </p>
                                    </>
                                  )}
                                </div>
                                {isEditing && (
                                  <button
                                    onClick={() => deleteBlock(section.id, block.id)}
                                    className="text-slate-500 hover:text-red-400"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Runbook
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
