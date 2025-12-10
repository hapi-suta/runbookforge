'use client'

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Maximize2, Minimize2, X, Download,
  Copy, Check, Play, Pause, BookOpen, Terminal, FileText, AlertCircle,
  AlertTriangle, Info, CheckCircle, Server, Database, Shield, Zap,
  ExternalLink, Settings, Code, Globe
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface SlideContent {
  type: 'text' | 'code' | 'config' | 'table' | 'grid' | 'alert' | 'step' | 'server-badge' | 'traffic-flow' | 'directory' | 'ports';
  content?: string;
  items?: Array<{
    title?: string;
    description?: string;
    icon?: string;
    color?: string;
    value?: string;
    path?: string;
  }>;
  language?: string;
  runOn?: string;
  alertType?: 'info' | 'warning' | 'danger' | 'success';
  stepNumber?: number;
  columns?: number;
  headers?: string[];
  rows?: string[][];
}

export interface PresentationSlide {
  id: string;
  title: string;
  subtitle?: string;
  layout: 'title' | 'content' | 'split' | 'grid' | 'code-focus' | 'comparison';
  content: SlideContent[];
  speakerNotes?: string;
  badges?: Array<{ label: string; color: string }>;
}

export interface PresentationData {
  id: string;
  title: string;
  subtitle?: string;
  badges?: Array<{ label: string; color: string }>;
  slides: PresentationSlide[];
  theme?: 'dark' | 'light';
}

interface HighClassPresentationProps {
  data: PresentationData;
  onClose?: () => void;
  startSlide?: number;
  isFullscreen?: boolean;
}

// ============================================================
// BADGE COLORS
// ============================================================

const badgeColors: Record<string, { bg: string; text: string; border: string }> = {
  green: { bg: 'rgba(16,185,129,0.2)', text: '#34d399', border: 'rgba(16,185,129,0.4)' },
  emerald: { bg: 'rgba(16,185,129,0.2)', text: '#34d399', border: 'rgba(16,185,129,0.4)' },
  violet: { bg: 'rgba(139,92,246,0.2)', text: '#a78bfa', border: 'rgba(139,92,246,0.4)' },
  purple: { bg: 'rgba(139,92,246,0.2)', text: '#a78bfa', border: 'rgba(139,92,246,0.4)' },
  sky: { bg: 'rgba(14,165,233,0.2)', text: '#38bdf8', border: 'rgba(14,165,233,0.4)' },
  blue: { bg: 'rgba(14,165,233,0.2)', text: '#38bdf8', border: 'rgba(14,165,233,0.4)' },
  amber: { bg: 'rgba(245,158,11,0.2)', text: '#fbbf24', border: 'rgba(245,158,11,0.4)' },
  orange: { bg: 'rgba(249,115,22,0.2)', text: '#fb923c', border: 'rgba(249,115,22,0.4)' },
  teal: { bg: 'rgba(20,184,166,0.2)', text: '#2dd4bf', border: 'rgba(20,184,166,0.4)' },
  cyan: { bg: 'rgba(6,182,212,0.2)', text: '#22d3ee', border: 'rgba(6,182,212,0.4)' },
  red: { bg: 'rgba(239,68,68,0.2)', text: '#f87171', border: 'rgba(239,68,68,0.4)' },
  rose: { bg: 'rgba(244,63,94,0.2)', text: '#fb7185', border: 'rgba(244,63,94,0.4)' },
  slate: { bg: 'rgba(100,116,139,0.2)', text: '#cbd5e1', border: 'rgba(100,116,139,0.4)' },
};

const serverRoleColors: Record<string, string> = {
  primary: 'server-primary',
  leader: 'server-primary',
  standby: 'server-standby',
  replica: 'server-standby',
  dr: 'server-dr',
  etcd: 'server-etcd',
  app: 'server-app',
  default: 'server-all',
};

// ============================================================
// SUBCOMPONENTS
// ============================================================

function Badge({ label, color }: { label: string; color: string }) {
  const colors = badgeColors[color] || badgeColors.slate;
  return (
    <span
      className="text-xs px-2 py-1 rounded font-medium"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {label}
    </span>
  );
}

function ServerBadge({ hostname, ip, role }: { hostname: string; ip?: string; role?: string }) {
  const roleKey = role?.toLowerCase() || 'default';
  const colors = badgeColors[serverRoleColors[roleKey]?.replace('server-', '') || 'slate'] || badgeColors.slate;
  
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm"
      style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
    >
      <Server size={14} />
      <span className="font-semibold">{hostname}</span>
      {ip && <span className="text-slate-400">| {ip}</span>}
      {role && <span className="opacity-70 text-xs uppercase">| {role}</span>}
    </div>
  );
}

