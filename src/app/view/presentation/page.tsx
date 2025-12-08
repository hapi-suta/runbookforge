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
  Loader2
} from 'lucide-react';

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

  // Fetch document data
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

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!window.document.fullscreenElement) {
      window.document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      window.document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard navigation
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
        if (isFullscreen) {
          window.document.exitFullscreen?.();
        }
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

  // Auto-play functionality
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

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!window.document.fullscreenElement);
    };
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
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const slides = docData.metadata?.slides || [];
  const currentSlideData = slides[currentSlide];
  const totalSlides = slides.length;

  const getLayoutStyles = (layout: string) => {
    switch (layout) {
      case 'title':
      case 'section':
        return 'items-center justify-center text-center';
      default:
        return 'items-start justify-center';
    }
  };

  const getTitleSize = (layout: string) => {
    switch (layout) {
      case 'title':
        return 'text-5xl md:text-7xl font-bold';
      case 'section':
        return 'text-4xl md:text-6xl font-bold';
      default:
        return 'text-3xl md:text-4xl font-bold';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col select-none">
      {/* Top Bar */}
      <div className="h-12 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.close()}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
          <h1 className="text-white font-medium truncate max-w-md">{docData.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-2 rounded-lg transition-colors ${showThumbnails ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            title="Slide Overview (G)"
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg transition-colors ${isPlaying ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            title={isPlaying ? 'Pause' : 'Auto-play'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Thumbnail Sidebar */}
        <AnimatePresence>
          {showThumbnails && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-slate-900 border-r border-slate-800 overflow-y-auto"
            >
              <div className="p-2 space-y-2">
                {slides.map((slide, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-full p-2 rounded-lg text-left transition-all ${
                      currentSlide === index 
                        ? 'bg-amber-500/20 border-2 border-amber-500' 
                        : 'bg-slate-800 hover:bg-slate-700 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${currentSlide === index ? 'text-amber-400' : 'text-slate-500'}`}>
                        {index + 1}
                      </span>
                      <span className="text-xs text-slate-400 truncate">{slide.layout}</span>
                    </div>
                    <p className="text-xs text-white truncate">{slide.title}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slide Area */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            className="absolute left-4 p-3 bg-slate-800/50 hover:bg-slate-800 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={() => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1))}
            disabled={currentSlide === totalSlides - 1}
            className="absolute right-4 p-3 bg-slate-800/50 hover:bg-slate-800 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10"
          >
            <ChevronRight size={24} />
          </button>

          {/* Slide Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl aspect-[16/9] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden relative"
            >
              <div className={`h-full p-8 md:p-12 flex flex-col ${getLayoutStyles(currentSlideData?.layout)}`}>
                {/* Slide Number Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-bold rounded-full">
                    {currentSlide + 1} / {totalSlides}
                  </span>
                </div>

                {/* Layout Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                    {currentSlideData?.layout}
                  </span>
                </div>

                {/* Title */}
                <h2 className={`${getTitleSize(currentSlideData?.layout)} text-white mb-6 leading-tight`}>
                  {currentSlideData?.title}
                </h2>

                {/* Content */}
                {currentSlideData?.layout !== 'title' && currentSlideData?.layout !== 'section' && (
                  <div className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-4xl">
                    {currentSlideData?.content?.split('•').filter(Boolean).map((item, i) => (
                      <div key={i} className="flex items-start gap-3 mb-3">
                        <span className="w-2 h-2 mt-2.5 bg-amber-500 rounded-full flex-shrink-0" />
                        <span>{item.trim()}</span>
                      </div>
                    )) || <p>{currentSlideData?.content}</p>}
                  </div>
                )}

                {/* Subtitle for title slides */}
                {(currentSlideData?.layout === 'title' || currentSlideData?.layout === 'section') && currentSlideData?.content && (
                  <p className="text-xl md:text-2xl text-slate-400 mt-4">
                    {currentSlideData.content}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Speaker Notes Panel */}
        <AnimatePresence>
          {showNotes && currentSlideData?.speakerNotes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4"
            >
              <h3 className="text-sm font-medium text-slate-400 mb-2">Speaker Notes</h3>
              <p className="text-sm text-slate-300">{currentSlideData.speakerNotes}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Bar */}
      <div className="h-14 bg-slate-900/80 backdrop-blur border-t border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showNotes ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Notes (N)
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-slate-500 text-center mt-1">
            Slide {currentSlide + 1} of {totalSlides}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>← → Navigate</span>
          <span>•</span>
          <span>F Fullscreen</span>
        </div>
      </div>
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
