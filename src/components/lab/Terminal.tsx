'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Terminal as TerminalIcon, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

interface TerminalProps {
  websocketUrl?: string;
  podName?: string;
  status: 'creating' | 'running' | 'paused' | 'completed' | 'error' | 'connecting';
  onReset?: () => void;
  commandQueue?: string[];
  onCommandExecuted?: (command: string) => void;
}

export default function LabTerminal({
  websocketUrl,
  podName,
  status,
  onReset,
  commandQueue = [],
  onCommandExecuted
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<any>(null);
  const onDataDisposableRef = useRef<{ dispose: () => void } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [terminalReady, setTerminalReady] = useState(false);
  const processedCommands = useRef<Set<string>>(new Set());

  // Initialize xterm.js
  const initTerminal = useCallback(async () => {
    if (!terminalRef.current || xtermRef.current) return;

    try {
      // Use the installed deprecated packages
      const xtermModule = await import('xterm');
      const fitModule = await import('xterm-addon-fit');
      
      const { Terminal } = xtermModule;
      const { FitAddon } = fitModule;

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
        theme: {
          background: '#0d1117',
          foreground: '#c9d1d9',
          cursor: '#58a6ff',
          cursorAccent: '#0d1117',
          selectionBackground: '#3b5998',
          black: '#0d1117',
          red: '#ff7b72',
          green: '#3fb950',
          yellow: '#d29922',
          blue: '#58a6ff',
          magenta: '#bc8cff',
          cyan: '#39c5cf',
          white: '#c9d1d9',
          brightBlack: '#484f58',
          brightRed: '#ffa198',
          brightGreen: '#56d364',
          brightYellow: '#e3b341',
          brightBlue: '#79c0ff',
          brightMagenta: '#d2a8ff',
          brightCyan: '#56d4dd',
          brightWhite: '#f0f6fc',
        },
        allowProposedApi: true,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        fitAddon.fit();
      }, 100);

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;
      setTerminalReady(true);

      // Welcome message
      term.writeln('\x1b[1;36m╔══════════════════════════════════════════════════════════╗\x1b[0m');
      term.writeln('\x1b[1;36m║\x1b[0m  \x1b[1;32mRunbookForge Practice Lab\x1b[0m                               \x1b[1;36m║\x1b[0m');
      term.writeln('\x1b[1;36m║\x1b[0m  Interactive Environment Ready                           \x1b[1;36m║\x1b[0m');
      term.writeln('\x1b[1;36m╚══════════════════════════════════════════════════════════╝\x1b[0m');
      term.writeln('');

      // Handle resize
      const handleResize = () => {
        if (fitAddonRef.current) {
          try {
            fitAddonRef.current.fit();
          } catch (e) {
            // Ignore resize errors
          }
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    } catch (error) {
      console.error('Failed to initialize terminal:', error);
      setConnectionError('Terminal libraries not available');
    }
  }, []);

  // Connect WebSocket
  const connectWebSocket = useCallback(() => {
    if (!websocketUrl || !xtermRef.current || wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionError(null);

    // Clean up any existing onData listener before creating a new one
    if (onDataDisposableRef.current) {
      onDataDisposableRef.current.dispose();
      onDataDisposableRef.current = null;
    }

    try {
      const ws = new WebSocket(websocketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        xtermRef.current?.writeln('\x1b[1;32m✓ Connected to lab environment\x1b[0m');
        xtermRef.current?.writeln('');
      };

      ws.onmessage = (event) => {
        if (xtermRef.current) {
          xtermRef.current.write(event.data);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        xtermRef.current?.writeln('\x1b[1;33m⚠ Connection closed\x1b[0m');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection failed - lab may still be starting');
        setIsConnected(false);
      };

      // Handle user input - store the disposable for cleanup
      if (xtermRef.current) {
        onDataDisposableRef.current = xtermRef.current.onData((data: string) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
          }
        });
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionError('Failed to connect');
    }
  }, [websocketUrl]);

  // Process command queue
  useEffect(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    commandQueue.forEach((cmd) => {
      if (!processedCommands.current.has(cmd)) {
        processedCommands.current.add(cmd);
        wsRef.current?.send(cmd + '\n');
        onCommandExecuted?.(cmd);
      }
    });
  }, [commandQueue, onCommandExecuted]);

  // Initialize on mount
  useEffect(() => {
    if (status === 'running' || status === 'connecting') {
      initTerminal();
    }
  }, [status, initTerminal]);

  // Connect when WebSocket URL is available
  useEffect(() => {
    if (websocketUrl && terminalReady && status === 'running') {
      connectWebSocket();
    }
  }, [websocketUrl, status, terminalReady, connectWebSocket]);

  // Cleanup
  useEffect(() => {
    return () => {
      // Dispose the onData listener first
      if (onDataDisposableRef.current) {
        onDataDisposableRef.current.dispose();
        onDataDisposableRef.current = null;
      }
      // Close WebSocket connection
      wsRef.current?.close();
      // Dispose the terminal instance
      xtermRef.current?.dispose();
    };
  }, []);

  // Render based on status
  if (status === 'creating') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0d1117] text-slate-400">
        <Loader2 size={48} className="animate-spin text-teal-400 mb-4" />
        <p className="text-lg font-medium text-white">Starting lab environment...</p>
        <p className="text-sm mt-2">Installing PostgreSQL and dependencies</p>
        <p className="text-xs mt-4 text-slate-500">This may take 30-60 seconds</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0d1117] text-slate-400">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-lg font-medium text-white">Failed to start environment</p>
        <p className="text-sm mt-2 text-red-400">{connectionError || 'Unknown error'}</p>
        {onReset && (
          <button
            onClick={onReset}
            className="mt-6 flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <TerminalIcon size={16} className="text-teal-400" />
          <span className="text-sm text-slate-300 font-mono">
            {podName || 'ubuntu@lab'}:~
          </span>
          <span className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'
          }`} />
          <span className="text-xs text-slate-500">
            {isConnected ? 'Connected' : connectionError ? 'Error' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 p-2"
        style={{ minHeight: 0 }}
      />
      
      {/* Show error inline if terminal loaded but connection failed */}
      {connectionError && terminalReady && (
        <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/30 text-amber-400 text-sm">
          {connectionError}
        </div>
      )}
    </div>
  );
}
