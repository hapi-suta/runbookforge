'use client'

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  Minimize2,
  Grid,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

// Color palette matching PPTX generator
const colors = {
  navy: "#1e3a5f",
  teal: "#0d9488",
  light: "#f8fafc",
  slate: "#1e293b",
  muted: "#64748b",
  lightMuted: "#94a3b8",
  success: "#10b981",
  successBg: "#d1fae5",
  successDark: "#065f46",
  warning: "#f59e0b",
  warningBg: "#fef3c7",
  warningDark: "#92400e",
  danger: "#ef4444",
  dangerBg: "#fee2e2",
  dangerDark: "#991b1b",
  blue: "#3b82f6",
  blueBg: "#dbeafe",
  white: "#ffffff",
  border: "#e2e8f0"
};

interface SlideItem {
  title: string;
  description?: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
}

interface SlideColumn {
  title: string;
  items: (SlideItem | string)[];
  color?: string;
}

export interface SlideData {
  title: string;
  layout: string;
  subtitle?: string;
  content?: string;
  leftColumn?: SlideColumn;
  rightColumn?: SlideColumn;
  columns?: SlideColumn[];
  items?: SlideItem[];
  problems?: { problem: string; solution: string }[];
  operations?: { title: string; description: string; command?: string }[];
  tableData?: { headers: string[]; rows: string[][] };
  keyInsight?: { title: string; content: string };
  speakerNotes?: string;
}

export interface PresentationData {
  title: string;
  subtitle?: string;
  slides: SlideData[];
}

interface PresentationViewerProps {
  presentation: PresentationData;
  onClose?: () => void;
  showHeader?: boolean;
  initialFullscreen?: boolean;
}

// ============================================
// SLIDE COMPONENTS
// ============================================

const TitleSlide = ({ slide }: { slide: SlideData }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8 relative" style={{ backgroundColor: colors.navy }}>
    <div className="w-24 h-1 mb-6" style={{ backgroundColor: colors.teal }} />
    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 px-4">{slide.title}</h1>
    {slide.subtitle && (
      <p className="text-lg md:text-2xl mb-4" style={{ color: colors.teal }}>{slide.subtitle}</p>
    )}
    {slide.content && (
      <p className="text-xs md:text-sm mt-4 max-w-2xl" style={{ color: colors.lightMuted }}>{slide.content}</p>
    )}
    <div className="absolute bottom-6 left-6">
      <p className="text-sm font-semibold" style={{ color: colors.lightMuted }}>RunbookForge</p>
      <p className="text-xs" style={{ color: colors.muted }}>a SUTA company</p>
    </div>
  </div>
);

