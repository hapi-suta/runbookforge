'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Loader2, 
  FileText, 
  Code, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Table,
  ListChecks,
  ArrowRight,
  Save,
  RefreshCw,
  X,
  Tag,
  Copy,
  Check,
  Upload,
  Wand2
} from "lucide-react";

interface Block {
  id: string;
  type: string;
  title?: string;
  content: string;
  language?: string;
  tags?: string[];
  tableData?: { headers: string[]; rows: string[][] };
  checklist?: { id: string; text: string; checked: boolean }[];
}

interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

interface RunbookData {
  title: string;
  description: string;
  sections: Section[];
}

const blockIcons: Record<string, any> = {
  step: CheckCircle,
  code: Code,
  warning: AlertTriangle,
  info: Info,
  note: FileText,
  header: FileText,
  table: Table,
  checklist: ListChecks,
};

const blockColors: Record<string, string> = {
  step: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  code: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
  warning: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  info: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  note: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  header: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  table: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  checklist: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
};

const exampleTexts = [
  {
    title: "PostgreSQL Backup",
    text: `PostgreSQL Backup Procedure

Prerequisites:
- Ensure pgBackRest is installed
- Verify backup repository is accessible
- Check disk space on backup server

Steps:

1. On the primary server, verify PostgreSQL is running:
systemctl status postgresql

2. Check current backup status:
sudo -u postgres pgbackrest info

3. Run a full backup:
sudo -u postgres pgbackrest --stanza=main --type=full backup

WARNING: Do not run backups during peak hours (9 AM - 6 PM)

4. Verify backup completed:
sudo -u postgres pgbackrest info

5. Test restore capability monthly`
  },
  {
    title: "Kubernetes Deployment",
    text: `Deploy Application to Kubernetes

Environment: Production cluster (us-east-1)

Server inventory:
- k8s-master-01: 10.0.1.10 (Control Plane)
- k8s-worker-01: 10.0.1.11 (Worker)
- k8s-worker-02: 10.0.1.12 (Worker)

Deployment Steps:

1. Update kubeconfig
aws eks update-kubeconfig --name prod-cluster --region us-east-1

2. Apply deployment manifest
kubectl apply -f deployment.yaml

3. Check rollout status
kubectl rollout status deployment/myapp

4. Verify pods are running
kubectl get pods -l app=myapp

CRITICAL: Always verify health checks pass before routing traffic

5. Update service
kubectl apply -f service.yaml`
  }
];

export default function AIImportPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunbookData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleImport = async () => {
    if (!text.trim()) {
      setError('Please enter some text to convert');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process text');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process text');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/runbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.title,
          description: result.description,
          sections: result.sections,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save runbook');
      }

      const data = await response.json();
      router.push(`/dashboard/runbooks/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save runbook');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTryAgain = () => {
    setResult(null);
    setError(null);
  };

  const loadExample = (example: typeof exampleTexts[0]) => {
    setText(example.text);
    setResult(null);
    setError(null);
  };

  const countStats = () => {
    if (!result) return { sections: 0, steps: 0, codeBlocks: 0, warnings: 0 };
    
    let steps = 0, codeBlocks = 0, warnings = 0;
    result.sections.forEach(section => {
      section.blocks.forEach(block => {
        if (block.type === 'step') steps++;
        if (block.type === 'code') codeBlocks++;
        if (block.type === 'warning') warnings++;
      });
    });
    
    return { sections: result.sections.length, steps, codeBlocks, warnings };
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Import</h1>
            <p className="text-slate-400">Paste your documentation and let AI structure it into a runbook</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-slate-300">Paste your text</label>
              <span className="text-xs text-slate-500">{text.length.toLocaleString()} / 50,000</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your documentation, notes, or procedures here...

Example:
- Step-by-step instructions
- Shell commands
- Configuration snippets
- Server information
- Warnings and notes"
              rows={16}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
              disabled={isProcessing}
            />
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleImport}
                disabled={isProcessing || !text.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg text-white font-semibold hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    Convert to Runbook
                  </>
                )}
              </button>
              {text && (
                <button
                  onClick={() => { setText(''); setResult(null); setError(null); }}
                  className="px-4 py-3 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Example Templates */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <p className="text-xs text-slate-500 mb-3">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {exampleTexts.map((example, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(example)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                >
                  {example.title}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl">
            <h3 className="text-sm font-medium text-violet-400 mb-2">Tips for best results</h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Include clear step-by-step instructions</li>
              <li>• Add code blocks and commands</li>
              <li>• Mention server roles (primary, replica, etc.)</li>
              <li>• Include warnings and important notes</li>
              <li>• Add context about the environment</li>
            </ul>
          </div>
        </motion.div>

        {/* Result Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-400 text-sm">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-xs text-red-400/70 hover:text-red-400 mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Loader2 size={32} className="text-violet-400 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Analyzing your content...</h3>
              <p className="text-slate-400 text-sm">AI is structuring your documentation into a runbook</p>
            </div>
          )}

          {/* Empty State */}
          {!isProcessing && !result && !error && (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <FileText size={32} className="text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Preview will appear here</h3>
              <p className="text-slate-400 text-sm">Paste your text and click "Convert to Runbook"</p>
            </div>
          )}

          {/* Result Preview */}
          {result && (
            <div className="space-y-4">
              {/* Stats Bar */}
              <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <CheckCircle size={20} className="text-emerald-400" />
                <div className="flex-1">
                  <p className="text-emerald-400 font-medium text-sm">Conversion successful!</p>
                  <p className="text-emerald-400/70 text-xs">
                    {countStats().sections} sections • {countStats().steps} steps • {countStats().codeBlocks} code blocks
                  </p>
                </div>
              </div>

              {/* Preview Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                  <h2 className="text-lg font-semibold text-white">{result.title}</h2>
                  {result.description && (
                    <p className="text-slate-400 text-sm mt-1">{result.description}</p>
                  )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
                  {result.sections.map((section) => (
                    <div key={section.id} className="border border-slate-800 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-slate-800/50">
                        <h3 className="text-sm font-medium text-white">{section.title}</h3>
                      </div>
                      <div className="p-3 space-y-2">
                        {section.blocks.slice(0, 3).map((block) => {
                          const Icon = blockIcons[block.type] || FileText;
                          const colorClass = blockColors[block.type] || blockColors.note;
                          return (
                            <div key={block.id} className={`p-2 rounded border ${colorClass}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <Icon size={12} />
                                <span className="text-xs font-medium capitalize">{block.type}</span>
                                {block.tags?.map(tag => (
                                  <span key={tag} className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400">{tag}</span>
                                ))}
                              </div>
                              {block.title && <p className="text-xs font-medium text-white">{block.title}</p>}
                              <p className="text-xs text-slate-400 line-clamp-2">{block.content}</p>
                            </div>
                          );
                        })}
                        {section.blocks.length > 3 && (
                          <p className="text-xs text-slate-500 text-center py-1">
                            +{section.blocks.length - 3} more blocks
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-slate-800 flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Runbook
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleTryAgain}
                    className="px-4 py-2.5 bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
