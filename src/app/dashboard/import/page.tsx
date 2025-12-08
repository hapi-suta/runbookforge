'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Plus
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

export default function AIPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'generate' | 'import'>('generate');
  
  // Generate state
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  
  // Import state
  const [importText, setImportText] = useState('');
  
  // Shared state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunbookData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

      // Add isCollapsed to sections
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
    if (result) {
      setResult({
        ...result,
        sections: result.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
      });
    }
  };

  const deleteSection = (sectionId: string) => {
    if (result && result.sections.length > 1) {
      setResult({
        ...result,
        sections: result.sections.filter(s => s.id !== sectionId)
      });
    }
  };

  const updateBlock = (sectionId: string, blockId: string, updates: Partial<Block>) => {
    if (result) {
      setResult({
        ...result,
        sections: result.sections.map(s => 
          s.id === sectionId 
            ? { ...s, blocks: s.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b) }
            : s
        )
      });
    }
  };

  const deleteBlock = (sectionId: string, blockId: string) => {
    if (result) {
      setResult({
        ...result,
        sections: result.sections.map(s => 
          s.id === sectionId 
            ? { ...s, blocks: s.blocks.filter(b => b.id !== blockId) }
            : s
        )
      });
    }
  };

  const countStats = () => {
    if (!result) return { sections: 0, steps: 0, codeBlocks: 0 };
    let steps = 0, codeBlocks = 0;
    result.sections.forEach(section => {
      section.blocks.forEach(block => {
        if (block.type === 'step') steps++;
        if (block.type === 'code') codeBlocks++;
      });
    });
    return { sections: result.sections.length, steps, codeBlocks };
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Runbook Builder</h1>
            <p className="text-slate-400">Generate or import runbooks with AI assistance</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      {!result && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'generate'
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wand2 size={18} />
            Generate New
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'import'
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Upload size={18} />
            Import Text
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Input Section */}
      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {activeTab === 'generate' ? (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  What would you like a runbook for?
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., PostgreSQL High Availability with Patroni"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-lg placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  disabled={isProcessing}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Add any specific requirements, tech stack, or context..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  disabled={isProcessing}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs text-slate-500">Try:</span>
                {exampleTopics.slice(0, 4).map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setTopic(t)}
                    className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 hover:text-white hover:border-slate-600"
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isProcessing || !topic.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg text-white font-semibold hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating Runbook...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    Generate Runbook
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">Paste your text</label>
                  <span className="text-xs text-slate-500">{importText.length.toLocaleString()} / 50,000</span>
                </div>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste your documentation, notes, or procedures here..."
                  rows={12}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  disabled={isProcessing}
                />
              </div>

              <button
                onClick={handleImport}
                disabled={isProcessing || !importText.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg text-white font-semibold hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50"
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
          )}
        </motion.div>
      )}

      {/* Result Preview / Editor */}
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
