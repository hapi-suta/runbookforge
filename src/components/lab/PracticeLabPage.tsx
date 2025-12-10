'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Clock, RotateCcw, Maximize2, Minimize2, Settings,
  CheckCircle, Circle, Play, Copy, Check, Sparkles, HelpCircle,
  Terminal, BookOpen, ChevronRight, AlertTriangle, Loader2, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================================
// TYPES
// ============================================================

interface LabStep {
  id: string;
  number: number;
  title: string;
  content: string;
  command?: string;
  expectedOutput?: string;
  hint?: string;
  verifyCommand?: string;
}

interface LabSession {
  id: string;
  status: 'creating' | 'running' | 'paused' | 'completed' | 'error';
  websocketUrl?: string;
  expiresAt?: string;
  progress: {
    completedSteps: number[];
    currentStep: number;
  };
  metrics: {
    commandsExecuted: number;
    timeActive: number;
  };
}

interface PracticeLabPageProps {
  labId: string;
  title: string;
  description?: string;
  steps: LabStep[];
  templateSlug: string;
  breadcrumbs: Array<{ label: string; href: string }>;
}

// ============================================================
// SPLIT PANE COMPONENT
// ============================================================

function SplitPane({ 
  left, 
  right, 
  defaultSplit = 40 
}: { 
  left: React.ReactNode; 
  right: React.ReactNode; 
  defaultSplit?: number;
}) {
  const [splitPosition, setSplitPosition] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    
    // Clamp between 20% and 80%
    setSplitPosition(Math.min(80, Math.max(20, newPosition)));
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex h-full select-none">
      {/* Left Pane */}
      <div 
        className="overflow-hidden"
        style={{ width: `${splitPosition}%` }}
      >
        {left}
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-2 bg-slate-700 hover:bg-teal-500 cursor-col-resize flex items-center justify-center transition-colors ${
          isDragging ? 'bg-teal-500' : ''
        }`}
      >
        <div className="w-1 h-8 bg-slate-500 rounded-full" />
      </div>

      {/* Right Pane */}
      <div 
        className="overflow-hidden flex-1"
        style={{ width: `${100 - splitPosition}%` }}
      >
        {right}
      </div>
    </div>
  );
}

// ============================================================
// RUNBOOK PANE
// ============================================================

function RunbookPane({
  title,
  steps,
  completedSteps,
  currentStep,
  onStepClick,
  onCopyCommand,
  onRunCommand,
  onAIHelp
}: {
  title: string;
  steps: LabStep[];
  completedSteps: number[];
  currentStep: number;
  onStepClick: (stepNum: number) => void;
  onCopyCommand: (command: string) => void;
  onRunCommand: (command: string) => void;
  onAIHelp: (step: LabStep, action: string) => void;
}) {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const handleCopy = (stepId: string, command: string) => {
    onCopyCommand(command);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 shrink-0">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen size={20} className="text-teal-400" />
          {title}
        </h2>
        <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
          <span>{completedSteps.length}/{steps.length} completed</span>
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
              style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = currentStep === step.number;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-teal-500/10 border-teal-500/50'
                  : isCompleted
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-slate-800/50 border-slate-700/50'
              }`}
            >
              {/* Step Header */}
              <button
                onClick={() => onStepClick(step.number)}
                className="w-full p-4 flex items-start gap-3 text-left"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle size={16} />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    isCompleted ? 'text-emerald-400' : isCurrent ? 'text-white' : 'text-slate-300'
                  }`}>
                    {step.title}
                  </h3>
                  {isCompleted && (
                    <span className="text-xs text-slate-500">✓ Completed</span>
                  )}
                </div>
                {isCurrent && (
                  <Play size={16} className="text-teal-400 shrink-0" />
                )}
              </button>

              {/* Expanded Content */}
              {isCurrent && (
                <div className="px-4 pb-4 space-y-4">
                  <p className="text-sm text-slate-300 leading-relaxed" 
                     dangerouslySetInnerHTML={{ __html: step.content }} />

                  {/* Command Block */}
                  {step.command && (
                    <div className="rounded-lg overflow-hidden border border-slate-700">
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-800">
                        <span className="text-xs text-slate-400 font-mono">bash</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleCopy(step.id, step.command!)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                            title="Copy"
                          >
                            {copiedStep === step.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                          <button
                            onClick={() => onRunCommand(step.command!)}
                            className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-700 rounded transition-colors"
                            title="Run in terminal"
                          >
                            <Play size={14} />
                          </button>
                        </div>
                      </div>
                      <pre className="p-3 bg-slate-900 text-emerald-400 text-sm font-mono overflow-x-auto">
                        {step.command}
                      </pre>
                    </div>
                  )}

                  {/* AI Help Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onAIHelp(step, 'explain')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-medium hover:bg-purple-500/20 transition-colors"
                    >
                      <Sparkles size={12} /> Explain
                    </button>
                    <button
                      onClick={() => onAIHelp(step, 'expected')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors"
                    >
                      <Terminal size={12} /> Expected Output
                    </button>
                    {step.hint && (
                      <button
                        onClick={() => onAIHelp(step, 'hint')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium hover:bg-amber-500/20 transition-colors"
                      >
                        <HelpCircle size={12} /> Hint
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// TERMINAL PANE (Placeholder - requires xterm.js integration)
// ============================================================

function TerminalPane({
  sessionId,
  status,
  onReset,
  onFullscreen,
  isFullscreen,
  commandQueue
}: {
  sessionId?: string;
  status: string;
  onReset: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  commandQueue: string[];
}) {
  const terminalRef = useRef<HTMLDivElement>(null);

  // In production, this would initialize xterm.js and connect via WebSocket
  // For now, showing a placeholder

  if (status === 'creating') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0d1117] text-slate-400">
        <Loader2 size={40} className="animate-spin text-teal-400 mb-4" />
        <p className="text-lg font-medium">Starting lab environment...</p>
        <p className="text-sm mt-2">This may take 30-60 seconds</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0d1117] text-slate-400">
        <AlertTriangle size={40} className="text-red-400 mb-4" />
        <p className="text-lg font-medium">Failed to start environment</p>
        <button
          onClick={onReset}
          className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-teal-400" />
          <span className="text-sm text-slate-300 font-mono">ubuntu@lab:~</span>
          <span className={`w-2 h-2 rounded-full ${
            status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
          }`} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title="Reset Environment"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={onFullscreen}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 font-mono text-sm text-emerald-400 overflow-auto"
      >
        {/* Placeholder terminal output */}
        <div className="space-y-1">
          <p className="text-slate-500"># Welcome to RunbookForge Practice Lab</p>
          <p className="text-slate-500"># PostgreSQL 15 environment ready</p>
          <p className="text-slate-500"># Type commands below or click "Run" on any step</p>
          <p></p>
          {commandQueue.map((cmd, idx) => (
            <div key={idx}>
              <p><span className="text-blue-400">ubuntu@lab:~$</span> {cmd}</p>
            </div>
          ))}
          <p>
            <span className="text-blue-400">ubuntu@lab:~$</span>
            <span className="animate-pulse ml-1">▊</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function PracticeLabPage({
  labId,
  title,
  description,
  steps,
  templateSlug,
  breadcrumbs
}: PracticeLabPageProps) {
  const router = useRouter();
  
  // State
  const [session, setSession] = useState<LabSession | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour
  const [commandQueue, setCommandQueue] = useState<string[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Timer
  useEffect(() => {
    if (session?.status === 'running' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session?.status, timeRemaining]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handlers
  const handleStepClick = (stepNum: number) => {
    setCurrentStep(stepNum);
  };

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
  };

  const handleRunCommand = (command: string) => {
    setCommandQueue(prev => [...prev, command]);
    // In production, this would send to WebSocket
  };

  const handleAIHelp = async (step: LabStep, action: string) => {
    // Call AI API for help
    setAiResponse(`Loading ${action} for "${step.title}"...`);
    // In production, call /api/ai with appropriate action
  };

  const handleReset = () => {
    setCommandQueue([]);
    setCompletedSteps([]);
    setCurrentStep(1);
    // In production, call reset API
  };

  const handleCompleteStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Initialize session on mount
  useEffect(() => {
    // In production, call API to create session
    setSession({
      id: 'mock-session',
      status: 'running',
      progress: { completedSteps: [], currentStep: 1 },
      metrics: { commandsExecuted: 0, timeActive: 0 }
    });
  }, []);

  return (
    <div className={`h-screen flex flex-col bg-[#0a0f1a] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">Back</span>
          </button>
          
          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {idx > 0 && <ChevronRight size={14} className="text-slate-600" />}
                <a
                  href={crumb.href}
                  className={idx === breadcrumbs.length - 1 ? 'text-white' : 'text-slate-400 hover:text-white'}
                >
                  {crumb.label}
                </a>
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            timeRemaining < 300 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-300'
          }`}>
            <Clock size={16} />
            <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
          </div>

          {/* Complete Step Button */}
          <button
            onClick={handleCompleteStep}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-colors"
          >
            Mark Step Complete
          </button>

          <button
            onClick={() => router.back()}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Split Pane Content */}
      <div className="flex-1 overflow-hidden">
        <SplitPane
          left={
            <RunbookPane
              title={title}
              steps={steps}
              completedSteps={completedSteps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              onCopyCommand={handleCopyCommand}
              onRunCommand={handleRunCommand}
              onAIHelp={handleAIHelp}
            />
          }
          right={
            <TerminalPane
              sessionId={session?.id}
              status={session?.status || 'creating'}
              onReset={handleReset}
              onFullscreen={() => setIsFullscreen(!isFullscreen)}
              isFullscreen={isFullscreen}
              commandQueue={commandQueue}
            />
          }
        />
      </div>

      {/* AI Response Modal */}
      <AnimatePresence>
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-800 rounded-xl border border-purple-500/30 shadow-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                <span className="font-semibold text-white">AI Assistant</span>
              </div>
              <button
                onClick={() => setAiResponse(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-slate-300">{aiResponse}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

