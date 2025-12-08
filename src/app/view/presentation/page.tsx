'use client'

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  Minimize2,
  Grid,
  Play,
  Pause,
  Loader2,
  AlertTriangle,
  Info,
  Lightbulb
} from 'lucide-react';
import CodeBlock from '@/components/CodeBlock';

interface Slide {
  title: string;
  content: string;
  layout: string;
  speakerNotes?: string;
}

interface DocumentData {
  id: string;
  title: string;
  metadata: {
    slides: Slide[];
    style?: string;
  };
}

// Parse content into structured sections
const parseContent = (content: string) => {
  if (!content) return { bullets: [], sections: [], callouts: [] };
  
  const bullets: string[] = [];
  const sections: { title: string; items: string[] }[] = [];
  const callouts: { type: string; text: string }[] = [];
  
  const lines = content.split(/[•\n]/).filter(l => l.trim());
  let currentSection: { title: string; items: string[] } | null = null;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    if (trimmed.toLowerCase().includes('warning:') || trimmed.toLowerCase().includes('caution:')) {
      callouts.push({ type: 'warning', text: trimmed.replace(/warning:|caution:/i, '').trim() });
    } else if (trimmed.toLowerCase().includes('note:') || trimmed.toLowerCase().includes('tip:')) {
      callouts.push({ type: 'info', text: trimmed.replace(/note:|tip:/i, '').trim() });
    } else if (trimmed.toLowerCase().includes('critical:') || trimmed.toLowerCase().includes('important:')) {
      callouts.push({ type: 'critical', text: trimmed.replace(/critical:|important:/i, '').trim() });
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: trimmed.replace(/\*\*/g, ''), items: [] };
    } else if (currentSection) {
      currentSection.items.push(trimmed);
    } else {
      bullets.push(trimmed);
    }
  });
  
  if (currentSection) sections.push(currentSection);
  
  return { bullets, sections, callouts };
};

