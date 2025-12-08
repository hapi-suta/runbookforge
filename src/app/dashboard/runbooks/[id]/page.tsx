'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Share2, 
  Loader2,
  CheckCircle,
  Code,
  AlertTriangle,
  Info,
  FileText,
  Table,
  LayoutGrid,
  Columns,
  ListChecks,
  Tag,
  Play,
  Copy,
  Check
} from "lucide-react";

interface Block {
  id: string;
  type: string;
  content: string;
  title?: string;
  language?: string;
  tags?: string[];
  tableData?: { headers: string[]; rows: string[][] };
  cards?: { title: string; content: string }[];
  leftContent?: string;
  rightContent?: string;
  leftTitle?: string;
  rightTitle?: string;
  checklist?: { id: string; text: string; checked: boolean }[];
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
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

function CodeBlock({ content, language }: { content: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 rounded-t-lg">
        <span className="text-xs text-slate-400 font-mono">{language || 'bash'}</span>
        <button 
          onClick={copyToClipboard}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="p-4 bg-slate-900 border border-t-0 border-slate-700 rounded-b-lg overflow-x-auto">
        <code className="text-sm text-slate-300 font-mono">{content}</code>
      </pre>
    </div>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'step':
      return (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="mt-1 w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
              <CheckCircle size={14} className="text-teal-400" />
            </div>
            <div className="flex-1">
              {block.title && <h4 className="text-white font-medium mb-2">{block.title}</h4>}
              {block.tags && block.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {block.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded border border-teal-500/30">
                      <Tag size={10} />{tag}
                    </span>
                  ))}
                </div>
              )}
              {block.content && (
                <div 
                  className="prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              )}
            </div>
          </div>
        </div>
      );

    case 'code':
      return (
        <div>
          {block.tags && block.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {block.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-500/20 text-slate-400 text-xs rounded border border-slate-500/30">
                  <Tag size={10} />{tag}
                </span>
              ))}
            </div>
          )}
          <CodeBlock content={block.content} language={block.language} />
        </div>
      );

    case 'warning':
      return (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-400 mt-0.5" />
            <div className="flex-1">
              {block.tags && block.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {block.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded border border-amber-500/30">
                      <Tag size={10} />{tag}
                    </span>
                  ))}
                </div>
              )}
              <div 
                className="prose prose-invert prose-sm max-w-none prose-p:text-amber-200"
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            </div>
          </div>
        </div>
      );

    case 'info':
      return (
        <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-sky-400 mt-0.5" />
            <div 
              className="prose prose-invert prose-sm max-w-none prose-p:text-sky-200"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          </div>
        </div>
      );

    case 'note':
      return (
        <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText size={18} className="text-violet-400 mt-0.5" />
            <div 
              className="prose prose-invert prose-sm max-w-none prose-p:text-violet-200"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          </div>
        </div>
      );

    case 'header':
      return (
        <div className="p-4 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/30 rounded-lg">
          {block.title && <h3 className="text-xl font-semibold text-teal-400 mb-1">{block.title}</h3>}
          {block.content && (
            <div 
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          )}
        </div>
      );

    case 'table':
      if (!block.tableData) return null;
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-800">
                {block.tableData.headers.map((header, i) => (
                  <th key={i} className="px-4 py-3 text-left text-slate-300 font-medium border-b border-slate-700">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.tableData.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-800 last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 text-slate-400">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'cardgrid':
      if (!block.cards) return null;
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {block.cards.map((card, i) => (
            <div key={i} className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
              <div className="text-sm font-medium text-teal-400 mb-1">{card.title}</div>
              <div className="text-xs text-slate-400 font-mono">{card.content}</div>
            </div>
          ))}
        </div>
      );

    case 'twocolumn':
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-800/50 border border-emerald-500/30 rounded-lg">
            {block.leftTitle && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <h4 className="text-emerald-400 font-medium">{block.leftTitle}</h4>
              </div>
            )}
            <div 
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: block.leftContent || '' }}
            />
          </div>
          <div className="p-4 bg-slate-800/50 border border-amber-500/30 rounded-lg">
            {block.rightTitle && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <h4 className="text-amber-400 font-medium">{block.rightTitle}</h4>
              </div>
            )}
            <div 
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: block.rightContent || '' }}
            />
          </div>
        </div>
      );

    case 'checklist':
      if (!block.checklist) return null;
      return (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-2">
          {block.checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${item.checked ? 'bg-teal-500 border-teal-500' : 'border-slate-600'}`}>
                {item.checked && <Check size={12} className="text-white" />}
              </div>
              <span className={`text-sm ${item.checked ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div 
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      );
  }
}

export default function ViewRunbookPage() {
  const params = useParams();
  const router = useRouter();
  const [runbook, setRunbook] = useState<Runbook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRunbook();
  }, [params.id]);

  const fetchRunbook = async () => {
    try {
      const response = await fetch(`/api/runbooks/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Runbook not found');
        } else {
          throw new Error('Failed to fetch runbook');
        }
        return;
      }
      const data = await response.json();
      setRunbook(data);
    } catch (err) {
      setError('Failed to load runbook');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this runbook?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/runbooks/${params.id}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/dashboard/runbooks');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error || !runbook) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <h2 className="text-xl font-semibold text-white mb-2">{error || 'Runbook not found'}</h2>
          <p className="text-slate-400 mb-6">The runbook you're looking for doesn't exist or has been deleted.</p>
          <Link href="/dashboard/runbooks" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700 transition-colors">
            <ArrowLeft size={18} />
            Back to Runbooks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/runbooks" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{runbook.title}</h1>
              {runbook.description && (
                <p className="text-slate-400 mt-1">{runbook.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/runbooks/${runbook.id}/edit`}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg text-white text-sm hover:bg-slate-700 transition-colors"
            >
              <Edit size={16} />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Delete
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>Updated {formatDate(runbook.updated_at)}</span>
          <span>•</span>
          <span>{runbook.sections?.length || 0} sections</span>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-8"
      >
        {runbook.sections?.length === 0 ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <p className="text-slate-400 mb-4">This runbook is empty.</p>
            <Link
              href={`/dashboard/runbooks/${runbook.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 rounded-lg text-white hover:bg-teal-600 transition-colors"
            >
              <Edit size={16} />
              Add Content
            </Link>
          </div>
        ) : (
          runbook.sections?.map((section, sectionIndex) => (
            <div key={section.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-800">
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
              <div className="p-6 space-y-4">
                {section.blocks?.length === 0 ? (
                  <p className="text-slate-500 text-sm">No content in this section.</p>
                ) : (
                  section.blocks?.map((block) => (
                    <BlockRenderer key={block.id} block={block} />
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
