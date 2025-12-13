'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Clock, RotateCcw, Maximize2, Minimize2,
  CheckCircle, Play, Copy, Check, Sparkles, HelpCircle,
  Terminal, BookOpen, ChevronRight, Loader2, X, AlertTriangle
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { createSanitizedHtml } from '@/lib/sanitize';

// Use Next.js API route which proxies to Hetzner (avoids mixed content issue)
const LAB_API_URL = '';

// Dynamically import Terminal to avoid SSR issues
const LabTerminal = dynamic(() => import('@/components/lab/Terminal'), { 
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#0d1117]">
      <Loader2 className="animate-spin text-teal-400" size={32} />
    </div>
  )
});

interface LabStep {
  id: string;
  number: number;
  title: string;
  content: string;
  command?: string;
  expectedOutput?: string;
  hint?: string;
}

interface LabData {
  title: string;
  description?: string;
  estimated_minutes?: number;
  steps: LabStep[];
  environment?: string;
}

interface LabSession {
  podName: string;
  status: 'creating' | 'running' | 'error';
  websocketUrl?: string;
  ready?: boolean;
}

// Split Pane Component
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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPosition(Math.min(70, Math.max(25, newPosition)));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

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
      <div className="overflow-hidden" style={{ width: `${splitPosition}%` }}>{left}</div>
      <div
        onMouseDown={() => setIsDragging(true)}
        className={`w-2 bg-slate-700 hover:bg-teal-500 cursor-col-resize flex items-center justify-center transition-colors ${isDragging ? 'bg-teal-500' : ''}`}
      >
        <div className="w-1 h-8 bg-slate-500 rounded-full" />
      </div>
      <div className="overflow-hidden flex-1" style={{ width: `${100 - splitPosition}%` }}>{right}</div>
    </div>
  );
}

