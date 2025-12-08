'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  FileText,
  Tag,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Play
} from "lucide-react";
import { getColorClasses } from "@/components/ColorPicker";

interface Card {
  title: string;
  content: string;
  color?: string;
}

interface ServerRow {
  hostname: string;
  role: string;
  roleColor: string;
  ip: string;
  region: string;
  components: string;
}

interface PortItem {
  name: string;
  port: string;
  color: string;
}

interface FlowItem {
  flow: string;
  color: string;
}

interface Block {
  id: string;
  type: string;
  content: string;
  title?: string;
  language?: string;
  tags?: string[];
  tableData?: { headers: string[]; rows: string[][] };
  cards?: Card[];
  leftContent?: string;
  rightContent?: string;
  leftTitle?: string;
  rightTitle?: string;
  leftColor?: string;
  rightColor?: string;
  checklist?: { id: string; text: string; checked: boolean }[];
  servers?: ServerRow[];
  ports?: PortItem[];
  infocards?: Card[];
  flows?: FlowItem[];
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

function CodeBlock({ content, language, tags }: { content: string; language?: string; tags?: string[] }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-mono">{language || 'bash'}</span>
        <div className="flex items-center gap-2">
          {tags?.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded border border-teal-500/30">
              {tag}
            </span>
          ))}
          <button 
            onClick={copyToClipboard}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-emerald-400 font-mono whitespace-pre">{content}</code>
      </pre>
    </div>
  );
}

function StepBlock({ block, stepNumber }: { block: Block; stepNumber: number }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
        {stepNumber}
      </div>
      <div className="flex-1 space-y-3">
        {block.title && <h3 className="text-lg font-semibold text-white">{block.title}</h3>}
        {block.content && (
          <div 
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        )}
      </div>
    </div>
  );
}