// Slide component for different layouts
const SlideContent = ({ slide, slideNumber, totalSlides }: { slide: Slide; slideNumber: number; totalSlides: number }) => {
  const { bullets, sections, callouts } = parseContent(slide.content);
  
  // Title Slide
  if (slide.layout === 'title') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
        >
          {slide.title}
        </motion.h1>
        {slide.content && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl"
          >
            {slide.content}
          </motion.p>
        )}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-slate-600"
        >
          <span className="text-sm">Slide {slideNumber} of {totalSlides}</span>
          <span className="text-sm">Press → to continue</span>
        </motion.div>
      </div>
    );
  }

  // Section Header Slide
  if (slide.layout === 'section') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 p-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-1 bg-teal-400 mb-8 rounded-full"
        />
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4"
        >
          {slide.title}
        </motion.h1>
        {slide.content && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-teal-200 max-w-2xl"
          >
            {slide.content}
          </motion.p>
        )}
      </div>
    );
  }

  // Two Column Layout
  if (slide.layout === 'two-column' || sections.length >= 2) {
    const leftSection = sections[0] || { title: '', items: bullets.slice(0, Math.ceil(bullets.length / 2)) };
    const rightSection = sections[1] || { title: '', items: bullets.slice(Math.ceil(bullets.length / 2)) };
    
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-12 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{slide.title}</h1>
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-8 p-12">
          <div>
            {leftSection.title && (
              <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider mb-4">{leftSection.title}</h2>
            )}
            <div className="space-y-3">
              {(leftSection.items || []).map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg text-white shadow-lg"
                >
                  <p className="font-medium">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div>
            {rightSection.title && (
              <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider mb-4">{rightSection.title}</h2>
            )}
            <div className="space-y-3">
              {(rightSection.items || []).map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-white border-2 border-slate-200 rounded-lg shadow-sm"
                >
                  <p className="text-slate-700 font-medium">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {callouts.length > 0 && (
          <div className="px-12 pb-8">
            {callouts.map((callout, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  callout.type === 'warning' ? 'bg-amber-100 border-l-4 border-amber-500' :
                  callout.type === 'critical' ? 'bg-red-100 border-l-4 border-red-500' :
                  'bg-blue-100 border-l-4 border-blue-500'
                }`}
              >
                {callout.type === 'warning' && <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />}
                {callout.type === 'critical' && <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />}
                {callout.type === 'info' && <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />}
                <p className={`font-medium ${
                  callout.type === 'warning' ? 'text-amber-800' :
                  callout.type === 'critical' ? 'text-red-800' :
                  'text-blue-800'
                }`}>{callout.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Diagram/Visual Layout
  if (slide.layout === 'diagram') {
    return (
      <div className="h-full flex flex-col bg-slate-50">
        <div className="bg-gradient-to-r from-indigo-800 to-purple-800 px-12 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{slide.title}</h1>
        </div>
        
        <div className="flex-1 p-12">
          <div className="grid grid-cols-3 gap-6 h-full">
            {bullets.slice(0, 6).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-xl shadow-lg flex flex-col justify-center ${
                  i % 3 === 0 ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' :
                  i % 3 === 1 ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white' :
                  'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                }`}
              >
                <div className="text-4xl font-bold mb-2">{i + 1}</div>
                <p className="font-medium">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Code Layout
  if (slide.layout === 'code') {
    return (
      <div className="h-full flex flex-col bg-slate-900">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-12 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">{slide.title}</h1>
        </div>
        
        <div className="flex-1 p-8 overflow-auto">
          <CodeBlock 
            code={slide.content} 
            language="bash"
            showLineNumbers={true}
          />
        </div>
      </div>
    );
  }

  // Bullets/Content Layout (Default)
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="px-12 pt-10 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-bold rounded-full">
            {slideNumber} / {totalSlides}
          </span>
          <span className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-full uppercase">
            {slide.layout}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">{slide.title}</h1>
      </div>
      
      <div className="flex-1 px-12 pb-10 overflow-auto">
        {sections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`p-5 rounded-xl ${
                  i % 4 === 0 ? 'bg-teal-500/20 border border-teal-500/30' :
                  i % 4 === 1 ? 'bg-purple-500/20 border border-purple-500/30' :
                  i % 4 === 2 ? 'bg-amber-500/20 border border-amber-500/30' :
                  'bg-blue-500/20 border border-blue-500/30'
                }`}
              >
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${
                  i % 4 === 0 ? 'text-teal-400' :
                  i % 4 === 1 ? 'text-purple-400' :
                  i % 4 === 2 ? 'text-amber-400' :
                  'text-blue-400'
                }`}>{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-slate-300">
                      <span className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
                        i % 4 === 0 ? 'bg-teal-400' :
                        i % 4 === 1 ? 'bg-purple-400' :
                        i % 4 === 2 ? 'bg-amber-400' :
                        'bg-blue-400'
                      }`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {bullets.map((bullet, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4"
              >
                <span className="w-2 h-2 mt-2.5 bg-amber-500 rounded-full flex-shrink-0" />
                <span className="text-lg text-slate-300">{bullet}</span>
              </motion.div>
            ))}
          </div>
        )}
        
        {callouts.length > 0 && (
          <div className="mt-6 space-y-3">
            {callouts.map((callout, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  callout.type === 'warning' ? 'bg-amber-500/20 border border-amber-500/30' :
                  callout.type === 'critical' ? 'bg-red-500/20 border border-red-500/30' :
                  'bg-blue-500/20 border border-blue-500/30'
                }`}
              >
                {callout.type === 'warning' && <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />}
                {callout.type === 'critical' && <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />}
                {callout.type === 'info' && <Lightbulb className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />}
                <p className={`${
                  callout.type === 'warning' ? 'text-amber-200' :
                  callout.type === 'critical' ? 'text-red-200' :
                  'text-blue-200'
                }`}>{callout.text}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function PresentationContent() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('id');
  
  const [docData, setDocData] = useState<DocumentData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!documentId) {
      setError('No document ID provided');
      setIsLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents?id=${documentId}`);
        if (!response.ok) throw new Error('Document not found');
        
        const docs = await response.json();
        const doc = Array.isArray(docs) ? docs.find((d: DocumentData) => d.id === documentId) : docs;
        
        if (!doc) throw new Error('Document not found');
        
        setDocData(doc);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load presentation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  const toggleFullscreen = useCallback(() => {
    if (!window.document.fullscreenElement) {
      window.document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      window.document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!docData?.metadata?.slides) return;
    
    const totalSlides = docData.metadata.slides.length;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        setCurrentSlide(prev => Math.max(prev - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setCurrentSlide(0);
        break;
      case 'End':
        e.preventDefault();
        setCurrentSlide(totalSlides - 1);
        break;
      case 'Escape':
        if (isFullscreen) window.document.exitFullscreen?.();
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'g':
      case 'G':
        setShowThumbnails(prev => !prev);
        break;
      case 'n':
      case 'N':
        setShowNotes(prev => !prev);
        break;
    }
  }, [docData, isFullscreen, toggleFullscreen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isPlaying || !docData?.metadata?.slides) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev >= docData.metadata.slides.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, docData]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!window.document.fullscreenElement);
    window.document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => window.document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error || !docData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || 'Presentation not found'}</p>
          <button onClick={() => window.close()} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
            Close
          </button>
        </div>
      </div>
    );
  }

  const slides = docData.metadata?.slides || [];
  const currentSlideData = slides[currentSlide];
  const totalSlides = slides.length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col select-none">
      {/* Top toolbar - hidden in fullscreen unless hovered */}
      <div className={`${isFullscreen ? 'opacity-0 hover:opacity-100 absolute top-0 left-0 right-0 z-50 transition-opacity duration-300' : ''} h-12 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4`}>
        <div className="flex items-center gap-4">
          <button onClick={() => window.close()} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
          <h1 className="text-white font-medium truncate max-w-md">{docData.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-2 rounded-lg transition-colors ${showThumbnails ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg transition-colors ${isPlaying ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      <div className={`flex-1 flex relative overflow-hidden ${isFullscreen ? 'h-screen' : ''}`}>
        <AnimatePresence>
          {showThumbnails && !isFullscreen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-slate-900 border-r border-slate-800 overflow-y-auto flex-shrink-0"
            >
              <div className="p-3 space-y-2">
                {slides.map((slide, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      currentSlide === index 
                        ? 'bg-amber-500/20 border-2 border-amber-500' 
                        : 'bg-slate-800 hover:bg-slate-700 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${currentSlide === index ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        {index + 1}
                      </span>
                      <span className="text-xs text-slate-400 truncate">{slide.layout}</span>
                    </div>
                    <p className="text-sm text-white truncate">{slide.title}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`flex-1 flex items-center justify-center relative ${isFullscreen ? 'p-0' : 'p-4 md:p-8'}`}>
          {/* Navigation buttons */}
          <button
            onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            className={`absolute left-2 md:left-4 p-2 md:p-3 bg-slate-800/70 hover:bg-slate-800 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10 ${isFullscreen ? 'opacity-0 hover:opacity-100' : ''}`}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={() => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1))}
            disabled={currentSlide === totalSlides - 1}
            className={`absolute right-2 md:right-4 p-2 md:p-3 bg-slate-800/70 hover:bg-slate-800 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10 ${isFullscreen ? 'opacity-0 hover:opacity-100' : ''}`}
          >
            <ChevronRight size={24} />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`${isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl aspect-[16/9] rounded-xl shadow-2xl border border-slate-700'} overflow-hidden`}
            >
              <SlideContent 
                slide={currentSlideData} 
                slideNumber={currentSlide + 1} 
                totalSlides={totalSlides} 
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showNotes && currentSlideData?.speakerNotes && !isFullscreen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 p-4 max-h-32 overflow-auto"
            >
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-2">Speaker Notes</h3>
              <p className="text-sm text-slate-300">{currentSlideData.speakerNotes}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar - hidden in fullscreen */}
      {!isFullscreen && (
        <div className="h-12 bg-slate-900/90 backdrop-blur border-t border-slate-800 flex items-center justify-between px-4">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${showNotes ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            Notes
          </button>

          <div className="flex-1 max-w-lg mx-4">
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
              />
            </div>
          </div>

          <div className="text-sm text-slate-500">
            {currentSlide + 1} / {totalSlides}
          </div>
        </div>
      )}
      
      {/* Fullscreen slide counter - subtle overlay */}
      {isFullscreen && (
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 text-white/70 text-sm rounded-full opacity-0 hover:opacity-100 transition-opacity">
          {currentSlide + 1} / {totalSlides}
        </div>
      )}
    </div>
  );
}

export default function PresentationViewer() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={48} className="text-amber-500 animate-spin" />
      </div>
    }>
      <PresentationContent />
    </Suspense>
  );
}
