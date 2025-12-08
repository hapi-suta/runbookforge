'use client'

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Loader2, CheckCircle, AlertTriangle, Info, FileText,
  BookOpen, Play, ChevronDown, ChevronRight, Check, Copy, ExternalLink,
  ThumbsUp
} from "lucide-react";

interface Block {
  id: string;
  type: string;
  content: string;
  title?: string;
  language?: string;
  checklist?: { id: string; text: string; checked: boolean }[];
  tableData?: { headers: string[]; rows: string[][] };
}

interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

interface Runbook {
  id: string;
  title: string;
  description: string | null;
  sections: Section[];
}

export default function ViewRunbookPage() {
  const params = useParams();
  const [runbook, setRunbook] = useState<Runbook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRunbook = async () => {
      try {
        const response = await fetch(`/api/runbooks/${params.id}/public`);
        if (!response.ok) {
          if (response.status === 404) setError('Runbook not found');
          else if (response.status === 403) setError('This runbook is not public');
          else setError('Failed to load runbook');
          return;
        }
        const data = await response.json();
        setRunbook(data);
        // Expand all sections by default
        setExpandedSections(new Set(data.sections?.map((s: Section) => s.id) || []));
      } catch (e) {
        setError('Failed to load runbook');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params.id) fetchRunbook();
  }, [params.id]);

  const toggleSection = (id: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedSections(newSet);
  };

  const toggleStep = (id: string) => {
    const newSet = new Set(completedSteps);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCompletedSteps(newSet);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <Loader2 size={32} className="text-teal-400 animate-spin" />
      </div>
    );
  }

  if (error || !runbook) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={48} className="text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">{error || 'Runbook not found'}</h1>
          <Link href="/" className="text-teal-400 hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'text':
        return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} />;
      
      case 'code':
        return (
          <div className="relative group">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-2 rounded-t-lg border-b border-slate-700">
              <span className="text-xs text-slate-400">{block.language || 'bash'}</span>
              <button
                onClick={() => copyCode(block.content, block.id)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {copiedId === block.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
            <pre className="bg-slate-900 p-4 rounded-b-lg overflow-x-auto">
              <code className="text-sm text-slate-300">{block.content}</code>
            </pre>
          </div>
        );
      
      case 'warning':
        return (
          <div className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-amber-200">{block.content}</div>
          </div>
        );
      
      case 'info':
        return (
          <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <Info className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-blue-200">{block.content}</div>
          </div>
        );
      
      case 'success':
        return (
          <div className="flex gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <CheckCircle className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-emerald-200">{block.content}</div>
          </div>
        );
      
      case 'checklist':
        return (
          <div className="space-y-2">
            {block.checklist?.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleStep(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                  completedSteps.has(item.id)
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center ${
                  completedSteps.has(item.id) ? 'bg-emerald-500' : 'border-2 border-slate-600'
                }`}>
                  {completedSteps.has(item.id) && <Check size={14} className="text-white" />}
                </div>
                <span className={completedSteps.has(item.id) ? 'text-slate-400 line-through' : 'text-white'}>
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        );
      
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-800">
                  {block.tableData?.headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-sm font-semibold text-slate-300 border border-slate-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.tableData?.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-3 text-sm text-slate-300 border border-slate-700">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      default:
        return <div className="text-slate-400">{block.content}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
              <span>Back</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <BookOpen size={16} />
              <span>Runbook</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{runbook.title}</h1>
            {runbook.description && (
              <p className="text-slate-400">{runbook.description}</p>
            )}
          </div>

          {/* Progress */}
          {runbook.sections.length > 0 && (
            <div className="mb-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Progress</span>
                <span className="text-sm text-teal-400 font-medium">
                  {completedSteps.size} steps completed
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (completedSteps.size / Math.max(1, runbook.sections.reduce((acc, s) => acc + s.blocks.filter(b => b.type === 'checklist').reduce((a, b) => a + (b.checklist?.length || 0), 0), 0))) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Sections */}
          <div className="space-y-4">
            {runbook.sections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 font-semibold text-sm">
                      {idx + 1}
                    </span>
                    <h2 className="font-semibold text-white">{section.title}</h2>
                  </div>
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="text-slate-400" size={20} />
                  ) : (
                    <ChevronRight className="text-slate-400" size={20} />
                  )}
                </button>

                {expandedSections.has(section.id) && (
                  <div className="px-4 pb-4 space-y-4">
                    {section.blocks.map((block) => (
                      <div key={block.id}>
                        {block.title && (
                          <h3 className="font-medium text-slate-300 mb-2">{block.title}</h3>
                        )}
                        {renderBlock(block)}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <p className="text-slate-500 text-sm">
            Powered by <span className="text-teal-400 font-semibold">RunbookForge</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