function BlockRenderer({ block, stepNumber }: { block: Block; stepNumber?: number }) {
  switch (block.type) {
    case 'step':
      return <StepBlock block={block} stepNumber={stepNumber || 1} />;

    case 'code':
      return <CodeBlock content={block.content} language={block.language} tags={block.tags} />;

    case 'warning':
      return (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div 
            className="prose prose-invert prose-sm max-w-none prose-p:text-amber-200"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      );

    case 'info':
      return (
        <div className="flex items-start gap-3 p-4 bg-sky-500/10 border border-sky-500/30 rounded-lg">
          <Info size={20} className="text-sky-400 flex-shrink-0 mt-0.5" />
          <div 
            className="prose prose-invert prose-sm max-w-none prose-p:text-sky-200"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      );

    case 'note':
      return (
        <div className="flex items-start gap-3 p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
          <FileText size={20} className="text-violet-400 flex-shrink-0 mt-0.5" />
          <div 
            className="prose prose-invert prose-sm max-w-none prose-p:text-violet-200"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      );

    case 'header':
      return null; // Headers are rendered as section titles

    case 'table':
      if (!block.tableData) return null;
      return (
        <div className="overflow-x-auto border border-slate-700 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                {block.tableData.headers.map((header, i) => (
                  <th key={i} className="px-4 py-3 text-left text-slate-400 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.tableData.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-slate-800 last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-white">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'keyvalue':
      if (!block.tableData) return null;
      return (
        <div className="overflow-x-auto border border-slate-700 rounded-lg">
          <table className="w-full text-sm">
            <tbody>
              {block.tableData.headers.map((header, i) => (
                <tr key={i} className="border-b border-slate-800 last:border-0">
                  <td className="px-4 py-3 text-slate-400 font-medium bg-slate-800/50 w-1/4">
                    {header}:
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {block.tableData!.rows[0]?.[i] || ''}
                  </td>
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
          {block.cards.map((card, i) => {
            const colors = getColorClasses(card.color || 'teal');
            return (
              <div key={i} className={`p-4 ${colors.bg} border ${colors.border} rounded-lg`}>
                <div className={`text-sm font-medium ${colors.text} mb-1`}>{card.title}</div>
                <div className="text-xs text-slate-400">{card.content}</div>
              </div>
            );
          })}
        </div>
      );

    case 'servertable':
      if (!block.servers) return null;
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Hostname</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Role</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Private IP</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Region</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Components</th>
              </tr>
            </thead>
            <tbody>
              {block.servers.map((server, i) => {
                const roleColors = getColorClasses(server.roleColor || 'green');
                return (
                  <tr key={i} className="border-b border-slate-800">
                    <td className="px-4 py-3 text-teal-400 font-mono">{server.hostname}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 ${roleColors.bg} ${roleColors.text} text-xs rounded border ${roleColors.border}`}>
                        {server.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono">{server.ip}</td>
                    <td className="px-4 py-3 text-slate-400">{server.region}</td>
                    <td className="px-4 py-3 text-slate-500">{server.components}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );

    case 'portref':
      if (!block.ports) return null;
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {block.ports.map((port, i) => {
            const colors = getColorClasses(port.color || 'teal');
            return (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-300">{port.name}</span>
                <span className={`text-sm font-bold ${colors.text}`}>{port.port}</span>
              </div>
            );
          })}
        </div>
      );

    case 'infocards':
      if (!block.infocards) return null;
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {block.infocards.map((card, i) => {
            const colors = getColorClasses(card.color || 'teal');
            return (
              <div key={i} className={`p-4 ${colors.bg} border ${colors.border} rounded-lg`}>
                <div className={`text-sm font-bold ${colors.text} mb-1`}>{card.title}</div>
                <div className="text-xs text-slate-400 font-mono">{card.content}</div>
              </div>
            );
          })}
        </div>
      );

    case 'flowcards':
      if (!block.flows) return null;
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {block.flows.map((flow, i) => {
            const colors = getColorClasses(flow.color || 'teal');
            return (
              <div key={i} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <span className={`text-sm ${colors.text}`}>{flow.flow}</span>
              </div>
            );
          })}
        </div>
      );

    case 'twocolumn':
      const leftColors = getColorClasses(block.leftColor || 'emerald');
      const rightColors = getColorClasses(block.rightColor || 'amber');
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 bg-slate-800/50 border ${leftColors.border} rounded-lg`}>
            {block.leftTitle && (
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${leftColors.solid}`}></div>
                <h4 className={`${leftColors.text} font-medium`}>{block.leftTitle}</h4>
              </div>
            )}
            <div 
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: block.leftContent || '' }}
            />
          </div>
          <div className={`p-4 bg-slate-800/50 border ${rightColors.border} rounded-lg`}>
            {block.rightTitle && (
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${rightColors.solid}`}></div>
                <h4 className={`${rightColors.text} font-medium`}>{block.rightTitle}</h4>
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
        <div className="space-y-2">
          {block.checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${item.checked ? 'bg-teal-500 border-teal-500' : 'border-slate-600'}`}>
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
        <div 
          className="prose prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
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
  const [activeSection, setActiveSection] = useState(0);

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

  // Extract all unique tags from blocks
  const getAllTags = () => {
    if (!runbook) return [];
    const tags = new Set<string>();
    runbook.sections.forEach(section => {
      section.blocks.forEach(block => {
        block.tags?.forEach(tag => tags.add(tag));
      });
    });
    return Array.from(tags);
  };

  // Count steps in a section
  const countSteps = (section: Section) => {
    return section.blocks.filter(b => b.type === 'step').length;
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

  const allTags = getAllTags();
  const currentSection = runbook.sections[activeSection];

  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      {/* Left Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 flex-shrink-0"
      >
        <div className="sticky top-24 space-y-4">
          {/* Runbook Info */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white text-sm line-clamp-1">{runbook.title}</h2>
                <p className="text-xs text-slate-500">Runbook</p>
              </div>
            </div>
            
            {/* Tags */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {allTags.slice(0, 4).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded border border-teal-500/30">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Section Navigation */}
            <nav className="space-y-1">
              {runbook.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(index)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === index
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {index + 1}. {section.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Links - Example */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Quick Links</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300">
                <ExternalLink size={14} />
                Documentation
              </a>
            </div>
          </div>

          {/* Edit Mode Button */}
          <Link
            href={`/dashboard/runbooks/${runbook.id}/edit`}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-medium hover:from-teal-600 hover:to-emerald-600 transition-all"
          >
            <Edit size={16} />
            Enable Edit Mode
          </Link>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-500/30 rounded-xl text-red-400 text-sm hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete Runbook
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 min-w-0"
      >
        {/* Back Button */}
        <Link href="/dashboard/runbooks" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to Runbooks
        </Link>

        {/* Section Title */}
        <h1 className="text-3xl font-bold text-white mb-8">{currentSection?.title}</h1>

        {/* Content */}
        <div className="space-y-6">
          {currentSection?.blocks.length === 0 ? (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <p className="text-slate-400">This section is empty.</p>
            </div>
          ) : (
            (() => {
              let stepCounter = 0;
              return currentSection?.blocks.map((block) => {
                if (block.type === 'step') {
                  stepCounter++;
                  return (
                    <div key={block.id} className="space-y-4">
                      <BlockRenderer block={block} stepNumber={stepCounter} />
                    </div>
                  );
                }
                return (
                  <div key={block.id}>
                    <BlockRenderer block={block} />
                  </div>
                );
              });
            })()
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveSection(prev => Math.max(0, prev - 1))}
            disabled={activeSection === 0}
            className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous Section
          </button>
          <span className="text-sm text-slate-500">
            {activeSection + 1} of {runbook.sections.length}
          </span>
          <button
            onClick={() => setActiveSection(prev => Math.min(runbook.sections.length - 1, prev + 1))}
            disabled={activeSection === runbook.sections.length - 1}
            className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next Section →
          </button>
        </div>
      </motion.main>
    </div>
  );
}