export default function StudentLabPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const labId = params.labId as string;

  // State
  const [labData, setLabData] = useState<LabData | null>(null);
  const [session, setSession] = useState<LabSession | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [commandQueue, setCommandQueue] = useState<string[]>([]);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch lab content
  useEffect(() => {
    const fetchLabContent = async () => {
      try {
        // First get the batch info
        const batchRes = await fetch(`/api/training/access/lookup?code=${code}`);
        if (!batchRes.ok) throw new Error('Training not found');
        
        // Then get the specific content
        const contentRes = await fetch(`/api/training/content/${labId}`);
        if (!contentRes.ok) throw new Error('Lab not found');
        
        const content = await contentRes.json();
        
        if (content.content_type !== 'lab') {
          throw new Error('This is not a lab');
        }

        // Parse lab data from content_data
        const data = content.content_data as LabData;
        if (!data?.steps) {
          throw new Error('Lab has no steps defined');
        }

        // Ensure steps have proper structure
        const steps = data.steps.map((step: any, idx: number) => ({
          id: step.id || String(idx + 1),
          number: step.number || idx + 1,
          title: step.title || `Step ${idx + 1}`,
          content: step.content || step.instructions || '',
          command: step.command,
          expectedOutput: step.expectedOutput || step.expected_output,
          hint: step.hint
        }));

        setLabData({
          ...data,
          title: content.title || data.title,
          steps
        });
      } catch (err) {
        console.error('Error fetching lab:', err);
        setError(err instanceof Error ? err.message : 'Failed to load lab');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabContent();
  }, [code, labId]);

  // Create lab session via Next.js API (proxies to Hetzner)
  const createLabSession = async () => {
    try {
      setError(null);
      console.log('Creating lab session...');
      
      const response = await fetch('/api/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          template: labData?.environment || 'postgresql', 
          userId: 'student-' + Date.now(),
          labId 
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lab creation failed:', errorText);
        throw new Error('Failed to create lab environment');
      }

      const data = await response.json();
      console.log('Lab created:', data);
      
      // WebSocket still needs to go direct to Hetzner (WSS not available yet)
      const wsUrl = `ws://178.156.177.96:443/terminal?pod=${data.podName}`;
      
      setSession({
        podName: data.podName,
        status: 'creating',
        websocketUrl: wsUrl
      });

      // Poll for ready status
      pollLabStatus(data.podName);
    } catch (err) {
      console.error('Error creating lab:', err);
      setError(err instanceof Error ? err.message : 'Failed to start lab');
      setSession({ podName: 'error', status: 'error' });
    }
  };

  // Poll lab status via Next.js API
  const pollLabStatus = (podName: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    const poll = async () => {
      try {
        console.log('Polling lab status for:', podName);
        const response = await fetch(`/api/labs/${podName}`);
        
        if (!response.ok) {
          console.log('Poll response not ok:', response.status);
          return;
        }

        const data = await response.json();
        console.log('Poll response data:', data);
        
        // Check for running status (case insensitive)
        const isRunning = data.ready || 
          data.status?.toLowerCase() === 'running' ||
          data.status?.toLowerCase() === 'succeeded';
        
        if (isRunning) {
          console.log('Lab is ready!');
          const wsUrl = `ws://178.156.177.96:443/terminal?pod=${podName}`;
          setSession(prev => prev ? {
            ...prev,
            status: 'running',
            ready: true,
            websocketUrl: wsUrl
          } : null);
          
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      } catch (err) {
        console.error('Error polling lab status:', err);
      }
    };

    // Poll immediately, then every 2 seconds
    poll();
    pollIntervalRef.current = setInterval(poll, 2000);
  };

  // Start lab when data is loaded
  useEffect(() => {
    if (labData && !session) {
      createLabSession();
    }
  }, [labData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (session?.podName && session.podName !== 'error') {
        fetch(`/api/labs/${session.podName}`, { method: 'DELETE' }).catch(console.error);
      }
    };
  }, [session?.podName]);

  // Timer
  useEffect(() => {
    if (session?.status === 'running' && timeRemaining > 0) {
      const timer = setInterval(() => setTimeRemaining(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [session?.status, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyCommand = (stepId: string, command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleRunCommand = (command: string) => {
    setCommandQueue(prev => [...prev, command]);
  };

  const handleReset = async () => {
    if (session?.podName && session.podName !== 'error') {
      await fetch(`/api/labs/${session.podName}`, { method: 'DELETE' }).catch(console.error);
    }
    setSession(null);
    setCommandQueue([]);
    setCompletedSteps([]);
    setCurrentStep(1);
    setTimeRemaining(3600);
    createLabSession();
  };

  const handleCompleteStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    if (labData && currentStep < labData.steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-400 mx-auto mb-4" size={48} />
          <p className="text-white text-lg">Loading lab...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !labData) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="text-red-400 mx-auto mb-4" size={48} />
          <h2 className="text-white text-xl font-bold mb-2">Unable to Load Lab</h2>
          <p className="text-slate-400 mb-6">{error || 'Lab not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col bg-[#0a0f1a] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/training/${code}`)}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">Back to Course</span>
          </button>
          
          <div className="hidden md:block">
            <h1 className="text-white font-semibold">{labData.title}</h1>
            {labData.estimated_minutes && (
              <p className="text-xs text-slate-400">~{labData.estimated_minutes} min</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
            <span className="text-sm text-slate-300">
              {completedSteps.length}/{labData.steps.length} steps
            </span>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            timeRemaining < 300 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-300'
          }`}>
            <Clock size={16} />
            <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
          </div>

          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Reset Lab"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button
            onClick={() => router.push(`/training/${code}`)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Split Pane Content */}
      <div className="flex-1 overflow-hidden">
        <SplitPane
          left={
            <div className="h-full flex flex-col bg-slate-900">
              {/* Instructions Header */}
              <div className="p-4 border-b border-slate-700 shrink-0">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen size={20} className="text-teal-400" />
                  Lab Instructions
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
                      style={{ width: `${(completedSteps.length / labData.steps.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400">
                    {Math.round((completedSteps.length / labData.steps.length) * 100)}%
                  </span>
                </div>
              </div>

              {/* Steps */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {labData.steps.map((step) => {
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
                      <button
                        onClick={() => setCurrentStep(step.number)}
                        className="w-full p-4 flex items-start gap-3 text-left"
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          {isCompleted ? <CheckCircle size={16} /> : step.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium ${
                            isCompleted ? 'text-emerald-400' : isCurrent ? 'text-white' : 'text-slate-300'
                          }`}>
                            {step.title}
                          </h3>
                        </div>
                        {isCurrent && <ChevronRight size={16} className="text-teal-400 shrink-0" />}
                      </button>

                      {isCurrent && (
                        <div className="px-4 pb-4 space-y-4">
                          <div 
                            className="text-sm text-slate-300 leading-relaxed"
                            dangerouslySetInnerHTML={createSanitizedHtml(step.content)} 
                          />

                          {step.command && (
                            <div className="rounded-lg overflow-hidden border border-slate-700">
                              <div className="flex items-center justify-between px-3 py-2 bg-slate-800">
                                <span className="text-xs text-slate-400 font-mono">Command</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleCopyCommand(step.id, step.command!)}
                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                                  >
                                    {copiedStep === step.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                  </button>
                                  <button
                                    onClick={() => handleRunCommand(step.command!)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-teal-500/20 text-teal-400 rounded hover:bg-teal-500/30 transition-colors"
                                  >
                                    <Play size={12} /> Run
                                  </button>
                                </div>
                              </div>
                              <pre className="p-3 bg-[#0d1117] text-emerald-400 text-sm font-mono overflow-x-auto">
                                {step.command}
                              </pre>
                            </div>
                          )}

                          {step.expectedOutput && (
                            <div className="text-xs text-slate-500">
                              <span className="font-medium">Expected:</span> {step.expectedOutput}
                            </div>
                          )}

                          {step.hint && (
                            <button className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300">
                              <HelpCircle size={12} /> Show Hint
                            </button>
                          )}

                          <button
                            onClick={handleCompleteStep}
                            className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-colors"
                          >
                            {step.number === labData.steps.length ? 'Complete Lab' : 'Mark Complete & Next'}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Completion message */}
                {completedSteps.length === labData.steps.length && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/30 text-center"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <CheckCircle size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Lab Complete! 🎉</h3>
                    <p className="text-slate-300 mb-4">You've successfully completed all steps.</p>
                    <button
                      onClick={() => router.back()}
                      className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Return to Course
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          }
          right={
            <LabTerminal
              websocketUrl={session?.websocketUrl}
              podName={session?.podName}
              status={session?.status || 'creating'}
              onReset={handleReset}
              commandQueue={commandQueue}
              onCommandExecuted={(cmd) => setCommandQueue(prev => prev.filter(c => c !== cmd))}
            />
          }
        />
      </div>
    </div>
  );
}

