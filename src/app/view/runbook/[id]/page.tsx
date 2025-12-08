'use client'

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Loader2, CheckCircle, AlertTriangle, Info, FileText,
  BookOpen, Play, ChevronDown, ChevronRight, Check, Copy, ExternalLink,
  ThumbsUp, Sparkles, Clock, Target, Award, Share2
} from "lucide-react";
import CodeBlock from "@/components/CodeBlock";

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
  const [showShareToast, setShowShareToast] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

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
        if (data.sections?.length > 0) {
          setActiveSection(data.sections[0].id);
        }
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
    setActiveSection(id);
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

  const shareRunbook = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  // Calculate total checkable items
  const getTotalCheckItems = () => {
    if (!runbook) return 0;
    return runbook.sections.reduce((acc, s) => 
      acc + s.blocks.filter(b => b.type === 'checklist')
        .reduce((a, b) => a + (b.checklist?.length || 0), 0), 0);
  };

  const totalItems = getTotalCheckItems();
  const progressPercent = totalItems > 0 ? (completedSteps.size / totalItems) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 size={48} className="text-teal-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-slate-400">Loading runbook...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !runbook) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle size={48} className="text-amber-400 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-xl font-bold text-white mb-2">{error || 'Runbook not found'}</h1>
          <Link href="/" className="text-teal-400 hover:underline">Go back home</Link>
        </motion.div>
      </div>
    );
  }

  const renderBlock = (block: Block, blockIndex: number) => {
    switch (block.type) {
      case 'text':
        return (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: blockIndex * 0.05 }}
            className="prose prose-invert max-w-none" 
            dangerouslySetInnerHTML={{ __html: block.content }} 
          />
        );
      
      case 'code':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: blockIndex * 0.05 }}
          >
            <CodeBlock 
              code={block.content} 
              language={block.language || 'bash'}
              title={block.title}
            />
          </motion.div>
        );
      
      case 'warning':
        return (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: blockIndex * 0.05 }}
            whileHover={{ scale: 1.01 }}
            className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg"
          >
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
            </motion.div>
            <div className="text-amber-200">{block.content}</div>
          </motion.div>
        );
      
      case 'info':
        return (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: blockIndex * 0.05 }}
            whileHover={{ scale: 1.01 }}
            className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
          >
            <Info className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-blue-200">{block.content}</div>
          </motion.div>
        );
      
      case 'success':
        return (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: blockIndex * 0.05 }}
            whileHover={{ scale: 1.01 }}
            className="flex gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
          >
            <CheckCircle className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-emerald-200">{block.content}</div>
          </motion.div>
        );
      
      case 'checklist':
        return (
          <div className="space-y-2">
            {block.checklist?.map((item, itemIdx) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (blockIndex * 0.05) + (itemIdx * 0.03) }}
                whileHover={{ scale: 1.01, x: 5 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleStep(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                  completedSteps.has(item.id)
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <motion.div 
                  animate={completedSteps.has(item.id) ? { scale: [1, 1.2, 1] } : {}}
                  className={`w-5 h-5 rounded flex items-center justify-center ${
                    completedSteps.has(item.id) ? 'bg-emerald-500' : 'border-2 border-slate-600'
                  }`}
                >
                  <AnimatePresence>
                    {completedSteps.has(item.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check size={14} className="text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className={completedSteps.has(item.id) ? 'text-slate-400 line-through' : 'text-white'}>
                  {item.text}
                </span>
              </motion.button>
            ))}
          </div>
        );
      
      case 'table':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: blockIndex * 0.05 }}
            className="overflow-x-auto rounded-lg border border-slate-700"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-800">
                  {block.tableData?.headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-sm font-semibold text-slate-300 border-b border-slate-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.tableData?.rows.map((row, i) => (
                  <motion.tr 
                    key={i} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-3 text-sm text-slate-300 border-b border-slate-700/50">{cell}</td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        );
      
      default:
        return <div className="text-slate-400">{block.content}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Scroll Progress */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 origin-left z-50"
      />

      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-teal-500 rounded-lg text-white font-medium z-50 shadow-lg"
          >
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-slate-900/80 border-b border-slate-800 sticky top-1 z-40 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
              <span>Back</span>
            </Link>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareRunbook}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">Share</span>
              </motion.button>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <BookOpen size={16} />
                <span>Runbook</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Title */}
          <div className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-white mb-3"
            >
              {runbook.title}
            </motion.h1>
            {runbook.description && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-lg"
              >
                {runbook.description}
              </motion.p>
            )}
          </div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 text-center">
              <Target className="text-teal-400 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-white">{runbook.sections.length}</p>
              <p className="text-xs text-slate-400">Sections</p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 text-center">
              <Clock className="text-amber-400 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-white">{totalItems}</p>
              <p className="text-xs text-slate-400">Steps</p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 text-center">
              <Award className="text-emerald-400 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-white">{Math.round(progressPercent)}%</p>
              <p className="text-xs text-slate-400">Complete</p>
            </div>
          </motion.div>

          {/* Progress */}
          {totalItems > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Progress</span>
                <span className="text-sm text-teal-400 font-medium">
                  {completedSteps.size} of {totalItems} steps completed
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                />
              </div>
              {progressPercent === 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center justify-center gap-2 text-emerald-400"
                >
                  <Sparkles size={20} />
                  <span className="font-semibold">Congratulations! You completed this runbook!</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Sections */}
          <div className="space-y-4">
            {runbook.sections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className={`bg-slate-800/30 border rounded-xl overflow-hidden transition-all ${
                  activeSection === section.id ? 'border-teal-500/50 ring-1 ring-teal-500/20' : 'border-slate-700'
                }`}
              >
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <motion.span 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 font-semibold text-sm"
                    >
                      {idx + 1}
                    </motion.span>
                    <h2 className="font-semibold text-white text-left">{section.title}</h2>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedSections.has(section.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="text-slate-400" size={20} />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {expandedSections.has(section.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4">
                        {section.blocks.map((block, blockIdx) => (
                          <div key={block.id}>
                            {block.title && (
                              <h3 className="font-medium text-slate-300 mb-2">{block.title}</h3>
                            )}
                            {renderBlock(block, blockIdx)}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-500 text-sm"
          >
            Powered by <span className="text-teal-400 font-semibold">RunbookForge</span>
          </motion.p>
        </div>
      </footer>
    </div>
  );
}