function CodeBlock({ code, language, runOn, isConfig }: { code: string; language?: string; runOn?: string; isConfig?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-lg overflow-hidden border ${isConfig ? 'border-amber-500/30' : 'border-slate-700/50'} my-4`}>
      <div className={`flex items-center justify-between px-4 py-2 ${isConfig ? 'bg-amber-900/30 border-b border-amber-500/30' : 'bg-slate-800 border-b border-slate-700/50'}`}>
        <div className="flex items-center gap-3">
          {isConfig ? (
            <FileText size={14} className="text-amber-400" />
          ) : (
            <Terminal size={14} className="text-slate-400" />
          )}
          <span className={`font-mono text-sm ${isConfig ? 'text-amber-400' : 'text-slate-400'}`}>
            {language || 'bash'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {runOn && (
            <span className="text-xs px-2 py-1 rounded bg-teal-500/20 text-teal-400 font-medium">
              {runOn}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-400" />}
          </button>
        </div>
      </div>
      <div className={`p-4 overflow-x-auto ${isConfig ? 'bg-slate-900/80' : 'bg-[#0f172a]'}`}>
        <pre className={`font-mono text-sm whitespace-pre-wrap ${isConfig ? 'text-amber-300' : 'text-emerald-400'}`}>
          {code}
        </pre>
      </div>
    </div>
  );
}

function AlertBox({ type, children }: { type: 'info' | 'warning' | 'danger' | 'success'; children: React.ReactNode }) {
  const styles = {
    info: { bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.3)', text: '#7dd3fc', icon: Info },
    warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#fcd34d', icon: AlertTriangle },
    danger: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#fca5a5', icon: AlertCircle },
    success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7', icon: CheckCircle },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div
      className="flex gap-3 p-4 rounded-lg my-4"
      style={{ backgroundColor: style.bg, border: `1px solid ${style.border}`, color: style.text }}
    >
      <Icon size={20} className="shrink-0 mt-0.5" />
      <div className="text-sm">{children}</div>
    </div>
  );
}

function StepItem({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="text-white font-semibold mb-2">{title}</h4>
        {children}
      </div>
    </div>
  );
}

function DirectoryGrid({ items }: { items: Array<{ title: string; path: string; color: string }> }) {
  return (
    <div className="grid grid-cols-3 gap-3 my-4">
      {items.map((item, idx) => {
        const colors = badgeColors[item.color] || badgeColors.slate;
        return (
          <div
            key={idx}
            className="p-3 rounded-lg"
            style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
          >
            <div className="font-semibold text-sm" style={{ color: colors.text }}>{item.title}</div>
            <div className="font-mono text-xs text-slate-400 mt-1">{item.path}</div>
          </div>
        );
      })}
    </div>
  );
}

function PortGrid({ items }: { items: Array<{ label: string; port: string; color: string }> }) {
  return (
    <div className="grid grid-cols-4 gap-3 my-4">
      {items.map((item, idx) => {
        const colors = badgeColors[item.color] || badgeColors.slate;
        return (
          <div
            key={idx}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700"
          >
            <span className="text-xs text-slate-400">{item.label}</span>
            <span className="font-mono font-bold" style={{ color: colors.text }}>{item.port}</span>
          </div>
        );
      })}
    </div>
  );
}

function TrafficFlow({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="flex items-center gap-2 flex-wrap px-4 py-3 bg-slate-800/50 rounded-lg my-4">
      {items.map((item, idx) => {
        const colors = badgeColors[item.color] || badgeColors.slate;
        return (
          <span key={idx} className="flex items-center gap-2">
            <span style={{ color: colors.text }}>{item.label}</span>
            {idx < items.length - 1 && <span className="text-slate-600">→</span>}
          </span>
        );
      })}
    </div>
  );
}

function TableDisplay({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-3 text-slate-400 font-semibold bg-slate-900/50 border-b border-slate-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-800/30 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 border-b border-slate-800 text-slate-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparisonGrid({ items }: { items: Array<{ title: string; description?: string; items?: string[]; color: string }> }) {
  return (
    <div className="grid grid-cols-2 gap-4 my-4">
      {items.map((item, idx) => {
        const colors = badgeColors[item.color] || badgeColors.slate;
        return (
          <div
            key={idx}
            className="p-5 rounded-xl bg-slate-800/50"
            style={{ border: `1px solid ${colors.border}` }}
          >
            <h4 className="font-semibold mb-3" style={{ color: colors.text }}>{item.title}</h4>
            {item.description && <p className="text-sm text-slate-400 mb-3">{item.description}</p>}
            {item.items && (
              <ul className="space-y-1.5">
                {item.items.map((li, liIdx) => (
                  <li key={liIdx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span dangerouslySetInnerHTML={{ __html: li }} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// SLIDE RENDERER
// ============================================================

function SlideRenderer({ slide }: { slide: PresentationSlide }) {
  const renderContent = (content: SlideContent, idx: number) => {
    switch (content.type) {
      case 'text':
        return <p key={idx} className="text-slate-300 mb-4" dangerouslySetInnerHTML={{ __html: content.content || '' }} />;
      
      case 'code':
        return <CodeBlock key={idx} code={content.content || ''} language={content.language} runOn={content.runOn} />;
      
      case 'config':
        return <CodeBlock key={idx} code={content.content || ''} language={content.language} runOn={content.runOn} isConfig />;
      
      case 'alert':
        return <AlertBox key={idx} type={content.alertType || 'info'}>{content.content}</AlertBox>;
      
      case 'step':
        return (
          <StepItem key={idx} number={content.stepNumber || idx + 1} title={content.items?.[0]?.title || ''}>
            {content.content && <p className="text-slate-400 text-sm">{content.content}</p>}
          </StepItem>
        );
      
      case 'server-badge':
        return (
          <div key={idx} className="flex flex-wrap gap-2 my-4">
            {content.items?.map((item, i) => (
              <ServerBadge key={i} hostname={item.title || ''} ip={item.value} role={item.color} />
            ))}
          </div>
        );
      
      case 'directory':
        return <DirectoryGrid key={idx} items={(content.items || []).map(i => ({ title: i.title || '', path: i.path || '', color: i.color || 'slate' }))} />;
      
      case 'ports':
        return <PortGrid key={idx} items={(content.items || []).map(i => ({ label: i.title || '', port: i.value || '', color: i.color || 'slate' }))} />;
      
      case 'traffic-flow':
        return <TrafficFlow key={idx} items={(content.items || []).map(i => ({ label: i.title || '', color: i.color || 'slate' }))} />;
      
      case 'table':
        return <TableDisplay key={idx} headers={content.headers || []} rows={content.rows || []} />;
      
      case 'grid':
        return <ComparisonGrid key={idx} items={(content.items || []).map(i => ({ title: i.title || '', description: i.description, items: i.path?.split('|'), color: i.color || 'slate' }))} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-8">
      {/* Badges */}
      {slide.badges && slide.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {slide.badges.map((b, i) => <Badge key={i} label={b.label} color={b.color} />)}
        </div>
      )}

      {/* Title */}
      <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
        {slide.title}
      </h2>
      
      {slide.subtitle && (
        <p className="text-slate-400 text-lg mb-6">{slide.subtitle}</p>
      )}

      {/* Content */}
      <div className="mt-6">
        {slide.content.map((c, i) => renderContent(c, i))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function HighClassPresentation({
  data,
  onClose,
  startSlide = 0,
  isFullscreen: initialFullscreen = false
}: HighClassPresentationProps) {
  const [currentSlide, setCurrentSlide] = useState(startSlide);
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);
  const [showNotes, setShowNotes] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < data.slides.length) {
      setCurrentSlide(index);
    }
  }, [data.slides.length]);

  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Space':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          if (isFullscreen) setIsFullscreen(false);
          else onClose?.();
          break;
        case 'f':
          setIsFullscreen(!isFullscreen);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen, onClose]);

  // Auto-play
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (currentSlide < data.slides.length - 1) {
          nextSlide();
        } else {
          setIsPlaying(false);
        }
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentSlide, nextSlide, data.slides.length]);

  const slide = data.slides[currentSlide];
  const progress = ((currentSlide + 1) / data.slides.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex ${isFullscreen ? '' : 'p-4'}`}
      style={{ backgroundColor: '#0f172a' }}
    >
      <div className={`flex w-full h-full ${isFullscreen ? '' : 'rounded-2xl overflow-hidden border border-slate-700/50'}`}>
        {/* Sidebar Navigation */}
        <div className="w-72 bg-slate-800/50 border-r border-slate-700/50 flex flex-col shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                <Database size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-white font-bold text-sm truncate">{data.title}</h1>
                {data.subtitle && <p className="text-slate-500 text-xs truncate">{data.subtitle}</p>}
              </div>
            </div>
            {data.badges && (
              <div className="flex flex-wrap gap-1">
                {data.badges.map((b, i) => <Badge key={i} label={b.label} color={b.color} />)}
              </div>
            )}
          </div>

          {/* Slide List */}
          <nav className="flex-1 overflow-y-auto p-2">
            {data.slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => goToSlide(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm mb-1 transition-all flex items-center gap-2 ${
                  idx === currentSlide
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <span className="text-xs opacity-60 w-5">{idx + 1}.</span>
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </nav>

          {/* Controls */}
          <div className="p-3 border-t border-slate-700/50 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg text-sm font-medium hover:bg-teal-500/30 transition-colors"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? 'Pause' : 'Auto-Play'}
              </button>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  showNotes ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-700/50 text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700/50 bg-slate-800/30 shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm">
                Slide {currentSlide + 1} of {data.slides.length}
              </span>
              <div className="w-48 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Slide Content */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <SlideRenderer slide={slide} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Speaker Notes */}
          {showNotes && slide.speakerNotes && (
            <div className="border-t border-slate-700/50 bg-slate-800/50 p-4 max-h-32 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={14} className="text-purple-400" />
                <span className="text-purple-400 text-xs font-semibold uppercase">Speaker Notes</span>
              </div>
              <p className="text-sm text-slate-400">{slide.speakerNotes}</p>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50 bg-slate-800/30 shrink-0">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} /> Previous
            </button>

            <div className="flex gap-1.5">
              {data.slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentSlide
                      ? 'bg-teal-400 scale-125'
                      : idx < currentSlide
                      ? 'bg-teal-600'
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              disabled={currentSlide === data.slides.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-600 hover:to-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