const AgendaSlide = ({ slide }: { slide: SlideData }) => {
  const leftItems = slide.leftColumn?.items || [];
  const rightItems = slide.rightColumn?.items || [];
  
  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: colors.light }}>
      <div className="px-6 py-4" style={{ backgroundColor: colors.navy }}>
        <h1 className="text-xl md:text-2xl font-bold text-white">{slide.title}</h1>
      </div>
      <div className="flex-1 p-6 grid grid-cols-2 gap-6 overflow-auto">
        <div className="space-y-2">
          {leftItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: colors.teal }}>
                {i + 1}
              </div>
              <span className="text-xs md:text-sm" style={{ color: colors.slate }}>
                {typeof item === 'string' ? item : item.title}
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {rightItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: colors.warning }}>
                {leftItems.length + i + 1}
              </div>
              <span className="text-xs md:text-sm" style={{ color: colors.slate }}>
                {typeof item === 'string' ? item : item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PainPointsSlide = ({ slide }: { slide: SlideData }) => (
  <div className="h-full flex flex-col" style={{ backgroundColor: colors.light }}>
    <div className="px-6 py-4" style={{ backgroundColor: colors.navy }}>
      <h1 className="text-xl md:text-2xl font-bold text-white">{slide.title}</h1>
    </div>
    <div className="flex-1 p-4 space-y-2 overflow-auto">
      {slide.items?.slice(0, 6).map((item, i) => (
        <div key={i} className="p-3 rounded border-l-4" style={{ backgroundColor: colors.dangerBg, borderColor: colors.danger }}>
          <h3 className="font-bold text-xs md:text-sm" style={{ color: colors.dangerDark }}>{item.title}</h3>
          {item.description && <p className="text-xs mt-1" style={{ color: '#7f1d1d' }}>{item.description}</p>}
        </div>
      ))}
    </div>
  </div>
);

const TwoColumnSlide = ({ slide }: { slide: SlideData }) => (
  <div className="h-full flex flex-col" style={{ backgroundColor: colors.light }}>
    <div className="px-6 py-4" style={{ backgroundColor: colors.navy }}>
      <h1 className="text-xl md:text-2xl font-bold text-white">{slide.title}</h1>
    </div>
    <div className="flex-1 p-4 grid grid-cols-2 gap-3 overflow-auto">
      <div className="rounded-lg p-3" style={{ backgroundColor: colors.successBg }}>
        <h3 className="font-bold text-xs mb-2" style={{ color: colors.success }}>{slide.leftColumn?.title || 'BENEFITS'}</h3>
        <div className="space-y-1">
          {slide.leftColumn?.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle size={12} style={{ color: colors.success }} className="mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium" style={{ color: colors.successDark }}>
                  {typeof item === 'string' ? item : item.title}
                </span>
                {typeof item !== 'string' && item.description && (
                  <p className="text-xs" style={{ color: colors.muted }}>{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg p-3" style={{ backgroundColor: colors.warningBg }}>
        <h3 className="font-bold text-xs mb-2" style={{ color: colors.warning }}>{slide.rightColumn?.title || 'CONSIDERATIONS'}</h3>
        <div className="space-y-1">
          {slide.rightColumn?.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertTriangle size={12} style={{ color: colors.warning }} className="mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium" style={{ color: colors.warningDark }}>
                  {typeof item === 'string' ? item : item.title}
                </span>
                {typeof item !== 'string' && item.description && (
                  <p className="text-xs" style={{ color: colors.muted }}>{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    {slide.keyInsight && (
      <div className="mx-4 mb-3 p-2 rounded" style={{ backgroundColor: colors.navy }}>
        <span className="text-xs font-bold" style={{ color: colors.teal }}>{slide.keyInsight.title}</span>
        <span className="text-xs ml-3 text-white">{slide.keyInsight.content}</span>
      </div>
    )}
  </div>
);

const ComparisonSlide = ({ slide }: { slide: SlideData }) => (
  <div className="h-full flex flex-col" style={{ backgroundColor: colors.light }}>
    <div className="px-6 py-4" style={{ backgroundColor: colors.navy }}>
      <h1 className="text-xl md:text-2xl font-bold text-white">{slide.title}</h1>
    </div>
    <div className="flex-1 p-4 grid grid-cols-2 gap-3 overflow-auto">
      <div className="rounded-lg p-3 border" style={{ borderColor: colors.border, backgroundColor: colors.white }}>
        <h3 className="font-bold text-xs mb-2" style={{ color: colors.danger }}>{slide.leftColumn?.title || 'CHALLENGES'}</h3>
        <div className="space-y-1">
          {slide.leftColumn?.items.map((item, i) => (
            <div key={i} className="text-xs" style={{ color: colors.slate }}>
              • {typeof item === 'string' ? item : item.title}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg p-3 border" style={{ borderColor: colors.border, backgroundColor: colors.white }}>
        <h3 className="font-bold text-xs mb-2" style={{ color: colors.success }}>{slide.rightColumn?.title || 'SOLUTIONS'}</h3>
        <div className="space-y-1">
          {slide.rightColumn?.items.map((item, i) => (
            <div key={i} className="text-xs" style={{ color: colors.slate }}>
              ✓ {typeof item === 'string' ? item : item.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ThreeColumnSlide = ({ slide }: { slide: SlideData }) => (
  <div className="h-full flex flex-col" style={{ backgroundColor: colors.light }}>
    <div className="px-6 py-4" style={{ backgroundColor: colors.navy }}>
      <h1 className="text-xl md:text-2xl font-bold text-white">{slide.title}</h1>
    </div>
    <div className="flex-1 p-4 grid grid-cols-3 gap-3 overflow-auto">
      {slide.columns?.map((col, i) => (
        <div key={i} className="rounded-lg p-3 border" style={{ borderColor: colors.border, backgroundColor: colors.white }}>
          <h3 className="font-bold text-xs mb-2" style={{ color: colors.navy }}>{col.title}</h3>
          <div className="space-y-1">
            {col.items.map((item, j) => (
              <div key={j} className="flex items-start gap-1">
                <CheckCircle size={10} style={{ color: colors.success }} className="mt-0.5 flex-shrink-0" />
                <span className="text-xs" style={{ color: colors.slate }}>{typeof item === 'string' ? item : item.title}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    {slide.keyInsight && (
      <div className="mx-4 mb-3 p-2 rounded" style={{ backgroundColor: colors.navy }}>
        <span className="text-xs font-bold" style={{ color: colors.teal }}>{slide.keyInsight.title}</span>
        <span className="text-xs ml-3 text-white">{slide.keyInsight.content}</span>
      </div>
    )}
  </div>
);

const TableSlide = ({ slide }: { slide: SlideData }) => (
  <div className="h-full flex flex-col" style={{ backgroundColor: colors.light }}>
    <div className="px-6 py-4" style={{ backgroundColor: colors.navy }}>
      <h1 className="text-xl md:text-2xl font-bold text-white">{slide.title}</h1>
    </div>
    <div className="flex-1 p-4 overflow-auto">
      {slide.tableData && (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {slide.tableData.headers.map((h, i) => (
                <th key={i} className="p-2 text-left font-bold border" style={{ 
                  backgroundColor: i === 0 ? colors.light : colors.navy,
                  color: i === 0 ? colors.slate : colors.white,
                  borderColor: colors.border
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slide.tableData.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => {
                  const isGood = cell.includes('✓') || cell.toLowerCase().includes('yes');
                  const isBad = cell.includes('✗') || cell.toLowerCase().includes('no');
                  return (
                    <td key={j} className="p-2 border" style={{ 
                      borderColor: colors.border,
                      color: isGood ? colors.success : isBad ? colors.danger : colors.slate,
                      fontWeight: isGood ? 'bold' : 'normal'
                    }}>{cell}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

const ProblemsSlide = ({ slide }: { slide: SlideData }) => (
  <div className="h-full flex flex-col" style={{ backgroundColor: colors.light }}>
    <div className="px-6 py-4" style={{ backgroundColor: colors.navy }}>
      <h1 className="text-xl md:text-2xl font-bold text-white">{slide.title}</h1>
    </div>
    <div className="flex-1 p-4 space-y-2 overflow-auto">
      {slide.problems?.slice(0, 5).map((item, i) => (
        <div key={i} className="flex items-stretch gap-2">
          <div className="flex-1 p-2 rounded" style={{ backgroundColor: colors.dangerBg }}>
            <span className="text-[9px] font-bold block" style={{ color: colors.danger }}>PROBLEM</span>
            <p className="text-xs font-medium" style={{ color: colors.dangerDark }}>{item.problem}</p>
          </div>
          <div className="flex items-center">
            <ArrowRight size={16} style={{ color: colors.muted }} />
          </div>
          <div className="flex-1 p-2 rounded" style={{ backgroundColor: colors.successBg }}>
            <span className="text-[9px] font-bold block" style={{ color: colors.success }}>SOLUTION</span>
            <p className="text-xs" style={{ color: colors.successDark }}>{item.solution}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const OperationsSlide = ({ slide }: { slide: SlideData }) => (
  <div className="h-full flex flex-col" style={{ backgroundColor: colors.light }}>
    <div className="px-6 py-4" style={{ backgroundColor: colors.navy }}>
      <h1 className="text-xl md:text-2xl font-bold text-white">{slide.title}</h1>
    </div>
    <div className="flex-1 p-4 space-y-2 overflow-auto">
      {slide.operations?.slice(0, 5).map((op, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded border" style={{ borderColor: colors.border, backgroundColor: colors.white }}>
          <div className="flex-shrink-0 w-1/4">
            <h4 className="text-xs font-bold" style={{ color: colors.navy }}>{op.title}</h4>
            <p className="text-[10px]" style={{ color: colors.muted }}>{op.description}</p>
          </div>
          {op.command && (
            <div className="flex-1 p-2 rounded font-mono text-[10px] overflow-x-auto" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
              {op.command}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const ContentSlide = ({ slide }: { slide: SlideData }) => (
  <div className="h-full flex flex-col" style={{ backgroundColor: colors.light }}>
    <div className="px-6 py-4" style={{ backgroundColor: colors.navy }}>
      <h1 className="text-xl md:text-2xl font-bold text-white">{slide.title}</h1>
    </div>
    <div className="flex-1 p-4 space-y-2 overflow-auto">
      {slide.items?.map((item, i) => {
        const bgColor = item.type === 'success' ? colors.successBg :
                        item.type === 'warning' ? colors.warningBg :
                        item.type === 'danger' ? colors.dangerBg : colors.blueBg;
        const textColor = item.type === 'success' ? colors.successDark :
                          item.type === 'warning' ? colors.warningDark :
                          item.type === 'danger' ? colors.dangerDark : colors.navy;
        const accentColor = item.type === 'success' ? colors.success :
                           item.type === 'warning' ? colors.warning :
                           item.type === 'danger' ? colors.danger : colors.blue;
        return (
          <div key={i} className="p-3 rounded border-l-4" style={{ backgroundColor: bgColor, borderColor: accentColor }}>
            <h3 className="font-bold text-xs" style={{ color: textColor }}>{item.title}</h3>
            {item.description && <p className="text-xs mt-1" style={{ color: colors.muted }}>{item.description}</p>}
          </div>
        );
      })}
      {!slide.items && slide.content && (
        <div className="prose prose-sm max-w-none">
          {slide.content.split('\n').map((line, i) => (
            <p key={i} className="text-sm" style={{ color: colors.slate }}>{line}</p>
          ))}
        </div>
      )}
    </div>
    {slide.keyInsight && (
      <div className="mx-4 mb-3 p-2 rounded" style={{ backgroundColor: colors.navy }}>
        <span className="text-xs font-bold" style={{ color: colors.teal }}>{slide.keyInsight.title}</span>
        <span className="text-xs ml-3 text-white">{slide.keyInsight.content}</span>
      </div>
    )}
  </div>
);

const TakeawaysSlide = ({ slide }: { slide: SlideData }) => (
  <div className="h-full flex flex-col p-6" style={{ backgroundColor: colors.navy }}>
    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{slide.title}</h1>
    <div className="w-16 h-1 mb-4" style={{ backgroundColor: colors.teal }} />
    <div className="flex-1 space-y-3 overflow-auto">
      {slide.items?.slice(0, 7).map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: colors.teal }}>
            {i + 1}
          </div>
          <span className="text-white text-xs md:text-sm">{item.title}</span>
        </div>
      ))}
    </div>
  </div>
);

const QuestionsSlide = ({ slide }: { slide: SlideData }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-6 relative" style={{ backgroundColor: colors.navy }}>
    <div className="w-24 h-1 mb-4" style={{ backgroundColor: colors.teal }} />
    <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">Questions?</h1>
    <p className="text-base md:text-lg" style={{ color: colors.lightMuted }}>{slide.subtitle || 'Thank you for your attention'}</p>
    {slide.items && slide.items.length > 0 && (
      <div className="flex gap-3 mt-6 flex-wrap justify-center">
        {slide.items.map((item, i) => (
          <div key={i} className="px-4 py-2 rounded" style={{ backgroundColor: '#1a3552', border: '1px solid #334155' }}>
            <span className="text-xs font-bold" style={{ color: colors.teal }}>{item.title.toUpperCase()}</span>
            {item.description && <p className="text-xs mt-1" style={{ color: colors.lightMuted }}>{item.description}</p>}
          </div>
        ))}
      </div>
    )}
    <div className="absolute bottom-6 left-6">
      <p className="text-sm font-semibold" style={{ color: colors.lightMuted }}>RunbookForge</p>
      <p className="text-xs" style={{ color: colors.muted }}>a SUTA company</p>
    </div>
  </div>
);

const SlideContent = ({ slide }: { slide: SlideData }) => {
  switch (slide.layout) {
    case 'title':
      return <TitleSlide slide={slide} />;
    case 'agenda':
      return <AgendaSlide slide={slide} />;
    case 'pain-points':
      return <PainPointsSlide slide={slide} />;
    case 'two-column':
      return <TwoColumnSlide slide={slide} />;
    case 'comparison':
      return <ComparisonSlide slide={slide} />;
    case 'three-column':
      return <ThreeColumnSlide slide={slide} />;
    case 'table':
      return <TableSlide slide={slide} />;
    case 'problems':
      return <ProblemsSlide slide={slide} />;
    case 'operations':
      return <OperationsSlide slide={slide} />;
    case 'takeaways':
      return <TakeawaysSlide slide={slide} />;
    case 'questions':
      return <QuestionsSlide slide={slide} />;
    default:
      return <ContentSlide slide={slide} />;
  }
};

// ============================================
// MAIN PRESENTATION VIEWER COMPONENT
// ============================================
export default function PresentationViewer({ 
  presentation, 
  onClose, 
  showHeader = true,
  initialFullscreen = false
}: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);
  const [showThumbnails, setShowThumbnails] = useState(false);

  const slides = presentation.slides || [];
  const totalSlides = slides.length;

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlide(index);
    }
  }, [totalSlides]);

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  }, [currentSlide, totalSlides]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else if (showThumbnails) {
          setShowThumbnails(false);
        } else if (onClose) {
          onClose();
        }
      } else if (e.key === 'f') {
        setIsFullscreen(!isFullscreen);
      } else if (e.key === 'g') {
        setShowThumbnails(!showThumbnails);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen, showThumbnails, onClose]);

  if (totalSlides === 0) {
    return (
      <div className="min-h-[400px] bg-slate-900 flex items-center justify-center text-white rounded-xl">
        <p>No slides in this presentation</p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900 ${isFullscreen ? 'fixed inset-0 z-50' : 'rounded-xl overflow-hidden'}`}>
      {/* Header */}
      {showHeader && !isFullscreen && (
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onClose && (
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            )}
            <h1 className="text-white font-medium truncate">{presentation.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowThumbnails(!showThumbnails)} className="p-2 text-slate-400 hover:text-white transition-colors" title="Grid view (G)">
              <Grid size={20} />
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-slate-400 hover:text-white transition-colors" title="Fullscreen (F)">
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative flex items-center justify-center p-4" style={{ height: isFullscreen ? '100vh' : 'calc(70vh)' }}>
        {/* Prev Button */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="absolute left-4 z-10 p-3 rounded-full bg-slate-800/80 text-white disabled:opacity-30 hover:bg-slate-700 transition-all"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Slide Container */}
        <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl relative">
          {/* Slide Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-800/90 text-white text-sm font-bold rounded-full">
              {currentSlide + 1} / {totalSlides}
            </span>
            <span className="px-3 py-1 bg-slate-700/90 text-slate-300 text-xs rounded-full uppercase">
              {slides[currentSlide]?.layout || 'content'}
            </span>
          </div>

          {/* Fullscreen Controls */}
          {isFullscreen && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className="p-2 bg-slate-800/80 text-white rounded-full hover:bg-slate-700 transition-colors"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-slate-800/80 text-white rounded-full hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Slide Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <SlideContent slide={slides[currentSlide]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="absolute right-4 z-10 p-3 rounded-full bg-slate-800/80 text-white disabled:opacity-30 hover:bg-slate-700 transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Speaker Notes */}
      {slides[currentSlide]?.speakerNotes && (
        <div className="mx-4 mb-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
          <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Speaker Notes</h4>
          <p className="text-sm text-slate-300">{slides[currentSlide].speakerNotes}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="h-1 bg-slate-700">
        <div 
          className="h-full transition-all duration-300"
          style={{ 
            width: `${((currentSlide + 1) / totalSlides) * 100}%`,
            backgroundColor: colors.teal
          }}
        />
      </div>

      {/* Thumbnail Grid */}
      <AnimatePresence>
        {showThumbnails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 overflow-auto p-8"
            onClick={() => setShowThumbnails(false)}
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-white text-xl font-bold mb-6">All Slides</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {slides.map((slide, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(i);
                      setShowThumbnails(false);
                    }}
                    className={`aspect-video rounded-lg overflow-hidden border-2 ${
                      i === currentSlide ? 'border-teal-400' : 'border-slate-600'
                    } hover:border-teal-400/50 transition-colors relative`}
                  >
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                      <div className="text-center p-2">
                        <span className="text-teal-400 text-xs font-bold">Slide {i + 1}</span>
                        <p className="text-white text-xs mt-1 line-clamp-2">{slide.title}</p>
                        <span className="text-slate-500 text-[10px] uppercase">{slide.layout}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

