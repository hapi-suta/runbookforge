'use client'

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Play,
  Download,
  FileJson,
  FileType,
  ChevronDown,
  ShoppingBag,
  DollarSign,
  X,
  Menu
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
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                {block.tableData.headers.map((header, i) => (
                  <th key={i} className="px-4 py-3 text-left text-slate-400 font-medium border-b border-r border-slate-700 last:border-r-0">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.tableData.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/30">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-white border-r border-slate-800 last:border-r-0">
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
          <table className="w-full text-sm border-collapse">
            <tbody>
              {block.tableData.headers.map((header, i) => (
                <tr key={i} className="border-b border-slate-800 last:border-b-0">
                  <td className="px-4 py-3 text-slate-400 font-medium bg-slate-800/50 w-1/3 border-r border-slate-700">
                    {header}
                  </td>
                  <td className="px-4 py-3 text-white">
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
                <div className={`text-xs ${colors.text} opacity-70 font-mono`}>{card.content}</div>
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellPrice, setSellPrice] = useState('25.00');
  const [sellCategory, setSellCategory] = useState('Database');
  const [sellDescription, setSellDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitToMarketplace = async () => {
    if (!runbook || !sellPrice) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runbook_id: runbook.id,
          price_personal: parseFloat(sellPrice),
          category: sellCategory,
          description: sellDescription || runbook.description,
          tags: []
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setShowSellModal(false);
        alert('Your runbook has been submitted for review! You\'ll be notified when it\'s approved.');
      } else {
        alert(data.error || 'Failed to submit listing');
      }
    } catch (error) {
      console.error('Error submitting to marketplace:', error);
      alert('Failed to submit listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRunbook();
  }, [params.id]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowExportMenu(false);
    if (showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showExportMenu]);

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

  // Export to PDF
  const exportToPDF = async () => {
    if (!runbook) return;
    setIsExporting(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      // Create a temporary container with all sections for PDF
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '850px';
      tempContainer.style.backgroundColor = '#0f172a';
      tempContainer.style.padding = '50px';
      tempContainer.style.color = 'white';
      tempContainer.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
      
      // Build HTML content with improved styling
      let htmlContent = `
        <div style="margin-bottom: 40px; border-bottom: 1px solid #334155; padding-bottom: 30px;">
          <h1 style="font-size: 32px; color: #2dd4bf; margin: 0 0 15px 0; font-weight: 700;">${runbook.title}</h1>
          ${runbook.description ? `<p style="color: #94a3b8; font-size: 16px; margin: 0 0 15px 0; line-height: 1.6;">${runbook.description}</p>` : ''}
          <p style="color: #475569; font-size: 12px; margin: 0;">Generated by RunbookForge • ${new Date().toLocaleDateString()}</p>
        </div>
      `;
      
      runbook.sections.forEach((section, sectionIndex) => {
        htmlContent += `
          <div style="margin-bottom: 40px;">
            <h2 style="font-size: 24px; color: white; margin: 0 0 25px 0; font-weight: 600;">
              ${sectionIndex + 1}. ${section.title}
            </h2>
        `;
        
        let stepNumber = 0;
        section.blocks.forEach(block => {
          if (block.type === 'step') {
            stepNumber++;
            htmlContent += `
              <div style="display: flex; gap: 16px; margin-bottom: 24px; align-items: flex-start;">
                <div style="width: 32px; height: 32px; min-width: 32px; background: linear-gradient(135deg, #14b8a6, #10b981); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">${stepNumber}</div>
                <div style="flex: 1;">
                  <h3 style="font-size: 18px; color: white; margin: 0 0 8px 0; font-weight: 600;">${block.title || 'Step'}</h3>
                  <p style="color: #cbd5e1; font-size: 14px; margin: 0; line-height: 1.6;">${block.content?.replace(/<[^>]*>/g, '') || ''}</p>
                  ${block.tags && block.tags.length > 0 ? `<div style="margin-top: 8px;">${block.tags.map(tag => `<span style="display: inline-block; background: rgba(20, 184, 166, 0.2); color: #2dd4bf; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 6px;">${tag}</span>`).join('')}</div>` : ''}
                </div>
              </div>
            `;
          } else if (block.type === 'code') {
            htmlContent += `
              <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; margin-bottom: 24px; overflow: hidden;">
                <div style="background: #0f172a; padding: 10px 16px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748b; font-size: 12px; font-family: monospace;">${block.language || 'bash'}</span>
                  ${block.tags && block.tags.length > 0 ? `<div>${block.tags.map(tag => `<span style="background: rgba(20, 184, 166, 0.2); color: #2dd4bf; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin-left: 6px;">${tag}</span>`).join('')}</div>` : ''}
                </div>
                <pre style="margin: 0; padding: 20px; font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 13px; color: #34d399; line-height: 1.6; white-space: pre-wrap; overflow-x: auto;">${block.content?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || ''}</pre>
              </div>
            `;
          } else if (block.type === 'warning') {
            htmlContent += `
              <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                  <span style="font-size: 16px;">⚠️</span>
                  <span style="color: #fbbf24; font-weight: 600; font-size: 14px;">Warning</span>
                </div>
                <p style="color: #fcd34d; font-size: 14px; margin: 0; line-height: 1.6;">${block.content?.replace(/<[^>]*>/g, '') || ''}</p>
              </div>
            `;
          } else if (block.type === 'info') {
            htmlContent += `
              <div style="background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.3); border-left: 4px solid #0ea5e9; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                  <span style="font-size: 16px;">ℹ️</span>
                  <span style="color: #38bdf8; font-weight: 600; font-size: 14px;">Info</span>
                </div>
                <p style="color: #7dd3fc; font-size: 14px; margin: 0; line-height: 1.6;">${block.content?.replace(/<[^>]*>/g, '') || ''}</p>
              </div>
            `;
          } else if (block.type === 'table' && block.tableData) {
            htmlContent += `
              <div style="border: 1px solid #334155; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <thead>
                    <tr style="background: #1e293b;">
                      ${block.tableData.headers.map(h => `<th style="padding: 14px 16px; text-align: left; color: #94a3b8; font-weight: 500; border-bottom: 1px solid #334155; border-right: 1px solid #334155;">${h}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${block.tableData.rows.map(row => `
                      <tr style="border-bottom: 1px solid #1e293b;">
                        ${row.map(cell => `<td style="padding: 14px 16px; color: white; border-right: 1px solid #1e293b;">${cell}</td>`).join('')}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          } else if (block.type === 'servertable' && block.servers) {
            const roleColors: Record<string, string> = {
              green: '#22c55e', blue: '#3b82f6', amber: '#f59e0b', orange: '#f97316',
              red: '#ef4444', violet: '#8b5cf6', teal: '#14b8a6', pink: '#ec4899'
            };
            htmlContent += `
              <div style="border: 1px solid #334155; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <thead>
                    <tr style="background: #1e293b;">
                      <th style="padding: 14px 16px; text-align: left; color: #94a3b8; font-weight: 500; border-bottom: 1px solid #334155;">Hostname</th>
                      <th style="padding: 14px 16px; text-align: left; color: #94a3b8; font-weight: 500; border-bottom: 1px solid #334155;">Role</th>
                      <th style="padding: 14px 16px; text-align: left; color: #94a3b8; font-weight: 500; border-bottom: 1px solid #334155;">IP</th>
                      <th style="padding: 14px 16px; text-align: left; color: #94a3b8; font-weight: 500; border-bottom: 1px solid #334155;">Region</th>
                      <th style="padding: 14px 16px; text-align: left; color: #94a3b8; font-weight: 500; border-bottom: 1px solid #334155;">Components</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${block.servers.map(s => `
                      <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 14px 16px; color: #2dd4bf; font-family: monospace;">${s.hostname}</td>
                        <td style="padding: 14px 16px;">
                          <span style="background: ${roleColors[s.roleColor] || '#14b8a6'}22; color: ${roleColors[s.roleColor] || '#14b8a6'}; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;">${s.role}</span>
                        </td>
                        <td style="padding: 14px 16px; color: #cbd5e1; font-family: monospace;">${s.ip}</td>
                        <td style="padding: 14px 16px; color: #94a3b8;">${s.region}</td>
                        <td style="padding: 14px 16px; color: #64748b; font-size: 12px;">${s.components}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          } else if (block.type === 'portref' && block.ports) {
            const portColors: Record<string, string> = {
              teal: '#14b8a6', green: '#22c55e', blue: '#3b82f6', amber: '#f59e0b',
              violet: '#8b5cf6', red: '#ef4444', orange: '#f97316', pink: '#ec4899'
            };
            htmlContent += `
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
                ${block.ports.map(p => `
                  <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #94a3b8; font-size: 13px;">${p.name}</span>
                    <span style="color: ${portColors[p.color] || '#14b8a6'}; font-weight: 700; font-size: 15px;">${p.port}</span>
                  </div>
                `).join('')}
              </div>
            `;
          } else if (block.type === 'infocards' && block.infocards) {
            const cardColors: Record<string, { bg: string; text: string }> = {
              red: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' },
              orange: { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c' },
              amber: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
              green: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80' },
              teal: { bg: 'rgba(20, 184, 166, 0.15)', text: '#2dd4bf' },
              blue: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' },
              violet: { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa' },
              pink: { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6' }
            };
            htmlContent += `
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
                ${block.infocards.map(card => {
                  const colors = cardColors[card.color || 'teal'] || cardColors.teal;
                  return `
                    <div style="background: ${colors.bg}; border: 1px solid ${colors.text}33; border-radius: 10px; padding: 16px;">
                      <div style="color: ${colors.text}; font-weight: 700; font-size: 14px; margin-bottom: 4px;">${card.title}</div>
                      <div style="color: ${colors.text}; opacity: 0.8; font-family: monospace; font-size: 12px;">${card.content}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          } else if (block.type === 'twocolumn') {
            const leftColor = block.leftColor === 'emerald' ? '#10b981' : '#14b8a6';
            const rightColor = block.rightColor === 'amber' ? '#f59e0b' : '#f97316';
            htmlContent += `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                <div style="background: #1e293b; border: 1px solid ${leftColor}44; border-left: 3px solid ${leftColor}; border-radius: 10px; padding: 20px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <div style="width: 8px; height: 8px; background: ${leftColor}; border-radius: 50%;"></div>
                    <span style="color: ${leftColor}; font-weight: 600; font-size: 15px;">${block.leftTitle || ''}</span>
                  </div>
                  <div style="color: #cbd5e1; font-size: 14px; line-height: 1.7;">${block.leftContent?.replace(/<[^>]*>/g, '').replace(/•/g, '<br>• ') || ''}</div>
                </div>
                <div style="background: #1e293b; border: 1px solid ${rightColor}44; border-left: 3px solid ${rightColor}; border-radius: 10px; padding: 20px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <div style="width: 8px; height: 8px; background: ${rightColor}; border-radius: 50%;"></div>
                    <span style="color: ${rightColor}; font-weight: 600; font-size: 15px;">${block.rightTitle || ''}</span>
                  </div>
                  <div style="color: #cbd5e1; font-size: 14px; line-height: 1.7;">${block.rightContent?.replace(/<[^>]*>/g, '').replace(/•/g, '<br>• ') || ''}</div>
                </div>
              </div>
            `;
          } else if (block.type === 'flowcards' && block.flows) {
            const flowColors: Record<string, string> = {
              teal: '#14b8a6', amber: '#f59e0b', violet: '#8b5cf6', green: '#22c55e', blue: '#3b82f6'
            };
            htmlContent += `
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
                ${block.flows.map(f => `
                  <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 14px 16px;">
                    <span style="color: ${flowColors[f.color] || '#14b8a6'}; font-size: 13px; font-weight: 500;">${f.flow}</span>
                  </div>
                `).join('')}
              </div>
            `;
          }
        });
        
        htmlContent += '</div>';
      });

      // Add footer
      htmlContent += `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; text-align: center;">
          <p style="color: #475569; font-size: 11px; margin: 0;">
            Generated by RunbookForge • runbookforge.com • ${new Date().toLocaleDateString()}
          </p>
        </div>
      `;
      
      tempContainer.innerHTML = htmlContent;
      document.body.appendChild(tempContainer);
      
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      document.body.removeChild(tempContainer);
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${runbook.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to Markdown
  const exportToMarkdown = () => {
    if (!runbook) return;
    
    let markdown = `# ${runbook.title}\n\n`;
    if (runbook.description) {
      markdown += `${runbook.description}\n\n`;
    }
    markdown += `---\n\n`;
    
    runbook.sections.forEach((section, sectionIndex) => {
      markdown += `## ${sectionIndex + 1}. ${section.title}\n\n`;
      
      let stepNumber = 0;
      section.blocks.forEach(block => {
        if (block.type === 'step') {
          stepNumber++;
          markdown += `### Step ${stepNumber}: ${block.title || 'Untitled'}\n\n`;
          if (block.content) {
            markdown += `${block.content.replace(/<[^>]*>/g, '')}\n\n`;
          }
        } else if (block.type === 'code') {
          markdown += `\`\`\`${block.language || ''}\n${block.content || ''}\n\`\`\`\n\n`;
        } else if (block.type === 'warning') {
          markdown += `> ⚠️ **Warning:** ${block.content?.replace(/<[^>]*>/g, '') || ''}\n\n`;
        } else if (block.type === 'info') {
          markdown += `> ℹ️ **Info:** ${block.content?.replace(/<[^>]*>/g, '') || ''}\n\n`;
        } else if (block.type === 'table' && block.tableData) {
          markdown += `| ${block.tableData.headers.join(' | ')} |\n`;
          markdown += `| ${block.tableData.headers.map(() => '---').join(' | ')} |\n`;
          block.tableData.rows.forEach(row => {
            markdown += `| ${row.join(' | ')} |\n`;
          });
          markdown += '\n';
        } else if (block.type === 'servertable' && block.servers) {
          markdown += `| Hostname | Role | IP | Region | Components |\n`;
          markdown += `| --- | --- | --- | --- | --- |\n`;
          block.servers.forEach(s => {
            markdown += `| ${s.hostname} | ${s.role} | ${s.ip} | ${s.region} | ${s.components} |\n`;
          });
          markdown += '\n';
        } else if (block.type === 'infocards' && block.infocards) {
          block.infocards.forEach(card => {
            markdown += `- **${card.title}**: \`${card.content}\`\n`;
          });
          markdown += '\n';
        } else if (block.type === 'portref' && block.ports) {
          markdown += `| Service | Port |\n| --- | --- |\n`;
          block.ports.forEach(p => {
            markdown += `| ${p.name} | ${p.port} |\n`;
          });
          markdown += '\n';
        } else if (block.type === 'twocolumn') {
          if (block.leftTitle) markdown += `**${block.leftTitle}**\n${block.leftContent?.replace(/<[^>]*>/g, '') || ''}\n\n`;
          if (block.rightTitle) markdown += `**${block.rightTitle}**\n${block.rightContent?.replace(/<[^>]*>/g, '') || ''}\n\n`;
        }
      });
    });
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${runbook.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to JSON
  const exportToJSON = () => {
    if (!runbook) return;
    
    const exportData = {
      title: runbook.title,
      description: runbook.description,
      sections: runbook.sections,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${runbook.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-7xl mx-auto">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between mb-2">
        <Link href="/dashboard/runbooks" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
        >
          <Menu size={16} />
          Sections
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setShowMobileSidebar(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 z-50 overflow-y-auto p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Sections</h2>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Runbook Info */}
              <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm line-clamp-1">{runbook.title}</h3>
                    <p className="text-xs text-slate-500">Runbook</p>
                  </div>
                </div>
                
                {/* Tags */}
                {allTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.slice(0, 4).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded border border-teal-500/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Section Navigation */}
              <nav className="space-y-1 mb-4">
                {runbook.sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => { setActiveSection(index); setShowMobileSidebar(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      activeSection === index
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {index + 1}. {section.title}
                  </button>
                ))}
              </nav>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <Link
                  href={`/dashboard/runbooks/${runbook.id}/edit`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-medium"
                >
                  <Edit size={16} />
                  Edit Runbook
                </Link>
                <button
                  onClick={() => { setShowSellModal(true); setShowMobileSidebar(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-400 font-medium"
                >
                  <ShoppingBag size={16} />
                  Sell on Marketplace
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Left Sidebar - Desktop */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block w-64 flex-shrink-0"
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

          {/* Quick Links */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Quick Links</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300">
                <ExternalLink size={14} />
                Documentation
              </a>
            </div>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export Runbook
                  <ChevronDown size={14} className={`ml-auto transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
            
            {showExportMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl z-50"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); exportToPDF(); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors border-b border-slate-700"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <FileText size={16} className="text-red-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">PDF Document</div>
                    <div className="text-xs text-slate-400">Print-ready format</div>
                  </div>
                </button>
                
                <button
                  onClick={(e) => { e.stopPropagation(); exportToMarkdown(); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors border-b border-slate-700"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <FileType size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Markdown</div>
                    <div className="text-xs text-slate-400">For documentation sites</div>
                  </div>
                </button>
                
                <button
                  onClick={(e) => { e.stopPropagation(); exportToJSON(); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <FileJson size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">JSON Data</div>
                    <div className="text-xs text-slate-400">Import to other tools</div>
                  </div>
                </button>
              </motion.div>
            )}
          </div>

          {/* Edit Mode Button */}
          <Link
            href={`/dashboard/runbooks/${runbook.id}/edit`}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-medium hover:from-teal-600 hover:to-emerald-600 transition-all"
          >
            <Edit size={16} />
            Enable Edit Mode
          </Link>

          {/* Sell on Marketplace Button */}
          <button
            onClick={() => setShowSellModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-400 font-medium hover:bg-violet-500/30 transition-all"
          >
            <ShoppingBag size={16} />
            Sell on Marketplace
          </button>

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
        {/* Back Button - Desktop only */}
        <Link href="/dashboard/runbooks" className="hidden lg:inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to Runbooks
        </Link>

        {/* Section Title */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 lg:mb-8">{currentSection?.title}</h1>

        {/* Content */}
        <div className="space-y-4 lg:space-y-6">
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

      {/* Sell on Marketplace Modal */}
      <AnimatePresence>
        {showSellModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSellModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 sm:p-6 border-b border-slate-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                      <ShoppingBag size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Sell on Marketplace</h2>
                      <p className="text-sm text-slate-400">List this runbook for sale</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSellModal(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-5">
                {/* Runbook Info */}
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <h3 className="font-medium text-white mb-1">{runbook.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">{runbook.description || 'No description'}</p>
                  <p className="text-xs text-slate-500 mt-2">{runbook.sections.length} sections</p>
                </div>

                {/* Price Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Personal License Price (USD)
                  </label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      placeholder="25.00"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Team license: ${(parseFloat(sellPrice || '0') * 3).toFixed(2)} • Enterprise: ${(parseFloat(sellPrice || '0') * 10).toFixed(2)}
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={sellCategory}
                    onChange={(e) => setSellCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="Database">Database</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Security">Security</option>
                    <option value="Operations">Operations</option>
                    <option value="Networking">Networking</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Revenue Split Info */}
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <h4 className="font-medium text-emerald-400 mb-2 flex items-center gap-2">
                    <DollarSign size={16} />
                    Revenue Split
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-emerald-300">You receive (70%)</span>
                      <span className="text-emerald-400 font-medium">
                        ${(parseFloat(sellPrice || '0') * 0.7).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Platform fee (30%)</span>
                      <span className="text-slate-400">
                        ${(parseFloat(sellPrice || '0') * 0.3).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <h4 className="font-medium text-white mb-2">Before you submit</h4>
                  <ul className="space-y-1 text-sm text-slate-400">
                    <li>✓ Runbook will be reviewed by our team</li>
                    <li>✓ Buyers get permanent access</li>
                    <li>✓ Payouts processed monthly via Stripe</li>
                    <li>✓ You can update pricing anytime</li>
                  </ul>
                </div>
              </div>

              <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-800/50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowSellModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitToMarketplace}
                    disabled={isSubmitting || !sellPrice}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl text-white font-semibold hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        Submit for Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
